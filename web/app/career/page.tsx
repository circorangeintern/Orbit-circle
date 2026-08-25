'use client';

import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import Image from "next/image";
import colors from "@/lib/colors";
import { DashboardShell, Card, Muted } from "@/components/dashboard";
import { useCareer } from "@/hooks/career.hook";
import { useSavedCareers, useSaveCareer, useUnsaveCareer } from "@/hooks/savedCareer.hook";
import { formatSalaryRange } from "@/lib/Format";

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 22px; }
`;

const BookmarkBtn = styled.button<{ $saved?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid ${colors.cardBorder};
  background: ${(p) => (p.$saved ? colors.buttonPurple : "rgba(119, 59, 236, 0.14)")};
  color: ${colors.normalWhite};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:hover { background: ${(p) => (p.$saved ? colors.buttonPurple : "rgba(119, 59, 236, 0.3)")}; }
  @media (max-width: 860px) { width: 38px; height: 38px; }
`;

const HeroCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36px 40px;
  position: relative;
  overflow: hidden;
  margin-top: 16px;
  @media (max-width: 860px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 20px;
    gap: 20px;
  }
`;

const HeroLeft = styled.div`
  max-width: 500px;
  z-index: 1;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  @media (max-width: 860px) { font-size: 13px; padding: 6px 12px; margin-bottom: 12px; }
`;

const HeroTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 24px; }
`;

const HeroDesc = styled(Muted)`
  font-size: 16px;
  line-height: 1.6;
  @media (max-width: 860px) { font-size: 14px; }
`;

const HeroImgWrapper = styled.div`
  position: relative;
  width: 260px;
  height: 160px;
  flex: none;
  @media (max-width: 860px) { width: 100%; height: 140px; }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 16px; margin-top: 20px; }
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 18px; margin-bottom: 12px; }
`;

const SectionBody = styled(Muted)`
  font-size: 15px;
  line-height: 1.7;
  @media (max-width: 860px) { font-size: 14px; }
`;

const BulletList = styled.ul`
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  @media (max-width: 860px) { display: none; }
`;

const BulletItem = styled.li`
  color: ${colors.muted};
  font-size: 15px;
  line-height: 1.5;
`;

const MobileTasks = styled.div`
  display: none;
  @media (max-width: 860px) { display: flex; flex-direction: column; gap: 10px; }
`;

const TaskPill = styled.div`
  background: rgba(119, 59, 236, 0.12);
  border: 1px solid rgba(119, 59, 236, 0.25);
  border-radius: 12px;
  padding: 14px 16px;
  color: ${colors.normalWhite};
  font-size: 14px;
  text-align: center;
  font-weight: 500;
`;

const SkillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const SkillTag = styled.span`
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(119, 59, 236, 0.16);
  border: 1px solid rgba(119, 59, 236, 0.3);
  font-size: 13px;
  color: ${colors.normalWhite};
`;

const SalarySection = styled.div`
  margin-top: 32px;
  @media (max-width: 860px) { margin-top: 24px; }
`;

const SalaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 14px; }
`;

const SalaryCard = styled(Card)`
  padding: 24px;
  text-align: center;
  background: rgba(119, 59, 236, 0.1);
  @media (max-width: 860px) { padding: 18px; }
`;

const FlagHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #4a90e2;
  margin-bottom: 8px;
`;

const SalaryAmount = styled.div`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
  @media (max-width: 860px) { font-size: 22px; }
`;

const Currency = styled.span`
  font-size: 13px;
  color: ${colors.muted};
`;

const MobileCta = styled.button`
  display: none;
  @media (max-width: 860px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px;
    margin-top: 28px;
    border: none;
    border-radius: 14px;
    background: ${colors.buttonPurple};
    color: ${colors.normalWhite};
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }
`;

const DesktopCta = styled.button`
  padding: 14px 24px;
  margin-top: 28px;
  border: none;
  border-radius: 14px;
  background: ${colors.buttonPurple};
  color: ${colors.normalWhite};
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  @media (max-width: 860px) { display: none; }
`;

