"use client";

import fontsize from "@/lib/fontsize";
import OnboardingLayout from "./OnboardingLayout";
import { PrimaryButton, OutlineButton, TermsText, Highlight } from "./shared";
import MatchCardsVisual from "./visuals/MatchCardVisual";
import styled from "styled-components";

export interface WelcomeScreenProps {
  onCreateAccount?: () => void;
  onLogIn?: () => void;
}

const FooterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: 32px; /* FIX 2: Creates the required gap below header/subtext */
`;

export default function WelcomeScreen({ onCreateAccount, onLogIn }: WelcomeScreenProps) {
  return (
    <OnboardingLayout
      heading={<WelcomeText>Welcome to <Highlight>CareerMap</Highlight> 👋</WelcomeText>}
      subtext="Let's help you discover what's possible."
      alignFooterBottom={true}
      visual={<MatchCardsVisual />}
      hideVisualOnMobile
      headingMaxWidth="600px"
      subtextMarginTop="10px"
      bodyGap="12px"
      footer={
        <FooterGroup>

          <PrimaryButton onClick={onCreateAccount}>Create Account</PrimaryButton>
          <OutlineButton onClick={onLogIn}>Log In</OutlineButton>
          <TermsText>
            By continuing, you agree to our <a href="/privacy-terms">Terms of Service and Privacy Policy</a>.
          </TermsText>
        </FooterGroup>
      }
    />
  );
}

const WelcomeText = styled.span`
  display: inline-block;
  font-size: ${fontsize.xl};
  max-width: 600px;

  @media (max-width: 900px) {
    font-size: clamp(28px, 8vw, ${fontsize.xl});
    max-width: 320px;
  }
`;