import {
  BIBLE_BOOKS,
  GOSPEL_BOOKS,
  NEW_TESTAMENT_BOOKS,
  OLD_TESTAMENT_BOOKS,
  WISDOM_BOOKS,
} from "@/data/bibleStructure";
import {
  BiblePlan,
  CustomPlanDayInput,
  PlanDay,
  ScriptureRange,
} from "@/types/readingPlans";

interface ChapterEntry {
  book: string;
  chapter: number;
}

const formatRange = (range: ScriptureRange) => {
  if (range.chapterStart === range.chapterEnd) {
    return `${range.book} ${range.chapterStart}`;
  }
  return `${range.book} ${range.chapterStart}-${range.chapterEnd}`;
};

const buildSummary = (ranges: ScriptureRange[]) => {
  if (!ranges.length) {
    return "Spend a few minutes reflecting on today's memory verse.";
  }
  if (ranges.length === 1) {
    return `Focus on ${formatRange(ranges[0])} and note what God highlights in your heart.`;
  }
  return `Journey through ${ranges
    .map((range) => formatRange(range))
    .join(", ")} and capture what stands out.`;
};

const buildReflectionQuestion = (dayNumber: number) => {
  const prompts = [
    "Where did you notice God's character today?",
    "What action can you take in response to this passage?",
    "How does this reading encourage your faith this week?",
    "What promise can you pray back to the Lord?",
    "Who can you encourage with what you read today?",
  ];
  return prompts[dayNumber % prompts.length];
};

const buildEncouragement = (dayNumber: number) => {
  const messages = [
    "You're building a steady rhythm—great work!",
    "Heaven celebrates every moment you show up.",
    "Short readings add up to lifelong transformation.",
    "Fresh strength is coming from today's reading.",
    "You're keeping your streak alive—keep pressing forward!",
  ];
  return messages[dayNumber % messages.length];
};

const flattenBooks = (books = BIBLE_BOOKS): ChapterEntry[] => {
  const entries: ChapterEntry[] = [];
  books.forEach((book) => {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      entries.push({ book: book.name, chapter });
    }
  });
  return entries;
};

const groupIntoRanges = (chunk: ChapterEntry[]): ScriptureRange[] => {
  if (!chunk.length) {
    return [];
  }

  const ranges: ScriptureRange[] = [];
  let start = chunk[0];
  let end = chunk[0];

  for (let i = 1; i < chunk.length; i += 1) {
    const current = chunk[i];
    if (current.book === end.book && current.chapter === end.chapter + 1) {
      end = current;
    } else {
      ranges.push({
        book: start.book,
        chapterStart: start.chapter,
        chapterEnd: end.chapter,
      });
      start = current;
      end = current;
    }
  }

  ranges.push({
    book: start.book,
    chapterStart: start.chapter,
    chapterEnd: end.chapter,
  });
  return ranges;
};

const buildPlanDaysFromChunks = (
  planId: string,
  chunks: ChapterEntry[][],
  duration: number,
  fallbackBook = "Psalms",
): PlanDay[] => {
  const ensuredChunks = [...chunks];
  let fallbackChapter = 1;

  while (ensuredChunks.length < duration) {
    ensuredChunks.push([
      { book: fallbackBook, chapter: fallbackChapter },
    ]);
    fallbackChapter = fallbackChapter === 150 ? 1 : fallbackChapter + 1;
  }

  return ensuredChunks.slice(0, duration).map((chunk, index) => {
    const ranges = groupIntoRanges(chunk);
    const estimatedMinutes = Math.max(8, ranges.length * 10);
    return {
      id: `${planId}-day-${index + 1}`,
      planId,
      dayNumber: index + 1,
      title: ranges.length
        ? `Day ${index + 1}: ${formatRange(ranges[0])}`
        : `Day ${index + 1}: Reflection`,
      scriptures: ranges,
      estimatedMinutes,
      summary: buildSummary(ranges),
      reflectionQuestion: buildReflectionQuestion(index),
      encouragement: buildEncouragement(index),
      aiPrompt: ranges.length
        ? `Offer a devotional summary for ${ranges
            .map((range) => formatRange(range))
            .join(", ")}.`
        : "Share a short reflection on gratitude.",
    };
  });
};

