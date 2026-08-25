'use client';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled, { keyframes } from "styled-components";
import Image from "next/image";
import { DashboardShell, Muted } from "@/components/dashboard";
import colors from "@/lib/colors";

const BackButton = styled.button`
  width: 54px;
  height: 54px;
  border-radius: 14px;
  border: 1px solid ${colors.cardBorder};
  background: rgba(119, 59, 236, 0.14);
  color: ${colors.normalWhite};
  font-size: 22px;
  cursor: pointer;

  &:hover {
    background: rgba(119, 59, 236, 0.3);
  }
`;

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 34px;
  font-weight: 700;
`;

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 70vh;
  gap: 8px;
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
`;

const Rocket = styled(Image)`
  width: 420px;
  max-width: 70vw;
  height: auto;
  animation: ${float} 3s ease-in-out infinite;
`;

const Status = styled.h2`
  margin: 0;
  font-size: 30px;
  font-weight: 700;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 28px;
`;

const Bar = styled.div`
  width: 380px;
  max-width: 60vw;
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
`;

const Fill = styled.div<{ $p: number }>`
  height: 100%;
  width: ${(p) => p.$p}%;
  border-radius: 999px;
  background: ${colors.buttonPurple};
  transition: width 0.4s ease;
`;

const Percent = styled.span`
  font-size: 18px;
  font-weight: 600;
`;

function AnalyzingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [percent, setPercent] = useState(15);

  useEffect(() => {
    const id = setInterval(() => {
      setPercent((p) => (p >= 100 ? 100 : p + 5));
    }, 350);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (percent < 100) return;
    const id = setTimeout(() => {
      const query = attemptId ? `?attemptId=${attemptId}` : "";
      router.push(`/result${query}`);
    }, 700);
    return () => clearInterval(id);
  }, [percent, attemptId, router]);

  return (
    <DashboardShell
      heading={
        <HeadingRow>
          <BackButton aria-label="Go back" onClick={() => router.push("/quiz")}>
            ‹
          </BackButton>
          <Title>Career Quiz</Title>
        </HeadingRow>
      }
    >
      <Center>
        <Rocket src="/image/rocket.png" alt="" width={700} height={700} priority />
        <Status>Analyzing your answers...</Status>
        <Muted>This will take only a few seconds</Muted>
        <BarRow>
          <Bar>
            <Fill $p={percent} />
          </Bar>
          <Percent>{percent}%</Percent>
        </BarRow>
      </Center>
    </DashboardShell>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense fallback={null}>
      <AnalyzingContent />
    </Suspense>
  );
}