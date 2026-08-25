"use client";

import styled from "styled-components";
import colors from "@/lib/colors";
import { Person, floaty } from "../shared";

type CareerCard = {
  label: string;
  icon: string;
  accent: string;
  top: number;
  right: number;
  width: number;
};

const careerCards: CareerCard[] = [
  { label: "Software\nDevelopment", icon: "</>", accent: "#C026D3", top: 60, right: 340, width: 148 },
  { label: "Healthcare", icon: "⚕", accent: "#7C3AED", top: 0, right: 150, width: 130 },
  { label: "Design", icon: "✎", accent: "#2563EB", top: 190, right: 20, width: 110 },
  { label: "Psychology", icon: "🧠", accent: "#8B5CF6", top: 260, right: 190, width: 130 },
  { label: "Business", icon: "📈", accent: "#EA580C", top: 320, right: 0, width: 120 },
  { label: "Research", icon: "🔬", accent: "#0EA5E9", top: 450, right: 100, width: 120 },
];

const PathSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const CardsLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
`;

const Card = styled.div<{ $accent: string; $top: number; $right: number; $width: number; $delay: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  right: ${({ $right }) => $right}px;
  width: ${({ $width }) => $width}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 12px;
  border-radius: 16px;
  background: ${({ $accent }) => `${$accent}26`};
  border: 1px solid ${({ $accent }) => `${$accent}66`};
  box-shadow: 0 0 24px ${({ $accent }) => `${$accent}40`};
  backdrop-filter: blur(6px);
  animation: ${floaty} 5s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CardIcon = styled.div<{ $accent: string }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 18px;
  color: ${({ $accent }) => $accent};
`;

const CardLabel = styled.span`
  font-size: 14px;
  line-height: 17px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
  white-space: pre-line;
`;

export default function CareerPathVisual() {
  return (
    <>
      <PathSvg viewBox="0 0 686 1030" preserveAspectRatio="none">
        <defs>
          <linearGradient id="careerPathGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F9A8D4" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor={colors.buttonPurple} />
          </linearGradient>
        </defs>
        <path
          d="M120 1020 C 260 880, 180 760, 300 660 C 420 560, 300 480, 420 380 C 520 300, 420 220, 520 120 C 570 70, 560 40, 600 -10"
          stroke="url(#careerPathGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
          strokeDasharray="18 14"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-320" dur="6s" repeatCount="indefinite" />
        </path>
      </PathSvg>

      <Person left={60} bottom={0} />

      <CardsLayer>
        {careerCards.map((card, i) => (
          <Card key={card.label} $accent={card.accent} $top={card.top} $right={card.right} $width={card.width} $delay={i * 0.4}>
            <CardIcon $accent={card.accent}>{card.icon}</CardIcon>
            <CardLabel>{card.label}</CardLabel>
          </Card>
        ))}
      </CardsLayer>
    </>
  );
}