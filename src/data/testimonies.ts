import { Testimony, TestimonyCommentTemplate } from "@/types/testimonies";

export const testimonies: Testimony[] = [
  {
    id: "t-1",
    name: "Grace M.",
    category: "healing",
    status: "approved",
    happenedAt: "March 2024",
    excerpt:
      "After months of pain, the Lord restored my strength. I can lift my children again and sleep peacefully.",
    hasAudio: true,
    transcriptPreview:
      "I went into the service with severe pain in my back. When prayer was made, I felt warmth and the pain released...",
    engagements: {
      encouraged: 124,
      prayed: 89,
      comments: 32,
    },
  },
  {
    id: "t-2",
    name: "Anonymous",
    category: "financial_breakthrough",
    status: "approved",
    happenedAt: "January 2024",
    excerpt:
      "We were behind on rent, but God opened a door. A new job offer came within the week and covered our needs.",
    hasAudio: false,
    engagements: {
      encouraged: 76,
      prayed: 54,
      comments: 18,
    },
  },
  {
    id: "t-3",
    name: "Caleb N.",
    category: "family_marriage",
    status: "approved",
    happenedAt: "November 2023",
    excerpt:
      "Our marriage was strained, yet through prayer and counseling we found unity again. God healed our home.",
    hasAudio: true,
    transcriptPreview:
      "We had reached a breaking point, but the Lord softened our hearts. We started praying together daily...",
    commentsLocked: true,
    engagements: {
      encouraged: 112,
      prayed: 97,
      comments: 0,
    },
  },
];

export const commentTemplates: TestimonyCommentTemplate[] = [
  { id: "c-1", label: "Thank God", value: "Thank God" },
  { id: "c-2", label: "Standing with you in faith", value: "Standing with you in faith" },
  { id: "c-3", label: "Glory to God", value: "Glory to God" },
];