const createSequentialPlan = (
  planId: string,
  duration: number,
  books = BIBLE_BOOKS,
  minimumChapterGroup = 3,
) => {
  const entries = flattenBooks(books);
  const chunkSize = Math.max(
    1,
    Math.ceil(entries.length / duration),
    minimumChapterGroup,
  );
  const chunks: ChapterEntry[][] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize));
  }
  return buildPlanDaysFromChunks(planId, chunks, duration);
};

const createWisdomPlan = (planId: string, duration = 60) => {
  const entries = flattenBooks(WISDOM_BOOKS);
  const chunkSize = 2;
  const chunks: ChapterEntry[][] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize));
  }
  return buildPlanDaysFromChunks(planId, chunks, duration, "Proverbs");
};

const createGospelPlan = (planId: string, duration = 30) =>
  createSequentialPlan(planId, duration, GOSPEL_BOOKS, 2);

const CHRONOLOGICAL_GROUPS: ChapterEntry[] = flattenBooks([
  ...OLD_TESTAMENT_BOOKS,
  ...GOSPEL_BOOKS,
  ...NEW_TESTAMENT_BOOKS.filter((book) => !GOSPEL_BOOKS.includes(book)),
]);

const createChronologicalPlan = (planId: string, duration: number) => {
  // Use the flattened chronological array but weight history + prophets + NT
  const chunkSize = Math.max(2, Math.ceil(CHRONOLOGICAL_GROUPS.length / duration));
  const chunks: ChapterEntry[][] = [];
  for (let i = 0; i < CHRONOLOGICAL_GROUPS.length; i += chunkSize) {
    chunks.push(CHRONOLOGICAL_GROUPS.slice(i, i + chunkSize));
  }
  return buildPlanDaysFromChunks(planId, chunks, duration);
};

interface TopicalDayConfig {
  title: string;
  scriptures: ScriptureRange[];
  summary: string;
  reflectionQuestion: string;
}

interface TopicalPlanConfig {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  tags: string[];
  difficulty: "easy" | "medium";
  days: TopicalDayConfig[];
}

