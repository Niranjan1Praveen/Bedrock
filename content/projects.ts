/**
 * Projects, in the order they should be read.
 *
 * Descriptions say what the thing does and what I built, and nothing else.
 * Every repository and demo link here has been checked to resolve.
 */

export interface Project {
  slug: string;
  name: string;
  /** What it is, in a few words. */
  subtitle: string;
  award?: string;
  year: string;
  /** What the project does. */
  summary: string;
  /** What I was responsible for. */
  role: string;
  stack: string[];
  repo: string;
  live?: string;
  /** Separate repositories that make up the rest of the system. */
  related?: { name: string; repo: string }[];
  /** Real screenshot, once one exists. Falls back to generated art. */
  image?: string;
}

export const projects: Project[] = [
  {
    slug: "dropconnect",
    name: "DropConnect",
    subtitle: "Water resilience platform",
    award: "Winner, Xylem Global Student Innovation Challenge",
    year: "2025",
    summary:
      "Tracks water availability and the effect of interventions across regions, with dashboards for impact assessment, CSR reporting and site suitability.",
    role: "Built the application end to end: the interface, the backend APIs and the database schema.",
    stack: ["Next.js", "Supabase", "Python"],
    repo: "https://github.com/Niranjan1Praveen/DropConnect",
    live: "https://drop-connect-development.vercel.app",
    related: [
      {
        name: "Impact assessment dashboard",
        repo: "https://github.com/Niranjan1Praveen/DropConnect-Impact-Assessment-Dashboard",
      },
      {
        name: "CSR dashboard",
        repo: "https://github.com/Niranjan1Praveen/DropConnect-CSR-Dashboard",
      },
      {
        name: "Region suitability map",
        repo: "https://github.com/Niranjan1Praveen/DropConnect-Region-Suitability-Map",
      },
    ],
  },
  {
    slug: "exoplanetarium",
    name: "Exoplanetarium",
    subtitle: "Exoplanet discovery and analysis",
    award: "2nd Runner-Up, NASA Space Apps Challenge, Noida",
    year: "2025",
    summary:
      "Explores exoplanet data in 3D and scores candidate planets for habitability, backed by separate services for discovery analysis and Earth comparison.",
    role: "Built the React and Three.js frontend, the Python services behind it, the database design and the deployment.",
    stack: ["React", "Three.js", "Python", "scikit-learn"],
    repo: "https://github.com/Niranjan1Praveen/Exoplanetarium-NasaSpaceAppsChallenge",
    live: "https://exoplanetarium-nasa-space-apps-chal.vercel.app",
    related: [
      {
        name: "Habitability estimator",
        repo: "https://github.com/Niranjan1Praveen/Exoplanetarium-HabitibilityEstimator",
      },
      {
        name: "Discovery analyzer",
        repo: "https://github.com/Niranjan1Praveen/Exoplanetarium-DiscoveryAnalyzer",
      },
      {
        name: "ExoEarth comparator",
        repo: "https://github.com/Niranjan1Praveen/Exoplanetarium-ExoEarthComparator",
      },
    ],
  },
  {
    slug: "adversanet",
    name: "AdversaNet",
    subtitle: "Adversarial robustness testing",
    year: "2025",
    summary:
      "Runs FGSM and PGD attacks against image classifiers and records how far accuracy falls as the attack strength increases.",
    role: "Built the interface, the Python attack pipeline and the schema that stores test results.",
    stack: ["Next.js", "Python", "TensorFlow", "PyTorch"],
    repo: "https://github.com/Niranjan1Praveen/AdversaNet",
    live: "https://adversa-net.vercel.app",
    related: [
      {
        name: "Custom models",
        repo: "https://github.com/Niranjan1Praveen/AdversaNet-CustomModels",
      },
    ],
  },
  {
    slug: "echowithin",
    name: "EchoWithin",
    subtitle: "Voice application with emotion analysis",
    year: "2025",
    summary:
      "Holds a spoken conversation in real time, analyses the emotion in what was said, and keeps a per-user log with dashboards over time.",
    role: "Built the voice pipeline, authentication, the emotion analysis service and the dashboards.",
    stack: ["Next.js", "Vapi AI", "Prisma", "Supabase", "Flask"],
    repo: "https://github.com/Niranjan1Praveen/EchoWithin",
    live: "https://eco-within.vercel.app",
    related: [
      {
        name: "Analysis model",
        repo: "https://github.com/Niranjan1Praveen/EchoWithin-AnalysisModel",
      },
    ],
  },
  {
    slug: "vahaanbandhu",
    name: "VahaanBandhu",
    subtitle: "Rural transport and logistics",
    award: "Top 10, Microsoft Azure Community Agritech Hackathon",
    year: "2025",
    summary:
      "Routing and driver welfare tooling for freight in rural India, including a truck route navigator.",
    role: "Frontend developer, in a team of four.",
    stack: ["Next.js", "Azure"],
    repo: "https://github.com/Niranjan1Praveen/VahaanBandhu",
    live: "https://vahaan-bandhu.vercel.app",
    related: [
      {
        name: "Truck route navigator",
        repo: "https://github.com/Niranjan1Praveen/VahaanBandhu-TruckRouteNavigator",
      },
    ],
  },
  {
    slug: "mediscribe",
    name: "MediScribe",
    subtitle: "Clinical documentation from speech",
    award: "Cyfuture AI Hackathon 1.0",
    year: "2025",
    summary:
      "Turns a spoken consultation into a structured clinical note using speech recognition and language models.",
    role: "Frontend and integration, in a team of five.",
    stack: ["Next.js", "Python", "NLP"],
    repo: "https://github.com/Niranjan1Praveen/MediScribe-Cyfuture-1.0",
    live: "https://medi-scribe-pi.vercel.app",
  },
  {
    slug: "mediconnect",
    name: "MediConnect",
    subtitle: "Telehealth for rural clinics",
    award: "Top 50, Hack4Health by Horiba, IIIT Delhi",
    year: "2025",
    summary:
      "Connects rural clinics to urban specialists for remote consultation.",
    role: "Frontend developer, in a team of three.",
    stack: ["Next.js", "Firebase"],
    repo: "https://github.com/Niranjan1Praveen/MediConnect",
    live: "https://hack4-health.vercel.app",
  },
  {
    slug: "industrial-wastewater-dashboard",
    name: "Industrial Wastewater Dashboard",
    subtitle: "Effluent monitoring",
    year: "2025",
    summary:
      "Reads sensor readings from treatment plants and charts them against compliance limits, with a separate Python service handling ingestion.",
    role: "Built the dashboard and the ingestion service.",
    stack: ["Next.js", "Python"],
    repo: "https://github.com/Niranjan1Praveen/industrial-waste-water-dashboard",
    live: "https://industrial-waste-water-dashboard.vercel.app",
    related: [
      {
        name: "Monitoring server",
        repo: "https://github.com/Niranjan1Praveen/wastewater-live-monitor-server",
      },
    ],
  },
];
