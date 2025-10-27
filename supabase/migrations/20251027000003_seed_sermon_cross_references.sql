-- Seed sample sermon cross-references for demonstration
-- This file adds sample connections between Bible verses and WMB sermon quotes

-- First, let's make sure we have some sample sermons
-- (These will only insert if they don't already exist)
INSERT INTO public.sermons (title, date, location) 
VALUES 
  ('The Message of Grace', '1961-08-06', 'Jeffersonville, IN'),
  ('Christ is the Mystery of God Revealed', '1963-07-28', 'Jeffersonville, IN'),
  ('The Spoken Word is the Original Seed', '1962-03-18', 'Jeffersonville, IN'),
  ('The Seven Church Ages', '1960-12-04', 'Jeffersonville, IN'),
  ('Questions and Answers', '1961-10-15', 'Jeffersonville, IN')
ON CONFLICT DO NOTHING;

-- Add sample sermon paragraphs
-- For sermon: The Message of Grace
DO $$
DECLARE
  grace_sermon_id UUID;
  mystery_sermon_id UUID;
  seed_sermon_id UUID;
  ages_sermon_id UUID;
  qa_sermon_id UUID;
BEGIN
  -- Get sermon IDs
  SELECT id INTO grace_sermon_id FROM public.sermons WHERE title = 'The Message of Grace' LIMIT 1;
  SELECT id INTO mystery_sermon_id FROM public.sermons WHERE title = 'Christ is the Mystery of God Revealed' LIMIT 1;
  SELECT id INTO seed_sermon_id FROM public.sermons WHERE title = 'The Spoken Word is the Original Seed' LIMIT 1;
  SELECT id INTO ages_sermon_id FROM public.sermons WHERE title = 'The Seven Church Ages' LIMIT 1;
  SELECT id INTO qa_sermon_id FROM public.sermons WHERE title = 'Questions and Answers' LIMIT 1;

  -- Insert paragraphs for The Message of Grace
  IF grace_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content)
    VALUES
      (grace_sermon_id, 1, 'Now, in Saint John 3:16, "For God so loved the world, that He gave His only begotten Son." Now, that word "loved" there, is past tense. He has already did it, see. "God so loved the world, He gave." Not "will give," but "has gave, His only begotten Son." Now remember, God is love. And love is God. And God is expressed in Jesus Christ. And all that God was, He poured into Christ. All that Christ was, He poured into the Church. So there you are, there is the reason that we can have faith tonight, because it is God Himself dwelling among us.'),
      (grace_sermon_id, 2, 'This great Gospel of grace that we preach, is not something that someone has made up. It is the Word of God. It is a revelation of Jesus Christ. And when you see Jesus Christ, you see God. For He said, "When you see Me, you see the Father." And the Father dwelleth in the Son. And the Son was the expressed image of God''s thoughts, making Hisself tangible so that we could see Him, touch Him, feel Him.'),
      (grace_sermon_id, 3, 'God gave His Son. And His Son gave His life. And we give our hearts. That''s all we have to give is our hearts to Him. And when we give our hearts to Him, then He takes it and fills it with His love, and seals it by the Holy Spirit until the day of our redemption. Oh, what a beautiful picture!')
    ON CONFLICT (sermon_id, paragraph_number) DO NOTHING;
  END IF;

  -- Insert paragraphs for Christ is the Mystery of God Revealed
  IF mystery_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content)
    VALUES
      (mystery_sermon_id, 1, 'Genesis 1:1, "In the beginning God..." Not "In the beginning God created." In the beginning was God. He is the Beginning and the Ending. He is the First and the Last. And in the beginning, God created the heavens and the earth. But before there was a creation, there was God. And God is the Beginning of the creation. He is the Creator. All things were made by Him, and without Him was not anything made that was made.'),
      (mystery_sermon_id, 2, 'Now notice in Colossians 1:16, it says that all things were created by Him and for Him. That''s Christ. All things are created by Christ and for Christ. He is the heir of all things. God has made Him heir of all things, and by Him He made the worlds. So therefore Christ is God expressed in a body. The fullness of the Godhead bodily dwelt in Christ Jesus.'),
      (mystery_sermon_id, 3, 'In John 14:6, Jesus said, "I am the way, the truth, and the life: no man cometh unto the Father, but by Me." See? He is the only approach to God. There is not another way to go. You must come through Jesus Christ. He is the Door. He is the Way. He is the Truth. He is the Life. Everything that God is, is expressed in Christ Jesus.')
    ON CONFLICT (sermon_id, paragraph_number) DO NOTHING;
  END IF;

  -- Insert paragraphs for The Spoken Word is the Original Seed
  IF seed_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content)
    VALUES
      (seed_sermon_id, 1, 'The Spoken Word of God is the Original Seed. And if that Seed could fall into the right kind of ground, it will produce exactly what the Word said it would do. The Word of God is the Seed, and your heart is the ground. And if you can take that Seed of God, every promise that He made, and hide it down in your heart and believe it, it will produce exactly what the Word said it would do.'),
      (seed_sermon_id, 2, 'Now in Luke 8, Jesus gave us the parable of the sower. And He said the seed is the Word. Now that seed cannot bring forth anything until it finds the right kind of ground. It must find a heart that will believe it. It must find a heart that will accept it. And when that seed falls into that kind of ground, it will produce exactly what the Word said.')
    ON CONFLICT (sermon_id, paragraph_number) DO NOTHING;
  END IF;

  -- Insert paragraphs for The Seven Church Ages
  IF ages_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_paragraphs (sermon_id, paragraph_number, content)
    VALUES
      (ages_sermon_id, 1, 'Ephesians 2:8 says, "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God." Now notice, salvation is a gift. You cannot work for it. You cannot buy it. It is a gift. And how do you receive a gift? By faith. Faith is the substance of things hoped for, the evidence of things not seen. So God gives you the gift of eternal life through Jesus Christ our Lord.'),
      (ages_sermon_id, 2, 'Now the church that Jesus is building is not built by denomination. It is not built by organization. It is built by the Holy Spirit. Every member of the Body of Christ is placed into that Body by the baptism of the Holy Ghost. And there is only one Body, and one Spirit, even as ye are called in one hope of your calling.')
    ON CONFLICT (sermon_id, paragraph_number) DO NOTHING;
  END IF;

  -- Now create the cross-references linking verses to sermon quotes
  -- John 3:16 cross-references
  IF grace_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'John', 3, 16, grace_sermon_id, sp.id, 'Brother Branham explains God''s love and the gift of His Son'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = grace_sermon_id AND sp.paragraph_number = 1
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;

    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'John', 3, 16, grace_sermon_id, sp.id, 'The Gospel of grace is the Word of God - a revelation of Jesus Christ'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = grace_sermon_id AND sp.paragraph_number = 2
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;
  END IF;

  -- Genesis 1:1 cross-references
  IF mystery_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'Genesis', 1, 1, mystery_sermon_id, sp.id, 'Before creation, there was God - He is the Beginning'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = mystery_sermon_id AND sp.paragraph_number = 1
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;
  END IF;

  -- Colossians 1:16 cross-references
  IF mystery_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'Colossians', 1, 16, mystery_sermon_id, sp.id, 'All things were created by Christ and for Christ'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = mystery_sermon_id AND sp.paragraph_number = 2
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;
  END IF;

  -- John 14:6 cross-references
  IF mystery_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'John', 14, 6, mystery_sermon_id, sp.id, 'Jesus is the only way to the Father'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = mystery_sermon_id AND sp.paragraph_number = 3
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;
  END IF;

  -- Luke 8 (Parable of the Sower) cross-references
  IF seed_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'Luke', 8, 11, seed_sermon_id, sp.id, 'The seed is the Word of God - it must find the right ground'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = seed_sermon_id AND sp.paragraph_number = 1
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;

    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'Luke', 8, 11, seed_sermon_id, sp.id, 'The Word must fall into a believing heart'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = seed_sermon_id AND sp.paragraph_number = 2
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;
  END IF;

  -- Ephesians 2:8 cross-references
  IF ages_sermon_id IS NOT NULL THEN
    INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
    SELECT 'Ephesians', 2, 8, ages_sermon_id, sp.id, 'Salvation is a gift - you receive it by faith'
    FROM public.sermon_paragraphs sp
    WHERE sp.sermon_id = ages_sermon_id AND sp.paragraph_number = 1
    ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Sample sermon cross-references have been seeded successfully';
END $$;
