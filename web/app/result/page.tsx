'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import Image from "next/image";
import colors from "@/lib/colors";
import {
  DashboardShell,
  Card,
  Accent,
  Muted,
  useDashboardUser,
} from "@/components/dashboard";
import { useQuizResults, QuizResult } from "@/hooks/quiz.hook";
import { formatSalaryRange } from "@/lib/Format";

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: 860px) { gap: 12px; }
`;

const BackButton = styled.button`
  width: 46px; height: 46px; flex: none; border-radius: 12px;
  border: 1px solid ${colors.cardBorder};
  background: rgba(119, 59, 236, 0.14);
  color: ${colors.normalWhite};
  font-size: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s ease;
  &:hover { background: rgba(119, 59, 236, 0.3); }
  @media (max-width: 860px) { width: 38px; height: 38px; font-size: 18px; }
`;

const Title = styled.h1`
  margin: 0; font-size: 30px; font-weight: 700;
  @media (max-width: 860px) { font-size: 22px; }
`;

const Intro = styled.div`
  margin: 28px 0 16px;
  @media (max-width: 860px) { margin: 18px 0 12px; }
`;

const Hi = styled.p`
  margin: 0 0 6px; font-size: 20px;
  @media (max-width: 860px) { font-size: 16px; }
`;

const Big = styled.h2`
  margin: 0 0 8px; font-size: 28px; font-weight: 700;
  @media (max-width: 860px) { font-size: 20px; line-height: 1.3; }
`;

const Stage = styled.div`
  position: relative; margin: 20px auto 0; width: min(760px, 100%);
  display: flex; flex-direction: column; align-items: center;
  overflow: hidden; padding: 10px 0;
`;

const Backdrop = styled(Image)`
  position: absolute; width: 540px; max-width: 90%; height: auto;
  opacity: 0.25; top: 20px; left: 50%; transform: translateX(-50%);
  pointer-events: none; border-radius: 50%;
`;

const Stack = styled.div`
  position: relative; z-index: 1; width: min(480px, 100%);
  display: flex; flex-direction: column; gap: 16px;
  @media (max-width: 860px) { gap: 12px; }
`;

const AccordionCard = styled(Card)<{ $expanded: boolean }>`
  backdrop-filter: blur(6px);
  padding: ${(p) => (p.$expanded ? "24px" : "16px 20px")};
  cursor: pointer;
  transition: padding 0.15s ease;
  @media (max-width: 860px) {
    padding: ${(p) => (p.$expanded ? "18px" : "14px 16px")};
  }
`;

const HeaderRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
`;

const NameRow = styled.div`
  display: flex; align-items: center; gap: 10px;
`;

const RankName = styled.h3<{ $expanded: boolean }>`
  margin: 0;
  font-size: ${(p) => (p.$expanded ? "26px" : "18px")};
  font-weight: 700;
  @media (max-width: 860px) {
    font-size: ${(p) => (p.$expanded ? "20px" : "15px")};
  }
`;

const Chevron = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  transform: rotate(${(p) => (p.$expanded ? "180deg" : "0deg")});
  transition: transform 0.15s ease;
  color: ${colors.muted};
`;

const Badge = styled.span<{ $small?: boolean }>`
  padding: ${(p) => (p.$small ? "6px 12px" : "8px 16px")};
  border-radius: 12px;
  background: #4a90e2;
  color: ${colors.normalWhite};
  font-size: ${(p) => (p.$small ? "14px" : "15px")};
  font-weight: 700;
  white-space: nowrap;
  @media (max-width: 860px) {
    padding: ${(p) => (p.$small ? "4px 10px" : "6px 12px")};
    font-size: ${(p) => (p.$small ? "12px" : "13px")};
  }
`;

const ConfidenceBadge = styled.span<{ $band?: "High" | "Medium" | "Low" }>`
  padding: 6px 12px;
  border-radius: 12px;
  background: ${(p) => {
    switch (p.$band) {
      case "High": return "#10b981";
      case "Medium": return "#f59e0b";
      case "Low": return "#ef4444";
      default: return "#6b7280";
    }
  }};
  color: ${colors.normalWhite};
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  @media (max-width: 860px) {
    padding: 4px 10px;
    font-size: 12px;
  }
`;

const ExpandedContent = styled.div`
  margin-top: 16px;
`;

const SkillTags = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0;
`;

const SkillTag = styled.span`
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(119, 59, 236, 0.18);
  border: 1px solid ${colors.cardBorder};
  color: ${colors.normalWhite};
  font-size: 13px;
`;

const SalaryRow = styled.div`
  display: flex; gap: 24px; margin: 14px 0;
  flex-wrap: wrap;
  @media (max-width: 860px) { gap: 14px; }
`;

const SalaryBlock = styled.div`
  font-size: 13px;
`;

const SalaryLabel = styled.p`
  margin: 0 0 4px;
  color: ${colors.muted};
`;

