import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { MessageRow } from "@/components/admin/message-row";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  // The layout guards the section, but a layout is not a security boundary in
  // the App Router -- a page can render without its layout re-running on a
  // client navigation -- so this checks for itself, as the other admin pages do.
  if (!(await getUser())) redirect("/login?next=/admin/messages");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const unread = messages.filter((m) => !m.read).length;

  return (
    <Container className="py-16 sm:py-20">
      <MonoLabel>Messages</MonoLabel>
      <h1 className="mt-4 text-3xl">
        {messages.length === 0
          ? "Nothing yet"
          : `${unread} unread of ${messages.length}`}
      </h1>
      <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
        Sent from the contact form on the homepage. Replying is a mail client
        away: the address is a link.
      </p>

      {messages.length === 0 ? (
        <p className="border-line text-ink-subtle mt-12 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
          No messages have come through the form yet.
        </p>
      ) : (
        <ul className="border-line mt-10 border-t">
          {messages.map((m) => (
            <MessageRow
              key={m.id}
              id={m.id}
              email={m.email}
              message={m.message}
              read={m.read}
              sentAt={formatDate(m.createdAt)}
            />
          ))}
        </ul>
      )}
    </Container>
  );
}
