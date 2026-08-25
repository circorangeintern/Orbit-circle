"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import SignUpScreen, { type SignUpValues } from "@/components/onboarding/SignUpScreen";
import { useSignup } from "@/hooks/auth.hook";

export default function SignUpPage() {
  const router = useRouter();
  const signupMutation = useSignup();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (values: SignUpValues) => {
    if (values.password !== values.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError(undefined);
    try {
      await signupMutation.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account right now.");
    }
  };

  return (
    <SignUpScreen
      onSubmit={handleSubmit}
      onGoogleSignUp={() => {
        // kick off OAuth flow
      }}
      isSubmitting={signupMutation.isPending}
      error={error}
      loginHref="/login"
    />
  );
}

export const Label = styled.label`
  display: block;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const InputBox = styled.div`
  display: flex;
  align-items: center;
  height: 65px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-radius: 18px;
  padding: 0 18px;
  margin-bottom: 22px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);

  @media (max-width: 480px) {
    height: 58px;
  }
`;

export const InputIcon = styled.span`
  color: #fff;
  font-size: 22px;
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

export const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  font-size: 18px;
  padding: 0 15px;
  font-family: inherit;

  &::placeholder {
    color: #d8d8d8;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