const SalaryValue = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
`;

const DetailButton = styled.button`
  margin-top: 12px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid ${colors.cardBorder};
  background: rgba(119, 59, 236, 0.14);
  color: ${colors.normalWhite};
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: rgba(119, 59, 236, 0.3); }
`;

const Cta = styled.button`
  margin-top: 28px;
  width: min(480px, 100%);
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 16px 20px; border: none; border-radius: 14px;
  background: ${colors.buttonPurple};
  color: ${colors.normalWhite};
  font-family: inherit; font-size: 18px; font-weight: 700; cursor: pointer;
  position: relative; z-index: 1;
  transition: filter 0.15s ease;
  &:hover { filter: brightness(1.1); }
  @media (max-width: 860px) { margin-top: 20px; padding: 14px; font-size: 16px; }
`;

const Retake = styled.button`
  margin-top: 16px;
  display: flex; align-items: center; gap: 8px;
  background: none; border: none;
  color: ${colors.normalWhite};
  font-family: inherit; font-size: 16px; font-weight: 500; cursor: pointer;
  position: relative; z-index: 1; opacity: 0.9;
  &:hover { opacity: 1; }
  @media (max-width: 860px) { font-size: 14px; }
`;

function AccordionResultCard({
  result,
  expanded,
  onToggle,
}: {
  result: QuizResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();

  return (
    <AccordionCard $expanded={expanded} onClick={onToggle}>
      <HeaderRow>
        <NameRow>
          <RankName $expanded={expanded}>{result.title}</RankName>
        </NameRow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge $small={!expanded}>{result.matchPercent}% Match</Badge>
          {result.confidenceBand && (
            <ConfidenceBadge $band={result.confidenceBand}>
              Confidence: {result.confidenceBand}
            </ConfidenceBadge>
          )}
          <Chevron $expanded={expanded}>▾</Chevron>
        </div>
      </HeaderRow>

      {expanded && (
        <ExpandedContent onClick={(e) => e.stopPropagation()}>
          {result.why_this_summary && (
            <Muted style={{ fontSize: 14, lineHeight: 1.5 }}>
              {result.why_this_summary}
            </Muted>
          )}

          {result.key_skills && result.key_skills.length > 0 && (
            <SkillTags>
              {result.key_skills.map((skill) => (
                <SkillTag key={skill}>{skill}</SkillTag>
              ))}
            </SkillTags>
          )}

          <SalaryRow>
            <SalaryBlock>
              <SalaryLabel>Local salary</SalaryLabel>
              <SalaryValue>
                {formatSalaryRange(result.salary_local_min, result.salary_local_max, result.salary_local_currency)}
              </SalaryValue>
            </SalaryBlock>
            <SalaryBlock>
              <SalaryLabel>International</SalaryLabel>
              <SalaryValue>
                {formatSalaryRange(result.salary_intl_min, result.salary_intl_max, result.salary_intl_currency)}
              </SalaryValue>
            </SalaryBlock>
          </SalaryRow>

          <DetailButton onClick={() => router.push(`/career/${result.id}`)}>
            View full details →
          </DetailButton>
        </ExpandedContent>
      )}
    </AccordionCard>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const { userName } = useDashboardUser();

  const { data, isLoading, isError, error } = useQuizResults(attemptId);
  const results = data?.results ?? [];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const currentExpandedId = expandedId ?? results[0]?.id ?? null;

  return (
    <DashboardShell
      heading={
        <HeadingRow>
          <BackButton aria-label="Go back" onClick={() => router.push("/quiz")}>
            ‹
          </BackButton>
          <Title>Your Results</Title>
        </HeadingRow>
      }
    >
      <Intro>
        <Hi>Great job, {userName}!</Hi>
        <Big>
          Here are your top <Accent>career matches</Accent>
        </Big>
        <Muted style={{ fontSize: 15 }}>
          Based on your personality, interests and quiz results
        </Muted>
      </Intro>

      <Stage>
        <Backdrop src="/image/results-orb.jpg" alt="" loading="lazy" width={620} height={620} />

        {!attemptId && (
          <Muted style={{ marginTop: 40 }}>
            No quiz attempt found. Try taking the quiz first.
          </Muted>
        )}

        {attemptId && isLoading && (
          <Muted style={{ marginTop: 40 }}>Loading your results...</Muted>
        )}

        {attemptId && isError && (
          <Muted style={{ marginTop: 40, color: "#ff6b6b" }}>
            {(error as Error)?.message || "Couldn't load your results. Please try again."}
          </Muted>
        )}

        {attemptId && !isLoading && !isError && results.length === 0 && (
          <Muted style={{ marginTop: 40 }}>
            This quiz attempt doesn&apos;t have results yet.
          </Muted>
        )}

        {results.length > 0 && (
          <>
            <Stack>
              {results.map((result) => (
                <AccordionResultCard
                  key={result.id}
                  result={result}
                  expanded={currentExpandedId === result.id}
                  onToggle={() =>
                    setExpandedId((current) => {
                      const activeId = current ?? results[0]?.id;
                      return activeId === result.id ? null : result.id;
                    })
                  }
                />
              ))}
            </Stack>

            <Cta onClick={() => router.push(`/career/${results[0].id}`)}>
              Explore My Matches →
            </Cta>
          </>
        )}

        <Retake onClick={() => router.push("/quiz")}>↺ Retake Quiz</Retake>
      </Stage>
    </DashboardShell>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}