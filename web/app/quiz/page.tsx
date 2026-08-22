'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Image from "next/image";
import {
  DashboardShell,
  Card,
  Accent,
  Muted,
  BellIcon,
} from "@/components/dashboard";
import colors from "@/lib/colors";
import {
  useStartQuiz,
  useSubmitAnswer,
  useSkipQuestion,
  QuizQuestion as QuizQuestionType,
} from "@/hooks/quiz.hook";
import { MultipleChoiceOptions } from "@/components/MultipleChoiceOptions";

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  @media (max-width: 860px) { gap: 10px; }
`;

const HeadIcon = styled.span`
  width: 56px; height: 56px; flex: none; border-radius: 50%;
  background: rgba(119, 59, 236, 0.18);
  border: 1px solid ${colors.cardBorder};
  display: flex; align-items: center; justify-content: center;
  @media (max-width: 860px) {
    width: 44px; height: 44px;
    img { width: 28px !important; height: 28px !important; }
  }
`;

const Title = styled.h1`
  margin: 0; font-size: 30px; font-weight: 700;
  @media (max-width: 860px) { font-size: 20px; }
`;

const HeaderSubtitle = styled(Muted)`
  font-size: 16px;
  @media (max-width: 860px) { font-size: 13px; }
`;

const ExitButton = styled.button`
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 12px;
  border: 1px solid ${colors.cardBorder};
  background: rgba(119, 59, 236, 0.14);
  color: ${colors.normalWhite};
  font-family: inherit; font-size: 15px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: background 0.15s ease;
  &:hover { background: rgba(119, 59, 236, 0.3); }
  @media (max-width: 860px) {
    padding: 8px 12px; font-size: 13px;
    svg { width: 16px; height: 16px; }
  }
`;

const TopActions = styled.div`
  display: flex; align-items: center; gap: 14px;
`;

const Grid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) 380px;
  gap: 28px; margin-top: 24px; align-items: start;
  @media (max-width: 1100px) { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 860px) { gap: 20px; margin-top: 16px; }
`;

const QuizCard = styled(Card)`
  padding: 32px 36px 28px; min-height: 600px;
  display: flex; flex-direction: column;
  @media (max-width: 860px) { padding: 20px 16px; min-height: auto; }
`;

const Step = styled.p`
  margin: 0 0 10px; color: ${colors.buttonPurple};
  font-size: 18px; font-weight: 600;
  @media (max-width: 860px) { font-size: 15px; margin-bottom: 8px; }
`;

const Bar = styled.div`
  height: 10px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.12); overflow: hidden;
  @media (max-width: 860px) { height: 8px; }
`;

const Fill = styled.div<{ $p: number }>`
  height: 100%; width: ${(p) => p.$p}%; border-radius: 999px;
  background: ${colors.buttonPurple}; transition: width 0.25s ease;
`;

const Question = styled.h2`
  margin: 28px 0 0; 
  font-size: 26px; 
  font-weight: 700;
  white-space: pre-line; /* PRESERVES NEWLINES */
  line-height: 1.2;
  @media (max-width: 860px) { margin: 20px 0 0; font-size: 20px; line-height: 1.35; }
`;

const Options = styled.div`
  display: flex; flex-direction: column; gap: 14px;
  margin: 36px auto; width: 100%; max-width: 480px;
  @media (max-width: 860px) { margin: 24px 0; gap: 12px; }
`;

