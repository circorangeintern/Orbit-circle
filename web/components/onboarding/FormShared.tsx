"use client";

import styled from "styled-components";

/**
 * Form building blocks for auth screens (Sign up, Login, Forgot password...).
 * Kept separate from `shared.tsx` since those are onboarding-shell pieces;
 * these are specifically form/input pieces reused across auth screens.
 */

// ---------- Icons ----------

const IconSvg = styled.svg`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: rgba(248, 250, 252, 0.7);
`;

export const PersonIcon = () => (
  <IconSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
  </IconSvg>
);

export const MailIcon = () => (
  <IconSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
  </IconSvg>
);

export const LockIcon = () => (
  <IconSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
  </IconSvg>
);

export const EyeIcon = ({ open }: { open?: boolean }) =>
  open ? (
    <IconSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </IconSvg>
  ) : (
    <IconSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M10.6 5.2A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a15.6 15.6 0 01-3.4 4.3M6.6 6.6A15.6 15.6 0 002 12s3.5 7 10 7a10.5 10.5 0 004.4-.9M9.9 9.9a3 3 0 004.2 4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSvg>
  );

export const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 01-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.66z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0012 24z" />
    <path fill="#FBBC05" d="M5.27 14.26A7.2 7.2 0 014.9 12c0-.78.14-1.55.37-2.26v-3.1H1.27A12 12 0 000 12c0 1.94.46 3.77 1.27 5.36l4-3.1z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.64l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

// ---------- Field group (label + input) ----------

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: #f8fafc;
`;

export const InlineLink = styled.a`
  font-size: 15px;
  font-weight: 500;
  color: #a78bfa;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const InputWrapper = styled.div<{ $error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid ${({ $error }) => ($error ? "#F87171" : "rgba(248, 250, 252, 0.35)")};
  background: rgba(248, 250, 252, 0.03);
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: ${({ $error }) => ($error ? "#F87171" : "#A78BFA")};
  }
`;

export const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #f8fafc;

  &::placeholder {
    color: rgba(248, 250, 252, 0.55);
  }
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: rgba(248, 250, 252, 0.7);

  &:hover {
    color: #f8fafc;
  }
`;

export const HelperText = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(248, 250, 252, 0.6);
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #f87171;
`;

// ---------- Buttons ----------

export const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 12px;
  background: #773bec;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #6d28d9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PillLink = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(119, 59, 236, 0.18);
  color: #a78bfa;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(119, 59, 236, 0.3);
  }
`;

// ---------- Divider + social ----------

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 4px 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(248, 250, 252, 0.15);
  }
`;

export const DividerLabel = styled.span`
  font-size: 14px;
  color: rgba(248, 250, 252, 0.7);
  white-space: nowrap;
`;

export const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  border-radius: 12px;
  border: 1px solid rgba(248, 250, 252, 0.15);
  background: rgba(248, 250, 252, 0.04);
  color: #f8fafc;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(248, 250, 252, 0.08);
  }
`;

// ---------- Bottom link line ----------

export const BottomText = styled.p`
  margin: 0;
  font-size: 15px;
  color: #f8fafc;

  a {
    color: #a78bfa;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// ---------- Terms text (overlaid on the visual panel) ----------

export const TermsText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(248, 250, 252, 0.85);

  a {
    color: #c4b5fd;
    text-decoration: underline;
  }
`;