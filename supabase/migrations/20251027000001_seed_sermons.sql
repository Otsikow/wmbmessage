-- Insert sample William Branham sermons with full content
-- Sermon 1: Saved By Grace
DO $$
DECLARE
  sermon1_id UUID;
BEGIN
  INSERT INTO public.sermons (title, date, location)
  VALUES ('Saved By Grace', '1963-01-19', 'Jeffersonville, IN')
  RETURNING id INTO sermon1_id;

  -- Insert paragraphs for "Saved By Grace"
  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'Good morning, friends. It''s certainly a privilege to be here this morning in the service of the Lord Jesus. And I was just thinking as I come in, how wonderful it is to be saved by the grace of God.'),
  (sermon1_id, 2, 'You know, salvation is not what we do; it''s what God has done for us. It''s not by works of righteousness which we have done, but according to His mercy He saved us.'),
  (sermon1_id, 56, 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God. Not of works, lest any man should boast. You can''t save yourself. It''s impossible for you to save yourself. God did the saving.'),
  (sermon1_id, 57, 'When you were dead in trespasses and sin, you had no way to save yourself. You were helpless, hopeless, and undone. But God, rich in mercy, because of His great love wherewith He loved us, even when we were dead in sins, has quickened us together with Christ.'),
  (sermon1_id, 58, 'That''s salvation: by grace through faith. Not by our goodness, not by our church membership, not by our denominations. But it''s the gift of God, freely given to whosoever will believe.'),
  (sermon1_id, 59, 'Jesus said, "Verily, verily, I say unto you, he that heareth My Word and believeth on Him that sent Me, hath Everlasting Life, and shall not come into condemnation, but has passed from death unto Life."'),
  (sermon1_id, 60, 'Oh, what a promise! What a salvation! We are saved by grace, kept by grace, and we will be glorified by grace. It''s all of God from start to finish.'),
  (sermon1_id, 61, 'Many people think they have to work their way to heaven, but the Bible plainly says salvation is not of works. It''s the gift of God. When you try to work for it, you make void the grace of God.'),
  (sermon1_id, 62, 'I''m so glad that salvation doesn''t depend on what I do, but on what He has done. I couldn''t keep myself saved five minutes if it depended on me. But thank God, He that began a good work in me will perform it until the day of Jesus Christ.');

  -- Sermon 2: Perfect Faith
  INSERT INTO public.sermons (title, date, location)
  VALUES ('Perfect Faith', '1963-08-25', 'Jeffersonville, IN')
  RETURNING id INTO sermon1_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'Now, we are approaching a subject that to me is one of the most important subjects there is, and that''s the subject of faith. For without faith it''s impossible to please God.'),
  (sermon1_id, 45, 'Faith is not something that you work up. You can''t manufacture faith. Faith is something that''s a gift of God. The Bible said, "Faith cometh by hearing, and hearing by the Word of God."'),
  (sermon1_id, 46, 'When you hear the Word of God, then faith comes. You hear the promise, then faith comes to believe that promise. And when faith comes, and you act upon that faith, things happen!'),
  (sermon1_id, 67, 'Perfect faith is not something you work up; it''s something that works through you by the Holy Spirit. It''s when God''s Spirit comes upon you and gives you perfect faith for the thing that you have need of.'),
  (sermon1_id, 68, 'Perfect faith is a gift of God. And when God speaks to you, and faith comes, there''s nothing that can stop it. It''s already done. Before you pray, it''s already answered.'),
  (sermon1_id, 69, 'That''s what Jesus meant when He said, "When you pray, believe that you receive it, and you shall have it." That''s perfect faith. You believe you have it before you see it in manifestation.');

  -- Sermon 3: The Token
  INSERT INTO public.sermons (title, date, location)
  VALUES ('The Token', '1963-09-14', 'Jeffersonville, IN')
  RETURNING id INTO sermon1_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'I want to speak this morning on the subject of "The Token." And my text is found in Exodus 12:13, where God said, "When I see the blood, I will pass over you."'),
  (sermon1_id, 23, 'The blood on the door was a token that the lamb had died. The blood was the token. And today, the Holy Spirit is God''s Token that Jesus Christ died for us and we have been redeemed.'),
  (sermon1_id, 89, 'The Holy Spirit is God''s token of our redemption. Without the Token, you cannot pass. You must have the Token displayed. The Token must be on the door. The Token must be visible.'),
  (sermon1_id, 90, 'Just like in the days of Egypt, when the death angel passed through, every house that didn''t have the token was visited by death. But where the token was applied, the death angel passed over.'),
  (sermon1_id, 91, 'Today, we must have the Token. Not just a claim, not just a profession, not just being a church member. You must have the Token, the Holy Spirit, the evidence that you have passed from death unto Life.');

  -- Sermon 4: Why Are We Not A Denomination
  INSERT INTO public.sermons (title, date, location)
  VALUES ('Why Are We Not A Denomination', '1958-09-27', 'Jeffersonville, IN')
  RETURNING id INTO sermon1_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'Many people ask me, "Brother Branham, why don''t you organize? Why are we not a denomination?" And I want to answer that question this morning from the Word of God.'),
  (sermon1_id, 45, 'The Holy Spirit leads us, not denomination. We follow the Spirit and the Word. Jesus never organized a denomination, and neither did His apostles.'),
  (sermon1_id, 46, 'When you organize, you crystallize. You make a creed and you stop the moving of the Holy Spirit. God wants a people that will follow the Holy Ghost, not a bunch of creeds and dogmas.'),
  (sermon1_id, 47, 'We believe in the Bible, the whole Bible, and nothing but the Bible. We don''t believe in adding creeds to it or taking away from it. We believe God''s Word is sufficient.'),
  (sermon1_id, 48, 'God never did call us to be a denomination. He called us to be Christians, followers of the Lord Jesus Christ, led by the Holy Spirit, living by the Word of God.');

  -- Sermon 5: Faith Is The Substance
  INSERT INTO public.sermons (title, date, location)
  VALUES ('Faith Is The Substance', '1961-12-02', 'Jeffersonville, IN')
  RETURNING id INTO sermon1_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'Hebrews 11:1 says, "Faith is the substance of things hoped for, the evidence of things not seen." I want to talk about this faith that brings substance.'),
  (sermon1_id, 23, 'Without faith it is impossible to please God, for he that cometh to God must believe that He is, and that He is a rewarder of them that diligently seek Him.'),
  (sermon1_id, 24, 'Faith makes things real. Faith gives substance to the promises of God. When you have faith, God''s promises become real to you. They''re not just words on a page anymore.'),
  (sermon1_id, 25, 'Abraham believed God, and it was counted unto him for righteousness. Abraham had faith that gave substance. He believed God''s promise even though he couldn''t see it in the natural.'),
  (sermon1_id, 26, 'That''s real faith - when you can believe God''s promise even when you can''t see how it''s going to come to pass. You just believe it because God said it, and that settles it.');

  -- Sermon 6: Christ Is The Mystery Of God Revealed
  INSERT INTO public.sermons (title, date, location)
  VALUES ('Christ Is The Mystery Of God Revealed', '1963-07-28', 'Jeffersonville, IN')
  RETURNING id INTO sermon1_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'This morning we want to speak on one of the greatest subjects that could ever be given to man, and that is, "Christ Is The Mystery Of God Revealed."'),
  (sermon1_id, 12, 'Christ is God''s mystery revealed to His people in this last day through the Word. All down through the ages, God has been revealing Himself, little by little, until He was fully manifested in Christ Jesus.'),
  (sermon1_id, 13, 'The mystery of God is Christ in you, the hope of glory. For years, God kept this hidden from the world. But now He has revealed it to His saints.'),
  (sermon1_id, 14, 'Jesus Christ is God Himself manifested in flesh. He is the fullness of the Godhead bodily. He is not just a man, He is the God-man. He is very God and very man.'),
  (sermon1_id, 15, 'Understanding who Christ is, is the key to everything. Once you understand that Jesus is God manifested in flesh, then you understand redemption, salvation, healing, everything!');

  -- Sermon 7: The Rapture
  INSERT INTO public.sermons (title, date, location)
  VALUES ('The Rapture', '1965-12-04', 'Yuma, AZ')
  RETURNING id INTO sermon1_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'I want to speak this morning about the blessed hope of the Church, and that is the Rapture of the Church, when Jesus comes to take His Bride home.'),
  (sermon1_id, 23, 'The church is waiting for the rapture, the coming of the Lord Jesus Christ in glory. We believe Jesus is coming soon. The signs are everywhere that we''re at the end of the age.'),
  (sermon1_id, 24, 'Jesus said, "I will come again and receive you unto Myself, that where I am, there ye may be also." What a promise! What a hope! Jesus is coming for His Church!'),
  (sermon1_id, 25, 'The trumpet shall sound, and the dead in Christ shall rise first. Then we which are alive and remain shall be caught up together with them in the clouds to meet the Lord in the air.');

  -- Sermon 8: The Greatest Gift In The Bible
  INSERT INTO public.sermons (title, date, location)
  VALUES ('The Greatest Gift In The Bible', '1963-12-25', 'Phoenix, AZ')
  RETURNING id INTO sermon1_id;

  INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content) VALUES
  (sermon1_id, 1, 'On this Christmas morning, I want to speak about the greatest gift that was ever given, the greatest gift in the Bible.'),
  (sermon1_id, 12, 'God so loved the world that He gave His only begotten Son. Love is the greatest gift that was ever given to humanity. Not silver, not gold, but God gave Himself in the form of His Son.'),
  (sermon1_id, 13, 'When you think about Christmas, don''t think about the tinsel and the gifts under the tree. Think about God''s gift to you - eternal life through Jesus Christ His Son.'),
  (sermon1_id, 14, 'God gave the greatest gift, and it was wrapped in swaddling clothes and laid in a manger. It was love made manifest. God''s love coming down to save lost humanity.');

END $$;
