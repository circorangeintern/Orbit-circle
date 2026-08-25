'use client'

import React, { ReactNode } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { Wrapper } from '@/components/shared/Layout.styled'
import { Logo } from '@/components/onboarding/shared'
import { ArrowLeft } from 'lucide-react'
import colors from '@/lib/colors'

interface AuthLayoutProps {
  children: ReactNode
  imageSrc: string
  imageAlt?: string
  showBackButton?: boolean
  onBackClick?: () => void
}

export default function AuthLayout({
  children,
  imageSrc,
  imageAlt = 'Illustration',
  showBackButton = true,
  onBackClick,
}: AuthLayoutProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <Wrapper>
      <PageContainer>
        {/* Mobile Header */}
        {/* <MobileHeader>
          {showBackButton ? (
            <BackButton onClick={handleBack}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </BackButton>
          ) : (
            <div style={{ width: 40 }} />
          )}
          <Logo />
        </MobileHeader> */}

        <MainContent>
          {children}
        </MainContent>

        {/* Desktop Side Illustration */}
        <DesktopIllustration>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </DesktopIllustration>
      </PageContainer>
    </Wrapper>
  )
}

// ---------- Styled Components ----------

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100vw;
  max-width: 1440px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 80px 80px 40px 80px;
  gap: 40px;
  background: ${colors.background};
  overflow-x: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: flex-start;
    padding: 24px 20px 40px;
    gap: 20px;
  }
`

const MobileHeader = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
  }
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
`

const MainContent = styled.div`
  flex: 0 1 420px;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 2;

  @media (max-width: 900px) {
    flex: none;
    max-width: 100%;
  }
`

const DesktopIllustration = styled.div`
  flex: 1;
  max-width: 650px;
  height: 520px;
  position: relative;

  @media (max-width: 900px) {
    display: none;
  }
`