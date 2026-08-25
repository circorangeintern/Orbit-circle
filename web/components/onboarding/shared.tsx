"use client";

import styled, { keyframes } from "styled-components";
import Image from "next/image";

/**
 * Shared building blocks for every "Desktop - Onboarding N" / auth screen.
 * Anything that repeats pixel-for-pixel across the Figma frames lives here
 * so individual screens only need to describe what's *different* about them
 * (heading, subtext, illustration, footer actions).
 */

// ---------- Logo ----------

export const LogoMark = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  text-decoration: none;
  z-index: 5;
`;

const Wordmark = styled.span`
  font-weight: 600;
  font-size: 24px;
  line-height: 29px;
  color: #f8fafc;

  b {
    font-weight: 700;
    color: #a78bfa;
  }
`;

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <LogoMark href={href}>
      <Image
        src="/image/Logo.png"
        alt="CareerMap Logo"
        width={50}
        height={50}
        priority
      />
      <Wordmark>
        Career<span>Map</span>
      </Wordmark>
    </LogoMark>
  );
}

// ---------- Heading helpers ----------

/** Wrap a word/phrase in this inside a `heading` prop to get the purple accent line, e.g.
 *  heading={<>Understand your <Highlight>strengths</Highlight></>} */
export const Highlight = styled.span`
  color: #a78bfa;
`;

// ---------- Arc-cropped visual panel ----------

/* Right-hand column of the flex Frame on desktop. Fills the full viewport
   height (Frame is 100vh, flex items stretch to match by default), and its
   width is a share of the row rather than a fixed 686px — so it scales
   with the window instead of being pinned to a 1440px canvas.

   Below 900px, Frame switches to a column layout (see OnboardingLayout),
   so this becomes a full-width block stacked ABOVE the content column
   (order: -1) with a fixed viewport-relative height, matching the mobile
   mockup — image on top, text below — instead of disappearing. */
export const VisualWrap = styled.div`
  position: relative;
  flex: 1 1 48%;
  min-width: 420px;
  z-index: 0;

  @media (max-width: 900px) {
    flex: none;
    width: 100%;
    min-width: 0;
    height: 42vh;
    min-height: 260px;
    order: -1;
  }
`;

/* The arc, done the way Figma actually built it: NOT a border-radius clip
   on the image, but a solid navy shape with a custom bezier-curved edge
   painted ON TOP of the image (Figma's "Rectangle 30" layer). ArcPanel just
   holds everything; no radius/clip here anymore. */
export const ArcPanel = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(120% 90% at 75% 15%, rgba(119, 59, 236, 0.55) 0%, rgba(119, 59, 236, 0) 55%),
    radial-gradient(90% 70% at 20% 85%, rgba(56, 139, 223, 0.35) 0%, rgba(56, 139, 223, 0) 60%),
    linear-gradient(180deg, #150a4a 0%, #0a003c 55%, #0a003c 100%);
`;

/* Exact path pulled from Figma dev mode ("Rectangle 30": 851x1021,
   positioned left:2px top:0 on the original 1440x1024 frame). Sized here
   with vw/vh (not %) because it must be positioned relative to the whole
   Frame, not to VisualWrap's own box — in the original design this shape's
   left ~59% overlaps the *text* column too (invisible there, same navy),
   and only its curved trailing edge pokes into the image. Stretching it to
   VisualWrap's box directly would cover way more of the image than it
   should. vw/vh works because Frame is full-bleed (100vw / ~100vh), so
   these units ARE percentages of the frame. */
const ArcOverlaySvg = styled.svg`
  position: absolute;
  left: 0.14vw; /* 2px / 1440px */
  top: 0;
  width: 59.1vw; /* 851px / 1440px */
  height: 99.7vh; /* 1021px / 1024px */
  z-index: 2;
  pointer-events: none;

  @media (max-width: 900px) {
    display: none; /* mobile mockup uses a plain rectangular image, no arc */
  }
`;

export function ArcOverlay({ fill = "#0a003c" }: { fill?: string }) {
  return (
    <ArcOverlaySvg viewBox="0 0 851 1021" preserveAspectRatio="none" aria-hidden focusable="false">
      <path d="M0 0H851C741.93 423.895 751.243 645.296 851 1021H0V0Z" fill={fill} />
    </ArcOverlaySvg>
  );
}

export const Stars = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(1.5px 1.5px at 20% 20%, rgba(255, 255, 255, 0.5) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 70% 10%, rgba(255, 255, 255, 0.35) 50%, transparent 51%),
    radial-gradient(1px 1px at 40% 60%, rgba(255, 255, 255, 0.4) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 85% 45%, rgba(255, 255, 255, 0.3) 50%, transparent 51%),
    radial-gradient(1px 1px at 15% 75%, rgba(255, 255, 255, 0.4) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 60% 85%, rgba(255, 255, 255, 0.3) 50%, transparent 51%);
  opacity: 0.8;
`;

// ---------- Person silhouette (placeholder for the character render) ----------

export const PersonSlot = styled.div`
  position: absolute;
  width: 340px;
  height: 620px;
  z-index: 2;
`;

const BackpackTag = styled.div`
  position: absolute;
  width: 26px;
  height: 26px;
  left: 62px;
  top: 300px;
  border-radius: 6px;
  background: #0a003c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(167, 139, 250, 0.7);

  svg {
    width: 16px;
    height: 16px;
  }
