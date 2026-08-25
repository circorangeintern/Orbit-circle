'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styled from 'styled-components'
import { Wrapper } from '@/components/shared/Layout.styled'
import { PrimaryButton } from '@/components/onboarding/shared'
import colors from '@/lib/colors'

export default function CheckEmailPage() {
  const router = useRouter()

  return (
    <Wrapper>
      <PageContainer>
        <Content>
          <Title>Check Your Email</Title>
          <Subtitle>
            We sent a password reset link to your inbox. Open it to choose a new password and regain access.
          </Subtitle>

          <ButtonRow>
            <PrimaryButton onClick={() => router.push('/login')}>
              Back to Login
            </PrimaryButton>
          </ButtonRow>
        </Content>

        <Illustration>
          <Image
            src="/image/Image2.png"
            alt="Check your email"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Illustration>
      </PageContainer>
    </Wrapper>
  )
}

/* ---------------- Styled Components ---------------- */

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100vw;
  max-width: 1440px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 100px 80px 30px 80px;
  gap: 40px;
  background: ${colors.background};
  overflow: hidden;

  @media (max-width: 1024px) {
    padding: 60px 40px;
  }

  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 48px 24px;
    gap: 32px;
  }
`

const Content = styled.div`
  flex: 0 1 440px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 2;
  width: 100%;
  max-width: 440px;

  @media (max-width: 900px) {
    flex: none;
    max-width: 100%;
  }
`

const Title = styled.h1`
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 44px;
  line-height: 1.2;
  color: ${colors.normalWhite};

  @media (max-width: 900px) {
    font-size: clamp(28px, 7vw, 36px);
  }
`

const Subtitle = styled.p`
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 1.5;
  color: rgba(248, 250, 252, 0.8);
  max-width: 380px;

  @media (max-width: 900px) {
    font-size: 15px;
    max-width: 100%;
  }
`

const ButtonRow = styled.div`
  width: 100%;
  max-width: 356px;
  margin-top: 8px;

  @media (max-width: 900px) {
    max-width: 100%;

    button {
      width: 100%;
    }
  }
`

const Illustration = styled.div`
  flex: 1 1 auto;
  width: 100%;
  max-width: 640px;
  height: 460px;
  border-radius: 32px;
  overflow: hidden;
  position: relative;

  @media (max-width: 1024px) {
    height: 360px;
  }

  @media (max-width: 900px) {
    display: none; /* Hides image on mobile layout to prioritize action, or set height: 260px if needed */
  }
`