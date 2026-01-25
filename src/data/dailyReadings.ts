import { differenceInCalendarDays, startOfDay } from "date-fns";

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
  {
    verse: {
      text: "Thy word is a lamp unto my feet, and a light unto my path.",
      reference: "Psalm 119:105",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Matthew points back to Isaiah's promise of Immanuel.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "Be still and know that He is God; He is in control.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,",
      reference: "1 Corinthians 13:4",
    },
    message: {
      text: "Though darkness rose, the Holy Ghost kept lighting the next lamp. The same Spirit that started the Church keeps it burning until the Bride is called out.",
      reference: "William Branham — The Seven Church Ages",
    },
  },
  {
    verse: {
      text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
      reference: "2 Corinthians 5:17",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my shepherd; I shall not want.",
      reference: "Psalm 23:1",
    },
    message: {
      text: "Walk in the light of His Word today and find peace for your soul.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.",
      reference: "Galatians 5:22-23",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "So cast away your condemnation. Look to Jesus, the Author and Finisher of our faith. His grace is sufficient, and His strength is made perfect in weakness.",
      reference: "William Branham — The Message of Grace",
    },
  },
  {
    verse: {
      text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
      reference: "2 Timothy 1:7",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "If the Word finds good ground, it will reproduce exactly what God said. Healing will heal, salvation will save, and deliverance will deliver—because the Original Seed never fails.",
      reference: "William Branham — The Spoken Word Is The Original Seed",
    },
  },
  {
    verse: {
      text: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.",
      reference: "Revelation 3:20",
    },
    message: {
      text: "Walk in the light of His Word today and find peace for your soul.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "Paul said the trumpet will sound and the dead in Christ shall rise first. That promise is as sure as the God who spoke it.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
      reference: "1 Thessalonians 5:16-18",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "David's prophecy of the Holy One not seeing decay is fulfilled in Jesus.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Thy word is a lamp unto my feet, and a light unto my path.",
      reference: "Psalm 119:105",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "John confirms Zechariah's prophecy of the pierced One.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "Reveals that the mystery of Christ dwelling in believers is accessed by faith accepting the revealed Word.",
      reference: "William Branham — Christ Is The Mystery Of God Revealed",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Those once not a people become God's people through mercy.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "Bethlehem is identified as the birthplace of the Messiah.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      reference: "1 John 1:9",
    },
    message: {
      text: "The ancient serpent is revealed and defeated in the end times.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "The new covenant promised through Jeremiah is established in Christ.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "Identifies Laodicea as the present age and calls believers to overcome and share Christ's throne.",
      reference: "William Branham — The Seven Church Ages",
    },
  },
  {
    verse: {
      text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      reference: "Hebrews 11:1",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "Jesus announces the year of the Lord's favor in His ministry.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
      reference: "Psalm 27:1",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "Some people fear they cannot hold out, but grace is not you holding on to God. Grace is God holding on to you, keeping you by His Spirit until the day of redemption.",
      reference: "William Branham — The Message of Grace",
    },
  },
  {
    verse: {
      text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
      reference: "Galatians 2:20",
    },
    message: {
      text: "Prayer changes things because it touches the heart of God.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "The Holy Spirit is your comforter and guide in all truth.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "Thank you, Brother Neville. The Lord bless you. We approach sacred ground this morning, speaking on the mystery hidden from the foundation of the world.",
      reference: "William Branham — Christ Is The Mystery Of God Revealed",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
      reference: "Isaiah 53:5",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
      reference: "1 Thessalonians 5:16-18",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "God's word is a sharp sword that discerns the heart.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "Christ became a curse for us, fulfilling the law's statement.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
      reference: "Psalm 27:1",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
      reference: "Romans 12:2",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "Explains the secret catching away of the Bride and the signs showing the season of His coming.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "God is our refuge and strength, a very present help in trouble.",
      reference: "Psalm 46:1",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus Christ the same yesterday, and to day, and for ever.",
      reference: "Hebrews 13:8",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      reference: "Ephesians 2:8",
    },
    message: {
      text: "Jesus identifies Himself with the I AM revealed to Moses.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      reference: "Philippians 4:6",
    },
    message: {
      text: "Jesus reads Isaiah to declare His mission to the poor and captive.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.",
      reference: "2 Corinthians 12:9",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "Ephesus, Smyrna, Pergamos, Thyatira, Sardis, Philadelphia, and Laodicea—each received a portion of the Word, and each messenger echoed the Life of Christ to his age.",
      reference: "William Branham — The Seven Church Ages",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "The virgin birth prophecy is fulfilled in Jesus' birth.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "By His stripes we are healed through Christ's suffering.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "Boast only in the Lord's wisdom and righteousness.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "God calls His Son out of Egypt through Jesus' return.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "Trust God's timing; He is never late and never early.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
      reference: "2 Timothy 1:7",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      reference: "Ephesians 2:8",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my shepherd; I shall not want.",
      reference: "Psalm 23:1",
    },
    message: {
      text: "Walk in the light of His Word today and find peace for your soul.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
      reference: "2 Timothy 1:7",
    },
    message: {
      text: "The Holy Spirit is your comforter and guide in all truth.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus Christ the same yesterday, and to day, and for ever.",
      reference: "Hebrews 13:8",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "Stephen sees the Son of Man standing at God's right hand.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "Prayer changes things because it touches the heart of God.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "Faith is not a feeling; it is an anchor that holds within the veil.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
      reference: "Psalm 34:8",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.",
      reference: "2 Corinthians 12:9",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      reference: "Ephesians 2:8",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
      reference: "Isaiah 53:5",
    },
    message: {
      text: "God sees the heart; keep yours pure and open to Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In the beginning God created the heaven and the earth.",
      reference: "Genesis 1:1",
    },
    message: {
      text: "John the Baptist prepares the way for the Lord.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "Faith is birthed through hearing God's word.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "The unbelief of Israel fulfills Isaiah's lament.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.",
      reference: "Galatians 5:22-23",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      reference: "Philippians 4:6",
    },
    message: {
      text: "Every eye will see the One who was pierced.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
      reference: "Isaiah 53:5",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
      reference: "Isaiah 53:5",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "The bronze serpent foreshadows Christ lifted up for salvation.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.",
      reference: "2 Corinthians 12:9",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "The Lord as light and salvation points to Jesus the Light of the world.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "Both passages declare God's eternal existence and role in creation.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.",
      reference: "2 Corinthians 12:9",
    },
    message: {
      text: "Christ is declared the eternal priest after the order of Melchizedek.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reference: "John 3:16",
    },
    message: {
      text: "Encourages believers to let the spoken Word take root, producing healing as promised.",
      reference: "William Branham — The Spoken Word Is The Original Seed",
    },
  },
  {
    verse: {
      text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
      reference: "Galatians 2:20",
    },
    message: {
      text: "David's suffering foreshadows Jesus receiving vinegar and gall.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      reference: "Philippians 4:6",
    },
    message: {
      text: "Moses' prophecy of a coming Prophet is fulfilled in Jesus.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "God is our refuge and strength, a very present help in trouble.",
      reference: "Psalm 46:1",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Trust God's timing; He is never late and never early.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "God sees the heart; keep yours pure and open to Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
      reference: "Galatians 2:20",
    },
    message: {
      text: "Peter interprets Pentecost through Joel's prophecy.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "John the Baptist prepares the way of the Lord.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      reference: "Philippians 4:6",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.",
      reference: "2 Corinthians 12:9",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reference: "John 3:16",
    },
    message: {
      text: "God declares Jesus as His Son, fulfilling the Davidic covenant.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      reference: "Psalm 37:4",
    },
    message: {
      text: "Those in darkness see the great light of Christ's ministry.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
      reference: "Romans 12:2",
    },
    message: {
      text: "Be still and know that He is God; He is in control.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
      reference: "1 Thessalonians 5:16-18",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      reference: "Hebrews 11:1",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
      reference: "Hebrews 4:12",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "The Lamb of God fulfills Isaiah's suffering servant imagery.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      reference: "Philippians 4:6",
    },
    message: {
      text: "Christ is before all things and holds creation together.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
      reference: "Galatians 2:20",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "Grace is God doing for you what you cannot do for yourself.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Jesus told us that the seed is the Word. Every promise God uttered carries His own life inside of it, waiting on fertile ground where faith will let it blossom.",
      reference: "William Branham — The Spoken Word Is The Original Seed",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "All the fullness of God was pleased to dwell in Jesus Christ. He is the expressed image of the invisible God, and the Bible unfolds Him from Genesis to Revelation.",
      reference: "William Branham — Christ Is The Mystery Of God Revealed",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "We stand in Laodicea, the age of rights and lukewarmness, yet Christ is still knocking. He wants to step inside and sup with anyone who will open the door.",
      reference: "William Branham — The Seven Church Ages",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Reveals that the Holy Spirit indwells the Bride, manifesting the Life of Christ again on earth.",
      reference: "William Branham — Christ Is The Mystery Of God Revealed",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "David speaks of the Lord exalted at God's right hand.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      reference: "1 John 1:9",
    },
    message: {
      text: "Jesus entrusts His spirit to the Father using David's prayer.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Peter quotes David concerning the resurrection hope.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "Matthew cites Isaiah concerning the voice in the wilderness.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      reference: "1 John 1:9",
    },
    message: {
      text: "The Root of Jesse is the hope for the nations.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "The chosen cornerstone is laid in Zion and fulfilled in Christ.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
      reference: "Psalm 19:14",
    },
    message: {
      text: "Creation is understood by faith in God's spoken word.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In the beginning God created the heaven and the earth.",
      reference: "Genesis 1:1",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "God proclaims the Sonship of Jesus.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "We turn tonight to the Book of Revelation, to the messages of the seven golden candlesticks. Each age shows Christ walking among His people.",
      reference: "William Branham — The Seven Church Ages",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Trust God's timing; He is never late and never early.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
      reference: "Psalm 34:8",
    },
    message: {
      text: "Jesus' cry from the cross recalls David's lament.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
      reference: "Psalm 34:8",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
      reference: "1 Thessalonians 5:16-18",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
      reference: "1 Thessalonians 5:16-18",
    },
    message: {
      text: "Faith is not a feeling; it is an anchor that holds within the veil.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      reference: "Psalm 37:4",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Trust God's timing; He is never late and never early.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "If He gave His Son while we were enemies, how much more will He freely give all things now that we are His children? Grace opens the door for every promise we claim.",
      reference: "William Branham — The Message of Grace",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "God writes His law on hearts through the Holy Spirit.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "Grace is God doing for you what you cannot do for yourself.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "Highlights that grace prepares and keeps the Bride ready for the catching away.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "Jonah's three days foreshadow Christ's burial and resurrection.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "Some questions deal with daily living—marriage, family, and conduct. Remember, the token is love: love for God, love for your spouse, love for the brethren.",
      reference: "William Branham — Questions and Answers",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "Therefore, the aim of every sermon, every song, and every testimony is to bring people to that personal union with Christ. Once He lives inside, the mystery is solved for you.",
      reference: "William Branham — Christ Is The Mystery Of God Revealed",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Jesus affirms the greatest commandment to love the Lord fully.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "Death is swallowed up in victory through Christ's resurrection.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "Prayer changes things because it touches the heart of God.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "Grace is God doing for you what you cannot do for yourself.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.",
      reference: "Galatians 5:22-23",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "Everyone who calls on the Lord will be saved.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Thy word is a lamp unto my feet, and a light unto my path.",
      reference: "Psalm 119:105",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
      reference: "Psalm 19:14",
    },
    message: {
      text: "Faith is not a feeling; it is an anchor that holds within the veil.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,",
      reference: "1 Corinthians 13:4",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "Be still and know that He is God; He is in control.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      reference: "Psalm 37:4",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "All things were created by and for Christ, echoing the creation account.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Thy word is a lamp unto my feet, and a light unto my path.",
      reference: "Psalm 119:105",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
      reference: "2 Timothy 1:7",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      reference: "1 John 1:9",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "The declaration of God's Son is applied to Christ's resurrection.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "The rebuilding of David's fallen tent includes the Gentiles.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
      reference: "Psalm 19:14",
    },
    message: {
      text: "John the Baptist comes in the spirit of Elijah.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "Christ is the chief cornerstone rejected by builders.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "Gabriel announces Jesus as the heir to David's throne.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "The signs of the time show us we are at the evening hour. Israel is in her homeland, the church ages are fulfilled, and the Bride is trimming her lamp.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
      reference: "Psalm 19:14",
    },
    message: {
      text: "I want to speak about the blessed hope of the Church—the catching away of the Bride to meet her Lord in the air.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "Trust God's timing; He is never late and never early.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      reference: "1 John 1:9",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Pierced hands and feet are fulfilled in Christ's crucifixion.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Jesus Christ the same yesterday, and to day, and for ever.",
      reference: "Hebrews 13:8",
    },
    message: {
      text: "Grace is God doing for you what you cannot do for yourself.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "God provides the Lamb in Christ, the sacrifice for the world.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
      reference: "Psalm 19:14",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      reference: "1 John 1:9",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Jesus' triumphal entry fulfills Zechariah's vision.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "In the beginning God created the heaven and the earth.",
      reference: "Genesis 1:1",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,",
      reference: "1 Corinthians 13:4",
    },
    message: {
      text: "The Holy Spirit is your comforter and guide in all truth.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "Be still and know that He is God; He is in control.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      reference: "Psalm 37:4",
    },
    message: {
      text: "Jesus identifies John the Baptist with Malachi's messenger.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
      reference: "Hebrews 4:12",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "Be still and know that He is God; He is in control.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "The Servant of the Lord brings justice to the nations.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Eternal life offered in Christ is the gift promised to believers.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Thy word is a lamp unto my feet, and a light unto my path.",
      reference: "Psalm 119:105",
    },
    message: {
      text: "The Great Commission is empowered by the promise of the Spirit.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "Jesus quotes David's lament from the cross.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      reference: "Ephesians 2:8",
    },
    message: {
      text: "Believing in Christ brings the right to become the children of God.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
      reference: "Jeremiah 29:11",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "May every answer tonight draw you closer to Christ. If one remains unsettled, stay reverent and wait on Him—He will make all things plain in His time.",
      reference: "William Branham — Questions and Answers",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "God sees the heart; keep yours pure and open to Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
      reference: "Galatians 2:20",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
      reference: "Romans 12:2",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      reference: "Psalm 37:4",
    },
    message: {
      text: "God sees the heart; keep yours pure and open to Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "The promised child and everlasting kingdom belong to Jesus.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      reference: "Hebrews 11:1",
    },
    message: {
      text: "Be still and know that He is God; He is in control.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,",
      reference: "1 Corinthians 13:4",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "Do not look for a public parade. The Rapture is a revelation to the Bride. She hears the secret call and slips away while the world goes on unaware.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      reference: "Ephesians 2:8",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reference: "John 3:16",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "My brethren, count it all joy when ye fall into divers temptations;",
      reference: "James 1:2",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "Brother Branham teaches that grace flowed from God's love, inviting believers to reflect that same love toward others.",
      reference: "William Branham — The Message of Grace",
    },
  },
  {
    verse: {
      text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
      reference: "Romans 12:2",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "Walk in the light of His Word today and find peace for your soul.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "The Shepherd is struck and the sheep scatter as Jesus is arrested.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
      reference: "Hebrews 4:12",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
      reference: "Isaiah 53:5",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
      reference: "Romans 12:2",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
      reference: "Psalm 34:8",
    },
    message: {
      text: "Philip explains Isaiah's prophecy of the suffering servant.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      reference: "Joshua 1:9",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.",
      reference: "Revelation 3:20",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "My brethren, count it all joy when ye fall into divers temptations;",
      reference: "James 1:2",
    },
    message: {
      text: "When believers sincerely ask, God honors that hunger. The Bible holds the pattern, and the Holy Spirit will always guide us back to what is written.",
      reference: "William Branham — Questions and Answers",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "Scripture testifies of Christ from Moses through the prophets.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "God turns what is meant for evil into good for His people.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      reference: "Hebrews 11:1",
    },
    message: {
      text: "They look upon the One they pierced at the crucifixion.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Jesus identifies with the children God has given Him.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
      reference: "1 Thessalonians 5:16-18",
    },
    message: {
      text: "Walk in the light of His Word today and find peace for your soul.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "The righteous live by faith, a theme Paul expounds.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
      reference: "Galatians 2:20",
    },
    message: {
      text: "The new creation fulfills God's promise of new hearts.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "The Lion of Judah triumphs, fulfilling Jacob's blessing.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "Faith is not a feeling; it is an anchor that holds within the veil.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "God's people are called a royal priesthood and holy nation.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
      reference: "Psalm 19:14",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "Hold to the Word. Stay humble. Let Christ live through you, and the world will know that Jesus Christ is the same yesterday, today, and forever.",
      reference: "William Branham — Christ Is The Mystery Of God Revealed",
    },
  },
  {
    verse: {
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reference: "John 3:16",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.",
      reference: "Galatians 5:22-23",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "Galilee of the nations sees the light foretold by Isaiah.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
      reference: "Hebrews 4:12",
    },
    message: {
      text: "When the Word is spoken in season, the Holy Spirit broods over it just like in the beginning. That same creative presence wants to bring forth sons and daughters who believe.",
      reference: "William Branham — The Spoken Word Is The Original Seed",
    },
  },
  {
    verse: {
      text: "My brethren, count it all joy when ye fall into divers temptations;",
      reference: "James 1:2",
    },
    message: {
      text: "Christ fulfills the Law and becomes the righteousness for believers.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.",
      reference: "Revelation 3:20",
    },
    message: {
      text: "Let that amazing grace soften your heart for others. Freely you have received; now freely give, reflecting the same mercy the Father showed to you.",
      reference: "William Branham — The Message of Grace",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Walk in the light of His Word today and find peace for your soul.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "When you receive the new birth, it is God unveiling Himself in flesh again. Every age, He reveals a little more of that mystery until it stands completed in the end-time Bride.",
      reference: "William Branham — Christ Is The Mystery Of God Revealed",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "The promised seed of the woman arrives in the fullness of time.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "My brethren, count it all joy when ye fall into divers temptations;",
      reference: "James 1:2",
    },
    message: {
      text: "The spoken Word becomes effective when mixed with faith in the hearer's heart, producing God's promises.",
      reference: "William Branham — The Spoken Word Is The Original Seed",
    },
  },
  {
    verse: {
      text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
      reference: "1 Thessalonians 5:16-18",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      reference: "Hebrews 11:1",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
      reference: "Psalm 19:14",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "Faith is not a feeling; it is an anchor that holds within the veil.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus Christ the same yesterday, and to day, and for ever.",
      reference: "Hebrews 13:8",
    },
    message: {
      text: "Be still and know that He is God; He is in control.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Faith is not a feeling; it is an anchor that holds within the veil.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In the beginning God created the heaven and the earth.",
      reference: "Genesis 1:1",
    },
    message: {
      text: "Faith is not a feeling; it is an anchor that holds within the veil.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In the beginning God created the heaven and the earth.",
      reference: "Genesis 1:1",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Jesus is the Good Shepherd who cares for His flock.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      reference: "Philippians 4:6",
    },
    message: {
      text: "Christ's wounds bring healing, fulfilling Isaiah's prophecy.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reference: "John 3:16",
    },
    message: {
      text: "God's word is a seed; plant it in your heart and watch it grow.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "The sign of Jonah foreshadows Jesus' resurrection.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "My brethren, count it all joy when ye fall into divers temptations;",
      reference: "James 1:2",
    },
    message: {
      text: "God's promises are true and faithful for every season of your life.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "Walk in the light of His Word today and find peace for your soul.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
      reference: "Galatians 2:20",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,",
      reference: "1 Corinthians 13:4",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "The chief priests recall Micah's prophecy about Bethlehem.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "Shows the Holy Ghost walking in every age, lighting the candlesticks and leading the church.",
      reference: "William Branham — The Seven Church Ages",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
      reference: "Psalm 27:1",
    },
    message: {
      text: "God sees the heart; keep yours pure and open to Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
      reference: "Matthew 28:19",
    },
    message: {
      text: "Abraham's faith is celebrated in offering Isaac.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "Every step of faith is a step toward your destiny.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      reference: "Matthew 11:28",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus Christ the same yesterday, and to day, and for ever.",
      reference: "Hebrews 13:8",
    },
    message: {
      text: "The new covenant promise is fulfilled in believers' hearts.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
      reference: "James 4:8",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And ye shall know the truth, and the truth shall make you free.",
      reference: "John 8:32",
    },
    message: {
      text: "So take heed to what the Spirit says to the churches. Overcomers are promised a throne, hidden manna, a new name, and a share in the Morning Star Himself.",
      reference: "William Branham — The Seven Church Ages",
    },
  },
  {
    verse: {
      text: "Jesus Christ the same yesterday, and to day, and for ever.",
      reference: "Hebrews 13:8",
    },
    message: {
      text: "The humble King enters Jerusalem on a donkey.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For all have sinned, and come short of the glory of God.",
      reference: "Romans 3:23",
    },
    message: {
      text: "The joy of the Lord is your strength; lean on Him.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my shepherd; I shall not want.",
      reference: "Psalm 23:1",
    },
    message: {
      text: "Hope in God does not disappoint; He is faithful.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
      reference: "Psalm 27:1",
    },
    message: {
      text: "Abraham's faith is counted as righteousness.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
      reference: "Isaiah 53:5",
    },
    message: {
      text: "Prayer changes things because it touches the heart of God.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      reference: "Romans 15:13",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
      reference: "Hebrews 4:12",
    },
    message: {
      text: "Trust God's timing; He is never late and never early.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,",
      reference: "1 Corinthians 13:4",
    },
    message: {
      text: "Trust God's timing; He is never late and never early.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      reference: "Romans 6:23",
    },
    message: {
      text: "So comfort one another with these words. Live ready, keep the Token applied, and watch the eastern sky—our redemption draweth nigh.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.",
      reference: "John 10:10",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
      reference: "Isaiah 41:10",
    },
    message: {
      text: "Forgiveness is the key that unlocks the door to freedom.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "Cast your cares on Him, for He cares affectionately for you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      reference: "Proverbs 3:5",
    },
    message: {
      text: "You are loved with an everlasting love that never fails.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
      reference: "Isaiah 40:31",
    },
    message: {
      text: "Love is the greatest commandment; let it rule your heart.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Now in Saint John 3:16 we read how God so loved the world that He gave His only begotten Son. Love moved first; grace made the approach before we could even call.",
      reference: "William Branham — The Message of Grace",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      reference: "Ephesians 2:8",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "The Son of Man is enthroned at the Father's right hand.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      reference: "Proverbs 18:10",
    },
    message: {
      text: "His mercies are new every morning; embrace this new day.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      reference: "Psalm 37:4",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "God is our refuge and strength, a very present help in trouble.",
      reference: "Psalm 46:1",
    },
    message: {
      text: "Explains grace as God's initiative—He loved us first, saves us, and keeps us by His power.",
      reference: "William Branham — The Message of Grace",
    },
  },
  {
    verse: {
      text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
      reference: "Psalm 27:1",
    },
    message: {
      text: "God's love is demonstrated through Christ's sacrificial death.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
      reference: "Jeremiah 29:11",
    },
    message: {
      text: "The promised eternal throne of David is given to Jesus.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
      reference: "2 Timothy 1:7",
    },
    message: {
      text: "The sending of the Son reveals the fullness of God's love.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      reference: "Isaiah 26:3",
    },
    message: {
      text: "The Branch from Jesse is fulfilled as Jesus is called a Nazarene.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      reference: "Ephesians 2:8",
    },
    message: {
      text: "Practical answers emphasize love as the token—guiding family life, fellowship, and daily conduct.",
      reference: "William Branham — Questions and Answers",
    },
  },
  {
    verse: {
      text: "My brethren, count it all joy when ye fall into divers temptations;",
      reference: "James 1:2",
    },
    message: {
      text: "Seek first the Kingdom, and everything else will fall into place.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Casting all your care upon him; for he careth for you.",
      reference: "1 Peter 5:7",
    },
    message: {
      text: "Prayer changes things because it touches the heart of God.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
      reference: "John 14:6",
    },
    message: {
      text: "A new heart and new creation life come through the Spirit.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "God is our refuge and strength, a very present help in trouble.",
      reference: "Psalm 46:1",
    },
    message: {
      text: "God's promise of His presence brings courage and confidence.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "Let His grace be sufficient for every challenge you face today.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      reference: "Psalm 37:4",
    },
    message: {
      text: "All nations are blessed through Abraham's seed.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      reference: "Philippians 4:6",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "Grace is God doing for you what you cannot do for yourself.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
      reference: "Micah 6:8",
    },
    message: {
      text: "Every knee bows and tongue confesses Jesus as Lord.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
      reference: "Hebrews 4:12",
    },
    message: {
      text: "Be holy, for the Lord is holy.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
      reference: "Jeremiah 29:11",
    },
    message: {
      text: "The promise to Abraham's seed is fulfilled in Christ.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "Christ our Passover Lamb brings deliverance through His blood.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
      reference: "Psalm 100:5",
    },
    message: {
      text: "Let your light shine so others may see His glory in you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "God is working all things together for your good.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
      reference: "Matthew 6:33",
    },
    message: {
      text: "The outpouring of the Spirit at Pentecost fulfills Joel's prophecy.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "We love him, because he first loved us.",
      reference: "1 John 4:19",
    },
    message: {
      text: "Jesus applies Zechariah's prophecy to His arrest and the disciples' flight.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
      reference: "Psalm 27:1",
    },
    message: {
      text: "Every step of faith is a step toward your destiny.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "Thy word is a lamp unto my feet, and a light unto my path.",
      reference: "Psalm 119:105",
    },
    message: {
      text: "Mark introduces the gospel with Isaiah's promise of a messenger.",
      reference: "Scripture Insight",
    },
  },
  {
    verse: {
      text: "God is our refuge and strength, a very present help in trouble.",
      reference: "Psalm 46:1",
    },
    message: {
      text: "Every step of faith is a step toward your destiny.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
      reference: "Romans 12:2",
    },
    message: {
      text: "Stand firm in the faith; victory is already yours in Christ.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
      reference: "Isaiah 53:5",
    },
    message: {
      text: "Do not be afraid, for the Lord your God is with you.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "My brethren, count it all joy when ye fall into divers temptations;",
      reference: "James 1:2",
    },
    message: {
      text: "Assures the Bride that the same power that changes the body also heals in the present day.",
      reference: "William Branham — The Rapture",
    },
  },
  {
    verse: {
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reference: "John 3:16",
    },
    message: {
      text: "You are fearfully and wonderfully made for a purpose.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:6",
    },
    message: {
      text: "Prayer changes things because it touches the heart of God.",
      reference: "Daily Inspiration",
    },
  },
  {
    verse: {
      text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
      reference: "Psalm 27:1",
    },
    message: {
      text: "The crushing of the serpent's head is assured through Christ.",
      reference: "Scripture Insight",
    },
  },
];

export function getReadingForDate(date: Date): DailyReading {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayIndex = differenceInCalendarDays(
    startOfDay(date),
    startOfDay(startOfYear)
  );

  const normalizedIndex = ((dayIndex % ALL_DAILY_READINGS.length) + ALL_DAILY_READINGS.length) % ALL_DAILY_READINGS.length;
  return ALL_DAILY_READINGS[normalizedIndex];
}
