export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={`mono-label text-ink-subtle hover:text-ink transition-colors ${className}`}
      >
        Sign out
      </button>
    </form>
  );
}
