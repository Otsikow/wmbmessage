import re
import os
import random
from datetime import datetime

# Target file
OUTPUT_FILE = "src/data/dailyReadings.ts"

# Source files
DAILY_QUOTE_FILE = "src/components/DailyQuote.tsx"
THEME_LIBRARY_FILE = "src/data/themeLibrary.ts"
SEED_SERMONS_FILE = "supabase/migrations/20251027000001_seed_sermons.sql"
CROSS_REFS_FILE = "src/data/staticCrossReferences.ts"

readings = []

def clean_text(text):
    return text.strip().strip('"').strip("'").replace('\\"', '"').replace("\\'", "'").replace('\n', ' ')

# Large pool of verses to ensure variety when we don't have the specific text
common_verses = [
    ("Genesis 1:1", "In the beginning God created the heaven and the earth."),
    ("John 3:16", "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."),
    ("Jeremiah 29:11", "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."),
    ("Romans 8:28", "And we know that all things work together for good to them that love God, to them who are the called according to his purpose."),
    ("Philippians 4:13", "I can do all things through Christ which strengtheneth me."),
    ("Proverbs 3:5", "Trust in the LORD with all thine heart; and lean not unto thine own understanding."),
    ("Proverbs 3:6", "In all thy ways acknowledge him, and he shall direct thy paths."),
    ("Psalm 23:1", "The LORD is my shepherd; I shall not want."),
    ("Isaiah 40:31", "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."),
    ("Joshua 1:9", "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest."),
    ("Hebrews 11:1", "Now faith is the substance of things hoped for, the evidence of things not seen."),
    ("2 Timothy 1:7", "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind."),
    ("John 14:6", "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me."),
    ("Romans 3:23", "For all have sinned, and come short of the glory of God."),
    ("Romans 6:23", "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord."),
    ("Ephesians 2:8", "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God."),
    ("1 John 1:9", "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness."),
    ("Psalm 46:1", "God is our refuge and strength, a very present help in trouble."),
    ("Galatians 5:22-23", "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law."),
    ("Psalm 119:105", "Thy word is a lamp unto my feet, and a light unto my path."),
    ("Matthew 11:28", "Come unto me, all ye that labour and are heavy laden, and I will give you rest."),
    ("Isaiah 41:10", "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness."),
    ("2 Corinthians 5:17", "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new."),
    ("John 10:10", "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly."),
    ("Romans 12:2", "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God."),
    ("Hebrews 13:8", "Jesus Christ the same yesterday, and to day, and for ever."),
    ("James 1:2", "My brethren, count it all joy when ye fall into divers temptations;"),
    ("1 Peter 5:7", "Casting all your care upon him; for he careth for you."),
    ("Psalm 19:14", "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer."),
    ("Matthew 28:19", "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:"),
    ("Psalm 100:5", "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations."),
    ("Micah 6:8", "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?"),
    ("Romans 15:13", "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost."),
    ("Psalm 37:4", "Delight thyself also in the LORD; and he shall give thee the desires of thine heart."),
    ("Philippians 4:6", "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God."),
    ("Proverbs 18:10", "The name of the LORD is a strong tower: the righteous runneth into it, and is safe."),
    ("Psalm 27:1", "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?"),
    ("Isaiah 26:3", "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee."),
    ("Matthew 6:33", "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you."),
    ("1 Corinthians 13:4", "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,"),
    ("1 Thessalonians 5:16-18", "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you."),
    ("Hebrews 4:12", "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart."),
    ("James 4:8", "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded."),
    ("Revelation 3:20", "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me."),
    ("Psalm 34:8", "O taste and see that the LORD is good: blessed is the man that trusteth in him."),
    ("1 John 4:19", "We love him, because he first loved us."),
    ("Isaiah 53:5", "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed."),
    ("John 8:32", "And ye shall know the truth, and the truth shall make you free."),
    ("2 Corinthians 12:9", "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness."),
    ("Galatians 2:20", "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me."),
]

generic_messages = [
    "God's promises are true and faithful for every season of your life.",
    "Walk in the light of His Word today and find peace for your soul.",
    "Faith is not a feeling; it is an anchor that holds within the veil.",
    "Let His grace be sufficient for every challenge you face today.",
    "The joy of the Lord is your strength; lean on Him.",
    "Prayer changes things because it touches the heart of God.",
    "You are loved with an everlasting love that never fails.",
    "Trust God's timing; He is never late and never early.",
    "Forgiveness is the key that unlocks the door to freedom.",
    "Let your light shine so others may see His glory in you.",
    "God is working all things together for your good.",
    "Be still and know that He is God; He is in control.",
    "His mercies are new every morning; embrace this new day.",
    "Seek first the Kingdom, and everything else will fall into place.",
    "You are fearfully and wonderfully made for a purpose.",
    "Cast your cares on Him, for He cares affectionately for you.",
    "Stand firm in the faith; victory is already yours in Christ.",
    "The Holy Spirit is your comforter and guide in all truth.",
    "God's word is a seed; plant it in your heart and watch it grow.",
    "Do not be afraid, for the Lord your God is with you.",
    "Love is the greatest commandment; let it rule your heart.",
    "Hope in God does not disappoint; He is faithful.",
    "Every step of faith is a step toward your destiny.",
    "God sees the heart; keep yours pure and open to Him.",
    "Grace is God doing for you what you cannot do for yourself.",
]

def get_random_verse():
    return random.choice(common_verses)

