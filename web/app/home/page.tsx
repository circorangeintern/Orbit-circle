'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import colors from "@/lib/colors";
import { useSavedCareers } from "@/hooks/savedCareer.hook";
import { useSavedMentors } from "@/hooks/savedMentor.hook";
import { useStartQuiz } from "@/hooks/quiz.hook";
import { useConversations } from "@/hooks/conversation.hook";
import {
  DashboardShell,
  Card,
  Accent,
  Muted,
  ArrowIcon,
  useDashboardUser,
} from "@/components/dashboard";

const Eyebrow = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 600;

  @media (max-width: 860px) {
    font-size: 15px;
  }
`;

const Title = styled.h1`
  margin: 4px 0;
  font-size: 44px;
  font-weight: 700;

  @media (max-width: 860px) {
    font-size: 24px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 40px;
  margin-top: 24px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 860px) {
    gap: 20px;
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 32px 0 16px;
  font-size: 24px;
  font-weight: 600;

  @media (max-width: 860px) {
    margin: 20px 0 10px;
    font-size: 16px;
  }
`;

const QuizCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 560px;

  @media (max-width: 860px) {
    gap: 12px;
    padding: 14px;
  }
`;

const Thumb = styled.img`
  width: 92px;
  height: 92px;
  border-radius: 16px;
  background: rgba(119, 59, 236, 0.2);
  object-fit: contain;

  @media (max-width: 860px) {
    width: 52px;
    height: 52px;
    flex: none;
  }
`;

const Continue = styled.button`
  margin-left: auto;
  align-self: flex-start;
  padding: 12px 22px;
  border: none;
  border-radius: 10px;
  background: ${colors.buttonPurple};
  color: ${colors.otherWhite};
  font-family: inherit;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;

  @media (max-width: 860px) {
    padding: 8px 14px;
    font-size: 14px;
  }
`;

const Bar = styled.div`
  height: 12px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.15);
  overflow: hidden;
  flex: 1;

  span {
    display: block;
    height: 100%;
    width: 75%;
    border-radius: 999px;
    background: ${colors.buttonPurple};
  }

  @media (max-width: 860px) {
    height: 8px;
  }
`;

const Match = styled.span`
  display: inline-block;
  margin: 10px 0;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(74, 222, 128, 0.15);
  color: ${colors.green};
  font-size: 18px;

  @media (max-width: 860px) {
    padding: 4px 10px;
    font-size: 13px;
  }
`;

const TileRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-top: 40px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 20px;
  }
`;

const Tile = styled(Card)`
  position: relative;
  min-height: 280px;

  @media (max-width: 860px) {
    min-height: 176px;
    padding: 14px;
  }
`;

const TileHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 28px;
  }

  @media (max-width: 860px) {
    gap: 8px;

    h3 {
      font-size: 15px;
    }
  }
`;

const TileArt = styled.img`
  display: block;
  width: 150px;
  height: 150px;
  margin: 8px auto 0;
  object-fit: contain;

  @media (max-width: 860px) {
    width: 84px;
    height: 84px;
  }
`;

const RoundArrow = styled.button`
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid ${colors.cardBorder};
  background: rgba(119, 59, 236, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 860px) {
    right: 12px;
    bottom: 12px;
    width: 32px;
    height: 32px;
  }
`;

const BookmarkBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(119, 59, 236, 0.25);
  color: ${colors.buttonPurple};
  font-size: 20px;

  @media (max-width: 860px) {
    width: 28px;
    height: 28px;
    flex: none;
  }
`;

const SideCard = styled(Card)`
  margin-top: 88px;
  padding: 32px;

  @media (max-width: 1100px) {
    margin-top: 0;
  }

  @media (max-width: 860px) {
    padding: 18px;
  }
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 22px 0 28px;

  @media (max-width: 860px) {
    gap: 14px;
    margin: 16px 0 20px;
  }