const topicalPlanConfigs: TopicalPlanConfig[] = [
  {
    id: "topical-faith",
    title: "Faith Foundations",
    description: "Anchor your trust in God with a 10-day boost of faith passages.",
    themeColor: "#2563eb",
    tags: ["faith", "confidence"],
    difficulty: "easy",
    days: [
      {
        title: "Faith that pleases",
        scriptures: [
          { book: "Hebrews", chapterStart: 11, chapterEnd: 11 },
        ],
        summary: "Walk through the Hall of Faith and let their stories inspire yours.",
        reflectionQuestion: "Which testimony fuels your obedience today?",
      },
      {
        title: "Belief and action",
        scriptures: [
          { book: "James", chapterStart: 2, chapterEnd: 2 },
        ],
        summary: "See how faith and works move together in harmony.",
        reflectionQuestion: "Where is God asking for obedient action?",
      },
      {
        title: "Faith over fear",
        scriptures: [
          { book: "Matthew", chapterStart: 14, chapterEnd: 14 },
        ],
        summary: "Watch Peter step out of the boat toward Jesus.",
        reflectionQuestion: "What waves surround you and how can you look to Jesus?",
      },
      {
        title: "Trusting promises",
        scriptures: [
          { book: "Romans", chapterStart: 4, chapterEnd: 4 },
        ],
        summary: "Abraham's faith was credited as righteousness—yours is too.",
        reflectionQuestion: "What promise do you need to stand on?",
      },
      {
        title: "Faith fueled by love",
        scriptures: [
          { book: "Galatians", chapterStart: 5, chapterEnd: 5 },
        ],
        summary: "Let freedom in Christ produce fruit as you walk by the Spirit.",
        reflectionQuestion: "How can you keep in step with the Spirit today?",
      },
      {
        title: "Shield of faith",
        scriptures: [
          { book: "Ephesians", chapterStart: 6, chapterEnd: 6 },
        ],
        summary: "Put on the armor and extinguish every fiery dart.",
        reflectionQuestion: "Which armor piece needs attention right now?",
      },
      {
        title: "Faith-filled prayer",
        scriptures: [
          { book: "Mark", chapterStart: 11, chapterEnd: 11 },
        ],
        summary: "Jesus teaches how faith-filled prayer moves mountains.",
        reflectionQuestion: "What mountain are you asking to move?",
      },
      {
        title: "Enduring faith",
        scriptures: [
          { book: "2 Timothy", chapterStart: 4, chapterEnd: 4 },
        ],
        summary: "Paul finishes his race and keeps the faith to the end.",
        reflectionQuestion: "What does finishing well look like for you?",
      },
      {
        title: "Faith in action",
        scriptures: [
          { book: "Acts", chapterStart: 3, chapterEnd: 4 },
        ],
        summary: "Watch the early church trust God for miracles and boldness.",
        reflectionQuestion: "How can you pray bold prayers today?",
      },
      {
        title: "Living by faith",
        scriptures: [
          { book: "Habakkuk", chapterStart: 2, chapterEnd: 3 },
        ],
        summary: "Even when life trembles, we rejoice in the God of salvation.",
        reflectionQuestion: "Where can you choose joy while you wait?",
      },
    ],
  },
  {
    id: "topical-healing",
    title: "Healing & Hope",
    description: "Meditate on God's heart to restore body and soul.",
    themeColor: "#16a34a",
    tags: ["healing", "hope"],
    difficulty: "easy",
    days: [
      {
        title: "The Lord who heals",
        scriptures: [
          { book: "Exodus", chapterStart: 15, chapterEnd: 15 },
        ],
        summary: "God reveals Himself as Jehovah Rapha to Israel.",
        reflectionQuestion: "Where do you need to remember God's healing name?",
      },
      {
        title: "Bless the Healer",
        scriptures: [
          { book: "Psalms", chapterStart: 103, chapterEnd: 103 },
        ],
        summary: "Forget not His benefits—He heals all our diseases.",
        reflectionQuestion: "What benefit are you grateful for today?",
      },
      {
        title: "By His stripes",
        scriptures: [
          { book: "Isaiah", chapterStart: 53, chapterEnd: 53 },
        ],
        summary: "Jesus carried our pain and provided eternal healing.",
        reflectionQuestion: "How does the cross speak to your situation?",
      },
      {
        title: "Faith for healing",
        scriptures: [
          { book: "Mark", chapterStart: 5, chapterEnd: 5 },
        ],
        summary: "Witness the woman pressing through the crowd for a miracle.",
        reflectionQuestion: "Where is God inviting persistent faith?",
      },
      {
        title: "Healing mission",
        scriptures: [
          { book: "Luke", chapterStart: 4, chapterEnd: 5 },
        ],
        summary: "Jesus proclaims freedom and heals every sickness.",
        reflectionQuestion: "How can you join Jesus in lifting the broken?",
      },
      {
        title: "Authority to heal",
        scriptures: [
          { book: "Acts", chapterStart: 9, chapterEnd: 9 },
        ],
        summary: "Peter and Dorcas' story reminds us of resurrection hope.",
        reflectionQuestion: "Where do you need to pray bold prayers today?",
      },
      {
        title: "Prayer of faith",
        scriptures: [
          { book: "James", chapterStart: 5, chapterEnd: 5 },
        ],
        summary: "Call the elders and confess—healing flows in community.",
        reflectionQuestion: "Who can pray with you this week?",
      },
      {
        title: "Tree of life",
        scriptures: [
          { book: "Revelation", chapterStart: 21, chapterEnd: 22 },
        ],
        summary: "A future is coming with no more pain or tears.",
        reflectionQuestion: "How does eternity reshape today's ache?",
      },
      {
        title: "Encouraging the broken",
        scriptures: [
          { book: "2 Corinthians", chapterStart: 1, chapterEnd: 1 },
        ],
        summary: "Comfort received becomes comfort offered.",
        reflectionQuestion: "Who needs the comfort you've received?",
      },
      {
        title: "Hope renewed",
        scriptures: [
          { book: "Lamentations", chapterStart: 3, chapterEnd: 3 },
        ],
        summary: "His mercies are new every morning.",
        reflectionQuestion: "What mercy met you today?",
      },
    ],
  },
  {
    id: "topical-growth",
    title: "Spiritual Growth",
    description: "Develop holy habits through Scripture and practice.",
    themeColor: "#a855f7",
    tags: ["growth", "discipleship"],
    difficulty: "medium",
    days: [
      {
        title: "Rooted like a tree",
        scriptures: [
          { book: "Psalms", chapterStart: 1, chapterEnd: 1 },
        ],
        summary: "Delighting in the Word produces fruit in every season.",
        reflectionQuestion: "What delights or distracts your roots?",
      },
      {
        title: "Renewed mind",
        scriptures: [
          { book: "Romans", chapterStart: 12, chapterEnd: 12 },
        ],
        summary: "Transformation happens as your mind aligns with heaven.",
        reflectionQuestion: "Where do you sense God renewing your thoughts?",
      },
      {
        title: "Abiding in the vine",
        scriptures: [
          { book: "John", chapterStart: 15, chapterEnd: 15 },
        ],
        summary: "Remain in Jesus and fruit will follow.",
        reflectionQuestion: "How will you abide more intentionally today?",
      },
      {
        title: "Practicing disciplines",
        scriptures: [
          { book: "1 Timothy", chapterStart: 4, chapterEnd: 4 },
        ],
        summary: "Train yourself in godliness—it holds promise for all.",
        reflectionQuestion: "Which spiritual muscle needs attention?",
      },
      {
        title: "Walk by the Spirit",
        scriptures: [
          { book: "Galatians", chapterStart: 5, chapterEnd: 5 },
        ],
        summary: "Fruit grows where the Spirit leads.",
        reflectionQuestion: "What fruit is ripening in you?",
      },
      {
        title: "Bold maturity",
        scriptures: [
          { book: "Hebrews", chapterStart: 5, chapterEnd: 6 },
        ],
        summary: "Leave the elementary teachings and press toward maturity.",
        reflectionQuestion: "What next step is Jesus inviting you into?",
      },
      {
        title: "Enduring trials",
        scriptures: [
          { book: "James", chapterStart: 1, chapterEnd: 1 },
        ],
        summary: "Trials develop perseverance and character.",
        reflectionQuestion: "How can you count this season as joy?",
      },
      {
        title: "Practicing love",
        scriptures: [
          { book: "1 Corinthians", chapterStart: 13, chapterEnd: 13 },
        ],
        summary: "Love is the highest marker of maturity.",
        reflectionQuestion: "Where can you show love in action?",
      },
      {
        title: "Serving gifts",
        scriptures: [
          { book: "1 Peter", chapterStart: 4, chapterEnd: 4 },
        ],
        summary: "Use what you've received to serve others.",
        reflectionQuestion: "How can your gifts strengthen the Body?",
      },
      {
        title: "Finishing well",
        scriptures: [
          { book: "Philippians", chapterStart: 3, chapterEnd: 4 },
        ],
        summary: "Press toward the goal for the prize of Christ Jesus.",
        reflectionQuestion: "What race lane are you called to run today?",
      },
    ],
  },
  {
    id: "topical-leadership",
    title: "Leadership & Purpose",
    description: "Lead with humility, wisdom, and Spirit-filled purpose.",
    themeColor: "#f97316",
    tags: ["leadership", "purpose"],
    difficulty: "medium",
    days: [
      {
        title: "Servant leadership",
        scriptures: [
          { book: "Mark", chapterStart: 10, chapterEnd: 10 },
        ],
        summary: "Greatness is measured in service.",
        reflectionQuestion: "How can you lead by stooping low?",
      },
      {
        title: "Joshua's courage",
        scriptures: [
          { book: "Joshua", chapterStart: 1, chapterEnd: 1 },
        ],
        summary: "Be strong and courageous for the Lord goes with you.",
        reflectionQuestion: "Where do you need courage?",
      },
      {
        title: "Deborah's wisdom",
        scriptures: [
          { book: "Judges", chapterStart: 4, chapterEnd: 5 },
        ],
        summary: "Lead with prophetic insight and courage.",
        reflectionQuestion: "What voice of courage can you offer?",
      },
      {
        title: "Nehemiah's strategy",
        scriptures: [
          { book: "Nehemiah", chapterStart: 2, chapterEnd: 4 },
        ],
        summary: "Plan prayerfully and lead persistently.",
        reflectionQuestion: "Where do you need a rebuilding strategy?",
      },
      {
        title: "David's shepherd heart",
        scriptures: [
          { book: "1 Samuel", chapterStart: 16, chapterEnd: 17 },
        ],
        summary: "God sees the heart more than the resume.",
        reflectionQuestion: "How can you nurture a shepherd heart?",
      },
      {
        title: "Purpose in exile",
        scriptures: [
          { book: "Daniel", chapterStart: 1, chapterEnd: 2 },
        ],
        summary: "Daniel leads with integrity in a foreign culture.",
        reflectionQuestion: "Where is God asking for integrity?",
      },
      {
        title: "Leading like Jesus",
        scriptures: [
          { book: "John", chapterStart: 13, chapterEnd: 13 },
        ],
        summary: "Jesus washes feet and redefines greatness.",
        reflectionQuestion: "Whose feet can you wash figuratively today?",
      },
      {
        title: "Spirit-led mission",
        scriptures: [
          { book: "Acts", chapterStart: 13, chapterEnd: 14 },
        ],
        summary: "Paul and Barnabas follow the Spirit's sending.",
        reflectionQuestion: "How can you stay flexible to the Spirit?",
      },
      {
        title: "Qualifications matter",
        scriptures: [
          { book: "1 Timothy", chapterStart: 3, chapterEnd: 3 },
        ],
        summary: "Character outruns charisma in the Kingdom.",
        reflectionQuestion: "What qualification is God forming in you?",
      },
      {
        title: "Purpose and perseverance",
        scriptures: [
          { book: "2 Corinthians", chapterStart: 4, chapterEnd: 4 },
        ],
        summary: "We don't lose heart because glory is coming.",
        reflectionQuestion: "What helps you not lose heart?",
      },
    ],
  },
  {
    id: "topical-purpose",
    title: "Purpose Discovery",
    description: "Listen for the unique call God has placed on your life.",
    themeColor: "#db2777",
    tags: ["purpose", "calling"],
    difficulty: "easy",
    days: [
      {
        title: "Created on purpose",
        scriptures: [
          { book: "Psalms", chapterStart: 139, chapterEnd: 139 },
        ],
        summary: "You are fearfully and wonderfully made.",
        reflectionQuestion: "Where do you feel God's intentional design?",
      },
      {
        title: "Called and sent",
        scriptures: [
          { book: "Isaiah", chapterStart: 6, chapterEnd: 6 },
        ],
        summary: "Isaiah responds, 'Here am I, send me'.",
        reflectionQuestion: "What is God inviting you to say yes to?",
      },
      {
        title: "Good works prepared",
        scriptures: [
          { book: "Ephesians", chapterStart: 2, chapterEnd: 2 },
        ],
        summary: "God prepared works for you to walk in.",
        reflectionQuestion: "What good work is in front of you?",
      },
      {
        title: "Unique assignments",
        scriptures: [
          { book: "1 Corinthians", chapterStart: 12, chapterEnd: 12 },
        ],
        summary: "Every part of the body matters.",
        reflectionQuestion: "Where do you fit in the body?",
      },
      {
        title: "Purpose in pain",
        scriptures: [
          { book: "Genesis", chapterStart: 50, chapterEnd: 50 },
        ],
        summary: "What the enemy meant for evil, God turns for good.",
        reflectionQuestion: "Where can God redeem your story?",
      },
      {
        title: "Purpose in exile",
        scriptures: [
          { book: "Jeremiah", chapterStart: 29, chapterEnd: 29 },
        ],
        summary: "Seek the welfare of the city you're planted in.",
        reflectionQuestion: "How can you bless your context today?",
      },
      {
        title: "Running your race",
        scriptures: [
          { book: "Hebrews", chapterStart: 12, chapterEnd: 12 },
        ],
        summary: "Fix your eyes on Jesus and run with endurance.",
        reflectionQuestion: "What weight needs to be laid aside?",
      },
      {
        title: "Purpose in waiting",
        scriptures: [
          { book: "Acts", chapterStart: 9, chapterEnd: 9 },
        ],
        summary: "Saul waits in blindness before walking in calling.",
        reflectionQuestion: "What is God forming in the waiting?",
      },
      {
        title: "The great commission",
        scriptures: [
          { book: "Matthew", chapterStart: 28, chapterEnd: 28 },
        ],
        summary: "Go and make disciples of all nations.",
        reflectionQuestion: "How can you disciple one person this week?",
      },
      {
        title: "Finishing the course",
        scriptures: [
          { book: "2 Timothy", chapterStart: 4, chapterEnd: 4 },
        ],
        summary: "Fight the good fight, finish the race, keep the faith.",
        reflectionQuestion: "What legacy do you want to leave?",
      },
    ],
  },
  {
    id: "topical-encouragement",
    title: "Encouragement & Joy",
    description: "Lift your heart with Scriptures of courage and joy.",
    themeColor: "#eab308",
    tags: ["encouragement", "joy"],
    difficulty: "easy",
    days: [
      {
        title: "Joy in trials",
        scriptures: [
          { book: "James", chapterStart: 1, chapterEnd: 1 },
        ],
        summary: "Count it all joy because perseverance is forming.",
        reflectionQuestion: "Where can you find joy today?",
      },
      {
        title: "The joy of salvation",
        scriptures: [
          { book: "Psalms", chapterStart: 51, chapterEnd: 51 },
        ],
        summary: "David prays for a restored joy.",
        reflectionQuestion: "What does restored joy look like?",
      },
      {
        title: "Courage from God",
        scriptures: [
          { book: "Isaiah", chapterStart: 41, chapterEnd: 41 },
        ],
        summary: "Fear not, God upholds you with His right hand.",
        reflectionQuestion: "Which fear do you need to surrender?",
      },
      {
        title: "Peace that guards",
        scriptures: [
          { book: "Philippians", chapterStart: 4, chapterEnd: 4 },
        ],
        summary: "Prayer ushers in peace beyond understanding.",
        reflectionQuestion: "What anxiety will you trade for peace?",
      },
      {
        title: "God of comfort",
        scriptures: [
          { book: "2 Corinthians", chapterStart: 1, chapterEnd: 1 },
        ],
        summary: "Comfort received is comfort shared.",
        reflectionQuestion: "Who can you comfort today?",
      },
      {
        title: "Joy in the Spirit",
        scriptures: [
          { book: "Romans", chapterStart: 15, chapterEnd: 15 },
        ],
        summary: "Hope overflows by the power of the Holy Spirit.",
        reflectionQuestion: "Where do you need overflow?",
      },
      {
        title: "Strength for the weary",
        scriptures: [
          { book: "Isaiah", chapterStart: 40, chapterEnd: 40 },
        ],
        summary: "Those who wait on the Lord renew their strength.",
        reflectionQuestion: "How can you wait on Him today?",
      },
      {
        title: "Rejoice always",
        scriptures: [
          { book: "1 Thessalonians", chapterStart: 5, chapterEnd: 5 },
        ],
        summary: "Give thanks in everything.",
        reflectionQuestion: "What gratitude can you voice now?",
      },
      {
        title: "Songs in the night",
        scriptures: [
          { book: "Acts", chapterStart: 16, chapterEnd: 16 },
        ],
        summary: "Paul and Silas sing in prison and chains break.",
        reflectionQuestion: "What song can you raise tonight?",
      },
      {
        title: "Joy made complete",
        scriptures: [
          { book: "John", chapterStart: 16, chapterEnd: 16 },
        ],
        summary: "Jesus promises joy that can't be stolen.",
        reflectionQuestion: "Where do you need unstoppable joy?",
      },
    ],
  },
];

