import { differenceInCalendarDays, startOfDay } from "date-fns";

export interface DailyReading {
  verse: { text: string; reference: string };
  message: { text: string; title: string; code: string; paragraph: number; number: string };
}

// Each excerpt is tied to an exact paragraph in the MessageGuide transcript archive.
const readings = {
  "Psalm 119:105": {
    verse: { reference: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path." },
    message: {
      text: "Father God, Thy Word is a Lamp, the Light that lights the path of every believer into the Presence of God, as It carries us like a lantern in our hand.",
      title: "The Masterpiece", code: "64-0705", paragraph: 24, number: "25",
    },
  },
  "1 Peter 5:7": {
    verse: { reference: "1 Peter 5:7", text: "Casting all your care upon him; for he careth for you." },
    message: {
      text: "But you see that He cares, and He died that you might care, that you might have a way.",
      title: "He Cares. Do You Care?", code: "63-0721", paragraph: 151, number: "152",
    },
  },
  "Romans 8:28": {
    verse: { reference: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
    message: {
      text: "And everything works together for good to them that love God. God just brings things around to happen that way. It’s His great love to His people.",
      title: "What Does It Take to Make a Christian Life?", code: "57-0113", paragraph: 20, number: "21",
    },
  },
  "1 Corinthians 13:4": {
    verse: { reference: "1 Corinthians 13:4", text: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up," },
    message: {
      text: "That’s how you know you passed from death unto Life, you got love, peace, joy, longsuffering, goodness, gentleness, patience.",
      title: "Hebrews, Chapter Four", code: "57-0901E", paragraph: 221, number: "222",
    },
  },
  "2 Corinthians 5:17": {
    verse: { reference: "2 Corinthians 5:17", text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new." },
    message: {
      text: "When God comes down and puts His Spirit into you, then you’re no more your own, but you’re God’s.",
      title: "Preparation", code: "53-1111", paragraph: 30, number: "31",
    },
  },
  "Psalm 23:1": {
    verse: { reference: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want." },
    message: {
      text: "No wonder David said, “The Lord is my shepherd. I shall not want.” And how He leads us by the side of the still waters; and restores their soul; and runs our cups over; and—and anoints us in the presence of the enemy!",
      title: "Beginning and Ending of the Gentile Dispensation", code: "55-0109E", paragraph: 40, number: "41",
    },
  },
  "Galatians 5:22-23": {
    verse: { reference: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law." },
    message: {
      text: "Now, Jesus said, “By their fruit you shall know them.” And the fruit of the Spirit is love, joy, peace, longsuffering, goodness, meekness, gentleness.",
      title: "Questions and Answers #1", code: "54-0103M", paragraph: 164, number: "165",
    },
  },
  "Matthew 28:19": {
    verse: { reference: "Matthew 28:19", text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:" },
    message: {
      text: "Jesus Christ, the Son of God, commissioned His disciples to go into all the world and preach the Gospel from there, saying, “These signs shall follow them that believe.”",
      title: "Go, Wake Jesus", code: "63-1103", paragraph: 20, number: "21",
    },
  },
  "John 8:32": {
    verse: { reference: "John 8:32", text: "And ye shall know the truth, and the truth shall make you free." },
    message: {
      text: "Now, you can be a prisoner, or, you can be a—a truth rejecting prisoner, or you can know the truth and be free.",
      title: "Watchman, What of the Night?", code: "60-0722", paragraph: 32, number: "33",
    },
  },
  "2 Timothy 1:7": {
    verse: { reference: "2 Timothy 1:7", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
    message: {
      text: "His promise is good. Don’t be afraid of it. Say, “I believe it. I accept it. He’s knocking at my heart. I believe it.”",
      title: "Jehovah-Jireh", code: "57-0810", paragraph: 54, number: "55",
    },
  },
  "Micah 6:8": {
    verse: { reference: "Micah 6:8", text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?" },
    message: {
      text: "Walk humbly. Have a contrite, broken spirit; a humble heart, willing to let the Holy Spirit lead you.",
      title: "The Seven Church Ages", code: "54-0512", paragraph: 70, number: "71",
    },
  },
  "Revelation 3:20": {
    verse: { reference: "Revelation 3:20", text: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me." },
    message: {
      text: "There’s something about it that each time when I read it, it just thrills my heart. It’s a picture of the Lord knocking at the door.",
      title: "The Door to the Heart", code: "58-0112E", paragraph: 5, number: "6",
    },
  },
  "Matthew 6:33": {
    verse: { reference: "Matthew 6:33", text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
    message: {
      text: "Now, all things ought to be considered prayerfully, first. “Seek ye first the Kingdom of God and His righteousness, and all these other things will be added.”",
      title: "Enticing Spirits", code: "55-0724", paragraph: 44, number: "45",
    },
  },
  "Proverbs 3:5": {
    verse: { reference: "Proverbs 3:5", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
    message: {
      text: "Don’t lean to your own understanding, but lean to His Word.",
      title: "Lean Not Unto Thy Own Understanding", code: "65-0120", paragraph: 232, number: "233",
    },
  },
  "1 Thessalonians 5:16-18": {
    verse: { reference: "1 Thessalonians 5:16-18", text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you." },
    message: {
      text: "Prayer changes things. So always bear that in mind. Pray without ceasing.",
      title: "Jairus, a Secret Believer", code: "55-0604", paragraph: 5, number: "6",
    },
  },
  "Romans 6:23": {
    verse: { reference: "Romans 6:23", text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord." },
    message: {
      text: "It’s God dealing with you. God trying to bring you to something, and you take the devil’s suggestion and go off with it. And that’s the way sorrow comes, that’s how death comes. And that life is not life, it’s death. “For the wages of sin is death; but the gift of God is Eternal Life to them that will receive It.”",
      title: "Life", code: "57-0602", paragraph: 108, number: "109",
    },
  },
  "Matthew 11:28": {
    verse: { reference: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
    message: {
      text: "What is He? The One that comes in you, gives you peace; your sign, your Comforter; comforted, at rest, sealed.",
      title: "What Is the Holy Ghost?", code: "59-1216", paragraph: 89, number: "90",
    },
  },
  "Joshua 1:9": {
    verse: { reference: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
    message: {
      text: "That’s the Scripture that was ringed in my heart when I was sick. It’s been something that’s stuck to me since I was converted. I believe it with all my heart that God is here tonight, and that God is going to do great things.",
      title: "As I Was with Moses", code: "51-0503", paragraph: 68, number: "69",
    },
  },
  "Romans 3:23": {
    verse: { reference: "Romans 3:23", text: "For all have sinned, and come short of the glory of God." },
    message: {
      text: "We are all sinners saved by grace.",
      title: "The Voice of the Sign", code: "64-0214", paragraph: 201, number: "202",
    },
  },
  "Proverbs 18:10": {
    verse: { reference: "Proverbs 18:10", text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe." },
    message: {
      text: "A man has got to want a place of refuge. You’ve got to feel your need of it.",
      title: "Letting off Pressure", code: "63-0113M", paragraph: 88, number: "89",
    },
  },
  "John 10:10": {
    verse: { reference: "John 10:10", text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly." },
    message: {
      text: "That’s what we’re here to seek, Life, and that more abundant. And I pray to God, this morning, in this breakfast that we will have abundance of Life.",
      title: "Show Us the Father and It Will Sufficeth Us", code: "62-0609B", paragraph: 86, number: "87",
    },
  },
  "1 John 1:9": {
    verse: { reference: "1 John 1:9", text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness." },
    message: {
      text: "I made many mistakes, still make them, will always make them. But, when I make them, the Holy Spirit tells me that’s wrong. Then I repent right there, “Lord, forgive me. Didn’t mean to do it. You help me now.” And I walk right on, the same thing.",
      title: "Law or Grace", code: "54-1006", paragraph: 134, number: "135",
    },
  },
  "Hebrews 11:1": {
    verse: { reference: "Hebrews 11:1", text: "Now faith is the substance of things hoped for, the evidence of things not seen." },
    message: {
      text: "Now, faith is the substance. Now, it isn’t just a—a makeup, or a thought, it’s a real substance. It’s something that’s just as real as any other sense of the body.",
      title: "Faith Is the Substance", code: "51-0508", paragraph: 17, number: "18",
    },
  },
  "Psalm 27:1": {
    verse: { reference: "Psalm 27:1", text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?" },
    message: {
      text: "Jesus said, “Fear not.” Don’t be afraid. God keeps His Word.",
      title: "When Divine Love Is Projected, Sovereign Grace Takes Its Place", code: "57-0126E", paragraph: 40, number: "41",
    },
  },
  "Philippians 4:13": {
    verse: { reference: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
    message: {
      text: "You’re just afraid to venture a little bit. Just to say, “Well, I can. I can do all things with Christ Who strengthens me.”",
      title: "At Thy Word", code: "53-0608E", paragraph: 16, number: "17",
    },
  },
  "Galatians 2:20": {
    verse: { reference: "Galatians 2:20", text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me." },
    message: {
      text: "Then, if Christ lives in me, (Ah!) if Christ lives in me, the works of Christ will be done through me. Certainly.",
      title: "Go, Wake Jesus", code: "63-1103", paragraph: 190, number: "191",
    },
  },
  "Isaiah 53:5": {
    verse: { reference: "Isaiah 53:5", text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed." },
    message: {
      text: "We believe that all these great benefits that we enjoy today in this Christian economy we have, was all purchased at Calvary by the Son of God, Jesus Christ.",
      title: "Jesus Christ the Same Yesterday, Today, and Forever", code: "63-0604", paragraph: 3, number: "4",
    },
  },
  "Psalm 100:5": {
    verse: { reference: "Psalm 100:5", text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations." },
    message: {
      text: "Heavenly Father, we thank Thee for all Thy goodness and mercy. We thank Thee, for, You’re still here, right in the midst of all this trouble. In this world that’s perverted, yet You’re here. Let Thy Spirit, Lord, ever remain with us.",
      title: "The Oddball", code: "64-0614E", paragraph: 125, number: "126",
    },
  },
  "Romans 12:2": {
    verse: { reference: "Romans 12:2", text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God." },
    message: {
      text: "Now we want to be transformed, ourselves, by the renewing of our mind.",
      title: "Power of Transformation", code: "65-1031M", paragraph: 58, number: "59",
    },
  },
  "Romans 15:13": {
    verse: { reference: "Romans 15:13", text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost." },
    message: {
      text: "God, give them the Holy Ghost now, fill their hearts with joy and peace, and put their minds upon God’s Word that they might live now and hereafter, forever.",
      title: "Jezebel Religion", code: "61-0319", paragraph: 123, number: "124",
    },
  },
  "Psalm 46:1": {
    verse: { reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
    message: {
      text: "So, it’s good to know God, find God, get on speaking terms with Him while there’s nothing wrong, then in the time of trouble, He’s a very present Help in the time of trouble.",
      title: "As I Thought on My Ways", code: "59-0814", paragraph: 47, number: "48",
    },
  },
  "Hebrews 13:8": {
    verse: { reference: "Hebrews 13:8", text: "Jesus Christ the same yesterday, and to day, and for ever." },
    message: {
      text: "The faith of the weakest, poorest, person in here, tonight, will bring Jesus Christ on the scene. It will. He’s the same yesterday, today, and forever.",
      title: "Jesus Christ the Same Yesterday, Today, and Forever", code: "54-0824", paragraph: 62, number: "63",
    },
  },
  "Ephesians 2:8": {
    verse: { reference: "Ephesians 2:8", text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God." },
    message: {
      text: "Grace is what God does for you. Works is what you do for God, to show appreciation of what God did for you.",
      title: "The Message of Grace", code: "61-0827", paragraph: 56, number: "57",
    },
  },
  "Philippians 4:6": {
    verse: { reference: "Philippians 4:6", text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." },
    message: {
      text: "You’ve got to pray for people. Prayer changes things.",
      title: "A Testimony on the Sea", code: "62-0720", paragraph: 126, number: "127",
    },
  },
  "Proverbs 3:6": {
    verse: { reference: "Proverbs 3:6", text: "In all thy ways acknowledge him, and he shall direct thy paths." },
    message: {
      text: "O Holy Spirit, move freshly in our hearts now. Show us our wrongs, Lord. We don’t…We won’t lean to our own understanding, our own reasoning. But we lean upon You, because we know that we’re standing in Your Divine, vindicated promise of today.",
      title: "Lean Not Unto Thy Own Understanding", code: "65-0120", paragraph: 243, number: "244",
    },
  },
  "2 Corinthians 12:9": {
    verse: { reference: "2 Corinthians 12:9", text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness." },
    message: {
      text: "God can make strength out of weakness! That’s the reason He always does it.",
      title: "Perfect Strength by Perfect Weakness", code: "61-1119", paragraph: 111, number: "112",
    },
  },
  "Isaiah 41:10": {
    verse: { reference: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness." },
    message: {
      text: "Don’t be afraid. Stand on your ground. When God moves, God is God.",
      title: "Do You Now Believe?", code: "55-0610", paragraph: 47, number: "48",
    },
  },
  "1 John 4:19": {
    verse: { reference: "1 John 4:19", text: "We love him, because he first loved us." },
    message: {
      text: "We love Him because He first loved us and gave His life for us.",
      title: "The Resurrection of Jairus' Daughter", code: "54-0331", paragraph: 9, number: "10",
    },
  },
  "Psalm 34:8": {
    verse: { reference: "Psalm 34:8", text: "O taste and see that the LORD is good: blessed is the man that trusteth in him." },
    message: {
      text: "That makes me just feel so good, to know that we have been privileged to do this: come into His wonderful fellowship into Christ.",
      title: "The Believer's Position in Christ", code: "55-0116A", paragraph: 29, number: "30",
    },
  },
  "Genesis 1:1": {
    verse: { reference: "Genesis 1:1", text: "In the beginning God created the heaven and the earth." },
    message: {
      text: "I just believe it. That’s all. God created it. It’s not my business to know. I’m glad He did it, and let me live here for a while.",
      title: "Influence", code: "63-1130B", paragraph: 104, number: "105",
    },
  },
  "John 3:16": {
    verse: { reference: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
    message: {
      text: "And when God projected Himself to the world to save the world, there could be nothing else but sovereign grace to produce a Saviour.",
      title: "Divine Love", code: "57-0305", paragraph: 11, number: "12",
    },
  },
  "Psalm 37:4": {
    verse: { reference: "Psalm 37:4", text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart." },
    message: {
      text: "May God, my brethren, may He give you all the desires of your heart. May you serve Him all the days, and have power of God in your lives, to minister to this fine bunch of people.",
      title: "Possessing the Gate of the Enemy after Trial", code: "64-0322", paragraph: 188, number: "189",
    },
  },
  "John 14:6": {
    verse: { reference: "John 14:6", text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me." },
    message: {
      text: "You listen to that warning of the Holy Ghost, tonight, that’s warning you, “I am the Way, the Truth, and the Life; no man cometh unto the Father, but by Me.” And He is the Word.",
      title: "Thirst", code: "65-0919", paragraph: 230, number: "231",
    },
  },
  "Hebrews 4:12": {
    verse: { reference: "Hebrews 4:12", text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart." },
    message: {
      text: "Think of that! The Word of God is That, a Discerner of the intents of the heart.",
      title: "Perfect Faith", code: "63-0825E", paragraph: 158, number: "159",
    },
  },
  "James 4:8": {
    verse: { reference: "James 4:8", text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded." },
    message: {
      text: "Now, as I said, we all are trying to come closer to God.",
      title: "The Stature of a Perfect Man", code: "62-1014M", paragraph: 50, number: "51",
    },
  },
  "Psalm 19:14": {
    verse: { reference: "Psalm 19:14", text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer." },
    message: {
      text: "I commit them to You now. “Take these few words and the meditation of my heart, and may it be acceptable in Thy sight, O Lord.”",
      title: "The Flashing Red Light of the Sign of His Coming", code: "63-0623E", paragraph: 200, number: "201",
    },
  },
  "Isaiah 26:3": {
    verse: { reference: "Isaiah 26:3", text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee." },
    message: {
      text: "Keep us in perfect peace, Lord, as our hearts are stayed on You.",
      title: "The Queen of Sheba", code: "58-0107", paragraph: 0, number: "1",
    },
  },
  "Jeremiah 29:11": {
    verse: { reference: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." },
    message: {
      text: "And He promised that He would return and bring the people, from scattered all over the earth, after those seventy years, back into Jerusalem where they left from; and He did it just that way.",
      title: "Desperations", code: "63-0901E", paragraph: 43, number: "44",
    },
  },
  "James 1:2": {
    verse: { reference: "James 1:2", text: "My brethren, count it all joy when ye fall into divers temptations;" },
    message: {
      text: "Trials to try our faith. Isn’t that marvelous, God would give us those trials and tests to prove us?",
      title: "An Ensign", code: "53-0606", paragraph: 6, number: "7",
    },
  },
  "Isaiah 40:31": {
    verse: { reference: "Isaiah 40:31", text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
    message: {
      text: "Give to them faith tonight, Lord, and may they be certain that every promise of God is true, if they’ll only wait.",
      title: "Be Certain of God", code: "59-0708E", paragraph: 101, number: "102",
    },
  },
} satisfies Record<string, DailyReading>;

const calendar: (keyof typeof readings)[] = [
  "Psalm 119:105", "1 Peter 5:7", "Romans 8:28", "1 Corinthians 13:4", "2 Corinthians 5:17", "Psalm 23:1",
  "Galatians 5:22-23", "Matthew 28:19", "Romans 8:28", "John 8:32", "2 Timothy 1:7", "Micah 6:8",
  "Revelation 3:20", "Matthew 6:33", "Proverbs 3:5", "1 Thessalonians 5:16-18", "Romans 6:23", "Matthew 11:28",
  "Psalm 119:105", "Joshua 1:9", "Romans 3:23", "Proverbs 18:10", "John 10:10", "Proverbs 18:10",
  "Matthew 28:19", "1 John 1:9", "Romans 3:23", "Matthew 28:19", "Joshua 1:9", "Hebrews 11:1",
  "Matthew 6:33", "Proverbs 3:5", "Psalm 27:1", "Romans 6:23", "Philippians 4:13", "Galatians 2:20",
  "Micah 6:8", "Micah 6:8", "John 10:10", "Proverbs 3:5", "Isaiah 53:5", "1 Thessalonians 5:16-18",
  "Proverbs 3:5", "Philippians 4:13", "Romans 3:23", "Psalm 100:5", "Psalm 27:1", "Romans 12:2",
  "Romans 15:13", "Psalm 46:1", "Hebrews 13:8", "Ephesians 2:8", "Philippians 4:13", "Philippians 4:6",
  "Proverbs 3:6", "2 Corinthians 12:9", "Proverbs 3:6", "Romans 6:23", "Isaiah 41:10", "Isaiah 41:10",
  "Micah 6:8", "Proverbs 18:10", "John 8:32", "2 Timothy 1:7", "Ephesians 2:8", "Psalm 23:1",
  "2 Timothy 1:7", "Hebrews 13:8", "Philippians 4:13", "Romans 15:13", "1 John 4:19", "Psalm 34:8",
  "2 Corinthians 12:9", "Ephesians 2:8", "Isaiah 53:5", "John 8:32", "Genesis 1:1", "Romans 15:13",
  "Romans 3:23", "Galatians 5:22-23", "Philippians 4:6", "Romans 6:23", "Isaiah 53:5", "Isaiah 53:5",
  "Proverbs 3:6", "Philippians 4:13", "2 Corinthians 12:9", "Proverbs 3:6", "Proverbs 3:5", "2 Corinthians 12:9",
  "John 3:16", "Galatians 2:20", "Philippians 4:6", "Psalm 46:1", "Psalm 100:5", "John 8:32",
  "1 Peter 5:7", "John 8:32", "Philippians 4:13", "Galatians 2:20", "1 John 4:19", "Philippians 4:6",
  "2 Corinthians 12:9", "John 3:16", "Psalm 37:4", "John 14:6", "Romans 12:2", "Joshua 1:9",
  "1 Thessalonians 5:16-18", "Hebrews 11:1", "Hebrews 4:12", "Romans 6:23", "Philippians 4:6", "Matthew 28:19",
  "Galatians 2:20", "Matthew 6:33", "Joshua 1:9", "James 4:8", "Proverbs 3:6", "Matthew 11:28",
  "Matthew 28:19", "Matthew 11:28", "John 14:6", "1 John 1:9", "Matthew 11:28", "Micah 6:8",
  "James 4:8", "John 14:6", "Matthew 6:33", "1 John 1:9", "1 John 4:19", "Psalm 19:14",
  "Isaiah 41:10", "Proverbs 3:5", "Genesis 1:1", "Matthew 28:19", "Isaiah 26:3", "Romans 6:23",
  "1 Peter 5:7", "Matthew 6:33", "Psalm 34:8", "Psalm 34:8", "Matthew 6:33", "1 Thessalonians 5:16-18",
  "1 Thessalonians 5:16-18", "Joshua 1:9", "Psalm 37:4", "James 4:8", "1 John 4:19", "John 14:6",
  "James 4:8", "1 John 4:19", "Isaiah 41:10", "Philippians 4:13", "John 14:6", "1 John 4:19",
  "Proverbs 18:10", "Micah 6:8", "Psalm 100:5", "Matthew 6:33", "Galatians 5:22-23", "John 10:10",
  "Psalm 119:105", "Psalm 19:14", "1 Corinthians 13:4", "John 10:10", "Psalm 37:4", "Psalm 100:5",
  "Psalm 119:105", "2 Timothy 1:7", "1 John 1:9", "Matthew 28:19", "Matthew 28:19", "Proverbs 18:10",
  "Isaiah 26:3", "Isaiah 41:10", "Matthew 28:19", "Psalm 19:14", "Romans 3:23", "Psalm 100:5",
  "1 Peter 5:7", "Psalm 100:5", "Matthew 28:19", "Psalm 19:14", "Romans 8:28", "1 John 1:9",
  "Proverbs 18:10", "Hebrews 13:8", "Romans 6:23", "Psalm 19:14", "1 John 1:9", "1 Peter 5:7",
  "James 4:8", "Genesis 1:1", "1 Corinthians 13:4", "Romans 3:23", "Isaiah 26:3", "Joshua 1:9",
  "Isaiah 41:10", "Psalm 37:4", "Hebrews 4:12", "Joshua 1:9", "Romans 6:23", "Romans 8:28",
  "John 10:10", "Matthew 11:28", "Psalm 119:105", "Romans 3:23", "Joshua 1:9", "Ephesians 2:8",
  "Jeremiah 29:11", "Romans 8:28", "Isaiah 41:10", "Galatians 2:20", "Romans 12:2", "Joshua 1:9",
  "Psalm 37:4", "Matthew 28:19", "Hebrews 11:1", "1 Corinthians 13:4", "1 John 4:19", "Romans 6:23",
  "John 8:32", "Romans 6:23", "Ephesians 2:8", "John 3:16", "Romans 3:23", "Philippians 4:13",
  "James 1:2", "Philippians 4:13", "Philippians 4:13", "Romans 12:2", "Romans 15:13", "Matthew 11:28",
  "Isaiah 26:3", "Hebrews 4:12", "Proverbs 3:6", "Matthew 11:28", "Isaiah 53:5", "Romans 12:2",
  "Psalm 34:8", "Joshua 1:9", "Revelation 3:20", "James 1:2", "Isaiah 26:3", "Proverbs 3:5",
  "Isaiah 26:3", "Proverbs 18:10", "Isaiah 26:3", "Hebrews 11:1", "1 Peter 5:7", "Proverbs 18:10",
  "1 Thessalonians 5:16-18", "Romans 15:13", "Galatians 2:20", "Matthew 28:19", "Matthew 11:28", "Proverbs 3:6",
  "Romans 15:13", "Psalm 19:14", "James 4:8", "Matthew 11:28", "Romans 8:28", "Psalm 100:5",
  "Isaiah 41:10", "John 3:16", "Galatians 5:22-23", "Isaiah 41:10", "Hebrews 4:12", "James 1:2",
  "Revelation 3:20", "Proverbs 18:10", "John 8:32", "John 10:10", "Romans 8:28", "John 14:6",
  "Romans 3:23", "James 1:2", "1 Thessalonians 5:16-18", "Micah 6:8", "Hebrews 11:1", "Psalm 19:14",
  "John 14:6", "Hebrews 13:8", "James 4:8", "Genesis 1:1", "Genesis 1:1", "Romans 6:23",
  "Proverbs 18:10", "James 4:8", "Philippians 4:6", "John 3:16", "Romans 8:28", "James 4:8",
  "James 1:2", "Proverbs 18:10", "Galatians 2:20", "1 Corinthians 13:4", "Romans 3:23", "John 10:10",
  "John 10:10", "Isaiah 26:3", "John 8:32", "Romans 15:13", "Psalm 27:1", "Matthew 11:28",
  "Matthew 28:19", "Romans 15:13", "Matthew 11:28", "Hebrews 13:8", "James 4:8", "Romans 8:28",
  "1 Peter 5:7", "John 8:32", "Hebrews 13:8", "Romans 3:23", "Psalm 23:1", "Psalm 27:1",
  "Isaiah 53:5", "Romans 15:13", "Hebrews 4:12", "1 Corinthians 13:4", "Romans 6:23", "John 10:10",
  "Isaiah 41:10", "1 John 4:19", "Proverbs 3:5", "Isaiah 40:31", "1 Peter 5:7", "1 Peter 5:7",
  "1 Peter 5:7", "Ephesians 2:8", "Psalm 100:5", "Proverbs 18:10", "Psalm 37:4", "Psalm 46:1",
  "Psalm 27:1", "Jeremiah 29:11", "2 Timothy 1:7", "Isaiah 26:3", "Ephesians 2:8", "James 1:2",
  "1 Peter 5:7", "John 14:6", "Psalm 46:1", "Philippians 4:13", "Psalm 37:4", "Philippians 4:6",
  "Matthew 6:33", "Micah 6:8", "Hebrews 4:12", "Jeremiah 29:11", "Romans 8:28", "Psalm 100:5",
  "Proverbs 3:6", "Matthew 6:33", "1 John 4:19", "Psalm 27:1", "Psalm 119:105", "Psalm 46:1",
  "Romans 12:2", "Isaiah 53:5", "James 1:2", "John 3:16", "Proverbs 3:6", "Psalm 27:1",
];

export function getReadingForDate(date: Date): DailyReading {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayIndex = differenceInCalendarDays(startOfDay(date), startOfYear);
  return readings[calendar[dayIndex]];
}
