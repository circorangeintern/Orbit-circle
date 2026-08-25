"use client";

import OnboardingLayout from "./OnboardingLayout";
import { ProgressDots, NextButton, Highlight } from "./shared";
import Image from "next/image";

export interface OnboardingStep2Props {
  onNext?: () => void;
}

export default function OnboardingStep2({ onNext }: OnboardingStep2Props) {
  return (
    <OnboardingLayout
      heading={
        <>
          Understand your <Highlight>strengths</Highlight>
        </>
      }
      subtext="Answer a few simple questions and we'll do the rest"
      alignFooterBottom={true}
      visual={<Image
                src="/image/background3a.png"
                alt="Onboarding illustration"
                fill
                sizes="(max-width: 900px) 0px, 48vw"
                style={{ objectFit: "cover" }}
                priority
              />}
      footer={<ProgressDots total={3} activeIndex={1} />}
      nextButton={<NextButton onClick={onNext} />}
    />
  );
}