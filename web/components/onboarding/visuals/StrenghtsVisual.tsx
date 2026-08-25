"use client";

import styled from "styled-components";
import { Person, floaty } from "../shared";

type StrengthPill = {
  label: string;
  icon: string;
  accent: string;
  top: number;
  right: number;
};

const strengths: StrengthPill[] = [
  { label: "Analytical", icon: "🧠", accent: "#8B5CF6", top: 90, right: 300 },
  { label: "Creative", icon: "💡", accent: "#A78BFA", top: 170, right: 40 },
  { label: "Leadership", icon: "👥", accent: "#7C3AED", top: 380, right: 400 },
  { label: "Empathy", icon: "♡", accent: "#C4B5FD", top: 430, right: 30 },
  { label: "Focused", icon: "🎯", accent: "#818CF8", top: 610, right: 60 },
];

const OrbitSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const PillsLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
`;

const Pill = styled.div<{ $accent: string; $top: number; $right: number; $delay: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  right: ${({ $right }) => $right}px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px 14px 14px;
  border-radius: 999px;
  background: rgba(119, 59, 236, 0.28);
  border: 1px solid ${({ $accent }) => `${$accent}80`};
  box-shadow: 0 0 24px ${({ $accent }) => `${$accent}33`};
  backdrop-filter: blur(6px);
  animation: ${floaty} 6s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  white-space: nowrap;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const PillIcon = styled.span<{ $accent: string }>`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  font-size: 16px;
  color: ${({ $accent }) => $accent};
`;

const PillLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
`;

export default function StrengthsVisual() {
  return (
    <>
      <OrbitSvg viewBox="0 0 686 1030">
        <circle cx="343" cy="460" r="220" fill="none" stroke="#A78BFA" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 8" />
        <circle cx="343" cy="460" r="320" fill="none" stroke="#A78BFA" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="2 8" />
        {[
          [343, 140],
          [520, 220],
          [560, 460],
          [190, 260],
          [150, 620],
          [500, 700],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={5} fill="#A78BFA" opacity={0.8} />
        ))}
      </OrbitSvg>

      <Person left={140} bottom={0} />

      <PillsLayer>
        {strengths.map((s, i) => (
          <Pill key={s.label} $accent={s.accent} $top={s.top} $right={s.right} $delay={i * 0.35}>
            <PillIcon $accent={s.accent}>{s.icon}</PillIcon>
            <PillLabel>{s.label}</PillLabel>
          </Pill>
        ))}
      </PillsLayer>
    </>
  );
}