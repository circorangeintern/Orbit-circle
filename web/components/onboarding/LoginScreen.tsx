"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import {StyledFormFooter} from "./SignUpScreen";
import OnboardingLayout from "./OnboardingLayout";
import { Highlight } from "./shared";
import {
  Form,
  FieldGroup,
  LabelRow,
  Label,
  InlineLink,
  InputWrapper,
  Input,
  IconButton,
  ErrorText,
  SubmitButton,
  Divider,
  DividerLabel,
  SocialButton,
  BottomText,
  PillLink,
  TermsText,
  MailIcon,
  LockIcon,
  EyeIcon,
  ArrowRightIcon,
  GoogleIcon,
} from "./FormShared";

export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginScreenProps {
  onSubmit?: (values: LoginValues) => void;
  onGoogleLogin?: () => void;
  signUpHref?: string;
  forgotPasswordHref?: string;
  isSubmitting?: boolean;
  /** Pass a message (e.g. "Incorrect password please try again.") to show
   *  the error state on the password field, matching the Figma error frame. */
  error?: string;
}

export default function LoginScreen({
  onSubmit,
  onGoogleLogin,
  signUpHref = "/signup",
  forgotPasswordHref = "/forgot-password",
  isSubmitting,
  error,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password });
  };

  return (
    <OnboardingLayout
      heading={
        <>
          Let&rsquo;s continue
          <br />
          <Highlight>your journey</Highlight>
        </>
      }
      headerAction={<PillLink href={signUpHref}>Sign Up</PillLink>}
      hideVisualOnMobile={true} 
      hideMobileHeader={true}
      visual={
        // Point this at your real exported asset, e.g. /image/login-visual.png
        <Image src="/image/background5.png" alt="Login illustration" fill style={{ objectFit: "cover" }} priority />
      }
      visualFooter={
        <TermsText>
          By continuing, you agree to our <a href="/privacy-terms">Terms of Service and Privacy Policy</a>.
        </TermsText>
      }
      footer={
        <StyledFormFooter>
        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label htmlFor="email">Email Address</Label>
            <InputWrapper>
              <MailIcon />
              <Input id="email" name="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </InputWrapper>
          </FieldGroup>

          <FieldGroup>
            <LabelRow>
              <Label htmlFor="password">Password</Label>
              <InlineLink href={forgotPasswordHref}>Forgot password?</InlineLink>
            </LabelRow>
            <InputWrapper $error={!!error}>
              <LockIcon />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <IconButton type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((s) => !s)}>
                <EyeIcon open={showPassword} />
              </IconButton>
            </InputWrapper>
            {error ? <ErrorText>{error}</ErrorText> : null}
          </FieldGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
            <ArrowRightIcon />
          </SubmitButton>

          <Divider>
            <DividerLabel>or Login with</DividerLabel>
          </Divider>

          <SocialButton type="button" onClick={onGoogleLogin}>
            <GoogleIcon />
            Google
          </SocialButton>

          <BottomText>
            Don&rsquo;t have an account? <a href={signUpHref}>Create Account</a>
          </BottomText>
        </Form>
        </StyledFormFooter>
      }
    />
  );
}