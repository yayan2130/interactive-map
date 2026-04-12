import React from "react";
import "./InteractiveMap.css";
import { Zone } from "../types";

interface Props {
  zones: Zone[];
  mapImage: string;
  onZoneClick: (zone: Zone) => void;
  scale?: number;
  lang?: "id" | "en";
}

const InteractiveMap: React.FC<Props> = ({
  zones,
  scale,
  mapImage,
  onZoneClick,
  lang,
}) => {
  return (
    <div
      className="map-container"
      style={{
        transform: `scale(${scale || 1})`,
        transformOrigin: "top center",
      }}
    >
      {/* generate map. */}
      {/* {mapImage digunakan untuk switching antara lt1 dan lt2} */}
      <img src={mapImage} alt="Map" className="map-image" />
      {zones.map((zone) => (
        <button
          key={zone.id}
          className="zone"
          style={{
            top: `${zone.top}%`,
            left: `${zone.left}%`,
            width: `${zone.width}%`,
            height: `${zone.height}%`,
          }}
          onClick={() => onZoneClick(zone)}
          title={zone.name}
        >
          {" "}
        </button>
      ))}
    </div>
  );
};

export default InteractiveMap;
