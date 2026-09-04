/**
 * Three sites built for the Ellipsis of Happiness Foundation.
 *
 * Kept separate from `projects.ts` because they are not entries in the
 * Selected Work list: they are one body of work for one organisation, shown
 * in their own section. Each links only to the running site -- the
 * repositories are private, so a "Source" link would send visitors to a
 * GitHub 404.
 *
 * Descriptions are drawn from what each site says about itself.
 */

export interface HappinessSite {
  /** What the site is, in one word, for the card's eyebrow. */
  kind: string;
  name: string;
  /** What it does. Plain, no selling. */
  summary: string;
  live: string;
  /** Shown as the link label, and it is the site's identity. */
  host: string;
}

export const happinessSites: HappinessSite[] = [
  {
    kind: "Foundation",
    name: "Ellipsis of Happiness",
    summary:
      "The organisation's own site. A Section 8 non-profit in Ghaziabad working on wellbeing through education, playfulness and community.",
    live: "https://www.ellipsishappiness.org/",
    host: "ellipsishappiness.org",
  },
  {
    kind: "Journal",
    name: "IJHHF",
    summary:
      "The International Journal of Happiness and Human Flourishing: an interdisciplinary, peer-reviewed, open-access journal for research in the field.",
    live: "https://ijhhf.ellipsishappiness.org/",
    host: "ijhhf.ellipsishappiness.org",
  },
  {
    kind: "Event",
    name: "Mr.&MissHappiness",
    summary:
      "The foundation's annual event, a non-competitive happiness pageant open to entrants across all age groups.",
    live: "https://www.mrandmisshappiness.in/",
    host: "mrandmisshappiness.in",
  },
];
