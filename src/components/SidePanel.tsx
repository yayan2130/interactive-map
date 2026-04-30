import React, { useState } from "react";
import "./SidePanel.css";
import { Zone } from "../types";

interface Props {
  zone: Zone | null;
  onClose: () => void;
}

const SidePanel: React.FC<Props> = ({ zone, onClose }) => {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [infoOpen, setInfoOpen] = useState(false);
  const infoUrl = zone?.fib ?? "";
  const hasInfo = Boolean(infoUrl);

  if (!zone) return null;

  return (
    <>
      <div className="side-panel-backdrop" onClick={onClose} />
      <aside className="side-panel visible">
        <div className="panel-header">
          <div>
            <span className="panel-badge">Zone detail</span>
            <h2>{zone.name}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
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

        <div className="info-action-bar">
          <button
            type="button"
            className="info-button"
            onClick={() => setInfoOpen(true)}
            disabled={!hasInfo}
          >
            Open establishment info
          </button>
        </div>

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

        {(zone.activity || zone.video) && (
          <div className="section-block">
            <h3>Media highlights</h3>
            {zone.activity && (
              <img
                className="establishment-image"
                src={zone.activity}
                alt={`${zone.name} activity`}
              />
            )}
            {zone.video && (
              <div className="video-container">
                <iframe
                  className="establishment-video"
                  src={zone.video}
                  title={`${zone.name} video`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
        )}

        <div className="panel-footer">
          <span>Tap outside the panel to close.</span>
          <span>Swipe left on mobile.</span>
        </div>
      </aside>

      {infoOpen && (
        <>
          <div
            className="info-modal-backdrop"
            onClick={() => setInfoOpen(false)}
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
                onClick={() => setInfoOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="info-modal-body">
              {hasInfo ? (
                <iframe
                  className="info-iframe"
                  src={infoUrl}
                  title={`${zone.name} info`}
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="info-empty">
                  <p>No external info is available for this zone.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SidePanel;
