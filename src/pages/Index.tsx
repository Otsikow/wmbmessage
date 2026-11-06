import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HomeMasthead from "@/components/home/HomeMasthead";
import HomeStudyLibrary from "@/components/home/HomeStudyLibrary";
import DailyVerseCard from "@/components/DailyVerseCard";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyContent } from "@/hooks/useDailyContent";
import { useReadingPlans } from "@/contexts/ReadingPlanContext";
import "./HomeEditorial.css";

const studies = [
  { number: "01", title: "Read the Bible", copy: "Read the King James Bible, book by book and verse by verse.", action: "Open the Bible", path: "/reader" },
  { number: "02", title: "Explore the sermons", copy: "Explore the sermon library of William Marrion Branham.", action: "Browse sermons", path: "/wmb-sermons" },
  { number: "03", title: "Browse Study Notes", copy: "Study Scripture and the Message through notes arranged by topic.", action: "Visit the Study Library", path: "/study-notes" },
];
const directory = [
  ["Reading Plans", "/plans"], ["Song Book", "/songs"], ["Find a Church", "/message-churches"],
  ["Events", "/events"], ["Prayer Board", "/prayer-board"], ["Testimonies", "/testimonies"],
];
const resources = [
  ["About", "/about"], ["Help", "/help"], ["Privacy", "/privacy"], ["Terms", "/terms"],
  ["Search", "/search"], ["Cross References", "/cross-references"], ["Downloads", "/downloads"], ["Share MessageGuide", "/share"], ["More", "/more"],
];

export default function Index() {
  const { user } = useAuth();
  const { dailyContent, loading: dailyLoading } = useDailyContent();
  const { todayAssignment } = useReadingPlans();
  const [dailyOpen, setDailyOpen] = useState(false);
  const hasVerse = Boolean(dailyContent?.verse_text?.trim() && dailyContent.verse_book && dailyContent.verse_chapter && dailyContent.verse_verse);
  const verseText = hasVerse ? dailyContent?.verse_text : "Thy word is a lamp unto my feet, and a light unto my path.";
  const reference = hasVerse ? `${dailyContent?.verse_book} ${dailyContent?.verse_chapter}:${dailyContent?.verse_verse}` : "Psalm 119:105";
  // The fallback reader link is verified; database references remain plain citations.
  const scriptureLink = "/reader?book=Psalms&chapter=119&verse=105";

  return (
    <div className="home-editorial">
      <Helmet>
        <title>MessageGuide — Bible & Message Study</title>
        <meta name="description" content="Read the King James Bible, explore William Marrion Branham’s sermons, and browse the MessageGuide Study Library." />
        <meta property="og:title" content="MessageGuide — Bible & Message Study" />
        <meta property="og:description" content="Read the King James Bible, explore William Marrion Branham’s sermons, and browse the MessageGuide Study Library." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Newsreader:ital,opsz,wght@1,6..72,400&family=Source+Sans+3:wght@400;600&display=swap" />
      </Helmet>
      <a className="home-skip" href="#home-main">Skip to content</a>
      <HomeMasthead />
      <main id="home-main" tabIndex={-1}>
        <section className="home-container home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="home-eyebrow">BIBLE &amp; MESSAGE STUDY</p>
            <h1 id="home-title">Study the Bible.<br /><em>Explore the Message.</em></h1>
            <p className="home-intro">Read the King James Bible, explore William Marrion Branham’s sermons, and find study notes that bring Scripture and the Message together.</p>
            <div className="home-hero-actions">
              <Button asChild size="lg"><Link to="/reader">Read the Bible <ArrowRight aria-hidden="true" /></Link></Button>
              <Link to="/study-notes" className="home-text-link">Browse Study Notes</Link>
            </div>
          </div>
          <aside className="home-scripture" aria-label="Scripture reading">
            <div className="home-scripture-label"><span>SCRIPTURE</span><span>KING JAMES VERSION</span></div>
            <blockquote><p>“{verseText}”</p></blockquote>
            <div className="home-scripture-citation">{hasVerse ? <span>{reference}</span> : <Link to={scriptureLink}>{reference} <ArrowRight aria-hidden="true" /></Link>}</div>
          </aside>
        </section>
        <div className="home-rule" />
        <div className="home-container">
          <section className="home-section" aria-labelledby="home-start-heading">
            <h2 id="home-start-heading">Start your study</h2>
            <div className="home-study-columns">{studies.map((study) => (
              <article key={study.number} className="home-study-entry">
                <span className="home-entry-number" aria-hidden="true">{study.number}</span>
                <h3>{study.title}</h3><p>{study.copy}</p>
                <Link to={study.path} className="home-text-link">{study.action} <ArrowRight aria-hidden="true" /></Link>
              </article>
            ))}</div>
          </section>
          <HomeStudyLibrary />
          <section className="home-section home-directory" aria-labelledby="home-more-heading">
            <h2 id="home-more-heading">More from MessageGuide</h2>
            <nav aria-label="Community and reading resources">{directory.map(([label, path]) => <Link key={path} to={path}>{label}<ArrowRight aria-hidden="true" /></Link>)}</nav>
            <div className="home-context-links"><Link to="/message-churches/submit">Submit a church</Link><Link to="/daily">Daily quote &amp; calendar</Link><Link to="/calendar">Reading calendar</Link></div>
            <details className="home-daily-disclosure" onToggle={(event) => setDailyOpen(event.currentTarget.open)}>
              <summary>Daily Scripture &amp; Message inspiration</summary>
              {dailyOpen && (dailyContent ? <SectionErrorBoundary section="Daily inspiration"><DailyVerseCard /></SectionErrorBoundary> : <p className="home-state" role="status">{dailyLoading ? "Loading daily inspiration…" : "Daily inspiration is temporarily unavailable."}</p>)}
            </details>
          </section>
          {user && <section className="home-personal" aria-label="Your study">
            <h2>Your study</h2>
            <nav aria-label="Personal study resources">
              <Link to="/plans">Reading progress</Link><Link to="/notes">My Notes</Link><Link to="/library">My Library</Link><Link to="/collections">Collections</Link>
              {todayAssignment && <Link to={`/plans/${todayAssignment.plan.id}/day/${todayAssignment.day.dayNumber}`}>Continue today’s reading <ArrowRight aria-hidden="true" /></Link>}
            </nav>
          </section>}
        </div>
      </main>
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-top"><span className="home-footer-brand">MessageGuide</span><nav aria-label="Footer resources">{resources.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</nav></div>
          <div className="home-footer-bottom"><p>© {new Date().getFullYear()} MessageGuide</p><a href="mailto:support@messageguide.com">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}
