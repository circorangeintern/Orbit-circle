'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import colors from "@/lib/colors";
import { DashboardShell, Card, Muted } from "@/components/dashboard";
import { useSavedCareers, useUnsaveCareer } from "@/hooks/savedCareer.hook";
import { useSavedMentors, useUnsaveMentor } from "@/hooks/savedMentor.hook";
import { MentorAvatar } from "@/lib/mentorAvatar";

type TabType = "careers" | "mentors";

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 24px;
  margin-top: 12px;
`;

const TabSwitchContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${colors.cardBorder};
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: ${(p) => (p.$active ? colors.buttonPurple : "transparent")};
  color: ${(p) => (p.$active ? colors.normalWhite : colors.muted)};
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { color: ${colors.normalWhite}; }
  @media (max-width: 860px) { padding: 8px 16px; font-size: 13px; }
`;

const MainCardContainer = styled(Card)`
  padding: 48px 32px;
  max-width: 760px;
  margin: 28px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  @media (max-width: 860px) { padding: 16px 0; border: none; background: transparent; }
`;

const CareerItemCard = styled(Card)`
  width: 100%;
  padding: 28px 32px;
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  background: rgba(119, 59, 236, 0.08);
  cursor: pointer;
  @media (max-width: 860px) { padding: 20px 20px; grid-template-columns: 24px 1fr 24px; }
`;

const CareerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  grid-column: 2;
`;

const CareerName = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 17px; }
`;

const BookmarkBtn = styled.button`
  background: transparent;
  border: none;
  color: #a77bf3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4px;
  grid-column: 3;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.8; }
`;

const MentorItemCard = styled(Card)`
  width: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(119, 59, 236, 0.08);
  @media (max-width: 860px) { padding: 18px; }
`;

const MentorTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const MentorProfileGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
`;

const MentorDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MentorName = styled.h3`
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 16px; }
`;

const MentorRole = styled(Muted)`
  font-size: 13px;
  margin-bottom: 2px;
`;

const MentorExp = styled(Muted)`
  font-size: 13px;
`;

const MentorBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  span { color: #ffd15c; }
  small { font-weight: 400; color: ${colors.muted}; }
`;

const ContactBtn = styled.button`
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: ${colors.buttonPurple};
  color: ${colors.normalWhite};
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  &:hover { opacity: 0.9; }
  @media (max-width: 860px) { padding: 8px 18px; font-size: 13px; }
`;

export default function SavedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("careers");

  const { data: careersData, isLoading: careersLoading } = useSavedCareers();
  const { data: mentorsData, isLoading: mentorsLoading } = useSavedMentors();
  const unsaveCareer = useUnsaveCareer();
  const unsaveMentor = useUnsaveMentor();

  const careers = careersData?.careers ?? [];
  const mentors = mentorsData?.mentors ?? [];

  return (
    <DashboardShell>
      <HeaderWrapper>
        <TabSwitchContainer>
          <TabButton $active={activeTab === "careers"} onClick={() => setActiveTab("careers")}>
            Saved Careers
          </TabButton>
          <TabButton $active={activeTab === "mentors"} onClick={() => setActiveTab("mentors")}>
            Saved Mentors
          </TabButton>
        </TabSwitchContainer>
      </HeaderWrapper>

      <MainCardContainer>
        {activeTab === "careers" && careersLoading && <Muted>Loading saved careers...</Muted>}
        {activeTab === "careers" && !careersLoading && careers.length === 0 && (
          <Muted>You haven&apos;t saved any careers yet.</Muted>
        )}
        {activeTab === "careers" &&
          careers.map((career) => (
            <CareerItemCard key={career.id}>
              <div />
              <CareerInfo onClick={() => router.push(`/career/${career.id}`)}>
                <CareerName>{career.title}</CareerName>
                {/* NOTE: no match % here -- that's specific to a completed
                    quiz attempt, not a fixed property of a saved career */}
              </CareerInfo>
              <BookmarkBtn
                onClick={(e) => {
                  e.stopPropagation();
                  unsaveCareer.mutate(career.id);
                }}
                aria-label="Remove saved career"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </BookmarkBtn>
            </CareerItemCard>
          ))}

        {activeTab === "mentors" && mentorsLoading && <Muted>Loading saved mentors...</Muted>}
        {activeTab === "mentors" && !mentorsLoading && mentors.length === 0 && (
          <Muted>You haven&apos;t saved any mentors yet.</Muted>
        )}
        {activeTab === "mentors" &&
          mentors.map((mentor) => (
            <MentorItemCard key={mentor.id}>
              <MentorTopRow>
                <MentorProfileGroup onClick={() => router.push(`/mentor/${mentor.id}`)}>
                  <MentorAvatar name={mentor.full_name} photoUrl={mentor.photo_url} size={60} />
                  <MentorDetails>
                    <MentorName>{mentor.full_name}</MentorName>
                    <MentorRole>{mentor.headline}</MentorRole>
                    {mentor.years_experience != null && (
                      <MentorExp>{mentor.years_experience}+ years experience</MentorExp>
                    )}
                  </MentorDetails>
                </MentorProfileGroup>

                <BookmarkBtn
                  onClick={() => unsaveMentor.mutate(mentor.id)}
                  aria-label="Remove saved mentor"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </BookmarkBtn>
              </MentorTopRow>

              <MentorBottomRow>
                <RatingBadge>
                  <span>★</span> {mentor.rating_avg} <small>({mentor.rating_count})</small>
                </RatingBadge>
                {/* NOTE: mentor_requests isn't built on the backend yet --
                    this button navigates but submitting will fail until
                    that endpoint exists */}
                <ContactBtn onClick={() => router.push(`/mentor-chat/${mentor.id}`)}>Contact</ContactBtn>
              </MentorBottomRow>
            </MentorItemCard>
          ))}
      </MainCardContainer>
    </DashboardShell>
  );
}