const buildTopicalPlanDays = (planId: string, config: TopicalPlanConfig): PlanDay[] =>
  config.days.map((day, index) => ({
    id: `${planId}-day-${index + 1}`,
    planId,
    dayNumber: index + 1,
    title: day.title,
    scriptures: day.scriptures,
    estimatedMinutes: day.scriptures.length * 8 + 5,
    summary: day.summary,
    reflectionQuestion: day.reflectionQuestion,
    encouragement: buildEncouragement(index),
    aiPrompt: `Share a 2-sentence encouragement for ${day.title} using ${day.scriptures
      .map((range) => formatRange(range))
      .join(", ")}.`,
  }));

export const BASE_READING_PLANS: BiblePlan[] = [
  {
    id: "bible-in-a-year",
    title: "Whole Bible in 1 Year",
    description: "Read the entire Bible in 365 days with balanced daily portions.",
    durationDays: 365,
    planType: "whole-bible",
    difficulty: "advanced",
    tags: ["whole bible", "discipline", "year"],
    themeColor: "#7c3aed",
  },
  {
    id: "new-testament-90",
    title: "New Testament in 90 Days",
    description: "Experience the life of Jesus and the early church in just three months.",
    durationDays: 90,
    planType: "new-testament",
    difficulty: "medium",
    tags: ["new testament", "gospels"],
    themeColor: "#2563eb",
  },
  {
    id: "old-testament-6mo",
    title: "Old Testament in 6 Months",
    description: "Trace the story of Israel, the prophets, and God's covenant faithfulness.",
    durationDays: 180,
    planType: "old-testament",
    difficulty: "advanced",
    tags: ["old testament", "prophets"],
    themeColor: "#b45309",
  },
  {
    id: "wisdom-daily",
    title: "Psalms & Proverbs Daily Wisdom",
    description: "60 days of worship, wisdom, and daily counsel.",
    durationDays: 60,
    planType: "wisdom",
    difficulty: "easy",
    tags: ["psalms", "proverbs", "wisdom"],
    themeColor: "#0ea5e9",
  },
  {
    id: "chronological-year",
    title: "Chronological Bible Plan",
    description: "Walk through Scripture in the order events unfolded.",
    durationDays: 365,
    planType: "chronological",
    difficulty: "advanced",
    tags: ["chronological", "story"],
    themeColor: "#14b8a6",
  },
  {
    id: "life-of-jesus",
    title: "The Life of Jesus",
    description: "30-day journey through the Gospels focusing on the words of Christ.",
    durationDays: 30,
    planType: "gospels",
    difficulty: "easy",
    tags: ["gospels", "jesus"],
    themeColor: "#f472b6",
  },
  ...topicalPlanConfigs.map((config) => ({
    id: config.id,
    title: config.title,
    description: config.description,
    durationDays: config.days.length,
    planType: "topical" as const,
    difficulty: config.difficulty,
    tags: config.tags,
    themeColor: config.themeColor,
  })),
];

