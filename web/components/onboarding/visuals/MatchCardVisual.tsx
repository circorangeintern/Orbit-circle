"use client";

import styled from "styled-components";
import colors from "@/lib/colors";
import { Person, floaty } from "../shared";

const CardsLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
`;

const BackCard = styled.div<{ $right: number; $top: number; $rotate: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  right: ${({ $right }) => $right}px;
  width: 210px;
  height: 320px;
  padding: 24px;
  border-radius: 24px;
  background: rgba(119, 59, 236, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.25);
  transform: rotate(${({ $rotate }) => $rotate}deg);
  backdrop-filter: blur(4px);
`;

const BackCardTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #cbd5f5;
`;

const BackCardMatch = styled.div`
  margin-top: 6px;
  font-size: 18px;
  font-weight: 600;
  color: #34d399;
`;

const MainCard = styled.div`
  position: absolute;
  top: 40px;
  right: 90px;
  width: 300px;
  height: 620px;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(119, 59, 236, 0.35) 0%, rgba(21, 10, 74, 0.9) 60%);
  border: 1px solid rgba(167, 139, 250, 0.4);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  animation: ${floaty} 7s ease-in-out infinite;
  z-index: 4;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Eyebrow = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #a78bfa;
`;

const Title = styled.div`
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #f8fafc;
`;

const Match = styled.div`
  margin-top: 6px;
  font-size: 22px;
  font-weight: 700;
  color: #34d399;
`;

const Thumbnail = styled.div`
  margin-top: 28px;
  height: 200px;
  border-radius: 18px;
  background: radial-gradient(120% 120% at 50% 20%, rgba(167, 139, 250, 0.5) 0%, rgba(119, 59, 236, 0.15) 60%);
  border: 1px solid rgba(167, 139, 250, 0.25);
`;

const WhyBox = styled.div`
  margin-top: 24px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.25);
`;

const WhyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #a78bfa;
  margin-bottom: 10px;
`;

const WhyItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #e2e8f0;
  margin-top: 8px;

  &::before {
    content: "✓";
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.buttonPurple};
    color: #fff;
    font-size: 10px;
    flex-shrink: 0;
  }
`;

export default function MatchCardsVisual() {
  return (
    <>
      <CardsLayer>
        <BackCard $right={-20} $top={230} $rotate={6}>
          <BackCardTitle>Data Analyst</BackCardTitle>
          <BackCardMatch>88% Match</BackCardMatch>
        </BackCard>

        <BackCard $right={-60} $top={420} $rotate={10}>
          <BackCardTitle>Psychologist</BackCardTitle>
          <BackCardMatch>85% Match</BackCardMatch>
        </BackCard>

        <MainCard>
          <Eyebrow>Top Match</Eyebrow>
          <Title>Product Designer</Title>
          <Match>92% Match</Match>
          <Thumbnail />
          <WhyBox>
            <WhyTitle>Why it&rsquo;s a great match</WhyTitle>
            <WhyItem>You enjoy creativity and innovation</WhyItem>
            <WhyItem>You like solving problems</WhyItem>
            <WhyItem>You have strong visual thinking</WhyItem>
          </WhyBox>
        </MainCard>
      </CardsLayer>

      <Person left={20} bottom={140} />
    </>
  );
}