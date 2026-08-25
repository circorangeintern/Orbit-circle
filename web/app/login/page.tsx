"use client";

import { useState, Suspense, useEffect } from "react"; // <-- Add useEffect
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query"; // <-- Add useQueryClient
import LoginScreen, { type LoginValues } from "@/components/onboarding/LoginScreen";
import { useLogin, setToken } from "@/hooks/auth.hook"; // <-- Import setToken

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient(); // <-- Create the query client
  const redirectUrl = searchParams.get("redirect") || "/home";
  const loginMutation = useLogin();
  const [error, setError] = useState<string | undefined>();

  // NEW: Handle Google OAuth Redirect
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // 1. Save the token to localStorage and cookies
      setToken(token);

      // 2. Tell React Query to refetch the current user immediately
      queryClient.invalidateQueries({ queryKey: ['me'] });

      // 3. Clean up the URL so the user doesn't accidentally refresh with the token
      window.history.replaceState({}, document.title, window.location.pathname);

      // 4. Redirect to the dashboard
      router.push("/home");
    }
  }, [searchParams, router, queryClient]);

  const handleSubmit = async (values: LoginValues) => {
    setError(undefined);
    try {
      await loginMutation.mutateAsync({ email: values.email, password: values.password });
      router.push(decodeURIComponent(redirectUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password please try again.");
    }
  };

  return (
    <LoginScreen
      onSubmit={handleSubmit}
      onGoogleLogin={() => {
        // Sends the user to the Express backend route we created
        window.location.href = "http://localhost:3002/auth/google";
      }}
      isSubmitting={loginMutation.isPending}
      error={error}
      signUpHref="/signup"
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}