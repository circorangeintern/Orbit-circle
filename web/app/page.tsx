'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wrapper } from '@/components/shared/Layout.styled';
import fontsize from '@/lib/fontsize';
import colors from '@/lib/colors';
import Image from 'next/image';
import styled from 'styled-components';
import { getToken } from '@/hooks/auth.hook';


// ---------- Component ----------
export default function SplashPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace('/home');
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(timer);
          // Navigate after a short delay
          setTimeout(() => router.push('/onboarding'), 700);
          return 100;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <SplashWrapper>
      <Brand>
        <LogoImg
          src="/image/Logo.png"
          alt="CareerMap Logo"
          width={350}
          height={270}
          priority
        />
        <Title>
          Career<span>Map</span>
        </Title>
        <Subtitle>Clarity Before the Big Choice</Subtitle>
      </Brand>

      <ProgressContainer>
        <Bar progress={progress} />
        <Percent>{progress}%</Percent>
      </ProgressContainer>
    </SplashWrapper>
  );
}



export const SplashWrapper = styled(Wrapper)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Brand = styled.div`
  text-align: center;
  width: 100%;
  margin-bottom: 3rem;
`;

const LogoImg = styled(Image)`
  width: 350px;
  height: 270px;
  margin-right: auto;
  margin-left: auto;

  @media (max-width: 600px) {
    width: 280px;
    height: auto;
  }
  @media (max-width: 380px) {
    width: 250px;
    height: auto;
  }
`;

const Title = styled.h1`
  color: ${colors.normalWhite};
  font-size: ${fontsize.lg};
  font-weight: 700;
  letter-spacing: -2px;
  margin-top: 10px;

  span {
    color: ${colors.buttonPurple};
  }

  @media (max-width: 600px) {
    font-size: ${fontsize.md};
  }
  @media (max-width: 380px) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  color: #e6e3f2;
  font-size: ${fontsize.md};
  margin-top: 17px;
  font-weight: 400;

  @media (max-width: 600px) {
    font-size: 18px;
    margin-top: 10px;
  }
  @media (max-width: 380px) {
    font-size: 15px;
  }
`;

const ProgressContainer = styled.div`
  width: 260px;
  height: 14px;
  background: #ffe5e5;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  @media (max-width: 600px) {
    max-width: 250px;
  }
  @media (max-width: 380px) {
    max-width: 220px;
  }
`;

const Bar = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background: ${colors.buttonPurple};
  border-radius: 20px;
  transition: width 0.2s ease;
`;

const Percent = styled.span`
  position: absolute;
  right: -45px;
  top: -7px;
  font-size: 14px;
  color: ${colors.buttonPurple};
  font-weight: bold;

  @media (max-width: 600px) {
    right: -38px;
  }
`;