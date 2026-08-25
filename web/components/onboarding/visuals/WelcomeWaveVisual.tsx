"use client";

import styled from "styled-components";

/**
 * The mobile Welcome screen doesn't use MatchCardsVisual at all — it has
 * its own much simpler decoration: a thin, glowing "bowtie" of crossing
 * wave lines sitting behind the CTA buttons. Desktop-only (hidden above
 * 900px, where MatchCardsVisual is used instead via hideVisualOnMobile).
 */

const WaveWrap = styled.div`
  display: none;
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;

  @media (max-width: 900px) {
    display: block;
  }
`;

const WaveSvg = styled.svg`
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 140%;
  max-width: 640px;
  height: auto;
  opacity: 0.85;
`;

export default function WelcomeWaveVisual() {
  const lines = Array.from({ length: 9 });

  return (
    <WaveWrap aria-hidden>
      <WaveSvg viewBox="0 0 780 420" fill="none">
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="780" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#773BEC" stopOpacity="0" />
            <stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#773BEC" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((_, i) => {
          const spread = 40 + i * 22; // how far each line bows at the ends
          return (
            <path
              key={i}
              d={`M0 ${210 - spread} C 260 210, 520 210, 780 ${210 + spread}`}
              stroke="url(#waveGradient)"
              strokeWidth="1.4"
              fill="none"
            />
          );
        })}
      </WaveSvg>
    </WaveWrap>
  );
}