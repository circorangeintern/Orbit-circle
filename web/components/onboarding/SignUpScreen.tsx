"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import styled from "styled-components";
import OnboardingLayout from "./OnboardingLayout";
import { Highlight } from "./shared";
import {
  Form,
  FieldGroup,
  Label,
  InputWrapper,
  Input,
  IconButton,
  HelperText,
  SubmitButton,
  Divider,
  DividerLabel,
  SocialButton,
  BottomText,
  PillLink,
  TermsText,
  PersonIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  ArrowRightIcon,
  GoogleIcon,
} from "./FormShared";

export interface SignUpValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpScreenProps {
  onSubmit?: (values: SignUpValues) => void;
  onGoogleSignUp?: () => void;
  loginHref?: string;
  isSubmitting?: boolean;
  error?: string;
}

export default function SignUpScreen({ onSubmit, onGoogleSignUp, loginHref = "/login", isSubmitting, error }: SignUpScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.({ fullName, email, password, confirmPassword });
  };

  

  return (
    
    <OnboardingLayout
      heading={
        <>
          Create your
          <br />
          <Highlight>account</Highlight>
        </>
      }
     
      headerAction={<PillLink href={loginHref}>Login</PillLink>}
      hideVisualOnMobile={true} 
      hideMobileHeader={true}
      visual={
        // Point this at your real exported asset, e.g. /image/signup-visual.png
        <Image src="/image/background5.png" alt="Sign up illustration" fill style={{ objectFit: "cover" }} priority />
      }
      visualFooter={
        <TermsText>
          By continuing, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
        </TermsText>
      }
      footer={
        <StyledFormFooter>
        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label htmlFor="fullName">Full Name</Label>
            <InputWrapper>
              <PersonIcon />
              <Input id="fullName" name="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </InputWrapper>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="email">Email Address</Label>
            <InputWrapper>
              <MailIcon />
              <Input id="email" name="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </InputWrapper>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <LockIcon />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <IconButton type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((s) => !s)}>
                <EyeIcon open={showPassword} />
              </IconButton>
            </InputWrapper>
            <HelperText>At least 8 characters with letters, numbers &amp; symbols</HelperText>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <InputWrapper>
              <LockIcon />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
              <IconButton type="button" aria-label={showConfirm ? "Hide password" : "Show password"} onClick={() => setShowConfirm((s) => !s)}>
                <EyeIcon open={showConfirm} />
              </IconButton>
            </InputWrapper>
          </FieldGroup>

          {error ? <HelperText style={{ color: "#ff8a8a" }}>{error}</HelperText> : null}

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
            <ArrowRightIcon />
          </SubmitButton>

          <Divider>
            <DividerLabel>or sign up with</DividerLabel>
          </Divider>

          <SocialButton type="button" onClick={onGoogleSignUp}>
            <GoogleIcon />
            Google
          </SocialButton>

          <BottomText>
            Already have an account? <a href={loginHref}>Login</a>
          </BottomText>
        </Form>
        </StyledFormFooter>
      }
    />
  );
}

export const StyledFormFooter = styled.div`
  margin-top: 0; /* Overrides default margin-top: auto */
`;