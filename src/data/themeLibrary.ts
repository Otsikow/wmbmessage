export interface ThemeScriptureReference {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  summary: string;
}

export interface ThemeSermonReference {
  title: string;
  date: string;
  location: string;
  paragraph?: number;
  summary: string;
}

export interface ThemeLibraryEntry {
  id: string;
  theme: string;
  description: string;
  keywords: string[];
  scriptureHighlights: ThemeScriptureReference[];
  sermonHighlights: ThemeSermonReference[];
}

export const themeLibrary: ThemeLibraryEntry[] = [
  {
    id: "love-of-god",
    theme: "Love of God",
    description:
      "The unchanging love of God expressed through Christ's sacrifice and the believer's response of love toward others.",
    keywords: [
      "love",
      "charity",
      "agape",
      "sacrifice",
      "compassion",
      "forgiveness",
    ],
    scriptureHighlights: [
      {
        book: "John",
        chapter: 3,
        verseStart: 16,
        summary:
          "God's love demonstrated by giving His only begotten Son for the salvation of the world.",
      },
      {
        book: "1 Corinthians",
        chapter: 13,
        verseStart: 4,
        verseEnd: 8,
        summary:
          "Paul's description of love's character—patient, kind, enduring—and its supremacy over other gifts.",
      },
      {
        book: "1 John",
        chapter: 4,
        verseStart: 7,
        verseEnd: 11,
        summary:
          "Believers are called to love one another because love originates from God and reveals His nature.",
      },
    ],
    sermonHighlights: [
      {
        title: "The Message of Grace",
        date: "1961-08-06",
        location: "Jeffersonville, IN",
        summary:
          "Brother Branham teaches that grace flowed from God's love, inviting believers to reflect that same love toward others.",
      },
      {
        title: "Questions and Answers",
        date: "1961-10-15",
        location: "Jeffersonville, IN",
        paragraph: 3,
        summary:
          "Practical answers emphasize love as the token—guiding family life, fellowship, and daily conduct.",
      },
    ],
  },
  {
    id: "saving-faith",
    theme: "Saving Faith",
    description:
      "Faith that anchors believers in God's promises, producing obedience, courage, and perseverance.",
    keywords: ["faith", "belief", "trust", "confidence", "obedience"],
    scriptureHighlights: [
      {
        book: "Hebrews",
        chapter: 11,
        verseStart: 1,
        summary:
          "Faith defined as the substance of things hoped for and the evidence of things not seen.",
      },
      {
        book: "Romans",
        chapter: 10,
        verseStart: 17,
        summary:
          "Faith comes by hearing, and hearing by the Word of God, underscoring the role of Scripture in building faith.",
      },
      {
        book: "Mark",
        chapter: 11,
        verseStart: 22,
        verseEnd: 24,
        summary:
          "Jesus calls His followers to have faith in God, promising that believing prayer will move mountains.",
      },
    ],
    sermonHighlights: [
      {
        title: "The Spoken Word Is The Original Seed",
        date: "1962-03-18",
        location: "Jeffersonville, IN",
        summary:
          "The spoken Word becomes effective when mixed with faith in the hearer's heart, producing God's promises.",
      },
      {
        title: "Christ Is The Mystery Of God Revealed",
        date: "1963-07-28",
        location: "Jeffersonville, IN",
        summary:
          "Reveals that the mystery of Christ dwelling in believers is accessed by faith accepting the revealed Word.",
      },
    ],
  },
  {
    id: "amazing-grace",
    theme: "Amazing Grace",
    description:
      "The unmerited favor of God that rescues, sustains, and empowers believers through Christ's finished work.",
    keywords: ["grace", "mercy", "redemption", "salvation", "forgiveness"],
    scriptureHighlights: [
      {
        book: "Ephesians",
        chapter: 2,
        verseStart: 8,
        verseEnd: 9,
        summary:
          "Salvation comes by grace through faith—not by works—so that no one can boast.",
      },
      {
        book: "Titus",
        chapter: 2,
        verseStart: 11,
        verseEnd: 12,
        summary:
          "The grace of God that brings salvation teaches believers to live soberly, righteously, and godly.",
      },
      {
        book: "Romans",
        chapter: 5,
        verseStart: 20,
        verseEnd: 21,
        summary:
          "Where sin abounded, grace abounded much more, reigning through righteousness unto eternal life.",
      },
    ],
    sermonHighlights: [
      {
        title: "The Message of Grace",
        date: "1961-08-06",
        location: "Jeffersonville, IN",
        summary:
          "Explains grace as God's initiative—He loved us first, saves us, and keeps us by His power.",
      },
      {
        title: "The Rapture",
        date: "1965-12-04",
        location: "Yuma, AZ",
        summary:
          "Highlights that grace prepares and keeps the Bride ready for the catching away.",
      },
    ],
  },
  {
    id: "divine-healing",
    theme: "Divine Healing",
    description:
      "Christ's atonement provides healing for the body, received by faith and confirmed by the Holy Spirit's presence.",
    keywords: ["healing", "deliverance", "restoration", "miracle", "atonement"],
    scriptureHighlights: [
      {
        book: "Isaiah",
        chapter: 53,
        verseStart: 5,
        summary:
          "By His stripes we are healed—the prophecy pointing to Christ's redemptive suffering.",
      },
      {
        book: "James",
        chapter: 5,
        verseStart: 14,
        verseEnd: 15,
        summary:
          "The elders pray over the sick with anointing oil, and the prayer of faith saves the sick.",
      },
      {
        book: "Matthew",
        chapter: 8,
        verseStart: 16,
        verseEnd: 17,
        summary:
          "Jesus heals all who are sick, fulfilling Isaiah's prophecy that He took our infirmities.",
      },
    ],
    sermonHighlights: [
      {
        title: "The Spoken Word Is The Original Seed",
        date: "1962-03-18",
        location: "Jeffersonville, IN",
        summary:
          "Encourages believers to let the spoken Word take root, producing healing as promised.",
      },
      {
        title: "The Rapture",
        date: "1965-12-04",
        location: "Yuma, AZ",
        summary:
          "Assures the Bride that the same power that changes the body also heals in the present day.",
      },
    ],
  },
  {
    id: "holy-spirit-life",
    theme: "Life in the Holy Spirit",
    description:
      "The indwelling Spirit leads believers into holiness, power, and intimate fellowship with Christ.",
    keywords: ["holy spirit", "pentecost", "anointing", "guidance", "comforter"],
    scriptureHighlights: [
      {
        book: "Acts",
        chapter: 2,
        verseStart: 1,
        verseEnd: 4,
        summary:
          "The Holy Ghost fills the early church on the Day of Pentecost, empowering them for witness.",
      },
      {
        book: "John",
        chapter: 14,
        verseStart: 16,
        verseEnd: 17,
        summary:
          "Jesus promises another Comforter who will abide with believers forever.",
      },
      {
        book: "Romans",
        chapter: 8,
        verseStart: 14,
        summary:
          "As many as are led by the Spirit of God are the sons of God, showing the Spirit's guidance in daily life.",
      },
    ],
    sermonHighlights: [
      {
        title: "Christ Is The Mystery Of God Revealed",
        date: "1963-07-28",
        location: "Jeffersonville, IN",
        summary:
          "Reveals that the Holy Spirit indwells the Bride, manifesting the Life of Christ again on earth.",
      },
      {
        title: "The Seven Church Ages",
        date: "1960-12-04",
        location: "Jeffersonville, IN",
        summary:
          "Shows the Holy Ghost walking in every age, lighting the candlesticks and leading the church.",
      },
    ],
  },
  {
    id: "end-time-promise",
    theme: "End-Time Promise",
    description:
      "Prophetic assurance for the Bride in the closing age—watchfulness, readiness, and hope in Christ's return.",
    keywords: ["rapture", "second coming", "end time", "prophecy", "watchful"],
    scriptureHighlights: [
      {
        book: "1 Thessalonians",
        chapter: 4,
        verseStart: 16,
        verseEnd: 18,
        summary:
          "The Lord descends with a shout, the dead in Christ rise, and believers are caught up together with Him.",
      },
      {
        book: "Matthew",
        chapter: 25,
        verseStart: 1,
        verseEnd: 13,
        summary:
          "The parable of the wise and foolish virgins calls believers to keep their lamps trimmed in the midnight cry.",
      },
      {
        book: "Revelation",
        chapter: 22,
        verseStart: 17,
        summary:
          "The Spirit and the Bride say, Come—an invitation and promise at the close of Scripture.",
      },
    ],
    sermonHighlights: [
      {
        title: "The Rapture",
        date: "1965-12-04",
        location: "Yuma, AZ",
        summary:
          "Explains the secret catching away of the Bride and the signs showing the season of His coming.",
      },
      {
        title: "The Seven Church Ages",
        date: "1960-12-04",
        location: "Jeffersonville, IN",
        summary:
          "Identifies Laodicea as the present age and calls believers to overcome and share Christ's throne.",
      },
    ],
  },
];
