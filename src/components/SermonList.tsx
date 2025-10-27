import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, MapPin, BookOpen, Filter } from "lucide-react";
import { Sermon } from "@/hooks/useSermons";
import { Skeleton } from "@/components/ui/skeleton";

interface SermonListProps {
  sermons: Sermon[];
  loading: boolean;
  onSermonSelect: (sermon: Sermon) => void;
}

export default function SermonList({
  sermons,
  loading,
  onSermonSelect,
}: SermonListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Extract unique years from sermons
  const years = useMemo(() => {
    const yearSet = new Set(
      sermons.map((s) => new Date(s.date).getFullYear().toString())
    );
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }, [sermons]);

  // Filter sermons based on search and year
  const filteredSermons = useMemo(() => {
    return sermons.filter((sermon) => {
      const matchesSearch =
        searchQuery === "" ||
        sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.location.toLowerCase().includes(searchQuery.toLowerCase());

      const sermonYear = new Date(sermon.date).getFullYear().toString();
      const matchesYear = selectedYear === "all" || sermonYear === selectedYear;

      return matchesSearch && matchesYear;
    });
  }, [sermons, searchQuery, selectedYear]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sermons by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSermons.length} sermon{filteredSermons.length !== 1 ? "s" : ""}{" "}
          found
        </p>
        {(searchQuery || selectedYear !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedYear("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Sermon List */}
      <div className="space-y-3">
        {filteredSermons.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No sermons found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          filteredSermons.map((sermon) => (
            <Card
              key={sermon.id}
              className="p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onSermonSelect(sermon)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors">
                    {sermon.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    {new Date(sermon.date).getFullYear()}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(sermon.date)}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{sermon.location}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSermonSelect(sermon);
                  }}
                >
                  Read Sermon
                  <BookOpen className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
