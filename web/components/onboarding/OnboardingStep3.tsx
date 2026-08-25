"use client";

import OnboardingLayout from "./OnboardingLayout";
import { ProgressDots, PrimaryButton, Highlight } from "./shared";
import Image from "next/image";

export interface OnboardingStep3Props {
  onNext?: () => void;
}

export default function OnboardingStep3({ onNext }: OnboardingStep3Props) {
  return (
    <OnboardingLayout
      heading={
        <>
         Get Career <Highlight>recommendations</Highlight> you can trust.
        </>
      }
      subtext="Personalized matches based on your interests and goals."
      alignFooterBottom={true}
      visual={
        <Image
          src="/image/background4a.png"
          alt="Onboarding illustration"
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
          style={{ objectFit: "cover" }}
          priority
        />
      }
      footer={
        <>
          <ProgressDots total={3} activeIndex={2} />
          <PrimaryButton type="button" onClick={onNext}>
            Get Started
          </PrimaryButton>
        </>
      }
    />
  );
}