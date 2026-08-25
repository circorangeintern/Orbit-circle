"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { VisualWrap, ArcPanel, ArcOverlay, Stars, Logo } from "./shared";
import fontsize from "@/lib/fontsize";
import colors from "@/lib/colors";

const Frame = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  background: #0a003c;
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }
`;

const MobileHeader = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 24px 24px 0 24px;
    z-index: 10;
  }
`;

const ResponsiveVisualWrap = styled(VisualWrap)<{ $hideOnMobile?: boolean }>`
  @media (max-width: 900px) {
    order: 1;
    ${({ $hideOnMobile }) => ($hideOnMobile ? "display: none;" : "")}
  }
`;

const ContentColumn = styled.div`
  position: relative;
  flex: 1 1 52%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100vh;
  padding: 48px 0 48px 80px;
  z-index: 3;
  overflow: hidden;

  @media (max-width: 1200px) {
    padding: 36px 0 36px 40px;
  }

  @media (max-width: 900px) {
    order: 2;
    flex: none;
    width: 100%;
    height: auto;
    gap: 16px;
    /* Reduced top padding so the heading starts right near the top on mobile */
    padding: 48px 24px 48px; 
    overflow: visible;
  }
`;

const DesktopHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 440px;
  padding-right: 20px;
  flex-shrink: 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const Body = styled.div<{ $gap?: string; $alignFooterBottom?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ $gap }) => $gap ?? "12px"};
  width: 100%;
  max-width: 440px;
  flex-shrink: 0;

  @media (min-width: 901px) {
    margin-top: auto;
    /* If aligning footer to bottom, let body push space below it */
    margin-bottom: ${({ $alignFooterBottom }) => ($alignFooterBottom ? "auto" : "24px")};
  }
`;

export const Heading = styled.h1<{ $maxWidth?: string }>`
  margin: 0;
  max-width: ${({ $maxWidth }) => $maxWidth ?? "380px"};
  line-height: 1.15;
  font-weight: 700;
  font-size: ${fontsize.lg};
  color: ${colors.normalWhite};

  @media (max-width: 900px) {
    max-width: 300px;
    font-size: clamp(24px, 6.5vw, ${fontsize.sl});
    font-weight: 600;
  }
`;

const Subtext = styled.p<{ $marginTop?: string }>`
  margin: ${({ $marginTop }) => $marginTop ?? "0px"} 0 0;
  max-width: 375px;
  font-weight: 400;
  font-size: ${fontsize.md};
  color: rgba(248, 250, 252, 0.8);
  line-height: 1.45;

  @media (max-width: 900px) {
    max-width: 310px;
    font-size: clamp(14px, 4vw, ${fontsize.ssm});
  }
`;

const FooterContainer = styled.div<{ $alignFooterBottom?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  max-width: 440px;
  padding-right: 16px;
  flex-shrink: 0;

  @media (min-width: 901px) {
    /* If alignFooterBottom is true, push footer strictly to bottom margin */
    margin-top: ${({ $alignFooterBottom }) => ($alignFooterBottom ? "auto" : "0")};
    margin-bottom: ${({ $alignFooterBottom }) => ($alignFooterBottom ? "0" : "auto")};
    max-height: 55vh;
    overflow-y: auto;
  }

  /* Form Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #773bec;
    border-radius: 10px;
    box-shadow: 0 0 8px rgba(119, 59, 236, 0.6);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #6d28d9;
  }
  scrollbar-width: thin;
  scrollbar-color: #773bec rgba(255, 255, 255, 0.05);

  @media (max-width: 900px) {
    margin: 0;
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
`;

export interface OnboardingLayoutProps {
  heading: ReactNode;
  subtext?: ReactNode;
  visual: ReactNode;
  footer?: ReactNode;
  headerAction?: ReactNode;
  nextButton?: ReactNode;
  headingMaxWidth?: string;
  subtextMarginTop?: string;
  bodyGap?: string;
  hideVisualOnMobile?: boolean;
  alignFooterBottom?: boolean; // New prop!
  hideMobileHeader?: boolean;
  visualFooter?: React.ReactNode; 
}

export default function OnboardingLayout({
  heading,
  subtext,
  visual,
  footer,
  headerAction,
  nextButton,
  headingMaxWidth,
  subtextMarginTop,
  bodyGap,
  hideVisualOnMobile,
  hideMobileHeader ,
  alignFooterBottom = false, // Defaults to false (tight layout for forms)
}: OnboardingLayoutProps) {
  return (
    <Frame>
      {!hideMobileHeader && (
  <MobileHeader>
    {headerAction}
  </MobileHeader>
)}

      <ContentColumn>
        <DesktopHeaderContainer>
          <Logo />
          {headerAction}
        </DesktopHeaderContainer>

        <Body $gap={bodyGap} $alignFooterBottom={alignFooterBottom}>
          <Heading $maxWidth={headingMaxWidth}>{heading}</Heading>
          {subtext ? <Subtext $marginTop={subtextMarginTop}>{subtext}</Subtext> : null}
        </Body>

        {footer ? (
          <FooterContainer $alignFooterBottom={alignFooterBottom}>
            {footer}
          </FooterContainer>
        ) : null}
      </ContentColumn>

      <ResponsiveVisualWrap $hideOnMobile={hideVisualOnMobile}>
        <ArcPanel>
          <Stars />
          {visual}
        </ArcPanel>
      </ResponsiveVisualWrap>

      <ArcOverlay />

      {nextButton}
    </Frame>
  );
}