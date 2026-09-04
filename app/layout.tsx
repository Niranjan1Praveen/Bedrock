import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

/**
 * Where the site actually lives, for resolving relative URLs in metadata.
 *
 * Without a metadataBase, Next emits Open Graph image URLs as paths, which no
 * crawler can fetch -- so a shared link shows no image at all. That applied to
 * the blog's cover images too, silently, until this was set.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://bedrock-niranjan-praveen.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Niranjan Praveen — Bedrock",
    template: "%s — Bedrock",
  },
  description:
    "Projects and reference notes by Niranjan Praveen, a full-stack and machine learning developer in New Delhi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
