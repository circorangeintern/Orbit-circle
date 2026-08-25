"use client";

import Image from "next/image";
import OnboardingLayout from "./OnboardingLayout";
import { ProgressDots, NextButton } from "./shared";

export interface OnboardingStep1Props {
  onNext?: () => void;
}

export default function OnboardingStep1({ onNext }: OnboardingStep1Props) {
  return (
    <OnboardingLayout
      heading="Discover What fits you."
      alignFooterBottom={true}
      subtext="Understand your strengths, interests, and values with smart assessments."
      visual={
        <Image
          src="/image/background2a.png"
          alt="Onboarding illustration"
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
          style={{ objectFit: "cover" }}
          priority
        />
      }
      footer={<ProgressDots total={3} activeIndex={0} />}
      nextButton={<NextButton onClick={onNext} />}
    />
  );
}