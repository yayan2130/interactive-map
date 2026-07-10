import React, { useEffect, useState } from "react";
import "./SidePanel.css";
import { ActivityCycle, CensusMap, Zone } from "../types";
import { getEstablishmentId, getSecondEstablishmentId } from "../utils/census";

interface Props {
  zone: Zone | null;
  census?: CensusMap;
  onClose: () => void;
}

const SidePanel: React.FC<Props> = ({ zone, census, onClose }) => {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [infoUrl, setInfoUrl] = useState<string | null>(null);
  const [scrollHintDismissed, setScrollHintDismissed] = useState(false);

  useEffect(() => {
    setScrollHintDismissed(false);
  }, [zone?.id]);

  if (!zone) return null;

  const showScrollHint = Boolean(zone.menu) && !scrollHintDismissed;

  const infoLinks: { url: string; label: string }[] = [];
  if (zone.fib) {
    infoLinks.push({
      url: zone.fib,
      label: zone.fibLabel ?? "Open establishment info",
    });
  }
  if (zone.fib2) {
    infoLinks.push({ url: zone.fib2, label: zone.fib2Label ?? "Info 2" });
  }
  // When there are two links the first one needs a distinguishing label too.
  if (infoLinks.length > 1 && !zone.fibLabel) {
    infoLinks[0].label = "Info 1";
  }

  // Next-cycle timers, one group per establishment a zone draws from (fib + fib2).
  const cycleGroups: {
    id: string;
    label?: string;
    activities: ActivityCycle[];
  }[] = [];
  const primaryId = getEstablishmentId(zone);
  const secondId = getSecondEstablishmentId(zone);
  if (primaryId) {
    cycleGroups.push({
      id: primaryId,
      label: zone.fibLabel,
      activities: census?.[primaryId]?.activities ?? [],
    });
  }
  if (secondId && secondId !== primaryId) {
    cycleGroups.push({
      id: secondId,
      label: zone.fib2Label,
      activities: census?.[secondId]?.activities ?? [],
    });
  }
  const hasCycles = cycleGroups.some((g) => g.activities.length > 0);

  return (
    <>
      <div className="side-panel-backdrop" onClick={onClose} />
      <aside className="side-panel visible">
        <div
          className="panel-scroll"
          onScroll={(e) => {
            if (!scrollHintDismissed && e.currentTarget.scrollTop > 40) {
              setScrollHintDismissed(true);
            }
          }}
        >
          <div className="panel-header">
            <div>
              <span className="panel-badge">Zone detail</span>
              <h2>{zone.name}</h2>
            </div>
          </div>

          <div className="lang-toggle">
            <button
              onClick={() => setLang("id")}
              className={lang === "id" ? "active" : ""}
            >
              IDN
            </button>
            <button
              onClick={() => setLang("en")}
              className={lang === "en" ? "active" : ""}
            >
              ENG
            </button>
          </div>

          {infoLinks.length > 0 && (
            <div className="info-action-bar">
              {infoLinks.map((link) => (
                <button
                  key={link.url + link.label}
                  type="button"
                  className="info-button"
                  onClick={() => setInfoUrl(link.url)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {hasCycles && (
            <div className="section-block">
              <h3>Next cycles</h3>
              {cycleGroups.map(
                (group) =>
                  group.activities.length > 0 && (
                    <div key={group.id} className="cycle-group">
                      {group.label && (
                        <h4 className="cycle-group-title">{group.label}</h4>
                      )}
                      <ul className="cycle-list">
                        {group.activities.map((activity, index) => (
                          <li
                            key={activity.activityId ?? index}
                            className="cycle-row"
                          >
                            <span className="cycle-activity">
                              {activity.name ?? "Activity"}
                            </span>
                            <span
                              className={`cycle-pill ${
                                activity.display === "Now" ? "cycle-now" : ""
                              }`}
                            >
                              {activity.display}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
            </div>
          )}

          {zone.image && (
            <div className="media-card">
              <img
                className="establishment-logo"
                src={zone.image}
                alt={zone.name}
              />
            </div>
          )}
          {zone.tags && zone.tags.length > 0 && (
            <div className="tags-container">
              <h4>Tags</h4>
              <div className="tags">
                {zone.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="section-block">
            <h3>About this zone</h3>
            <p className="description">
              {lang === "en" ? zone.description.en : zone.description.id}
            </p>
          </div>

          {(zone.activity || zone.menu || zone.video) && (
            <div className="section-block">
              <h3>Media highlights</h3>
              {zone.activity && (
                <img
                  className="establishment-image"
                  src={zone.activity}
                  alt={`${zone.name} activity`}
                />
              )}
              {zone.menu && (
                <img
                  className="establishment-image menu-image"
                  src={zone.menu}
                  alt={`${zone.name} menu`}
                  loading="lazy"
                />
              )}
              {zone.video && (
                <div
                  className={`video-container${
                    zone.videoPortrait ? " portrait" : ""
                  }`}
                >
                  <iframe
                    className="establishment-video"
                    src={zone.video}
                    title={`${zone.name} video`}
                    allow="autoplay; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {showScrollHint && (
          <div className="scroll-hint" aria-hidden="true">
            Scroll down for menu <span className="scroll-hint-arrow">↓</span>
          </div>
        )}

        <div className="panel-footer">
          <button className="close-btn-bottom" onClick={onClose}>
            Close
          </button>
        </div>
      </aside>

      {infoUrl && (
        <>
          <div
            className="info-modal-backdrop"
            onClick={() => setInfoUrl(null)}
          />
          <div className="info-modal visible">
            <div className="info-modal-header">
              <div>
                <span className="panel-badge">Info popup</span>
                <h3>{zone.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setInfoUrl(null)}
              >
                ×
              </button>
            </div>
            <div className="info-modal-body">
              <iframe
                className="info-iframe"
                src={infoUrl}
                title={`${zone.name} info`}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SidePanel;
