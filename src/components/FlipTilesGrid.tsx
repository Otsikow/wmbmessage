import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  DownloadCloud,
  FileText,
  MessageSquare,
  Search,
  Target,
} from "lucide-react";
import "./FlipTilesGrid.css";

interface CardData {
  title: string;
  description: string;
  Icon: React.ElementType;
  tone: "blue" | "gold";
  link: string;
}

const cards: CardData[] = [
  {
    title: "Bible Reading Plans",
    description: "Follow guided plans with streak tracking, notes, and synced bookmarks.",
    Icon: Target,
    tone: "blue",
    link: "/plans",
  },
  {
    title: "Bible Reading",
    description: "Read scripture with powerful search, notes, and cross-references.",
    Icon: BookOpen,
    tone: "blue",
    link: "/reader",
  },
  {
    title: "WMB Sermons",
    description: "Explore sermons with verse connections and deep insights.",
    Icon: MessageSquare,
    tone: "gold",
    link: "/wmb-sermons",
  },
  {
    title: "Smart Search",
    description: "Find verses, topics, and sermon quotes instantly.",
    Icon: Search,
    tone: "gold",
    link: "/search",
  },
  {
    title: "Notes",
    description: "Create and organize your personal Bible study notes.",
    Icon: FileText,
    tone: "blue",
    link: "/notes",
  },
  {
    title: "Downloads",
    description: "Access offline Bibles and sermon resources.",
    Icon: DownloadCloud,
    tone: "gold",
    link: "/downloads",
  },
];

const toneColors = {
  blue: "#2244CC",
  gold: "#D4A215",
};

interface FlipTilesGridProps {
  autoPlay?: boolean;
  triggerOnScroll?: boolean;
}

const FlipTilesGrid = ({ autoPlay = true, triggerOnScroll = false }: FlipTilesGridProps) => {
  const [hasFlipped, setHasFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-play on mount
    if (autoPlay && !triggerOnScroll) {
      const timer = setTimeout(() => {
        setHasFlipped(true);
      }, 100);
      return () => clearTimeout(timer);
    }

    // Trigger on scroll into view
    if (triggerOnScroll && sectionRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasFlipped) {
              setIsVisible(true);
              setHasFlipped(true);
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(sectionRef.current);

      return () => {
        if (sectionRef.current) {
          observer.unobserve(sectionRef.current);
        }
      };
    }
  }, [autoPlay, triggerOnScroll, hasFlipped]);

  return (
    <section ref={sectionRef} className="flip-tiles-section">
      <div className="flip-tiles-container">
        <div className="flip-tiles-grid">
          {cards.map((card, index) => (
            <Link
              key={card.title}
              to={card.link}
              className="flip-tile-link"
              style={
                {
                  "--flip-delay": `${index * 0.15}s`,
                  "--tone-color": toneColors[card.tone],
                } as React.CSSProperties
              }
            >
              <div className={`flip-tile ${hasFlipped ? "flipped" : ""}`}>
                {/* Front Face */}
                <div className="flip-tile-face flip-tile-front">
                  <div className="tile-glow-pulse" />
                  <div className="tile-content">
                    <div className="icon-container">
                      <div className="icon-glow" />
                      <card.Icon size={44} strokeWidth={1.8} />
                    </div>
                    <div className="tile-text">
                      <h3 className="tile-title">{card.title}</h3>
                      <p className="tile-description">{card.description}</p>
                    </div>
                  </div>
                </div>

                {/* Back Face */}
                <div className="flip-tile-face flip-tile-back">
                  <div className="tile-content">
                    <div className="icon-container">
                      <div className="icon-glow" />
                      <card.Icon size={44} strokeWidth={1.8} />
                    </div>
                    <div className="tile-text">
                      <h3 className="tile-title">{card.title}</h3>
                      <p className="tile-description">{card.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlipTilesGrid;
