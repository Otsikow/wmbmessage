import React from "react";
import { Link } from "react-router-dom";
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
    path: "/plans",
  },
  {
    title: "Bible Reading",
    description: "Read scripture with powerful search, notes, and cross-references.",
    Icon: BookOpen,
    tone: "blue" as const,
    path: "/reader",
  },
  {
    title: "WMB Sermons",
    description: "Explore sermons with verse connections and deep insights.",
    Icon: MessageCircle,
    tone: "gold" as const,
    path: "/wmb-sermons",
  },
  {
    title: "Smart Search",
    description: "Find verses, topics, and sermon quotes instantly.",
    Icon: Search,
    tone: "gold" as const,
    path: "/search",
  },
  {
    title: "Notes",
    description: "Create and organize your personal Bible study notes.",
    Icon: FileText,
    tone: "blue" as const,
    path: "/notes",
  },
  {
    title: "Downloads",
    description: "Access offline Bibles and sermon resources.",
    Icon: DownloadCloud,
    tone: "gold" as const,
    path: "/downloads",
  },
];

const toneColors = {
  blue: "#1E40AF",
  gold: "#DAA520",
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
          <p className="cascade-eyebrow">Guidance & Study</p>
          <h2 className="cascade-title">Beautifully organized for your devotion</h2>
          <p className="cascade-subtitle">
            Six focused spaces crafted with premium clarity, calm gradients, and a gentle
            cascade entrance.
          </p>
        </header>

        <div className="cascade-grid">
          {cards.map(({ title, description, Icon, tone, path }, index) => (
            <Link key={title} to={path} className="cascade-card-link">
              <article
                className="cascade-card"
                style={{
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <div className="card-ripple" />
                <div className="card-shimmer" />
                <div className="icon-wrapper" style={{ color: toneColors[tone] }}>
                  <Icon size={44} strokeWidth={1.8} />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{title}</h3>
                  <p className="card-description">{description}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardGroupCascade;
