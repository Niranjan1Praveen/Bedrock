"use client";

import { useState } from "react";

type State = "idle" | "sending" | "sent";

/**
 * The contact form.
 *
 * Two fields, because every extra one is another reason not to bother. The
 * validation here is only there to catch a slip before a round trip -- the
 * route revalidates everything itself, since nothing sent from a browser can
 * be trusted.
 */
export function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;

    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, website }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "That did not send. Try again.");
        setState("idle");
        return;
      }

      setState("sent");
      setEmail("");
      setMessage("");
    } catch {
      setError("That did not send. Check your connection and try again.");
      setState("idle");
    }
  };

  if (state === "sent") {
    return (
      <div className="border-line rounded-xl border border-dashed px-6 py-12 text-center">
        <p className="text-ink text-lg">Sent — thank you.</p>
        <p className="text-ink-subtle mt-3 text-sm">
          I read everything that comes through here and will reply to the
          address you gave.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink mt-6 rounded border px-3 py-2 transition-colors"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl">
      <label htmlFor="contact-email" className="mono-label text-ink-subtle block">
        Your email
      </label>
      <input
        id="contact-email"
        type="email"
        required
        maxLength={200}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder="you@example.com"
        className="border-line bg-surface text-ink focus:border-ink-subtle mt-3 w-full rounded border px-4 py-3 outline-none transition-colors"
      />

      <label
        htmlFor="contact-message"
        className="mono-label text-ink-subtle mt-8 block"
      >
        Message
      </label>
      <textarea
        id="contact-message"
        required
        minLength={10}
        maxLength={4000}
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What would you like to talk about?"
        className="border-line bg-surface text-ink focus:border-ink-subtle mt-3 w-full resize-y rounded border px-4 py-3 leading-relaxed outline-none transition-colors"
      />

      {/* The honeypot: off-screen rather than display:none, which some bots
          know to skip, and hidden from assistive technology and the tab order
          so nobody can land in it by accident. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this empty</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-warn mt-5 text-sm leading-relaxed">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mono-label bg-ink text-base hover:bg-ink-muted mt-8 rounded px-5 py-3 transition-colors disabled:opacity-40"
      >
        {state === "sending" ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