`;

const RingContainer = styled.span<{ $percent: number }>`
  width: 84px;
  height: 84px;
  flex: none;
  border-radius: 50%;
  background: conic-gradient(
    ${colors.buttonPurple} 0turn ${(p) => p.$percent / 100}turn,
    rgba(248, 250, 252, 0.15) ${(p) => p.$percent / 100}turn 1turn
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
`;

const RingInner = styled.span`
  width: 66px;
  height: 66px;
  border-radius: 50%;
  background: ${colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Steps = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 20px;
`;

const Step = styled.li<{ $done?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &::before {
    content: "•";
    margin-right: 8px;
  }

  span {
    margin-right: auto;
  }

  em {
    font-style: normal;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: ${(p) => (p.$done ? "#0A003C" : "transparent")};
    background: ${(p) => (p.$done ? colors.buttonPurple : "transparent")};
    border: 2px solid
      ${(p) => (p.$done ? colors.buttonPurple : "rgba(248,250,252,0.4)")};
  }
`;

// ─── Empty state styled components ───────────────────────────────────────────

const EmptyGreeting = styled.h1`
  margin: 0;
  font-size: 40px;
  font-weight: 700;

  @media (max-width: 860px) {
    font-size: 24px;
  }
`;

const EmptyGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 32px;
  margin-top: 56px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 860px) {
    margin-top: 24px;
    gap: 20px;
  }
`;

const EmptyHeroCard = styled(Card)`
  text-align: center;
  padding: 48px 32px;

  @media (max-width: 860px) {
    padding: 24px 16px;
  }
`;

const EmptyHeroTitle = styled.h2`
  margin: 0;
  font-size: 40px;
  font-weight: 700;

  @media (max-width: 860px) {
    font-size: 24px;
  }
`;

const EmptyCtaButton = styled.button`
  margin: 32px 0;
  padding: 16px 42px;
  min-width: 300px;
  border: none;
  border-radius: 12px;
  background: ${colors.buttonPurple};
  color: ${colors.otherWhite};
  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: #6d28d9; }

  @media (max-width: 860px) {
    width: 100%;
    min-width: 0;
    margin: 20px 0;
    padding: 14px 20px;
    font-size: 17px;
  }
`;

const EmptyHeroImg = styled.img`
  width: 100%;
  max-width: 780px;
  border-radius: 16px;
`;

const EmptySide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const EmptyProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 20px;
`;

const EmptyRing = styled.span`
  width: 84px;
  height: 84px;
  flex: none;
  border-radius: 50%;
  border: 3px solid rgba(248, 250, 252, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
`;

const EmptyQuote = styled.blockquote`
  margin: 16px 0 0;
  font-size: 20px;
  line-height: 30px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  width: 100%;
`;

function HomeDashboard() {
  const { userName } = useDashboardUser();
  const router = useRouter();

  const { data: savedCareersData, isLoading: isSavedCareersLoading } = useSavedCareers();
  const { data: savedMentorsData } = useSavedMentors();
  const { data: conversationsData } = useConversations();

  const savedCareers = savedCareersData?.careers ?? [];
  const savedMentors = savedMentorsData?.mentors ?? [];
  const conversations = conversationsData?.conversations ?? [];

  const hasSavedCareers = savedCareers.length > 0;
  const hasSavedMentors = savedMentors.length > 0;
  const hasStartedConversation = conversations.length > 0;

  const [quizProgress, setQuizProgress] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState<boolean | null>(null);
  const startQuiz = useStartQuiz();

  useEffect(() => {
    startQuiz.mutate(undefined, {
      onSuccess: (data) => {
        const answered = data.attempt?.askedQuestionIds?.length ?? 0;
        const percent = Math.min(Math.round((answered / 18) * 100), 100);
        setQuizProgress(percent);
        setHasStarted(answered > 0 || hasSavedCareers);
        if (data.nextQuestion === null) {
          setIsQuizCompleted(true);
        }
      },
      onError: () => {
        setHasStarted(hasSavedCareers);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSavedCareers]);

  const steps = [
    { label: "Career Assessment", done: isQuizCompleted || hasSavedCareers },
    { label: "Explore Careers", done: hasSavedCareers },
    { label: "Connect to Mentor", done: hasSavedMentors },
    { label: "Send A mentor request", done: hasStartedConversation },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const overallProgressPercent = Math.round((completedCount / steps.length) * 100);

  // ─── Loading state ─────────────────────────────────────────────────────────
  const isCheckingState = hasStarted === null || isSavedCareersLoading || startQuiz.isPending;

  if (isCheckingState) {
    return (
      <DashboardShell>
        <LoadingContainer>
          <Muted style={{ fontSize: 18 }}>Loading your dashboard...</Muted>
        </LoadingContainer>
      </DashboardShell>
    );
  }

  // ─── Empty / onboarding state ────────────────────────────────────────────────
  const NotStarted = !hasStarted && !isQuizCompleted && !hasSavedCareers;

  if (NotStarted) {
    return (
      <DashboardShell
        heading={
          <>
            <EmptyGreeting>
              Welcome, <Accent>{userName}</Accent> 👋
            </EmptyGreeting>
            <Muted style={{ marginTop: 8, fontSize: 20 }}>
              Let&rsquo;s map your future
            </Muted>
          </>
        }
      >
        <EmptyGrid>
          <EmptyHeroCard>
            <EmptyHeroTitle>
              Get Clarity into your <Accent>future</Accent>
            </EmptyHeroTitle>
            <Muted style={{ marginTop: 12, fontSize: 20 }}>
              Take the career quiz to discover paths that match your strengths and
              interests.
            </Muted>
            <EmptyCtaButton type="button" onClick={() => router.push('/quiz')}>
              Start Career Quiz
            </EmptyCtaButton>
            <EmptyHeroImg src="/image/home-girl.png" alt="Explorer mapping career paths" />
          </EmptyHeroCard>

          <EmptySide>
            <Card>
              <h3 style={{ margin: 0, fontSize: 26 }}>Your progress</h3>
              <EmptyProgressRow>
                <EmptyRing>0%</EmptyRing>
                <Muted style={{ fontSize: 18 }}>Complete quiz to get started.</Muted>
              </EmptyProgressRow>
            </Card>
            <Card>
              <span style={{ color: colors.buttonPurple, fontSize: 40, lineHeight: 1 }}>
                &ldquo;
              </span>
              <EmptyQuote>
                The best career is the one that aligns with who you are and what
                you love.
              </EmptyQuote>
              <Muted style={{ marginTop: 20, fontSize: 18 }}>- Unknown</Muted>
            </Card>
          </EmptySide>
        </EmptyGrid>
      </DashboardShell>
    );
  }

  // ─── Active Dashboard state ──────────────────────────────────────────────────
  return (
    <DashboardShell
      heading={
        <>
          <Eyebrow>Welcome back {userName}! 👋</Eyebrow>
          <Title>
            Let&rsquo;s map your <Accent>future</Accent>
          </Title>
          <Muted style={{ fontSize: 20 }}>
            Discover paths. Build skills. Become more
          </Muted>
        </>
      }
    >
      <Grid>
        <div>
          <SectionHead>Continue where you left off</SectionHead>
          <QuizCard>
            <Thumb src="/image/file.png" alt="" loading="lazy" width={512} height={512} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 28 }}>Career Quiz</h3>
              <Muted style={{ fontSize: 18, marginTop: 4 }}>20 questions</Muted>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                <Bar>
                  <span style={{ width: `${quizProgress}%` }} />
                </Bar>
                <strong style={{ fontSize: 18 }}>{quizProgress}%</strong>
              </div>
            </div>
            <Continue type="button" onClick={() => router.push('/quiz')}>
              {quizProgress > 0 ? "Continue" : "Start"}
            </Continue>
          </QuizCard>

          <SectionHead>
            Saved Careers
            <span
              style={{ color: colors.buttonPurple, fontSize: 20, cursor: "pointer" }}
              onClick={() => router.push('/saved')}
            >
              View all ›
            </span>
          </SectionHead>
          {savedCareers.length > 0 ? (
            savedCareers.map((c) => (
              <Card key={c.id} style={{ maxWidth: 560, marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 30 }}>{c.title}</h3>
                <Match>90% Match</Match>
                <Muted style={{ fontSize: 19 }}>
                  {c.description || c.why_this_summary || "Explore learning resources and mentors."}
                </Muted>
              </Card>
            ))
          ) : (
            <Card style={{ maxWidth: 560 }}>
              <Muted style={{ fontSize: 18 }}>
                You haven&rsquo;t saved any careers yet. Complete the quiz to see matches!
              </Muted>
            </Card>
          )}

          <TileRow>
            <Tile>
              <TileHead>
                <div>
                  <h3>Saved Mentors</h3>
                  <Muted style={{ fontSize: 20, marginTop: 4 }}>
                    {savedMentors.length} {savedMentors.length === 1 ? "Mentor" : "Mentors"} Saved
                  </Muted>
                </div>
                <BookmarkBadge>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 4h10v16l-5-3.5L7 20z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </BookmarkBadge>
              </TileHead>
              <TileArt src="/image/saved-mentors.png" alt="" loading="lazy" width={512} height={512} />
              <RoundArrow type="button" aria-label="Open saved mentors" onClick={() => router.push('/saved')}>
                <ArrowIcon />
              </RoundArrow>
            </Tile>
            <Tile>
              <TileHead>
                <div>
                  <h3>Saved Careers</h3>
                  <Muted style={{ fontSize: 20, marginTop: 4 }}>
                    {savedCareers.length} {savedCareers.length === 1 ? "Career" : "Careers"} Saved
                  </Muted>
                </div>
                <BookmarkBadge>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 4h10v16l-5-3.5L7 20z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </BookmarkBadge>
              </TileHead>
              <TileArt src="/image/compass.png" alt="" loading="lazy" width={512} height={512} />
              <RoundArrow type="button" aria-label="Open saved careers" onClick={() => router.push('/saved')}>
                <ArrowIcon />
              </RoundArrow>
            </Tile>
          </TileRow>
        </div>

        <SideCard>
          <h2 style={{ margin: 0, fontSize: 30, textAlign: "center" }}>
            Your progress
          </h2>
          <ProgressRow>
            <RingContainer $percent={overallProgressPercent}>
              <RingInner>{overallProgressPercent}%</RingInner>
            </RingContainer>
            <Muted style={{ fontSize: 20, color: colors.otherWhite }}>
              Overall progress
              <br />
              {completedCount}/4 completed
            </Muted>
          </ProgressRow>
          <Steps>
            {steps.map((s) => (
              <Step key={s.label} $done={s.done}>
                <span>{s.label}</span>
                <em>{s.done ? "✓" : ""}</em>
              </Step>
            ))}
          </Steps>
          <Muted style={{ marginTop: 28, fontSize: 20, textAlign: "center" }}>
            Connect with a mentor to reach 100% progress
          </Muted>
        </SideCard>
      </Grid>
    </DashboardShell>
  );
}

export default HomeDashboard;