"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Signs in against Supabase Auth.
 *
 * The token never passes through this component. signInWithPassword hands it to
 * @supabase/ssr, which writes it as an httpOnly cookie, so no script on the
 * page -- including an injected one -- can read the session afterwards.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    // refresh() so Server Components re-read the freshly set cookie.
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mono-label text-ink-subtle">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 text-sm outline-none transition-colors"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="password" className="mono-label text-ink-subtle">
            Password
          </label>
          {/* Not a checkbox: a labelled toggle states the current state rather
              than an action, and reads correctly to a screen reader via
              aria-pressed. */}
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-pressed={reveal}
            aria-controls="password"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            {reveal ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          type={reveal ? "text" : "password"}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 text-sm outline-none transition-colors"
        />
      </div>

      {error && (
        <p className="border-hard/40 text-hard border-l pl-3 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mono-label bg-ink text-base hover:bg-ink-muted w-full rounded px-5 py-3 transition-colors disabled:opacity-50"
      >
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
