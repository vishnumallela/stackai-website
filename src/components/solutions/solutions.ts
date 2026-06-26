import { AgenticVisual } from "./AgenticVisual";
import { VisionVisual } from "./VisionVisual";
import { DataVisual } from "./DataVisual";
import { VoiceVisual } from "./VoiceVisual";
import { AnalyticsVisual } from "./AnalyticsVisual";
import { GenerativeVisual } from "./GenerativeVisual";
import { LanguageVisual } from "./LanguageVisual";
import { PredictiveVisual } from "./PredictiveVisual";
import { DocumentVisual } from "./DocumentVisual";
import { MLOpsVisual } from "./MLOpsVisual";
import type { SolutionVisual } from "./types";

export type Solution = {
  id: string;
  /** Small category label on the card, e.g. "Agentic AI". */
  name: string;
  /** Human, benefit-led card title. */
  headline: string;
  /** One concise supporting sentence. */
  blurb: string;
  /** Per-solution accent (hex). */
  accent: string;
  /** The bespoke animated visual rendered when there's no video yet. */
  Visual: SolutionVisual;
  /**
   * Drop your demo here later, e.g. video: "/solutions/agentic-ai.mp4".
   * When set, the card plays the video instead of the placeholder animation.
   */
  video?: string;
};

export const SOLUTIONS: Solution[] = [
  {
    id: "agentic",
    name: "Agentic AI",
    headline: "Autonomous execution at scale",
    blurb: "Agents that orchestrate your tools and systems to automate complex work end to end, governed for compliance with full auditability and human oversight.",
    accent: "#8B5CF6",
    Visual: AgenticVisual,
    // video: "/solutions/agentic-ai.mp4",
  },
  {
    id: "vision",
    name: "Computer Vision",
    headline: "Perception that scales operations",
    blurb: "Detection, OCR, and inspection that turn images and video into trusted, structured data, deployed securely across your operations.",
    accent: "#22D3EE",
    Visual: VisionVisual,
    // video: "/solutions/computer-vision.mp4",
  },
  {
    id: "data",
    name: "Data Platforms",
    headline: "The enterprise data foundation",
    blurb: "Governed, secure pipelines that deliver clean, real-time data to every model and team, with lineage and access controls built in.",
    accent: "#10B981",
    Visual: DataVisual,
    // video: "/solutions/data-platforms.mp4",
  },
  {
    id: "voice",
    name: "Voice AI",
    headline: "Voice that scales the front line",
    blurb: "Real-time conversational agents that resolve requests and qualify demand across channels, lowering cost to serve while meeting your compliance bar.",
    accent: "#F59E0B",
    Visual: VoiceVisual,
    // video: "/solutions/voice-ai.mp4",
  },
  {
    id: "analytics",
    name: "Analytics",
    headline: "Decision intelligence for leaders",
    blurb: "Live dashboards and forecasts that explain what changed and why, turning governed data into decisions leaders can trust.",
    accent: "#2563EB",
    Visual: AnalyticsVisual,
    // video: "/solutions/analytics.mp4",
  },
  {
    id: "genai",
    name: "Generative AI",
    headline: "Copilots and content at scale",
    blurb: "LLM-powered copilots and content generation, grounded in your data and guarded by enterprise controls.",
    accent: "#D946EF",
    Visual: GenerativeVisual,
    // video: "/solutions/generative-ai.mp4",
  },
  {
    id: "language",
    name: "Language AI",
    headline: "Answers from your knowledge",
    blurb: "Retrieval-augmented systems that turn documents and knowledge bases into accurate, sourced answers.",
    accent: "#14B8A6",
    Visual: LanguageVisual,
    // video: "/solutions/language-ai.mp4",
  },
  {
    id: "predictive",
    name: "Predictive ML",
    headline: "Forecasting that protects margin",
    blurb: "Machine learning for demand, risk, and propensity, deployed and monitored against real business KPIs.",
    accent: "#F43F5E",
    Visual: PredictiveVisual,
    // video: "/solutions/predictive-ml.mp4",
  },
  {
    id: "document",
    name: "Document AI",
    headline: "From documents to decisions",
    blurb: "Intelligent document processing that extracts, validates, and routes data from any document, at volume.",
    accent: "#6366F1",
    Visual: DocumentVisual,
    // video: "/solutions/document-ai.mp4",
  },
  {
    id: "mlops",
    name: "MLOps",
    headline: "Models, monitored in production",
    blurb: "Deploy, observe, and govern models with versioning, drift detection, and full audit trails.",
    accent: "#0EA5E9",
    Visual: MLOpsVisual,
    // video: "/solutions/mlops.mp4",
  },
];
