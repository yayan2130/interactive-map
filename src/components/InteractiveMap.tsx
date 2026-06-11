import React from "react";
import "./InteractiveMap.css";
import { CensusMap, Zone } from "../types";
import { getEstablishmentIds, pickSoonest } from "../utils/census";

interface Props {
  zones: Zone[];
  mapImage: string;
  onZoneClick: (zone: Zone) => void;
  scale?: number;
  lang?: "id" | "en";
  highlightedZoneIds?: string[];
  census?: CensusMap;
}

const InteractiveMap: React.FC<Props> = ({
  zones,
  scale,
  mapImage,
  onZoneClick,
  lang,
  highlightedZoneIds,
  census,
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
      {zones.map((zone) => {
        const activities = getEstablishmentIds(zone).flatMap(
          (id) => census?.[id]?.activities ?? []
        );
        const soonest = pickSoonest(activities);
        return (
          <button
            key={zone.id}
            className={`zone ${highlightedZoneIds?.includes(zone.id) ? "highlighted" : ""}`}
            style={{
              top: `${zone.top}%`,
              left: `${zone.left}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
            onClick={() => onZoneClick(zone)}
            title={zone.name}
          >
            {soonest && (
              <span
                className={`cycle-badge ${
                  soonest.display === "Now" ? "cycle-now" : ""
                }`}
              >
                {soonest.display}
                {activities.length > 1 && (
                  <span className="cycle-count">×{activities.length}</span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default InteractiveMap;
