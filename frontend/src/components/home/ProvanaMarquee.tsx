import React from "react";

const WORDS = [
  "PROTEIN",
  "PERFORMANCE",
  "RECOVERY",
  "WELLNESS",
  "HYPERTROPHY",
  "STRENGTH",
  "DISCIPLINE",
  "PRECISION",
];

export default function ProvanaMarquee() {
  return (
    <div className="provana-marquee-wrap" aria-hidden="true">
      <div className="provana-marquee-track">
        {[...WORDS, ...WORDS, ...WORDS].map((word, i) => (
          <div key={`${word}-${i}`} className="provana-marquee-item">
            <span>{word}</span>
            <span className="provana-marquee-dot" />
          </div>
        ))}
      </div>
    </div>
  );
}
