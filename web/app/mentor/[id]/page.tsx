'use client';

import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import colors from "@/lib/colors";
import { DashboardShell, Card, Muted } from "@/components/dashboard";
import { useMentor } from "@/hooks/mentor.hook";
import { useSavedMentors, useSaveMentor, useUnsaveMentor } from "@/hooks/savedMentor.hook";
import { MentorAvatar } from "@/lib/mentorAvatar";

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid ${colors.cardBorder};
  background: rgba(119, 59, 236, 0.14);
  color: ${colors.normalWhite};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: rgba(119, 59, 236, 0.3); }
  @media (max-width: 860px) { width: 38px; height: 38px; }
`;

const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileHeaderIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(119, 59, 236, 0.18);
  border: 1px solid ${colors.cardBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  @media (max-width: 860px) { display: none; }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 20px; }
`;

const ProfileHeroCard = styled(Card)`
  padding: 32px;
  display: flex;
  gap: 32px;
  align-items: center;
  margin-top: 20px;
  @media (max-width: 860px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    gap: 16px;
  }
`;

const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  flex: none;
  @media (max-width: 860px) { width: 100%; align-items: stretch; }
`;

const ActionBtn = styled.button<{ $saved?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${colors.cardBorder};
  background: ${(p) => (p.$saved ? colors.buttonPurple : "rgba(119, 59, 236, 0.14)")};
  color: ${colors.normalWhite};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s ease;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const DesktopContactBtn = styled(ActionBtn)`
  background: ${colors.buttonPurple};
  @media (max-width: 860px) { display: none; }
`;

const ProfileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  span { color: #ffd15c; }
  small { font-weight: 400; color: ${colors.muted}; }
`;

const MentorName = styled.h2`
  margin: 4px 0 2px;
  font-size: 26px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 22px; }
`;

const MentorTitle = styled(Muted)`
  font-size: 15px;
  margin-bottom: 12px;
`;

const SkillsDotRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  color: ${colors.muted};
  font-size: 14px;
  span.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${colors.buttonPurple}; }
  @media (max-width: 860px) { display: none; }
`;

const MobileTagRow = styled.div`
  display: none;
  @media (max-width: 860px) { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
`;

const SkillTag = styled.div`
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(119, 59, 236, 0.16);
  border: 1px solid rgba(119, 59, 236, 0.3);
  font-size: 13px;
  color: ${colors.normalWhite};
`;

const AboutSection = styled.div`
  margin-top: 32px;
  @media (max-width: 860px) { margin-top: 24px; }
`;

const SectionHeading = styled.h3`
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 18px; margin-bottom: 12px; }
`;

const BioText = styled(Muted)`
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-line;
  @media (max-width: 860px) { font-size: 14px; }
`;

const MobileContactBtn = styled.button`
  display: none;
  @media (max-width: 860px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px;
    margin-top: 32px;
    border: none;
    border-radius: 14px;
    background: ${colors.buttonPurple};
    color: ${colors.normalWhite};
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }
`;

export default function MentorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;

  const { data, isLoading, isError } = useMentor(mentorId);
  const mentor = data?.mentor;

  const { data: savedData } = useSavedMentors();
  const isSaved = !!savedData?.mentors.some((m) => m.id === mentorId);
  const saveMentor = useSaveMentor();
  const unsaveMentor = useUnsaveMentor();
  const savingInFlight = saveMentor.isPending || unsaveMentor.isPending;

  const handleToggleSave = () => {
    if (isSaved) unsaveMentor.mutate(mentorId);
    else saveMentor.mutate(mentorId);
  };

  // NOTE: mentor_requests isn't built on the backend yet. This navigates to
  // the flat /mentor-chat route rather than silently doing nothing, but
  // submitting an actual request there will fail until that endpoint exists.
  const handleContact = () => {
    router.push(`/mentor-chat/${mentorId}`);
  };

  if (isLoading) {
    return (
      <DashboardShell heading={<Title>Mentor Profile</Title>}>
        <Muted>Loading mentor profile...</Muted>
      </DashboardShell>
    );
  }

  if (isError || !mentor) {
    return (
      <DashboardShell heading={<Title>Mentor Profile</Title>}>
        <Muted>Couldn&apos;t load this mentor. They may not exist.</Muted>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      heading={
        <HeaderWrapper>
          <BackBtn onClick={() => router.back()} aria-label="Go Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </BackBtn>
          <HeaderTitleRow>
            <ProfileHeaderIcon>👥</ProfileHeaderIcon>
            <Title>Mentor Profile</Title>
          </HeaderTitleRow>
        </HeaderWrapper>
      }
    >
      <ProfileHeroCard>
        <AvatarWrapper>
          <MentorAvatar name={mentor.full_name} photoUrl={mentor.photo_url} size={180} />
          <DesktopContactBtn onClick={handleContact}>Contact Mentor</DesktopContactBtn>
          <ActionBtn $saved={isSaved} onClick={handleToggleSave} disabled={savingInFlight}>
            {isSaved ? "Saved ✓" : "Save Mentor"}
          </ActionBtn>
        </AvatarWrapper>

        <ProfileDetails>
          <RatingBadge>
            <span>★</span> {mentor.rating_avg} <small>({mentor.rating_count})</small>
          </RatingBadge>
          <MentorName>{mentor.full_name}</MentorName>
          <MentorTitle>{mentor.headline}</MentorTitle>
          {mentor.location && <Muted style={{ fontSize: 13 }}>{mentor.location}</Muted>}

          {mentor.specialty_tags && mentor.specialty_tags.length > 0 && (
            <>
              <SkillsDotRow>
                {mentor.specialty_tags.map((skill, index) => (
                  <div key={skill} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {index > 0 && <span className="dot" />}
                    <span>{skill}</span>
                  </div>
                ))}
              </SkillsDotRow>
              <MobileTagRow>
                {mentor.specialty_tags.map((skill) => (
                  <SkillTag key={skill}>{skill}</SkillTag>
                ))}
              </MobileTagRow>
            </>
          )}
        </ProfileDetails>
      </ProfileHeroCard>

      <AboutSection>
        <SectionHeading>About</SectionHeading>
        <BioText>{mentor.bio}</BioText>
      </AboutSection>

      <MobileContactBtn onClick={handleContact}>Contact</MobileContactBtn>
    </DashboardShell>
  );
}