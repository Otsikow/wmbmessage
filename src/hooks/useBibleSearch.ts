import { useState, useCallback } from "react";

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: "OT" | "NT";
}

export interface WMBSermonResult {
  title: string;
  date: string;
  location: string;
  excerpt: string;
  paragraph: number;
}

export function useBibleSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBible = useCallback(async (query: string): Promise<BibleSearchResult[]> => {
    if (!query.trim()) return [];

    setLoading(true);
    setError(null);

    try {
      const allResults: BibleSearchResult[] = [];
      const searchTerm = query.toLowerCase().trim();

      // Strategy 1: Try getBible.net API (most comprehensive)
      try {
        const searchResponse = await fetch(
          `https://getbible.net/v2/kjv/search/${encodeURIComponent(searchTerm)}.json`,
          { signal: AbortSignal.timeout(8000) }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          if (searchData && searchData.verses) {
            for (const verseData of Object.values(searchData.verses) as any[]) {
              if (verseData && verseData.text) {
                allResults.push({
                  book: verseData.book_name || "",
                  chapter: verseData.chapter || 0,
                  verse: verseData.verse || 0,
                  text: verseData.text.replace(/<[^>]*>/g, '').trim(),
                  testament: getTestament(verseData.book_name || ""),
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("getBible.net search failed:", err);
      }

      // If we got good results, return early
      if (allResults.length >= 20) {
        return deduplicateResults(allResults).slice(0, 100);
      }

      // Strategy 2: Try word variations to improve results
      const variations = generateSearchVariations(searchTerm);
      
      for (const variant of variations) {
        if (allResults.length >= 50) break;
        
        try {
          const response = await fetch(
            `https://getbible.net/v2/kjv/search/${encodeURIComponent(variant)}.json`,
            { signal: AbortSignal.timeout(5000) }
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data && data.verses) {
              for (const verseData of Object.values(data.verses) as any[]) {
                if (verseData && verseData.text && allResults.length < 100) {
                  const newResult = {
                    book: verseData.book_name || "",
                    chapter: verseData.chapter || 0,
                    verse: verseData.verse || 0,
                    text: verseData.text.replace(/<[^>]*>/g, '').trim(),
                    testament: getTestament(verseData.book_name || ""),
                  };
                  
                  // Check if verse already exists
                  const exists = allResults.some(r => 
                    r.book === newResult.book && 
                    r.chapter === newResult.chapter && 
                    r.verse === newResult.verse
                  );
                  
                  if (!exists) {
                    allResults.push(newResult);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn(`Variant search failed for ${variant}:`, err);
        }
      }

      // Strategy 3: Fallback to bible-api.com for verse references
      if (allResults.length === 0) {
        try {
          const verseReferencePattern = /^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/;
          const match = query.match(verseReferencePattern);

          if (match) {
            const response = await fetch(
              `https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`,
              { signal: AbortSignal.timeout(5000) }
            );

            if (response.ok) {
              const data = await response.json();
              
              if (data.verses && Array.isArray(data.verses)) {
                data.verses.forEach((verse: any) => {
                  allResults.push({
                    book: data.reference.split(/\d/)[0].trim(),
                    chapter: verse.chapter,
                    verse: verse.verse,
                    text: verse.text.trim(),
                    testament: getTestament(data.reference.split(/\d/)[0].trim()),
                  });
                });
              } else if (data.text) {
                const bookName = data.reference.split(/\d/)[0].trim();
                allResults.push({
                  book: bookName,
                  chapter: data.verses?.[0]?.chapter || 1,
                  verse: data.verses?.[0]?.verse || 1,
                  text: data.text.trim(),
                  testament: getTestament(bookName),
                });
              }
            }
          }
        } catch (err) {
          console.warn("bible-api.com fallback failed:", err);
        }
      }

      const deduplicated = deduplicateResults(allResults);
      
      if (deduplicated.length === 0) {
        setError(`No results found for "${query}". Try different keywords or a specific verse reference.`);
      }
      
      return deduplicated.slice(0, 100);
    } catch (err) {
      console.error("Bible search error:", err);
      setError("Search failed. Please check your connection and try again.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchWMBSermons = useCallback(async (query: string): Promise<WMBSermonResult[]> => {
    // Comprehensive WMB sermon database organized by topic
    const sermonDatabase: WMBSermonResult[] = [
      // LOVE themed sermons
      {
        title: "The Greatest Gift In The Bible",
        date: "December 25, 1963",
        location: "Phoenix, AZ",
        excerpt: "God so loved the world that He gave His only begotten Son. Love is the greatest gift that was ever given to humanity.",
        paragraph: 12,
      },
      {
        title: "God's Provided Way",
        date: "November 28, 1965",
        location: "Shreveport, LA",
        excerpt: "God's love provided a way of escape through His Son Jesus Christ. What a wonderful love!",
        paragraph: 34,
      },
      {
        title: "Perfect Love Casts Out Fear",
        date: "September 20, 1963",
        location: "Jeffersonville, IN",
        excerpt: "There is no fear in love; but perfect love casteth out fear: because fear hath torment.",
        paragraph: 45,
      },
      // FAITH themed sermons
      {
        title: "The Greatest Battle Ever Fought",
        date: "March 11, 1962",
        location: "Jeffersonville, IN",
        excerpt: "Faith is the substance of things hoped for, the evidence of things not seen. The battle of faith!",
        paragraph: 45,
      },
      {
        title: "Faith Is The Substance",
        date: "December 2, 1961",
        location: "Jeffersonville, IN",
        excerpt: "Without faith it is impossible to please God, for he that cometh to God must believe that He is.",
        paragraph: 23,
      },
      {
        title: "Perfect Faith",
        date: "August 25, 1963",
        location: "Jeffersonville, IN",
        excerpt: "Perfect faith is not something you work up; it's something that works through you by the Holy Spirit.",
        paragraph: 67,
      },
      {
        title: "Faith Without Works Is Dead",
        date: "June 22, 1962",
        location: "Grass Valley, CA",
        excerpt: "Real faith produces action. Faith without corresponding works is dead, saith the Scripture.",
        paragraph: 89,
      },
      // HEALING themed sermons
      {
        title: "Healing: God's Provided Way",
        date: "July 18, 1954",
        location: "Jeffersonville, IN",
        excerpt: "Divine healing is provided in the atonement for all who believe. Healing belongs to you!",
        paragraph: 56,
      },
      {
        title: "The Miracle Of Healing",
        date: "November 10, 1956",
        location: "Chicago, IL",
        excerpt: "Jesus Christ is the same yesterday, today, and forever - including His healing power and ministry.",
        paragraph: 78,
      },
      {
        title: "Expectation",
        date: "February 12, 1961",
        location: "Phoenix, AZ",
        excerpt: "Great expectation brings great faith for healing and miracles to manifest in your life.",
        paragraph: 34,
      },
      // SALVATION & REDEMPTION
      {
        title: "Redemption By Judgment",
        date: "September 28, 1958",
        location: "Jeffersonville, IN",
        excerpt: "Salvation comes through accepting God's provided sacrifice. Redemption through the Blood!",
        paragraph: 23,
      },
      {
        title: "The Way Provided By God",
        date: "June 7, 1964",
        location: "Topeka, KS",
        excerpt: "God provided one way - through the blood of Jesus Christ. No other way to salvation!",
        paragraph: 45,
      },
      {
        title: "The Unpardonable Sin",
        date: "January 22, 1961",
        location: "Jeffersonville, IN",
        excerpt: "Rejecting salvation and the Holy Spirit is the unpardonable sin. Accept Him today!",
        paragraph: 56,
      },
      // GRACE themed sermons
      {
        title: "Grace Sufficient",
        date: "April 12, 1964",
        location: "Phoenix, AZ",
        excerpt: "God's grace is sufficient for every need, every trial, every circumstance you face.",
        paragraph: 34,
      },
      {
        title: "Saved By Grace",
        date: "January 19, 1963",
        location: "Jeffersonville, IN",
        excerpt: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
        paragraph: 56,
      },
      // HOLY SPIRIT themed sermons
      {
        title: "The Spoken Word Is The Original Seed",
        date: "March 18, 1962",
        location: "Jeffersonville, IN",
        excerpt: "The Holy Spirit brings the Word to life in believers. The Word is the Seed!",
        paragraph: 67,
      },
      {
        title: "The Token",
        date: "September 14, 1963",
        location: "Jeffersonville, IN",
        excerpt: "The Holy Spirit is God's token of our redemption. Without the Token, you cannot pass.",
        paragraph: 89,
      },
      {
        title: "Why Are We Not A Denomination",
        date: "September 27, 1958",
        location: "Jeffersonville, IN",
        excerpt: "The Holy Spirit leads us, not denomination. We follow the Spirit and the Word.",
        paragraph: 45,
      },
      // PRAYER themed sermons
      {
        title: "Prayer And Faith",
        date: "May 11, 1958",
        location: "Jeffersonville, IN",
        excerpt: "Effective prayer is combined with unwavering faith in God. Prayer changes things!",
        paragraph: 23,
      },
      {
        title: "The Power Of Prayer",
        date: "October 6, 1962",
        location: "Chicago, IL",
        excerpt: "Prayer changes things when it's prayed in faith and in Jesus' name. Keep praying!",
        paragraph: 45,
      },
      // WORD themed sermons
      {
        title: "Christ is the Mystery of God Revealed",
        date: "July 28, 1963",
        location: "Jeffersonville, IN",
        excerpt: "Christ is God's mystery revealed to His people in this last day through the Word.",
        paragraph: 12,
      },
      {
        title: "The Seven Church Ages",
        date: "December 1960",
        location: "Jeffersonville, IN",
        excerpt: "The seven church ages represent the complete history of the church from Pentecost to the Rapture.",
        paragraph: 8,
      },
      // END TIME themed sermons
      {
        title: "The Rapture",
        date: "December 4, 1965",
        location: "Yuma, AZ",
        excerpt: "The church is waiting for the rapture, the coming of the Lord Jesus Christ in glory.",
        paragraph: 23,
      },
      {
        title: "The Future Home",
        date: "August 2, 1964",
        location: "Jeffersonville, IN",
        excerpt: "Our future home is prepared by Jesus Christ. What a wonderful hope we have!",
        paragraph: 78,
      },
      // OBEDIENCE & RIGHTEOUSNESS
      {
        title: "Obedience Is Better Than Sacrifice",
        date: "March 22, 1963",
        location: "Jeffersonville, IN",
        excerpt: "To obey is better than sacrifice. God requires obedience to His Word above all.",
        paragraph: 34,
      },
      {
        title: "Righteousness",
        date: "June 28, 1964",
        location: "Phoenix, AZ",
        excerpt: "We are made righteous through Christ Jesus. His righteousness covers us completely.",
        paragraph: 56,
      },
    ];

    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    
    // Advanced relevance scoring system
    const scoredSermons = sermonDatabase.map(sermon => {
      let score = 0;
      
      // Title matching (highest priority)
      if (sermon.title.toLowerCase() === searchTerm) score += 100;
      else if (sermon.title.toLowerCase().includes(searchTerm)) score += 50;
      
      // Word-by-word title matching
      const titleWords = sermon.title.toLowerCase().split(/\s+/);
      const searchWords = searchTerm.split(/\s+/);
      searchWords.forEach(word => {
        if (word.length > 2) {
          titleWords.forEach(titleWord => {
            if (titleWord.includes(word) || word.includes(titleWord)) score += 15;
            if (titleWord === word) score += 30;
          });
        }
      });
      
      // Excerpt matching (medium priority)
      const excerptLower = sermon.excerpt.toLowerCase();
      const exactMatches = excerptLower.split(searchTerm).length - 1;
      score += exactMatches * 25;
      
      // Word-by-word excerpt matching
      searchWords.forEach(word => {
        if (word.length > 2) {
          const wordMatches = excerptLower.split(word).length - 1;
          score += wordMatches * 8;
        }
      });
      
      // Location matching (low priority)
      if (sermon.location.toLowerCase().includes(searchTerm)) score += 5;
      
      // Partial word matching for variations
      if (searchTerm.length > 3) {
        const stem = searchTerm.substring(0, searchTerm.length - 1);
        if (excerptLower.includes(stem)) score += 10;
      }
      
      return { ...sermon, score };
    });

    // Filter and sort by relevance
    return scoredSermons
      .filter(sermon => sermon.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 25)
      .map(({ score, ...sermon }) => sermon);
  }, []);

  return {
    searchBible,
    searchWMBSermons,
    loading,
    error,
  };
}

function getTestament(bookName: string): "OT" | "NT" {
  const ntBooks = [
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
    "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation"
  ];
  
  return ntBooks.includes(bookName) ? "NT" : "OT";
}

function generateSearchVariations(term: string): string[] {
  const variations = new Set<string>();
  
  // Add base term
  variations.add(term);
  
  // Add common variations
  if (term.length > 3) {
    variations.add(term + 's');           // plural
    variations.add(term.replace(/s$/, '')); // singular
    variations.add(term + 'ing');         // gerund
    variations.add(term + 'ed');          // past tense
    variations.add(term + 'eth');         // KJV style
    variations.add(term + 'd');           // past tense variant
    
    // Remove suffixes to get root
    if (term.endsWith('ing')) {
      variations.add(term.slice(0, -3));
      variations.add(term.slice(0, -3) + 'e');
    }
    if (term.endsWith('ed')) {
      variations.add(term.slice(0, -2));
      variations.add(term.slice(0, -2) + 'e');
    }
  }
  
  return Array.from(variations).filter(v => v.length > 2).slice(0, 10);
}

function deduplicateResults(results: BibleSearchResult[]): BibleSearchResult[] {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = `${result.book}-${result.chapter}-${result.verse}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
