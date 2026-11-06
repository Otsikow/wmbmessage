import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function HomeStudyLibrary() {
  const { data: notes, isPending, isError, refetch } = useQuery({
    queryKey: ["home-editorial-published-notes"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("message_study_notes")
        .select("id,slug,title,topic,excerpt,updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false }).order("id", { ascending: true }).limit(3);
      if (error) throw error;
      return data;
    },
  });
  return (
    <section className="home-section" aria-labelledby="home-library-heading">
      <div className="home-section-heading">
        <h2 id="home-library-heading">From the Study Library</h2>
        <Link className="home-text-link" to="/study-notes">All Study Notes <ArrowRight aria-hidden="true" /></Link>
      </div>
      {isPending ? <p className="home-state" role="status">Loading study notes…</p>
        : isError ? <div className="home-state" role="status">Study notes are temporarily unavailable. <Button variant="link" onClick={() => refetch()}>Try again</Button></div>
        : !notes?.length ? <p className="home-state">No published study notes yet.</p>
        : <div className="home-note-list">{notes.map((note) => (
          <article className="home-note-row" key={note.id}>
            <div className="home-note-meta"><span>{note.topic}</span><time dateTime={note.updated_at}>{new Date(note.updated_at).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</time></div>
            <div className="home-note-copy">
              <h3><Link to={`/study-notes/${note.slug || note.id}`}>{note.title}</Link></h3>
              {note.excerpt && <p>{note.excerpt}</p>}
            </div>
            <Link className="home-note-arrow" to={`/study-notes/${note.slug || note.id}`} aria-label={`Read ${note.title}`}><ArrowRight aria-hidden="true" /></Link>
          </article>
        ))}</div>}
    </section>
  );
}