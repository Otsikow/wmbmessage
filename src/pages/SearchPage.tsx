import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock search results
  const results = [
    {
      book: "John",
      chapter: 3,
      verse: 16,
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    },
    {
      book: "Romans",
      chapter: 8,
      verse: 28,
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Search Scripture</h1>
            <p className="text-muted-foreground">
              Search the Bible and WMB sermons for verses, topics, and insights
            </p>
          </div>

          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for verses, topics, or keywords..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          <Tabs defaultValue="bible" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bible">Bible</TabsTrigger>
              <TabsTrigger value="wmb">WMB Sermons</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bible" className="space-y-4 mt-6">
              {results.map((result, index) => (
                <Card key={index} className="p-6 hover:shadow-elegant transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="min-w-[4rem]">
                      <div className="text-sm font-semibold text-primary">
                        {result.book} {result.chapter}:{result.verse}
                      </div>
                    </div>
                    <p className="text-base leading-relaxed">{result.text}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="wmb" className="space-y-4 mt-6">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  WMB sermon search will be available after backend integration
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-6">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Combined search results will appear here
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
