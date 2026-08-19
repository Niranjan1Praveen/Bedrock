"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MonoLabel } from "@/components/ui/mono-label";

export interface EditorPost {
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED";
  tags: string[];
}

const EMPTY: EditorPost = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  coverImage: "",
  status: "DRAFT",
  tags: [],
};

/** Mirrors slugify in lib/markdown.ts so the field previews the real result. */
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type Wrap = { before: string; after?: string; block?: boolean };

const TOOLS: { label: string; title: string; key?: string; wrap: Wrap }[] = [
  { label: "B", title: "Bold (Ctrl+B)", key: "b", wrap: { before: "**", after: "**" } },
  { label: "I", title: "Italic (Ctrl+I)", key: "i", wrap: { before: "_", after: "_" } },
  { label: "<>", title: "Inline code", wrap: { before: "`", after: "`" } },
  { label: "H", title: "Heading", wrap: { before: "## ", block: true } },
  { label: "•", title: "List item", wrap: { before: "- ", block: true } },
  { label: "❝", title: "Quote", wrap: { before: "> ", block: true } },
  { label: "{ }", title: "Code block", wrap: { before: "```sql\n", after: "\n```" } },
  { label: "🔗", title: "Link (Ctrl+K)", key: "k", wrap: { before: "[", after: "](url)" } },
];

export function MarkdownEditor({
  initial,
  mode,
}: {
  initial?: EditorPost;
  mode: "new" | "edit";
}) {
  const router = useRouter();
  const original = initial ?? EMPTY;

  const [post, setPost] = useState<EditorPost>(original);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof EditorPost>(key: K, value: EditorPost[K]) =>
    setPost((p) => ({ ...p, [key]: value }));

  // Slug tracks the title until it is edited by hand, then stops.
  const onTitle = (title: string) => {
    setPost((p) => ({
      ...p,
      title,
      slug: slugTouched ? p.slug : slugify(title),
    }));
  };

  // Preview renders through the same server pipeline as a published post, so
  // there is no second markdown implementation to drift. Debounced, because it
  // is a network call per keystroke otherwise.
  useEffect(() => {
    const id = setTimeout(() => {
      fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: post.content }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d: { html: string }) => setHtml(d.html))
        .catch(() => setHtml("<p>Preview unavailable.</p>"));
    }, 300);
    return () => clearTimeout(id);
  }, [post.content]);

  const applyWrap = useCallback((wrap: Wrap) => {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end);

    const next = wrap.block
      ? value.slice(0, start) + wrap.before + selected + value.slice(end)
      : value.slice(0, start) +
        wrap.before +
        selected +
        (wrap.after ?? "") +
        value.slice(end);

    setPost((p) => ({ ...p, content: next }));

    // Put the caret inside the new markers rather than after them.
    requestAnimationFrame(() => {
      el.focus();
      const offset = start + wrap.before.length;
      el.setSelectionRange(offset, offset + selected.length);
    });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const tool = TOOLS.find((t) => t.key === e.key.toLowerCase());
    if (!tool) return;
    e.preventDefault();
    applyWrap(tool.wrap);
  };

  async function save(status: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    setError(null);
    setNotice(null);

    const payload = { ...post, status };
    const res =
      mode === "new"
        ? await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/posts/${original.slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? `Request failed with ${res.status}`);
      return;
    }

    setPost((p) => ({ ...p, status }));
    setNotice(status === "PUBLISHED" ? "Published." : "Saved as draft.");
    router.refresh();
    if (mode === "new" || data.post?.slug !== original.slug) {
      router.replace(`/admin/${data.post.slug}/edit`);
    }
  }

  async function upload(file: File) {
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    set("coverImage", data.url);
  }

  const slugWarning =
    mode === "edit" &&
    original.status === "PUBLISHED" &&
    post.slug !== original.slug;

  return (
    <div className="space-y-8">
      {/* Fields */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="title" className="mono-label text-ink-subtle">
            Title
          </label>
          <input
            id="title"
            value={post.title}
            onChange={(e) => onTitle(e.target.value)}
            className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="slug" className="mono-label text-ink-subtle">
            Slug
          </label>
          <input
            id="slug"
            value={post.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 font-mono text-sm outline-none transition-colors"
          />
          {slugWarning && (
            <p className="text-warn mt-2 text-sm">
              Changing this breaks every existing link to the published post.
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label htmlFor="summary" className="mono-label text-ink-subtle">
            Summary
          </label>
          <input
            id="summary"
            value={post.summary}
            onChange={(e) => set("summary", e.target.value)}
            className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 text-sm outline-none transition-colors"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="tags" className="mono-label text-ink-subtle">
            Tags, comma separated
          </label>
          <input
            id="tags"
            value={post.tags.join(", ")}
            onChange={(e) =>
              set(
                "tags",
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 text-sm outline-none transition-colors"
          />
        </div>

        <div className="min-w-0 lg:col-span-2">
          <span className="mono-label text-ink-subtle">Cover image</span>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <label className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink cursor-pointer rounded border px-3 py-2 transition-colors">
              Choose file
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                }}
              />
            </label>
            {post.coverImage && (
              <>
                <span className="text-ink-subtle min-w-0 flex-1 truncate font-mono text-xs">
                  {post.coverImage}
                </span>
                <button
                  type="button"
                  onClick={() => set("coverImage", "")}
                  className="mono-label text-ink-subtle hover:text-ink transition-colors"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor and preview */}
      <div>
        <div className="border-line bg-surface-2 flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 px-2 py-2">
          {TOOLS.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.title}
              onClick={() => applyWrap(t.wrap)}
              className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="border-line grid grid-cols-1 overflow-hidden rounded-b-xl border lg:grid-cols-2">
          <textarea
            ref={textarea}
            value={post.content}
            onChange={(e) => set("content", e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck
            placeholder="Write in markdown."
            className="bg-surface text-ink placeholder:text-ink-subtle border-line min-h-[28rem] w-full resize-y border-b p-5 font-mono text-[13px] leading-relaxed outline-none lg:border-r lg:border-b-0"
          />
          <div className="min-w-0 overflow-x-auto p-5">
            <MonoLabel>Preview</MonoLabel>
            <div
              className="prose mt-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {error && (
        <p className="border-hard/40 text-hard border-l pl-3 text-sm">{error}</p>
      )}
      {notice && (
        <p className="border-accent/40 text-accent border-l pl-3 text-sm">
          {notice}
        </p>
      )}

      <div className="border-line flex flex-wrap items-center gap-3 border-t pt-6">
        <button
          type="button"
          disabled={saving || !post.title.trim()}
          onClick={() => save("DRAFT")}
          className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-4 py-2.5 transition-colors disabled:opacity-40"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={saving || !post.title.trim()}
          onClick={() => save("PUBLISHED")}
          className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-4 py-2.5 transition-colors disabled:opacity-40"
        >
          {original.status === "PUBLISHED" ? "Update" : "Publish"}
        </button>
        {post.status === "PUBLISHED" && (
          <button
            type="button"
            disabled={saving}
            onClick={() => save("DRAFT")}
            className="mono-label text-ink-subtle hover:text-warn ml-auto transition-colors"
          >
            Unpublish
          </button>
        )}
      </div>
    </div>
  );
}
