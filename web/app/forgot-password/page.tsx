'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import AuthLayout from '@/components/auth/AuthLayout'
import { PrimaryButton, Highlight } from '@/components/onboarding/shared'
import { Mail, ChevronLeft } from 'lucide-react'
import { InputIcon, StyledInput } from '@/app/signup/page'
import colors from '@/lib/colors'
import { useForgotPassword } from '@/hooks/auth.hook'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const forgotPasswordMutation = useForgotPassword()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleContinue = async () => {
    setMessage(null)
    try {
      await forgotPasswordMutation.mutateAsync({ email })
      router.push('/forgot-password/check-email')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to send the reset link right now.')
    }
  }

  return (
    <AuthLayout imageSrc="/image/Image0.png" imageAlt="Forgot Password Lock">
      <TextBlock>
        <Title>
          Forgot Your <Highlight>Password?</Highlight>
        </Title>
        <Description>
          No worries! Enter your email and we’ll send you a link to reset your password.
        </Description>
      </TextBlock>

      <MobileIllustration>
        <Image
          src="/image/Image0.png"
          alt="Lock"
          width={220}
          height={160}
          style={{ objectFit: 'contain' }}
          priority
        />
      </MobileIllustration>

      <FormSection>
        <InputGroup>
          <Label>Email Address</Label>
          <InputField>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <CustomStyledInput
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputField>
        </InputGroup>

        {message ? <StatusText>{message}</StatusText> : null}

        <ButtonRow>
          <PrimaryButton onClick={handleContinue} disabled={forgotPasswordMutation.isPending || !email}>
            {forgotPasswordMutation.isPending ? 'Sending...' : 'Continue →'}
          </PrimaryButton>
        </ButtonRow>

        <BackLink onClick={() => router.push('/login')}>
          <ChevronLeft size={18} />
          Back to Login
        </BackLink>
      </FormSection>
    </AuthLayout>
  )
}

/* ---------------- Styled Components ---------------- */

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.h1`
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 44px;
  line-height: 1.15;
  color: ${colors.normalWhite};

  @media (max-width: 900px) {
    font-size: clamp(28px, 7vw, 36px);
  }
`

const Description = styled.p`
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(248, 250, 252, 0.8);

  @media (max-width: 900px) {
    font-size: 14px;
  }
`

export const MobileIllustration = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 8px 0;
  }
`

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

const Label = styled.label`
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${colors.normalWhite};

  @media (max-width: 900px) {
    font-size: 14px;
  }
`

const InputField = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px;
  padding: 0 16px;
  gap: 12px;
  border: 1px solid rgba(248, 250, 252, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
`

const CustomStyledInput = styled(StyledInput)`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: ${colors.normalWhite};
  font-size: 14px;
  padding: 0;

  &::placeholder {
    color: rgba(248, 250, 252, 0.4);
    font-size: 13.5px;
  }
`

const ButtonRow = styled.div`
  width: 100%;

  button {
    width: 100%;
  }
`

const StatusText = styled.p`
  margin: 0;
  color: #ffd1d1;
  font-size: 14px;
`

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 15px;
  color: rgba(248, 250, 252, 0.8);
  align-self: center;

  &:hover {
    color: ${colors.normalWhite};
  }
`