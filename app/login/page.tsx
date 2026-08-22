import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Container className="py-24 sm:py-32">
      <div className="mx-auto max-w-sm">
        <MonoLabel>Bedrock</MonoLabel>
        <h1 className="mt-4 text-2xl">Sign in</h1>
        {/* Deliberately vague about what is behind it. This page is public, and
            naming the library here would tell every visitor it exists. */}
        <p className="text-ink-subtle mt-3 text-sm leading-relaxed">
          Sign in to reach the private area of this site. Everything public
          works without an account.
        </p>
        {/* LoginForm reads ?next= via useSearchParams, which forces a client
            bailout unless it sits behind a Suspense boundary. */}
        <div className="mt-10">
          <Suspense
            fallback={
              <div className="border-line h-64 animate-pulse rounded border" />
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
