// Census poller: authenticates once against the KidZania SOAP auth service,
// then loops every establishment (one GetCensusDisplay call each), extracts the
// per-activity NextCycleStartsAt, and writes public/census.json for the Vite app.
//
// Run once:        node scraper/fetchCensus.js
// Poll forever:    node scraper/fetchCensus.js --watch
//
// Requires Node 18+ (global fetch) and fast-xml-parser.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const ZONE_FILES = [
  path.join(ROOT, "src/zones/firstFloor.ts"),
  path.join(ROOT, "src/zones/secondFloor.ts"),
];

const xml = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true, // collapse <b:NextCycleStartsAt> -> NextCycleStartsAt
  parseTagValue: false, // keep values as strings; we coerce ourselves
});

// ---------------------------------------------------------------------------
// Establishment list — single source of truth is the zone files. Each zone's
// `fib` URL carries `p=<establishmentId>`; we pair it with the zone `id`.
// ---------------------------------------------------------------------------
async function loadEstablishments() {
  const found = new Map(); // establishmentId -> zoneId
  // Anchor on each zone's top-level `id` (4-space indent, to skip the nested
  // description.id), then collect EVERY `p=<hex>` in that zone's block — a
  // combined zone can carry more than one (fib + fib2).
  const idRe = /^ {4}id: ["']([^"']+)["']/gm;
  const pRe = /CensusDisplay\?p=([0-9a-fA-F]+)/g;
  for (const file of ZONE_FILES) {
    let src;
    try {
      src = await readFile(file, "utf8");
    } catch {
      continue; // file may not exist (e.g. no second floor data yet)
    }
    const idMatches = [...src.matchAll(idRe)];
    for (let i = 0; i < idMatches.length; i++) {
      const zoneId = idMatches[i][1];
      const start = idMatches[i].index;
      const end = i + 1 < idMatches.length ? idMatches[i + 1].index : src.length;
      const block = src.slice(start, end);
      for (const pm of block.matchAll(pRe)) {
        const establishmentId = pm[1];
        if (!found.has(establishmentId)) found.set(establishmentId, zoneId);
      }
    }
  }
  return [...found.entries()].map(([establishmentId, zoneId]) => ({
    establishmentId,
    zoneId,
  }));
}

// ---------------------------------------------------------------------------
// SOAP contract (derived from the service WSDLs). BasicHttpBinding => SOAP 1.1
// with the action in the HTTP SOAPAction header.
// ---------------------------------------------------------------------------
const AUTH_ACTION =
  "http://tempuri.org/IIdentityManagementService/ValidateUserCredentials";
const CENSUS_ACTION =
  "http://tempuri.org/ICensusDisplayManagementService/GetCensusDisplay";

function buildAuthEnvelope(creds) {
  // ValidateUserCredentials(userName, password). The token is returned by the
  // service in an <authentication-header><Token> SOAP *response* header.
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <tem:ValidateUserCredentials>
      <tem:userName>${escapeXml(creds.auth.username)}</tem:userName>
      <tem:password>${escapeXml(creds.auth.password)}</tem:password>
    </tem:ValidateUserCredentials>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildCensusEnvelope(token, establishmentId, forDate, languageCode) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header>
    <authentication-header xmlns="kidzania.com">
      <Token xmlns="http://schemas.datacontract.org/2004/07/KZoftware.Services.Behaviors">${escapeXml(
        token
      )}</Token>
    </authentication-header>
  </soapenv:Header>
  <soapenv:Body>
    <tem:GetCensusDisplay>
      <tem:establishmentId>${escapeXml(establishmentId)}</tem:establishmentId>
      <tem:forDate>${forDate}</tem:forDate>
      <tem:languageCode>${escapeXml(languageCode)}</tem:languageCode>
    </tem:GetCensusDisplay>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function soapPost(endpoint, soapAction, body) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `"${soapAction}"`,
    },
    body,
  });
  const text = await res.text();
  return { status: res.status, text };
}

// ---------------------------------------------------------------------------
// Auth + census calls
// ---------------------------------------------------------------------------
async function authenticate(creds) {
  const { status, text } = await soapPost(
    creds.auth.endpoint,
    creds.auth.soapAction ?? AUTH_ACTION,
    buildAuthEnvelope(creds)
  );
  if (status !== 200) {
    throw new Error(`Auth failed (HTTP ${status}): ${text.slice(0, 400)}`);
  }
  // Token may arrive in the response body (SOAP header) — find <...Token>value.
  const parsed = xml.parse(text);
  const token = findToken(parsed);
  if (!token) {
    throw new Error(`Auth succeeded but no Token found in response: ${text.slice(0, 400)}`);
  }
  return token;
}

