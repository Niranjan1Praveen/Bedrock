import Link from "next/link";
import { formatDate, type PostWithTags } from "@/lib/posts";

/** Mirrors the hairline-row styling of the SQL 50 index. */
export function PostList({ posts }: { posts: PostWithTags[] }) {
  if (posts.length === 0) {
    return (
      <p className="border-line text-ink-subtle rounded-lg border border-dashed px-6 py-16 text-center text-sm">
        Nothing published yet.
      </p>
    );
  }

  return (
    <ul className="border-line border-t">
      {posts.map((post) => (
        <li key={post.id} className="border-line border-b">
          <Link
            href={`/blog/${post.slug}`}
            className="group hover:bg-surface flex flex-col gap-2 px-2 py-6 transition-colors sm:flex-row sm:gap-6"
          >
            <span className="mono-label text-ink-subtle w-36 shrink-0 sm:pt-1">
              {formatDate(post.publishedAt)}
            </span>

            <span className="min-w-0 flex-1">
              <span className="text-ink block text-[15px]">{post.title}</span>
              {post.summary && (
                <span className="text-ink-muted mt-2 block text-sm leading-relaxed">
                  {post.summary}
                </span>
              )}
              <span className="mt-3 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="mono-label border-line text-ink-subtle rounded border px-2 py-0.5"
                  >
                    {tag.name}
                  </span>
                ))}
                <span className="mono-label text-ink-subtle">
                  {post.readingTime} min
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
