'use client';

import styled from "styled-components";
import Image from "next/image";
import colors from "@/lib/colors";

export type StateType =
  | "generic_error"
  | "server_error"
  | "no_internet"
  | "empty_saved"
  | "success"
  | "not_found";

interface StateConfig {
  imageSrc: string;
  title: string;
  titleColor?: string;
  description: string;
  primaryButtonText?: string;
  showGoBack?: boolean;
}

const STATE_CONFIGS: Record<StateType, StateConfig> = {
  generic_error: {
    imageSrc: "/image/something wrong.png",
    title: "Something went wrong",
    titleColor: "#f87171", // Soft red/coral accent
    description: "We couldn't complete your request.\nplease try again.",
    primaryButtonText: "Try Again",
    showGoBack: true,
  },
  server_error: {
    imageSrc: "/image/server.png",
    title: "Server Error",
    titleColor: "#fbbf24", // Amber accent
    description: "Something went wrong on our end.\nPlease try again.",
    primaryButtonText: "Try Again",
    showGoBack: true,
  },
  no_internet: {
    imageSrc: "/image/no internet.png",
    title: "No internet connection",
    description: "Please check your connection\nand try again.",
    primaryButtonText: "Try Again",
    showGoBack: true,
  },
  not_found: {
    imageSrc: "/image/gemini-svg.svg",
    title: "Page Not Found",
    titleColor: "#f87171",
    description: "The page you are looking for does not exist.",
    primaryButtonText: "Go Home",
    showGoBack: true,
  },
  empty_saved: {
    imageSrc: "/image/empty-folder.png", // this remains as placeholder/original
    title: "No saved careers yet",
    description: "Careers would appear here so you\ncan revisit them anytime.",
    primaryButtonText: "Take Quiz",
    showGoBack: false,
  },
  success: {
    imageSrc: "/image/success-checkmark.png",
    title: "Success!",
    description: "Your data was saved successfully",
    showGoBack: false,
  },
};

/* ---------------- Styled Components ---------------- */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  width: 100%;
  margin: auto;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 260px;
  height: 220px;
  margin-bottom: 24px;

  @media (max-width: 860px) {
    width: 200px;
    height: 170px;
  }
`;

const Title = styled.h2<{ $color?: string }>`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: ${(p) => p.$color || colors.normalWhite};

  @media (max-width: 860px) {
    font-size: 19px;
  }
`;

const Description = styled.p`
  margin: 0 0 28px;
  font-size: 14px;
  line-height: 1.5;
  color: ${colors.muted};
  white-space: pre-line;
  max-width: 320px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  max-width: 280px;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background: ${colors.buttonPurple};
  color: ${colors.normalWhite};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const GoBackButton = styled.button`
  background: transparent;
  border: none;
  color: ${colors.muted};
  font-size: 13px;
  font-weight: 500;
  margin-top: 16px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.normalWhite};
  }
`;

/* ---------------- Props Interface ---------------- */

export interface StateViewProps {
  type: StateType;
  title?: string;
  description?: string;
  imageSrc?: string;
  primaryButtonText?: string;
  onPrimaryAction?: () => void;
  onGoBack?: () => void;
}

export default function StateView({
  type,
  title,
  description,
  imageSrc,
  primaryButtonText,
  onPrimaryAction,
  onGoBack,
}: StateViewProps) {
  const config = STATE_CONFIGS[type];

  const finalTitle = title ?? config.title;
  const finalDescription = description ?? config.description;
  const finalImageSrc = imageSrc ?? config.imageSrc;
  const finalBtnText = primaryButtonText ?? config.primaryButtonText;

  return (
    <Container>
      <ImageWrapper>
        <Image
          src={finalImageSrc}
          alt={finalTitle}
          fill
          unoptimized
          loading="eager"
          style={{ objectFit: "contain" }}
        />
      </ImageWrapper>

      <Title $color={config.titleColor}>{finalTitle}</Title>
      <Description>{finalDescription}</Description>

      {finalBtnText && (
        <PrimaryButton onClick={onPrimaryAction}>
          {finalBtnText}
        </PrimaryButton>
      )}

      {config.showGoBack && (
        <GoBackButton onClick={onGoBack ?? (() => window.history.back())}>
          Go back
        </GoBackButton>
      )}
    </Container>
  );
}