# 1. Extract from DailyQuote.tsx (Keep exact pairs if possible)
try:
    with open(DAILY_QUOTE_FILE, "r") as f:
        content = f.read()
        matches = re.findall(r'verse:\s*{\s*text:\s*"(.*?)",\s*reference:\s*"(.*?)"\s*},\s*message:\s*{\s*text:\s*"(.*?)",\s*reference:\s*"(.*?)"\s*}', content, re.DOTALL)
        for m in matches:
            readings.append({
                "verse": {"text": clean_text(m[0]), "reference": clean_text(m[1])},
                "message": {"text": clean_text(m[2]), "reference": clean_text(m[3])}
            })
        print(f"Extracted {len(readings)} from DailyQuote.tsx")
except Exception as e:
    print(f"Error reading DailyQuote.tsx: {e}")

# 2. Extract from themeLibrary.ts
try:
    with open(THEME_LIBRARY_FILE, "r") as f:
        content = f.read()
        sermon_summaries = re.findall(r'title:\s*"(.*?)".*?summary:\s*"(.*?)"', content, re.DOTALL)

        for title, summary in sermon_summaries:
            verse_ref, verse_text = get_random_verse()
            readings.append({
                "verse": {"text": verse_text, "reference": verse_ref},
                "message": {"text": clean_text(summary), "reference": f"William Branham — {clean_text(title)}"}
            })
        print(f"Extracted {len(sermon_summaries)} sermon summaries from themeLibrary.ts")
except Exception as e:
    print(f"Error reading themeLibrary.ts: {e}")

# 3. Extract from seed_sermons.sql
try:
    with open(SEED_SERMONS_FILE, "r") as f:
        content = f.read()
        titles = {}
        title_matches = re.findall(r"VALUES \('([^']+)', '[^']+', '[^']+'\)\s*RETURNING id INTO ([a-z_]+);", content)
        for title, var_name in title_matches:
            titles[var_name] = title

        para_matches = re.findall(r"\(([a-z_]+_id), \d+, '([^']+)'\)", content)

        for var_name, text in para_matches:
             title = titles.get(var_name, "Sermon")
             verse_ref, verse_text = get_random_verse()
             readings.append({
                "verse": {"text": verse_text, "reference": verse_ref},
                "message": {"text": clean_text(text), "reference": f"William Branham — {title}"}
            })
        print(f"Extracted {len(para_matches)} paragraphs from seed_sermons.sql")

except Exception as e:
    print(f"Error reading seed_sermons.sql: {e}")

# 4. Extract from staticCrossReferences.ts
try:
    with open(CROSS_REFS_FILE, "r") as f:
        content = f.read()
        objects = content.split("createId")
        count = 0
        for obj in objects[1:]:
            # We ignore the specific verse reference because we don't have the text.
            # We just use the NOTE as the message.
            notes = re.search(r'notes:\s*"([^"]+)"', obj)

            if notes:
                verse_ref, verse_text = get_random_verse()
                readings.append({
                    "verse": {"text": verse_text, "reference": verse_ref},
                    "message": {"text": clean_text(notes.group(1)), "reference": "Scripture Insight"}
                })
                count += 1
        print(f"Extracted {count} cross-refs from staticCrossReferences.ts")
except Exception as e:
    print(f"Error reading staticCrossReferences.ts: {e}")

# Deduplicate based on message text
unique_readings = []
seen_messages = set()
for r in readings:
    msg = r["message"]["text"]
    if msg not in seen_messages:
        unique_readings.append(r)
        seen_messages.add(msg)

readings = unique_readings
print(f"Total unique extracted: {len(readings)}")

# FILLERS to reach 366
needed = 366 - len(readings)
if needed > 0:
    print(f"Generating {needed} fillers...")
    for i in range(needed):
        verse_ref, verse_text = get_random_verse()
        msg_text = random.choice(generic_messages)

        readings.append({
            "verse": {"text": verse_text, "reference": verse_ref},
            "message": {"text": msg_text, "reference": "Daily Inspiration"}
        })

# Randomize the whole list
random.shuffle(readings)

# Ensure exactly 366
readings = readings[:366]

# Write TS File
ts_content = """import { differenceInCalendarDays, startOfDay } from "date-fns";

export interface DailyReading {
  verse: {
    text: string;
    reference: string;
  };
  message: {
    text: string;
    reference: string;
  };
}

export const ALL_DAILY_READINGS: DailyReading[] = [
"""

for r in readings:
    v_text = r["verse"]["text"].replace('"', '\\"')
    v_ref = r["verse"]["reference"].replace('"', '\\"')
    m_text = r["message"]["text"].replace('"', '\\"')
    m_ref = r["message"]["reference"].replace('"', '\\"')

    ts_content += f"""  {{
    verse: {{
      text: "{v_text}",
      reference: "{v_ref}",
    }},
    message: {{
      text: "{m_text}",
      reference: "{m_ref}",
    }},
  }},
"""

ts_content += """];

export function getReadingForDate(date: Date): DailyReading {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayIndex = differenceInCalendarDays(
    startOfDay(date),
    startOfDay(startOfYear)
  );

  const normalizedIndex = ((dayIndex % ALL_DAILY_READINGS.length) + ALL_DAILY_READINGS.length) % ALL_DAILY_READINGS.length;
  return ALL_DAILY_READINGS[normalizedIndex];
}
"""

with open(OUTPUT_FILE, "w") as f:
    f.write(ts_content)

print(f"Successfully generated {OUTPUT_FILE} with {len(readings)} readings.")
