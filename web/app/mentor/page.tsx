'use client';

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import colors from "@/lib/colors";
import { DashboardShell, Card, Muted } from "@/components/dashboard";
import { useCareer } from "@/hooks/career.hook";
import { MentorAvatar } from "@/lib/mentorAvatar";

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  @media (max-width: 860px) { flex-direction: column; align-items: flex-start; }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 22px; }
`;

const SubText = styled(Muted)`
  font-size: 14px;
  margin-top: 4px;
`;

const MentorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 28px;
  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 720px) { grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
`;

const MentorCard = styled(Card)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  @media (max-width: 860px) { padding: 18px; }
`;

const ProfileRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MentorName = styled.h3`
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 700;
  @media (max-width: 860px) { font-size: 17px; }
`;

const Role = styled(Muted)`
  font-size: 13px;
  line-height: 1.4;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 13px;
  color: ${colors.muted};
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0;
`;

const Tag = styled.span`
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  color: ${colors.normalWhite};
`;

const Bio = styled(Muted)`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 15px;
  span { color: #ffd15c; }
  small { font-weight: 400; color: ${colors.muted}; font-size: 13px; }
`;

const ContactBtn = styled.button`
  padding: 10px 22px;
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
  @media (max-width: 860px) { padding: 8px 18px; }
`;

function MentorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerId = searchParams.get("careerId");

  const { data, isLoading, isError } = useCareer(careerId);
  const career = data?.career;
  const mentors = career?.mentors ?? [];

  if (!careerId) {
    return (
      <DashboardShell heading={<Title>Mentors</Title>}>
        <Muted style={{ marginTop: 32 }}>
         Your mentor journey starts here
Complete the career quiz and save a career to unlock mentors in your chosen field.
        </Muted>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      heading={
        <HeaderRow>
          <div>
            <Title>Mentors{career ? ` for ${career.title}` : ""}</Title>
            <SubText>Connect with professionals working in this field.</SubText>
          </div>
        </HeaderRow>
      }
    >
      {isLoading && <Muted style={{ marginTop: 32 }}>Loading mentors...</Muted>}
      {isError && <Muted style={{ marginTop: 32 }}>Couldn&apos;t load this career&apos;s mentors.</Muted>}
      {!isLoading && !isError && mentors.length === 0 && (
        <Muted style={{ marginTop: 32 }}>No mentors linked to this career yet.</Muted>
      )}

      <MentorGrid>
        {mentors.map((mentor) => (
          <MentorCard key={mentor.id} onClick={() => router.push(`/mentor/${mentor.id}`)}>
            <div>
              <ProfileRow>
                <MentorAvatar name={mentor.full_name} photoUrl={mentor.photo_url} size={64} />
                <ProfileInfo>
                  <MentorName>{mentor.full_name}</MentorName>
                  <Role>{mentor.headline}</Role>
                </ProfileInfo>
              </ProfileRow>

              {mentor.location && (
                <Location>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21s-6-5.333-6-10a6 6 0 0112 0c0 4.667-6 10-6 10z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="11" r="2" fill="currentColor" />
                  </svg>
                  {mentor.location}
                </Location>
              )}

              {mentor.specialty_tags && mentor.specialty_tags.length > 0 && (
                <TagsRow>
                  {mentor.specialty_tags.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </TagsRow>
              )}

              <Bio>{mentor.bio}</Bio>
            </div>

            <CardFooter>
              <Rating>
                <span>★</span> {mentor.rating_avg} <small>({mentor.rating_count})</small>
              </Rating>
              <ContactBtn
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/mentor-chat/${mentor.id}`);
                }}
              >
                Contact
              </ContactBtn>
            </CardFooter>
          </MentorCard>
        ))}
      </MentorGrid>
    </DashboardShell>
  );
}

export default function MentorPage() {
  return (
    <Suspense fallback={null}>
      <MentorContent />
    </Suspense>
  );
}