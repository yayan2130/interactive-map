import React, { useState } from "react";
import InteractiveMap from "./components/InteractiveMap";
import SidePanel from "./components/SidePanel";
import { firstFloorZones } from "./zones/firstFloor";
import { secondFloorZones } from "./zones/secondFloor";
import { Zone } from "./types";

const App: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [currentFloor, setCurrentFloor] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState("");
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
        <div className="topbar-actions">
          <div className="floor-toggle">
            <button
              onClick={() => setCurrentFloor(1)}
              disabled={currentFloor === 1}
              className={currentFloor === 1 ? "active" : ""}
            >
              1st
            </button>
            <button
              onClick={() => setCurrentFloor(2)}
              disabled={currentFloor === 2}
              className={currentFloor === 2 ? "active" : ""}
            >
              2nd
            </button>
          </div>
        </div>
      </header>
      <div className="searchbar-panel glass-card">
        <div className="topbar-search">
          <input
            className="search-input"
            type="search"
            placeholder="Search zone name…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="search-status">
          {searchTerm ? (
            highlightedCount > 0 ? (
              <span>
                Highlighting {highlightedCount} matching zone
                {highlightedCount > 1 ? "s" : ""}.
              </span>
            ) : (
              <span>No matching zone found on this floor.</span>
            )
          ) : (
            <span>Search by zone name to highlight one or more areas.</span>
          )}
        </div>
      </div>
      <div className="map-container bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 shadow-xl mt-4">
        <InteractiveMap
          zones={zones}
          mapImage={mapImage}
          scale={currentFloor === 2 ? 1 : 1}
          onZoneClick={setSelectedZone}
          highlightedZoneIds={highlightedZoneIds}
        />
      </div>
      {selectedZone && (
        <SidePanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
      )}
    </div>
  );
};

export default App;
