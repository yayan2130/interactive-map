import React, { useState } from "react";
import "./SidePanel.css";
import { Zone } from "../types";

interface Props {
  zone: Zone | null;
  onClose: () => void;
}

const SidePanel: React.FC<Props> = ({ zone, onClose }) => {
  const [lang, setLang] = useState<"id" | "en">("id");

  if (!zone) return null; // jika belum pilih zona, tidak tampilkan panel

  return (
    <div className="side-panel visible">
      <div className="content">
        {/* Tombol tutup */}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* Nama Zona */}
        <h2>{zone.name}</h2>

        {/* Logo establishment (opsional) */}
        {zone.image && (
          <img
            className="establishment-logo"
            src={zone.image}
            alt={zone.name}
            width="150"
          />
        )}

        {/* Tombol ganti bahasa */}
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

        {/* Deskripsi */}
        <p className="description">
          {" "}
          <p>
            {lang === "en" ? zone.description.en : zone.description.id}
          </p>{" "}
        </p>

        {/* Foto kegiatan */}
        {zone.activity && (
          <img
            className="establishment-image"
            src={zone.activity}
            alt={`${zone.name} activity`}
            width="500"
          />
        )}

        {/* Video kegiatan */}
        {zone.video && (
          <div className="video-container">
            <iframe
              className="establishment-video"
              src={zone.video}
              title={`${zone.name} video`}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;
