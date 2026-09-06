/**
 * Extra images for a project's own page, beyond the single poster in
 * `projects.ts`.
 *
 * Kept separate from `Project` because these are optional and only four
 * projects have them so far. A project with no entry here simply renders no
 * gallery -- the section is skipped rather than shown empty.
 *
 * Every caption says what is actually in the frame. The order is deliberate:
 * the running application first, then the analysis behind it, then the event
 * it was built at.
 */

export interface GalleryImage {
  src: string;
  /** For screen readers. Says what the image is, not that it is an image. */
  alt: string;
  /** Printed under the image. One line, no selling. */
  caption: string;
}

export const projectGalleries: Record<string, GalleryImage[]> = {
  dropconnect: [
    {
      src: "/images/projects/dropconnect/dropconnect-01.webp",
      alt: "DropConnect landing page",
      caption: "The landing page.",
    },
    {
      src: "/images/projects/dropconnect/dropconnect-02.webp",
      alt: "Registration paths for volunteers, NGOs and corporate partners",
      caption:
        "Three ways in — volunteers, NGOs and corporate partners — each with its own registration path.",
    },
    {
      src: "/images/projects/dropconnect/dropconnect-03.webp",
      alt: "Site suitability map of India, showing scores for Madhya Pradesh",
      caption:
        "The suitability map: vegetation, water, elevation and urban share scored per region.",
    },
    {
      src: "/images/projects/dropconnect/dropconnect-04.webp",
      alt: "Event matching screen listing water and flood preparedness drives",
      caption:
        "Event matching — relief and preparedness drives a volunteer can join.",
    },
    {
      src: "/images/projects/dropconnect/dropconnect-05.webp",
      alt: "CSR assessment dashboard with area restored, flora planted, waste removed and biodiversity count",
      caption:
        "The CSR dashboard: area restored, flora planted, waste removed and biodiversity count.",
    },
    {
      src: "/images/projects/dropconnect/dropconnect-06.webp",
      alt: "Charts of risk classes by geography and their composition per region",
      caption: "Risk classes by geography, and their composition region by region.",
    },
    {
      src: "/images/projects/dropconnect/dropconnect-07.webp",
      alt: "The five-person team presenting DropConnect at Amity University",
      caption: "Presenting the build at Amity University.",
    },
    {
      src: "/images/projects/dropconnect/dropconnect-08.webp",
      alt: "Result slide naming DropConnect best project in the water related disasters challenge",
      caption: "The result slide from the Xylem challenge.",
    },
  ],

  exoplanetarium: [
    {
      src: "/images/projects/exoplanetarium/exoplanetarium-01.webp",
      alt: "Exoplanetarium landing page",
      caption: "The landing page.",
    },
    {
      src: "/images/projects/exoplanetarium/exoplanetarium-02.webp",
      alt: "Atmospheres panel with transit light curve, 3D planet view, detected molecules and transmission spectra",
      caption:
        "Atmospheres: the transit light curve, the 3D view, detected molecules, and morning against evening spectra.",
    },
    {
      src: "/images/projects/exoplanetarium/exoplanetarium-03.webp",
      alt: "Prediction result showing class probabilities for false positive, candidate and confirmed",
      caption:
        "One prediction, with the class probabilities behind it — an ensemble of LightGBM and XGBoost.",
    },
    {
      src: "/images/projects/exoplanetarium/exoplanetarium-04.webp",
      alt: "Confusion matrices and a one-versus-rest ROC curve for the classifier",
      caption:
        "How the classifier actually did: confusion matrices, then one-vs-rest ROC.",
    },
    {
      src: "/images/projects/exoplanetarium/exoplanetarium-05.webp",
      alt: "The team working at laptops during the NASA Space Apps Challenge",
      caption: "Mid-build, at the NASA Space Apps Challenge.",
    },
    {
      src: "/images/projects/exoplanetarium/exoplanetarium-06.webp",
      alt: "The team holding certificates at the Noida host venue",
      caption: "Certificates, at the Noida host venue.",
    },
  ],

  mediconnect: [
    {
      src: "/images/projects/mediconnect/mediconnect-01.webp",
      alt: "MediConnect landing page",
      caption: "The landing page.",
    },
    {
      src: "/images/projects/mediconnect/mediconnect-02.webp",
      alt: "Diagnostic assistant running a tongue disease predictor and a wound type classifier",
      caption:
        "The diagnostic assistant: a tongue predictor and a wound type classifier, picked per case.",
    },
    {
      src: "/images/projects/mediconnect/mediconnect-03.webp",
      alt: "Live conversation capture screen for a doctor and patient dialogue",
      caption:
        "Live conversation capture — the doctor and patient dialogue, by voice or by text.",
    },
    {
      src: "/images/projects/mediconnect/mediconnect-04.webp",
      alt: "Grid of misclassified images with their true and predicted labels",
      caption: "Where the classifier gets it wrong, with true and predicted labels.",
    },
    {
      src: "/images/projects/mediconnect/mediconnect-05.webp",
      alt: "A wound photograph and five augmented versions of it",
      caption: "One wound photograph and the augmentations trained on it.",
    },
    {
      src: "/images/projects/mediconnect/mediconnect-06.webp",
      alt: "Spectrograms of the highest and lowest confidence cough predictions",
      caption:
        "The most and least confident cough predictions, as spectrograms.",
    },
    {
      src: "/images/projects/mediconnect/mediconnect-07.webp",
      alt: "The team seated in the auditorium at Hack4Health, IIIT Delhi",
      caption: "At Hack4Health, IIIT Delhi.",
    },
    {
      src: "/images/projects/mediconnect/mediconnect-08.webp",
      alt: "Talking through the build with a judge at the hackathon",
      caption: "Talking the build through with a judge.",
    },
  ],

  vahaanbandhu: [
    {
      src: "/images/projects/vahaanbandhu/vahaanbandhu-01.webp",
      alt: "VahaanBandhu entry screen offering farmer, driver and team paths, in Hindi",
      caption:
        "Three ways in — farmer, driver, team. The whole interface is in Hindi.",
    },
    {
      src: "/images/projects/vahaanbandhu/vahaanbandhu-02.webp",
      alt: "VahaanBandhu landing page, in Hindi",
      caption: "The landing page.",
    },
    {
      src: "/images/projects/vahaanbandhu/vahaanbandhu-03.webp",
      alt: "A planned truck route on a map, broken into legs with distance and fuel totals",
      caption:
        "A planned route, broken into legs, with distance and fuel totalled underneath.",
    },
    {
      src: "/images/projects/vahaanbandhu/vahaanbandhu-04.webp",
      alt: "Three plots comparing the classical route, the candidate corridor and the final hybrid route",
      caption:
        "How the route is chosen: the classical incumbent, the candidate corridor, then the hybrid that won.",
    },
    {
      src: "/images/projects/vahaanbandhu/vahaanbandhu-05.webp",
      alt: "The team working at laptops during the hackathon",
      caption: "Building it, during the hackathon.",
    },
    {
      src: "/images/projects/vahaanbandhu/vahaanbandhu-06.webp",
      alt: "Presenting the route navigator on a projector to the judges",
      caption: "Presenting the route navigator to the judges.",
    },
  ],
};

/** The gallery for a project, or an empty list if it has none yet. */
export function getGallery(slug: string): GalleryImage[] {
  return projectGalleries[slug] ?? [];
}
