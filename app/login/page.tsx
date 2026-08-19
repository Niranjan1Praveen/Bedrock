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
        <p className="text-ink-subtle mt-3 text-sm leading-relaxed">
          Writing the blog. Nothing else on this site needs an account.
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
