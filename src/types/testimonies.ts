export type TestimonyStatus = "pending" | "approved" | "rejected" | "archived";

export type TestimonyCategory =
  | "healing"
  | "financial_breakthrough"
  | "family_marriage"
  | "salvation_growth"
  | "deliverance"
  | "career_education"
  | "other";

export type TestimonyIdentity = "full_name" | "first_name" | "anonymous";

export type TestimonyEngagement = "encouraged" | "prayed";

export interface Testimony {
  id: string;
  name: string;
  category: TestimonyCategory;
  status: TestimonyStatus;
  happenedAt: string;
  excerpt: string;
  hasAudio: boolean;
  transcriptPreview?: string;
  commentsLocked?: boolean;
  engagements: {
    encouraged: number;
    prayed: number;
    comments: number;
  };
}

export interface TestimonyCommentTemplate {
  id: string;
  label: string;
  value: string;
}

export const testimonyCategoryLabels: Record<TestimonyCategory, string> = {
  healing: "Healing",
  financial_breakthrough: "Financial breakthrough",
  family_marriage: "Family / Marriage",
  salvation_growth: "Salvation / Spiritual growth",
  deliverance: "Deliverance",
  career_education: "Career / Education",
  other: "Other",
};
