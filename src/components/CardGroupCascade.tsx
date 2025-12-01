import React from "react";
import {
  BookOpen,
  DownloadCloud,
  FileText,
  MessageCircle,
  Search,
  Target,
} from "lucide-react";
import "./CardGroupCascade.css";

const cards = [
  {
    title: "Bible Reading Plans",
    description: "Follow guided plans with streak tracking, notes, and synced bookmarks.",
    Icon: Target,
    tone: "blue" as const,
  },
  {
    title: "Bible Reading",
    description: "Read scripture with powerful search, notes, and cross-references.",
    Icon: BookOpen,
    tone: "blue" as const,
  },
  {
    title: "WMB Sermons",
    description: "Explore sermons with verse connections and deep insights.",
    Icon: MessageCircle,
    tone: "gold" as const,
  },
  {
    title: "Smart Search",
    description: "Find verses, topics, and sermon quotes instantly.",
    Icon: Search,
    tone: "gold" as const,
  },
  {
    title: "Notes",
    description: "Create and organize your personal Bible study notes.",
    Icon: FileText,
    tone: "blue" as const,
  },
  {
    title: "Downloads",
    description: "Access offline Bibles and sermon resources.",
    Icon: DownloadCloud,
    tone: "gold" as const,
  },
];

const toneColors = {
  blue: "#2244CC",
  gold: "#D4A215",
};

const CardGroupCascade = () => {
  return (
    <section className="cascade-section">
      <div className="cascade-gradient" />
      <div className="floating-orb orb-a" />
      <div className="floating-orb orb-b" />
      <div className="floating-orb orb-c" />

      <div className="cascade-inner">
        <header className="cascade-header">
          <p className="cascade-eyebrow">Guidance &amp; Study</p>
          <h2 className="cascade-title">Beautifully organized for your devotion</h2>
          <p className="cascade-subtitle">
            Six focused spaces crafted with premium clarity, calm gradients, and a gentle
            cascade entrance.
          </p>
        </header>

        <div className="cascade-grid">
          {cards.map(({ title, description, Icon, tone }, index) => (
            <article
              key={title}
              className="cascade-card"
              style={{
                animationDelay: `${index * 150}ms`,
                ["--tone-color" as const]: toneColors[tone],
              }}
            >
              <div className="card-ripple" />
              <div className="card-shimmer" />
              <div className="light-sweep" />
              <div className="icon-wrapper">
                <span className="icon-halo" />
                <span className="icon-glow" />
                <Icon size={48} strokeWidth={1.8} />
              </div>
              <div className="card-body">
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardGroupCascade;
