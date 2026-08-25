"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import { getToken } from "@/hooks/auth.hook";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";

/**
 * app/onboarding/page.tsx  (App Router)
 *
 * Drives the 4-screen onboarding flow: 3 "quiz intro" steps with progress
 * dots + a Next button, then the Welcome screen with Create Account / Log In.
 *
 * State lives here (not in the screens) so the screens stay dumb/reusable —
 * they just render whatever `heading`/`visual`/`footer` they're given and
 * call `onNext` when their button is pressed.
 */

const TOTAL_QUIZ_STEPS = 3;

// The 1440x1024 frame is a fixed desktop size (matches the Figma export).
// This wrapper centers it and lets it scroll on smaller viewports rather
// than clipping — swap for a responsive Frame later if you need one.
const PageWrapper = styled.div`

  
`;

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/home");
    }
  }, [router]);

  // Preload onboarding background images to prevent lag
  useEffect(() => {
    const imageUrls = [
      "/image/background1.png",
      "/image/background2a.png",
      "/image/background3a.png",
      "/image/background4a.png",
    ];

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const goNext = () => setStep((s) => (s < 4 ? ((s + 1) as Step) : s));

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OnboardingStep1 onNext={goNext} />;
      case 2:
        return <OnboardingStep2 onNext={goNext} />;
      case 3:
        return <OnboardingStep3 onNext={goNext} />;
      case 4:
        return (
          <WelcomeScreen
            onCreateAccount={() => router.push("/signup")}
            onLogIn={() => router.push("/login")}
          />
        );
    }
  };

  return <PageWrapper>{renderStep()}</PageWrapper>;
}

// Exported in case you want to drive dots/step count from elsewhere later.
export { TOTAL_QUIZ_STEPS };