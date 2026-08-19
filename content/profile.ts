/**
 * Everything about the person behind the site.
 *
 * Kept as data next to the SQL content so the About section, the footer and
 * the page metadata all read from one place and cannot drift apart.
 */

export const profile = {
  name: "Niranjan Praveen",
  /** What the work actually is. Written flat, on purpose. */
  role: "Full-stack and machine learning developer",
  location: "New Delhi, India",
  education: {
    degree: "B.Tech, Computer Science and Engineering",
    school: "Amity University, Noida",
    period: "2023 - 2027",
    result: "CGPA 8.98, through the sixth semester",
    coursework: [
      "Data Structures and Algorithms",
      "Operating Systems",
      "Database Management Systems",
    ],
  },
  links: {
    email: "niranjanbpraveen@gmail.com",
    github: "https://github.com/Niranjan1Praveen",
    linkedin: "https://www.linkedin.com/in/niranjan-praveen-a9019921a/",
    resume: "/niranjan-praveen-resume.pdf",
  },
} as const;

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "JavaScript", "C++", "SQL"] },
  {
    group: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"],
  },
  {
    group: "Machine learning",
    items: ["TensorFlow", "PyTorch", "scikit-learn", "LangGraph", "Matplotlib"],
  },
  { group: "Data", items: ["PostgreSQL", "Supabase", "Firebase", "Prisma"] },
  { group: "Tools", items: ["Git", "Vercel", "Flask", "Blender"] },
];

export interface Hackathon {
  result: string;
  event: string;
  year: string;
  project: string;
  /** Slug of the project in content/projects.ts. */
  projectSlug: string;
}

export const hackathons: Hackathon[] = [
  {
    result: "Winner",
    event: "Xylem Global Student Innovation Challenge",
    year: "2025",
    project: "DropConnect",
    projectSlug: "dropconnect",
  },
  {
    result: "2nd Runner-Up",
    event: "NASA Space Apps Challenge, Noida",
    year: "2025",
    project: "Exoplanetarium",
    projectSlug: "exoplanetarium",
  },
  {
    result: "Top 10",
    event: "Microsoft Azure Community Agritech Hackathon",
    year: "2025",
    project: "VahaanBandhu",
    projectSlug: "vahaanbandhu",
  },
  {
    result: "Top 50",
    event: "Hack4Health by Horiba, IIIT Delhi",
    year: "2025",
    project: "MediConnect",
    projectSlug: "mediconnect",
  },
];
