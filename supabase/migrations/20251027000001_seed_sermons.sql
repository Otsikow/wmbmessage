-- Insert William Branham sermons with representative paragraphs
DO $$
DECLARE
  spoken_seed_id UUID;
  mystery_id UUID;
  grace_id UUID;
  ages_id UUID;
  qa_id UUID;
  rapture_id UUID;
BEGIN
  -- The Spoken Word Is The Original Seed
  INSERT INTO public.sermons (title, date, location)
  VALUES ('The Spoken Word Is The Original Seed', '1962-03-18', 'Jeffersonville, IN')
  RETURNING id INTO spoken_seed_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
    (spoken_seed_id, 1, 'Good morning, friends. It''s a privilege to be with you again in the presence of the Lord, gathered to hear His Word and watch Him make It live among us.'),
    (spoken_seed_id, 2, 'Jesus told us that the seed is the Word. Every promise God uttered carries His own life inside of it, waiting on fertile ground where faith will let it blossom.'),
    (spoken_seed_id, 3, 'When the Word is spoken in season, the Holy Spirit broods over it just like in the beginning. That same creative presence wants to bring forth sons and daughters who believe.'),
    (spoken_seed_id, 4, 'The same creative power that framed the worlds still rides on God''s spoken Word today. Let it fall into your heart, and do not mix it with doubt or creeds.'),
    (spoken_seed_id, 5, 'If the Word finds good ground, it will reproduce exactly what God said. Healing will heal, salvation will save, and deliverance will deliver—because the Original Seed never fails.'),
    (spoken_seed_id, 6, 'So guard that Seed. Keep it watered by prayer, warmed by love, and exposed to the Light of the Son. Then watch the harvest of God''s promise come to pass in your life.');

  -- Christ Is The Mystery Of God Revealed
  INSERT INTO public.sermons (title, date, location)
  VALUES ('Christ Is The Mystery Of God Revealed', '1963-07-28', 'Jeffersonville, IN')
  RETURNING id INTO mystery_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
    (mystery_id, 1, 'Thank you, Brother Neville. The Lord bless you. We approach sacred ground this morning, speaking on the mystery hidden from the foundation of the world.'),
    (mystery_id, 2, 'All the fullness of God was pleased to dwell in Jesus Christ. He is the expressed image of the invisible God, and the Bible unfolds Him from Genesis to Revelation.'),
    (mystery_id, 3, 'God''s great mystery is Christ in you—the Hope of Glory. Not a distant religion, but the very Life of Jesus Christ living, breathing, and working through His Bride.'),
    (mystery_id, 4, 'When you receive the new birth, it is God unveiling Himself in flesh again. Every age, He reveals a little more of that mystery until it stands completed in the end-time Bride.'),
    (mystery_id, 5, 'Therefore, the aim of every sermon, every song, and every testimony is to bring people to that personal union with Christ. Once He lives inside, the mystery is solved for you.'),
    (mystery_id, 6, 'Hold to the Word. Stay humble. Let Christ live through you, and the world will know that Jesus Christ is the same yesterday, today, and forever.');

  -- The Message of Grace
  INSERT INTO public.sermons (title, date, location)
  VALUES ('The Message of Grace', '1961-08-06', 'Jeffersonville, IN')
  RETURNING id INTO grace_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
    (grace_id, 1, 'Now in Saint John 3:16 we read how God so loved the world that He gave His only begotten Son. Love moved first; grace made the approach before we could even call.'),
    (grace_id, 2, 'Grace is God''s unmerited favor. He loved us when we were unlovable, saved us while we were sinners, and keeps us not by our works but by His finished work at Calvary.'),
    (grace_id, 3, 'If He gave His Son while we were enemies, how much more will He freely give all things now that we are His children? Grace opens the door for every promise we claim.'),
    (grace_id, 4, 'Some people fear they cannot hold out, but grace is not you holding on to God. Grace is God holding on to you, keeping you by His Spirit until the day of redemption.'),
    (grace_id, 5, 'So cast away your condemnation. Look to Jesus, the Author and Finisher of our faith. His grace is sufficient, and His strength is made perfect in weakness.'),
    (grace_id, 6, 'Let that amazing grace soften your heart for others. Freely you have received; now freely give, reflecting the same mercy the Father showed to you.');

  -- The Seven Church Ages
  INSERT INTO public.sermons (title, date, location)
  VALUES ('The Seven Church Ages', '1960-12-04', 'Jeffersonville, IN')
  RETURNING id INTO ages_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
    (ages_id, 1, 'We turn tonight to the Book of Revelation, to the messages of the seven golden candlesticks. Each age shows Christ walking among His people.'),
    (ages_id, 2, 'Ephesus, Smyrna, Pergamos, Thyatira, Sardis, Philadelphia, and Laodicea—each received a portion of the Word, and each messenger echoed the Life of Christ to his age.'),
    (ages_id, 3, 'Though darkness rose, the Holy Ghost kept lighting the next lamp. The same Spirit that started the Church keeps it burning until the Bride is called out.'),
    (ages_id, 4, 'We stand in Laodicea, the age of rights and lukewarmness, yet Christ is still knocking. He wants to step inside and sup with anyone who will open the door.'),
    (ages_id, 5, 'So take heed to what the Spirit says to the churches. Overcomers are promised a throne, hidden manna, a new name, and a share in the Morning Star Himself.');

  -- Questions and Answers
  INSERT INTO public.sermons (title, date, location)
  VALUES ('Questions and Answers', '1961-10-15', 'Jeffersonville, IN')
  RETURNING id INTO qa_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
    (qa_id, 1, 'Tonight we gather around the Word and the stack of questions you have handed in. I don''t claim to know it all, but I look to the Scriptures for every answer.'),
    (qa_id, 2, 'When believers sincerely ask, God honors that hunger. The Bible holds the pattern, and the Holy Spirit will always guide us back to what is written.'),
    (qa_id, 3, 'Some questions deal with daily living—marriage, family, and conduct. Remember, the token is love: love for God, love for your spouse, love for the brethren.'),
    (qa_id, 4, 'Others ask about prophecy and the end time. No matter how deep the mystery, keep your eyes on Jesus and stay filled with the Spirit; then you''ll be ready for anything.'),
    (qa_id, 5, 'May every answer tonight draw you closer to Christ. If one remains unsettled, stay reverent and wait on Him—He will make all things plain in His time.');

  -- The Rapture
  INSERT INTO public.sermons (title, date, location)
  VALUES ('The Rapture', '1965-12-04', 'Yuma, AZ')
  RETURNING id INTO rapture_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
    (rapture_id, 1, 'I want to speak about the blessed hope of the Church—the catching away of the Bride to meet her Lord in the air.'),
    (rapture_id, 2, 'Paul said the trumpet will sound and the dead in Christ shall rise first. That promise is as sure as the God who spoke it.'),
    (rapture_id, 3, 'The signs of the time show us we are at the evening hour. Israel is in her homeland, the church ages are fulfilled, and the Bride is trimming her lamp.'),
    (rapture_id, 4, 'Do not look for a public parade. The Rapture is a revelation to the Bride. She hears the secret call and slips away while the world goes on unaware.'),
    (rapture_id, 5, 'So comfort one another with these words. Live ready, keep the Token applied, and watch the eastern sky—our redemption draweth nigh.');
END $$;
