import React, { useState } from "react";
import InteractiveMap from "./components/InteractiveMap";
import SidePanel from "./components/SidePanel";
import { firstFloorZones } from "./zones/firstFloor";
import { secondFloorZones } from "./zones/secondFloor";
import { Zone } from "./types";
const App: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [currentFloor, setCurrentFloor] = useState<1 | 2>(1);
  const zones = currentFloor === 1 ? firstFloorZones : secondFloorZones;
  const mapImage = currentFloor === 1 ? "1ST FLOOR.png" : "2ND FLOOR.png";
  return (
    <div className="app-container">
      {" "}
      <div className="floor-toggle">
        {" "}
        <button
          onClick={() => setCurrentFloor(1)}
          disabled={currentFloor === 1}
        >
          {" "}
          1st Floor{" "}
        </button>{" "}
        <button
          onClick={() => setCurrentFloor(2)}
          disabled={currentFloor === 2}
        >
          {" "}
          2nd Floor{" "}
        </button>{" "}
      </div>{" "}
      <InteractiveMap
        zones={zones}
        mapImage={mapImage}
        scale={currentFloor === 2 ? 1 : 1}
        onZoneClick={setSelectedZone}
      />{" "}
      {selectedZone && (
        <SidePanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
      )}{" "}
    </div>
  );
};
export default App;
