import React, { useState } from "react";
import InteractiveMap from "./components/InteractiveMap";
import SidePanel from "./components/SidePanel";
import { firstFloorZones } from "./zones/firstFloor";
import { secondFloorZones } from "./zones/secondFloor";
import { Zone } from "./types";
import { getEstablishmentId, useCensus } from "./utils/census";

const App: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [currentFloor, setCurrentFloor] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const census = useCensus();
  const selectedCensus = selectedZone
    ? (census[getEstablishmentId(selectedZone) ?? ""] ?? null)
    : null;
  const zones = currentFloor === 1 ? firstFloorZones : secondFloorZones;
  const mapImage = currentFloor === 1 ? "1ST FLOOR.png" : "2ND FLOOR.png";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const highlightedZoneIds = normalizedSearch
    ? zones
        .filter((zone) => zone.name?.toLowerCase().includes(normalizedSearch))
        .map((zone) => zone.id)
    : [];
  const highlightedCount = highlightedZoneIds.length;

  return (
    <div className="app-container bg-gradient-to-br from-red-600 via-red-500 to-pink-500 min-h-screen">
      <header className="topbar glass-card">
        <div className="topbar-title">
          <span className="eyebrow">KidZania Surabaya</span>
          <h1>Interactive Building Map</h1>
          <p>Switch floors and tap a zone to view its details.</p>
        </div>
      </header>
      <div className="map-container bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 shadow-xl mt-4">
        <InteractiveMap
          zones={zones}
          mapImage={mapImage}
          scale={currentFloor === 2 ? 1 : 1}
          onZoneClick={setSelectedZone}
          highlightedZoneIds={highlightedZoneIds}
          census={census}
        />
      </div>
      {selectedZone && (
        <SidePanel
          zone={selectedZone}
          census={selectedCensus}
          onClose={() => setSelectedZone(null)}
        />
      )}
      <div className="floor-toggle floor-toggle--floating">
        <button
          onClick={() => setCurrentFloor(1)}
          disabled={currentFloor === 1}
          className={currentFloor === 1 ? "active" : ""}
        >
          1st Floor
        </button>
        <button
          onClick={() => setCurrentFloor(2)}
          disabled={currentFloor === 2}
          className={currentFloor === 2 ? "active" : ""}
        >
          2nd Floor
        </button>
      </div>
    </div>
  );
};

export default App;