`;

/** Placeholder character render — swap the inner <svg> for the real exported
 *  PNG/WebP whenever you have it; the outer <PersonSlot> keeps its size/position. */
export function Person({ left = 60, bottom = 0 }: { left?: number; bottom?: number }) {
  return (
    <PersonSlot style={{ left, bottom }}>
      <svg viewBox="0 0 340 620" width="100%" height="100%" fill="none">
        <ellipse cx="150" cy="620" rx="140" ry="10" fill="#000" opacity="0.25" />
        <circle cx="150" cy="90" r="58" fill="#241154" />
        <path d="M60 620 L60 340 C60 250 100 190 150 190 C200 190 240 250 240 340 L240 620 Z" fill="#1B0B45" />
        <rect x="30" y="260" width="90" height="220" rx="24" fill="#150A38" />
      </svg>
      <BackpackTag>
        <svg viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" stroke="#A78BFA" strokeWidth="3" />
          <path d="M22 12l10 10-10 10" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </BackpackTag>
    </PersonSlot>
  );
}

// ---------- Progress dots (quiz-style onboarding screens) ----------

const DotRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Dot = styled.span<{ $active?: boolean }>`
  width: 32px;
  height: 15px;
  border-radius: 16px;
  background: ${({ $active }) => ($active ? "#773bec" : "rgba(248, 250, 252, 0.6)")};
  transition: width 0.2s ease, height 0.2s ease, background 0.2s ease;

  @media (max-width: 900px) {
    width: ${({ $active }) => ($active ? "20px" : "9px")};
    height: ${({ $active }) => ($active ? "8px" : "9px")};
    border-radius: 10px;
    background: ${({ $active }) => ($active ? "var(--white, #F8FAFC)" : "rgba(248, 250, 252, 0.6)")};
  }
`;

export function ProgressDots({ total, activeIndex }: { total: number; activeIndex: number }) {
  return (
    <DotRow>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} $active={i === activeIndex} />
      ))}
    </DotRow>
  );
}

// ---------- Next button (circular, bottom-right of visual) ----------

const NextButtonEl = styled.button<{ $hasLabel?: boolean }>`
  position: absolute;
  width: ${({ $hasLabel }) => ($hasLabel ? "auto" : "80px")};
  min-width: ${({ $hasLabel }) => ($hasLabel ? "180px" : "80px")};
  height: ${({ $hasLabel }) => ($hasLabel ? "56px" : "80px")};
  left: ${({ $hasLabel }) => ($hasLabel ? "12.78%" : "auto")};
  right: ${({ $hasLabel }) => ($hasLabel ? "auto" : "12.78%")};
  bottom: 8.01%; /* 82px / 1024px frame height, from Figma dev mode */
  border: none;
  border-radius: ${({ $hasLabel }) => ($hasLabel ? "999px" : "50%")};
  background: #773bec;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $hasLabel }) => ($hasLabel ? "0 24px" : "0")};
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  z-index: 6;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: #6d28d9;
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }

  svg {
    width: 28px;
    height: 19px;
  }

  @media (max-width: 900px) {
    position: fixed;
    /* Force exact width and height match for circular shape on icon-only mode */
    width: ${({ $hasLabel }) => ($hasLabel ? "calc(100% - 40px)" : "56px")};
    min-width: ${({ $hasLabel }) => ($hasLabel ? "auto" : "56px")};
    height: 56px;
    aspect-ratio: ${({ $hasLabel }) => ($hasLabel ? "auto" : "1 / 1")};
    border-radius: ${({ $hasLabel }) => ($hasLabel ? "12px" : "50%")};
    left: ${({ $hasLabel }) => ($hasLabel ? "20px" : "auto")};
    right: ${({ $hasLabel }) => ($hasLabel ? "auto" : "20px")};
    bottom: 20px;
    padding: 0;

    svg {
      width: 20px;
      height: 14px;
    }
  }
`;

export function NextButton({ onClick, label = "Next" }: { onClick?: () => void; label?: string }) {
  const hasLabel = label !== "Next";

  return (
    <NextButtonEl type="button" aria-label={label} onClick={onClick} $hasLabel={hasLabel}>
      {hasLabel ? label : (
        <svg viewBox="0 0 28 19" fill="none">
          <path d="M1 9.5H27M27 9.5L18.5 1M27 9.5L18.5 18" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </NextButtonEl>
  );
}

// ---------- CTA buttons + terms (welcome / auth-style screens) ----------

export const PrimaryButton = styled.button`
  width: 100%;
  max-width: 356px;
  height: 56px;
  border: none;
  border-radius: 10px;
  background: #773bec;
  color: #f8fafc;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #6d28d9;
  }
`;

export const OutlineButton = styled.button`
  width: 100%;
  max-width: 356px;
  height: 56px;
  border: 2px solid #6d28d9;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.004);
  color: #773bec;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: rgba(109, 40, 217, 0.12);
  }
`;

export const TermsText = styled.p`
  max-width: 356px;
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 19px;
  color: #f8fafc;
  opacity: 0.8;

  a {
    color: #a78bfa;
    text-decoration: underline;
  }
`;

// ---------- Motion tokens shared by illustrations ----------

export const floaty = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;