export default function CareerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const careerId = params.id as string;

  const { data, isLoading, isError } = useCareer(careerId);
  const career = data?.career;

  const { data: savedData } = useSavedCareers();
  const isSaved = !!savedData?.careers.some((c) => c.id === careerId);

  const saveCareer = useSaveCareer();
  const unsaveCareer = useUnsaveCareer();
  const savingInFlight = saveCareer.isPending || unsaveCareer.isPending;

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveCareer.mutate(careerId);
    } else {
      saveCareer.mutate(careerId);
    }
  };

  const primaryMentor = career?.mentors?.[0];

  const handleFindMentor = () => {
    router.push(primaryMentor ? `/mentors/${primaryMentor.id}` : "/mentors");
  };

  if (isLoading) {
    return (
      <DashboardShell heading={<Title>Career Details</Title>}>
        <Muted>Loading career details...</Muted>
      </DashboardShell>
    );
  }

  if (isError || !career) {
    return (
      <DashboardShell heading={<Title>Career Details</Title>}>
        <Muted>Couldn&apos;t load this career. It may not exist.</Muted>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      heading={
        <HeaderWrapper>
          <Title>Career Details</Title>
          <BookmarkBtn
            $saved={isSaved}
            onClick={handleToggleSave}
            disabled={savingInFlight}
            aria-label="Save Career"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"}>
              <path
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </BookmarkBtn>
        </HeaderWrapper>
      }
    >
      <HeroCard>
        <HeroLeft>
          {/* NOTE: match % is quiz-attempt-specific, not a fixed property of a
              career -- there is no "this career's match %" outside the
              context of a completed quiz attempt. The badge is omitted here
              rather than showing a fabricated or stale number. */}
          <HeroTitle>{career.title}</HeroTitle>
          <HeroDesc>{career.why_this_summary}</HeroDesc>
        </HeroLeft>
        <HeroImgWrapper>
          <Image src="/image/icon-laptop.png" alt={career.title} fill style={{ objectFit: "contain" }} />
        </HeroImgWrapper>
      </HeroCard>

      <ContentGrid>
        <Card>
          <SectionTitle>About this career</SectionTitle>
          <SectionBody>{career.description}</SectionBody>

          {career.key_skills && career.key_skills.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: 24, fontSize: 18 }}>Key skills</SectionTitle>
              <SkillsRow>
                {career.key_skills.map((skill) => (
                  <SkillTag key={skill}>{skill}</SkillTag>
                ))}
              </SkillsRow>
            </>
          )}
        </Card>

        <Card>
          <SectionTitle>What you&apos;ll do</SectionTitle>
          <BulletList>
            {career.daily_tasks?.map((task, i) => (
              <BulletItem key={i}>{task}</BulletItem>
            ))}
          </BulletList>
          <MobileTasks>
            {career.daily_tasks?.map((task, i) => (
              <TaskPill key={i}>{task}</TaskPill>
            ))}
          </MobileTasks>
        </Card>
      </ContentGrid>

      <SalarySection>
        <SectionTitle>Estimated annual salary</SectionTitle>
        <SalaryGrid>
          <SalaryCard>
            <FlagHeader>🇳🇬 Nigeria</FlagHeader>
            <SalaryAmount>
              {formatSalaryRange(career.salary_local_min, career.salary_local_max, career.salary_local_currency)}
            </SalaryAmount>
            <Currency>({career.salary_local_currency})</Currency>
          </SalaryCard>

          <SalaryCard>
            <FlagHeader>🌐 Internationally</FlagHeader>
            <SalaryAmount>
              {formatSalaryRange(career.salary_intl_min, career.salary_intl_max, career.salary_intl_currency)}
            </SalaryAmount>
            <Currency>({career.salary_intl_currency})</Currency>
          </SalaryCard>
        </SalaryGrid>
      </SalarySection>

      {/* NOTE: learning_resources aren't included here -- that endpoint
          doesn't exist on the backend yet, not a frontend gap. */}

      <DesktopCta onClick={handleFindMentor}>Find a Mentor</DesktopCta>
      <MobileCta onClick={handleFindMentor}>Find a Mentor</MobileCta>
    </DashboardShell>
  );
}