// Walk the parsed object for the first "Token" key with a string value.
function findToken(node) {
  if (node == null || typeof node !== "object") return null;
  for (const [key, value] of Object.entries(node)) {
    if (key === "Token" && typeof value === "string" && value.trim()) {
      return value.trim();
    }
    const nested = findToken(value);
    if (nested) return nested;
  }
  return null;
}

async function fetchCensus(creds, token, establishmentId, forDate) {
  const { status, text } = await soapPost(
    creds.census.endpoint,
    creds.census.soapAction ?? CENSUS_ACTION,
    buildCensusEnvelope(token, establishmentId, forDate, creds.languageCode)
  );
  if (status === 401 || /Unauthorized|authentication/i.test(text)) {
    const err = new Error("Census call unauthorized");
    err.needsReauth = true;
    throw err;
  }
  if (status !== 200) {
    throw new Error(`HTTP ${status}: ${text.slice(0, 300)}`);
  }
  return normalizeActivities(xml.parse(text));
}

// Collect every node that looks like an activity (has a NextCycleStartsAt).
function normalizeActivities(parsed) {
  const activities = [];
  const visit = (node) => {
    if (node == null || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    // An ActivityCensusDisplayDTO carries the cycle fields; the human-readable
    // name/id live on its nested <Activity> (ActivityDTO).
    if ("NextCycleStartsAt" in node || "MinutesForTheNextCycle" in node) {
      const nextCycleStartsAt = isNil(node.NextCycleStartsAt)
        ? null
        : String(node.NextCycleStartsAt);
      const minutes = isNil(node.MinutesForTheNextCycle)
        ? null
        : Number(node.MinutesForTheNextCycle);
      const activity = node.Activity ?? {};
      activities.push({
        activityId: str(activity.ActivityID),
        name: str(activity.LocalName ?? activity.Establishment),
        nextCycleStartsAt,
        minutesForTheNextCycle: minutes,
        display: nextCycleStartsAt === null ? "Now" : `${minutes ?? "?"} min`,
      });
    }
    for (const value of Object.values(node)) visit(value);
  };
  visit(parsed);
  return activities;
}

function str(v) {
  return v == null ? null : String(v);
}

// A nillable element with i:nil="true" parses to "" or an object with @_nil.
function isNil(v) {
  if (v == null || v === "") return true;
  if (typeof v === "object") {
    return v["@_nil"] === "true" || v["@_i:nil"] === "true" || !("#text" in v);
  }
  return false;
}

// ---------------------------------------------------------------------------
// One full pass over all establishments -> write census.json
// ---------------------------------------------------------------------------
async function runOnce(creds) {
  const establishments = await loadEstablishments();
  if (establishments.length === 0) {
    throw new Error("No establishments found in zone files (expected fib URLs with ?p=<id>).");
  }
  // forDate is xs:dateTime; send midnight of "today" in the facility timezone.
  const ymd = new Date().toLocaleDateString("en-CA", {
    timeZone: creds.timezone,
  }); // YYYY-MM-DD
  const forDate = `${ymd}T00:00:00`;

  let token = await authenticate(creds);
  console.log(`[auth] token acquired; polling ${establishments.length} establishments for ${forDate}`);

  const out = { generatedAt: new Date().toISOString(), forDate, establishments: {} };

  for (const { establishmentId, zoneId } of establishments) {
    try {
      let activities;
      try {
        activities = await fetchCensus(creds, token, establishmentId, forDate);
      } catch (err) {
        if (err.needsReauth) {
          console.log("[auth] token rejected, re-authenticating once...");
          token = await authenticate(creds);
          activities = await fetchCensus(creds, token, establishmentId, forDate);
        } else {
          throw err;
        }
      }
      out.establishments[establishmentId] = { zoneId, activities };
      console.log(`  ✓ ${zoneId} (${establishmentId}): ${activities.length} activity(ies)`);
    } catch (err) {
      console.warn(`  ✗ ${zoneId} (${establishmentId}): ${err.message}`);
      // fail soft — skip this establishment, keep the rest
    }
  }

  const outPath = path.resolve(ROOT, creds.outputPath);
  await writeFile(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`[write] ${outPath} (${Object.keys(out.establishments).length} establishments)`);
}

async function main() {
  const creds = JSON.parse(await readFile(CREDENTIALS_PATH, "utf8"));
  const watch = process.argv.includes("--watch");

  const tick = async () => {
    try {
      await runOnce(creds);
    } catch (err) {
      console.error(`[error] ${err.message}`);
    }
  };

  await tick();
  if (watch) {
    const interval = creds.pollIntervalMs ?? 60000;
    console.log(`[watch] re-polling every ${interval}ms (Ctrl+C to stop)`);
    setInterval(tick, interval);
  }
}

main();