const planDayCache = new Map<string, PlanDay[]>();

const buildPlanDays = (planId: string): PlanDay[] => {
  switch (planId) {
    case "bible-in-a-year":
      return createSequentialPlan(planId, 365, BIBLE_BOOKS, 3);
    case "new-testament-90":
      return createSequentialPlan(planId, 90, NEW_TESTAMENT_BOOKS, 2);
    case "old-testament-6mo":
      return createSequentialPlan(planId, 180, OLD_TESTAMENT_BOOKS, 3);
    case "wisdom-daily":
      return createWisdomPlan(planId, 60);
    case "chronological-year":
      return createChronologicalPlan(planId, 365);
    case "life-of-jesus":
      return createGospelPlan(planId, 30);
    default: {
      const topicalPlan = topicalPlanConfigs.find((config) => config.id === planId);
      if (topicalPlan) {
        return buildTopicalPlanDays(planId, topicalPlan);
      }
      return [];
    }
  }
};

export const getPlanDaysById = (planId: string): PlanDay[] => {
  if (!planDayCache.has(planId)) {
    planDayCache.set(planId, buildPlanDays(planId));
  }
  return planDayCache.get(planId) ?? [];
};

export const createCustomPlanDays = (
  planId: string,
  dailyReadings: CustomPlanDayInput[],
): PlanDay[] =>
  dailyReadings.map((day, index) => ({
    id: `${planId}-day-${index + 1}`,
    planId,
    dayNumber: index + 1,
    title: day.title,
    scriptures: day.scriptures,
    estimatedMinutes: day.estimatedMinutes ?? Math.max(6, day.scriptures.length * 6),
    summary: day.summary ?? buildSummary(day.scriptures),
    reflectionQuestion:
      day.reflectionQuestion ?? buildReflectionQuestion(index),
    encouragement: buildEncouragement(index),
    aiPrompt: `Create a devotional thought for ${day.title} using ${day.scriptures
      .map((range) => formatRange(range))
      .join(", ")}.`,
  }));