const Option = styled.button<{ $selected: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; width: 100%; text-align: left;
  padding: 16px 20px; border-radius: 14px;
  background: rgba(119, 59, 236, 0.12);
  border: 1px solid ${(p) => (p.$selected ? colors.buttonPurple : "rgba(119,59,236,0.25)")};
  color: ${colors.normalWhite};
  font-family: inherit; font-size: 16px; cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  &:hover { background: rgba(119, 59, 236, 0.22); }
  @media (max-width: 860px) { padding: 14px 16px; font-size: 14px; }
`;

const Radio = styled.span<{ $selected: boolean }>`
  width: 22px; height: 22px; flex: none; border-radius: 50%;
  border: 2px solid ${(p) => (p.$selected ? colors.normalWhite : "rgba(185,179,214,0.7)")};
  background: ${(p) => (p.$selected ? colors.normalWhite : "transparent")};
  box-shadow: ${(p) => (p.$selected ? `0 0 0 3px ${colors.buttonPurple}` : "none")};
  @media (max-width: 860px) { width: 18px; height: 18px; }
`;

const RankBadge = styled.span`
  width: 26px; height: 26px; flex: none; border-radius: 50%;
  background: ${colors.buttonPurple}; color: ${colors.normalWhite};
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
`;

const ScaleRow = styled.div`
  display: flex; gap: 12px; margin: 36px auto; justify-content: center;
`;

const ScaleButton = styled.button<{ $selected: boolean }>`
  width: 56px; height: 56px; border-radius: 50%;
  border: 1px solid ${(p) => (p.$selected ? colors.buttonPurple : "rgba(119,59,236,0.25)")};
  background: ${(p) => (p.$selected ? colors.buttonPurple : "rgba(119, 59, 236, 0.12)")};
  color: ${colors.normalWhite};
  font-family: inherit; font-size: 18px; font-weight: 700; cursor: pointer;
`;

const TextArea = styled.textarea`
  width: 100%; min-height: 140px; margin: 24px 0 12px;
  padding: 16px 20px; border-radius: 14px;
  background: rgba(119, 59, 236, 0.12);
  border: 1px solid rgba(119,59,236,0.25);
  color: ${colors.normalWhite};
  font-family: inherit; font-size: 16px; resize: vertical;
  &:focus { outline: none; border-color: ${colors.buttonPurple}; }
`;

const AiFeedbackBanner = styled.div`
  margin: 16px 0; padding: 14px 18px; border-radius: 12px;
  background: rgba(119, 59, 236, 0.2);
  border: 1px solid ${colors.buttonPurple};
  color: ${colors.normalWhite};
  font-size: 14px; line-height: 1.5;
`;

const Footer = styled.div`
  margin-top: auto; display: flex; align-items: center;
  justify-content: space-between; gap: 12px; padding-top: 16px;
`;

const GhostButton = styled.button`
  display: flex; align-items: center; gap: 8px;
  padding: 12px 22px; border-radius: 12px; border: none;
  background: rgba(255, 255, 255, 0.08); color: ${colors.normalWhite};
  font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  @media (max-width: 860px) { padding: 10px 16px; font-size: 14px; }
`;

const NextButton = styled(GhostButton)`
  background: ${colors.buttonPurple};
`;

const SideCol = styled.div`
  display: flex; flex-direction: column; gap: 24px;
`;

const SideTitle = styled.h3`
  margin: 0; font-size: 20px; font-weight: 700; text-align: center;
  @media (max-width: 860px) { font-size: 18px; }
`;

const RingRow = styled.div`
  display: flex; align-items: center; justify-content: center;
  gap: 18px; margin: 18px 0 14px;
`;

const Count = styled.p`
  margin: 0; font-size: 34px; font-weight: 700;
  span { font-size: 22px; color: ${colors.muted}; }
  @media (max-width: 860px) { font-size: 28px; span { font-size: 18px; } }
`;

const WhyTitle = styled.h3`
  margin: 0; display: flex; align-items: center; gap: 10px;
  font-size: 20px; font-weight: 700;
  @media (max-width: 860px) { font-size: 17px; }
`;

const NoteCard = styled(Card)`
  text-align: center; padding: 24px 20px;
`;

const NoteImg = styled(Image)`
  width: 120px; height: 120px; object-fit: contain; margin: 0 auto 12px;
  @media (max-width: 860px) { width: 90px; height: 90px; }
`;

const ReadOnlyBanner = styled.div`
  margin-bottom: 16px; padding: 10px 16px; border-radius: 10px;
  background: rgba(255, 200, 0, 0.12);
  border: 1px solid rgba(255, 200, 0, 0.3);
  color: ${colors.normalWhite};
  font-size: 14px;
`;

const ErrorText = styled.p`
  color: #ff6b6b; font-size: 14px; margin: 12px 0 0;
`;

function Ring({ percent }: { percent: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 86 86" aria-hidden>
      <circle cx="43" cy="43" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
      <circle
        cx="43" cy="43" r={r} fill="none" stroke={colors.buttonPurple} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={`${(percent / 100) * c} ${c}`}
        transform="rotate(-90 43 43)"
      />
      <text x="43" y="48" textAnchor="middle" fill={colors.normalWhite} fontSize="15" fontWeight="600">
        {percent}%
      </text>
    </svg>
  );
}

const ASSUMED_MAX_QUESTIONS = 18;

interface HistoryEntry {
  question: QuizQuestionType;
  answerSummary: string;
}

function QuizPage() {
  const router = useRouter();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestionType | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);
  const [latestAiFeedback, setLatestAiFeedback] = useState<string | null>(null);

  // Per-question state
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [rankingOrder, setRankingOrder] = useState<number[]>([]);
  const [scaleValue, setScaleValue] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState("");

  const startQuiz = useStartQuiz();
  const submitAnswer = useSubmitAnswer();
  const skipQuestion = useSkipQuestion();

  useEffect(() => {
    startQuiz.mutate(undefined, {
      onSuccess: (data) => {
        setAttemptId(data.attempt.id);
        setQuestionsAnswered(data.attempt.askedQuestionIds.length);
        setCurrentQuestion(data.nextQuestion);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAnswerState = () => {
    setSelectedOptionId(null);
    setSelectedOptionIds([]);
    setRankingOrder([]);
    setScaleValue(null);
    setReflectionText("");
  };

  const summarizeAnswer = (question: QuizQuestionType): string => {
    const findLabel = (id: number) => question.options?.find((o) => o.id === id)?.label ?? "";
    switch (question.question_type) {
      case "single_choice":
      case "scenario":
        return selectedOptionId ? findLabel(selectedOptionId) : "";
      case "multiple_choice":
        return selectedOptionIds.map(findLabel).join(", ");
      case "ranking":
        return rankingOrder.map((id, i) => `${i + 1}. ${findLabel(id)}`).join("  ");
      case "scale":
        return scaleValue ? `${scaleValue}/5` : "";
      case "reflection_text":
        return reflectionText.trim() || "(skipped)";
      default:
        return "";
    }
  };

  const canSubmit = () => {
    if (!currentQuestion) return false;
    switch (currentQuestion.question_type) {
      case "single_choice":
      case "scenario":
        return selectedOptionId !== null;
      case "multiple_choice":
        return selectedOptionIds.length > 0;
      case "ranking":
        return rankingOrder.length === (currentQuestion.options?.length ?? 0);
      case "scale":
        return scaleValue !== null;
      case "reflection_text":
        return reflectionText.trim().length >= 3;
      default:
        return false;
    }
  };

  const handleNext = () => {
  if (!attemptId || !currentQuestion || !canSubmit()) return;

  const payload: any = { attemptId, questionId: currentQuestion.id };

  switch (currentQuestion.question_type) {
    case "single_choice":
    case "scenario":
      payload.selectedOptionIds = [selectedOptionId];
      break;
    case "multiple_choice":
      payload.selectedOptionIds = selectedOptionIds;
      break;
    case "ranking":
      payload.rankingOrder = rankingOrder;
      break;
    case "scale":
      payload.scaleValue = scaleValue;
      break;
    case "reflection_text":
      payload.reflectionText = reflectionText;
      break;
  }

  const answeredQuestion = currentQuestion;
  const answerSummary = summarizeAnswer(currentQuestion);

  submitAnswer.mutate(payload, {
    onSuccess: (data) => {
      setHistory((h) => [...h, { question: answeredQuestion, answerSummary }]);
      setQuestionsAnswered((n) => n + 1);
      resetAnswerState();

      if (data.done) {
        router.push(`/analyzing?attemptId=${attemptId}`);
        return;
      }

      if ('aiFeedback' in data && data.aiFeedback) {
        setLatestAiFeedback(data.aiFeedback);
      } else {
        setLatestAiFeedback(null);
      }

      setCurrentQuestion(data.nextQuestion);
    },
    onError: (error) => {
      console.error("❌ Submission Error:", error);
    }
  });
};

  const handleSkip = () => {
    if (!attemptId || !currentQuestion) return;

    const answeredQuestion = currentQuestion;

    skipQuestion.mutate(
      { attemptId, questionId: currentQuestion.id },
      {
        onSuccess: (data) => {
          setHistory((h) => [...h, { question: answeredQuestion, answerSummary: "(skipped)" }]);
          setQuestionsAnswered((n) => n + 1);
          resetAnswerState();

          if (data.done) {
            router.push(`/analyzing?attemptId=${attemptId}`);
            return;
          }
          setLatestAiFeedback(null);
          setCurrentQuestion(data.nextQuestion);
        },
      }
    );
  };

  const toggleRanking = (optionId: number) => {
    setRankingOrder((order) =>
      order.includes(optionId) ? order.filter((id) => id !== optionId) : [...order, optionId]
    );
  };

  const percent = Math.min(100, Math.round(((questionsAnswered + 1) / ASSUMED_MAX_QUESTIONS) * 100));

  const viewingPast = viewingHistoryIndex !== null;
  const displayedEntry = viewingPast ? history[viewingHistoryIndex!] : null;
  const displayedQuestion = viewingPast ? displayedEntry!.question : currentQuestion;

  const skippable = currentQuestion?.question_type === "ranking" || currentQuestion?.question_type === "scale";

  if (startQuiz.isPending || !displayedQuestion) {
    return (
      <DashboardShell heading={<Title>Career Quiz</Title>}>
        <Muted>Loading your quiz...</Muted>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      heading={
        <HeadingRow>
          <HeadIcon>
            <Image src="/image/file.png" alt="" width={36} height={36} />
          </HeadIcon>
          <div>
            <Title>Career Quiz</Title>
            <HeaderSubtitle>Answer honestly to get personalized career matches</HeaderSubtitle>
          </div>
        </HeadingRow>
      }
      topRight={
        <TopActions>
          <BellIcon />
          <ExitButton onClick={() => router.push("/home")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Exit quiz
          </ExitButton>
        </TopActions>
      }
    >
      <Grid>
        <QuizCard>
          <Step>Question {questionsAnswered + 1}</Step>
          <Bar>
            <Fill $p={percent} />
          </Bar>

          {viewingPast && (
            <ReadOnlyBanner>
              Viewing a previous answer. This can&apos;t be changed, since later questions were
              already chosen based on it.
            </ReadOnlyBanner>
          )}

          {latestAiFeedback && !viewingPast && (
            <AiFeedbackBanner>
              🤖 <strong>AI Analysis:</strong> {latestAiFeedback}
            </AiFeedbackBanner>
          )}

          <Question>{displayedQuestion.question_text}</Question>

          {displayedQuestion.question_type === "single_choice" ||
          displayedQuestion.question_type === "scenario" ? (
            <Options>
              {displayedQuestion.options?.map((opt) => {
                const selected = viewingPast
                  ? displayedEntry!.answerSummary === opt.label
                  : selectedOptionId === opt.id;
                return (
                  <Option
                    key={opt.id}
                    $selected={selected}
                    disabled={viewingPast}
                    onClick={() => !viewingPast && setSelectedOptionId(opt.id)}
                    aria-pressed={selected}
                  >
                    {opt.label}
                    <Radio $selected={selected} />
                  </Option>
                );
              })}
            </Options>
          ) : null}

          {displayedQuestion.question_type === "multiple_choice" && !viewingPast && (
            <MultipleChoiceOptions
              options={displayedQuestion.options ?? []}
              selectedIds={selectedOptionIds}
              onChange={setSelectedOptionIds}
              maxSelections={displayedQuestion.max_selections ?? undefined}
            />
          )}

          {displayedQuestion.question_type === "ranking" && !viewingPast && (
            <Options>
              {displayedQuestion.options?.map((opt) => {
                const rank = rankingOrder.indexOf(opt.id);
                return (
                  <Option key={opt.id} $selected={rank !== -1} onClick={() => toggleRanking(opt.id)}>
                    {opt.label}
                    {rank !== -1 ? <RankBadge>{rank + 1}</RankBadge> : <Radio $selected={false} />}
                  </Option>
                );
              })}
            </Options>
          )}

          {displayedQuestion.question_type === "scale" && !viewingPast && (
            <ScaleRow>
              {[1, 2, 3, 4, 5].map((n) => (
                <ScaleButton key={n} $selected={scaleValue === n} onClick={() => setScaleValue(n)}>
                  {n}
                </ScaleButton>
              ))}
            </ScaleRow>
          )}

         {displayedQuestion.question_type === "reflection_text" && (
          <div>
            <TextArea
              placeholder={displayedQuestion.placeholder || "Tell us about yourself..."}
              maxLength={displayedQuestion.maxLength || 500}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: colors.muted, marginTop: 4 }}>
              {reflectionText.length} / {displayedQuestion.maxLength || 500}
            </div>
          </div>
        )}

          <Footer>
            <GhostButton
              disabled={history.length === 0}
              onClick={() => {
                if (viewingHistoryIndex === null) {
                  setViewingHistoryIndex(history.length - 1);
                } else if (viewingHistoryIndex > 0) {
                  setViewingHistoryIndex(viewingHistoryIndex - 1);
                }
              }}
            >
              ← Back
            </GhostButton>

            {viewingPast ? (
              <NextButton onClick={() => setViewingHistoryIndex(null)}>
                Continue where you left off →
              </NextButton>
            ) : (
              <>
                {skippable && (
                  <GhostButton onClick={handleSkip} disabled={skipQuestion.isPending}>
                    Skip
                  </GhostButton>
                )}
                <NextButton onClick={handleNext} disabled={!canSubmit() || submitAnswer.isPending}>
                  {submitAnswer.isPending ? "Analyzing..." : "Next →"}
                </NextButton>
              </>
            )}
          </Footer>
        </QuizCard>

        <SideCol>
          <Card>
            <SideTitle>Your progress</SideTitle>
            <RingRow>
              <Ring percent={percent} />
              <Count>
                {questionsAnswered + 1}
                <span>/~{ASSUMED_MAX_QUESTIONS}</span>
              </Count>
            </RingRow>
            <Muted style={{ textAlign: "center", fontSize: 14 }}>
              Keep going, you&apos;re doing great.
            </Muted>
          </Card>

          <Card>
            <WhyTitle>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2.9 1.9h5.2c0-.7.3-1.4.9-1.9A6 6 0 0 0 12 3Z"
                  stroke={colors.buttonPurple} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              Why this matters
            </WhyTitle>
            <Muted style={{ marginTop: 12, fontSize: 14 }}>
              Your answers help us understand your interests, strengths, and
              preferences to suggest the best career paths for you.
            </Muted>
          </Card>

          <NoteCard>
            <NoteImg src="/image/file.png" alt="" width={120} height={120} />
            <SideTitle>
              There are no right or <Accent>wrong</Accent> answers.
            </SideTitle>
            <Muted style={{ marginTop: 8, fontSize: 14 }}>
              Be honest and think about what you truly enjoy.
            </Muted>
          </NoteCard>
        </SideCol>
      </Grid>
    </DashboardShell>
  );
}

export default QuizPage;