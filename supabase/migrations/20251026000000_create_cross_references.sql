-- Create cross_references table for Bible verse relationships
CREATE TABLE public.cross_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_book TEXT NOT NULL,
  from_chapter INTEGER NOT NULL,
  from_verse INTEGER NOT NULL,
  to_book TEXT NOT NULL,
  to_chapter INTEGER NOT NULL,
  to_verse INTEGER NOT NULL,
  to_verse_end INTEGER,
  relationship_type TEXT DEFAULT 'related', -- related, parallel, quotation, fulfillment, contrast
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_cross_ref UNIQUE (from_book, from_chapter, from_verse, to_book, to_chapter, to_verse)
);

-- Create index for faster lookups
CREATE INDEX idx_cross_references_from ON public.cross_references(from_book, from_chapter, from_verse);
CREATE INDEX idx_cross_references_to ON public.cross_references(from_book, to_chapter, to_verse);

-- Create user_cross_references table for custom user-created cross-references
CREATE TABLE public.user_cross_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_book TEXT NOT NULL,
  from_chapter INTEGER NOT NULL,
  from_verse INTEGER NOT NULL,
  to_book TEXT NOT NULL,
  to_chapter INTEGER NOT NULL,
  to_verse INTEGER NOT NULL,
  to_verse_end INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cross_references ENABLE ROW LEVEL SECURITY;

-- Policies for cross_references (public read, admin write)
CREATE POLICY "Anyone can view cross references"
ON public.cross_references
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cross references"
ON public.cross_references
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for user_cross_references
CREATE POLICY "Users can view their own cross references"
ON public.user_cross_references
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cross references"
ON public.user_cross_references
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cross references"
ON public.user_cross_references
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cross references"
ON public.user_cross_references
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_cross_references_updated_at
BEFORE UPDATE ON public.user_cross_references
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert some popular cross-references
INSERT INTO public.cross_references (from_book, from_chapter, from_verse, to_book, to_chapter, to_verse, relationship_type, notes) VALUES
-- John 3:16 cross-references
('John', 3, 16, 'Romans', 5, 8, 'related', 'God''s love demonstrated'),
('John', 3, 16, '1 John', 4, 9, 'related', 'God''s love manifested'),
('John', 3, 16, 'Romans', 6, 23, 'related', 'Gift of eternal life'),
('John', 3, 16, 'John', 1, 12, 'related', 'Believing and receiving'),

-- Genesis 1:1 cross-references
('Genesis', 1, 1, 'John', 1, 1, 'parallel', 'In the beginning'),
('Genesis', 1, 1, 'Hebrews', 11, 3, 'related', 'By faith we understand creation'),
('Genesis', 1, 1, 'Colossians', 1, 16, 'related', 'All things created'),

-- Romans 8:28 cross-references
('Romans', 8, 28, 'Genesis', 50, 20, 'related', 'God meant it for good'),
('Romans', 8, 28, 'Jeremiah', 29, 11, 'related', 'Plans to prosper'),
('Romans', 8, 28, 'Philippians', 1, 6, 'related', 'Good work will be completed'),

-- Matthew 5:3 (Beatitudes) cross-references
('Matthew', 5, 3, 'Luke', 6, 20, 'parallel', 'Parallel beatitude'),
('Matthew', 5, 3, 'Isaiah', 57, 15, 'related', 'Contrite and humble spirit'),

-- Psalm 23:1 cross-references
('Psalms', 23, 1, 'John', 10, 11, 'fulfillment', 'Jesus is the Good Shepherd'),
('Psalms', 23, 1, 'Ezekiel', 34, 12, 'related', 'God as shepherd'),
('Psalms', 23, 1, '1 Peter', 5, 4, 'fulfillment', 'Chief Shepherd'),

-- John 14:6 cross-references
('John', 14, 6, 'Acts', 4, 12, 'related', 'No other name for salvation'),
('John', 14, 6, '1 Timothy', 2, 5, 'related', 'One mediator'),
('John', 14, 6, 'Hebrews', 10, 20, 'related', 'New and living way'),

-- Ephesians 2:8-9 cross-references
('Ephesians', 2, 8, 'Romans', 3, 24, 'related', 'Justified freely by grace'),
('Ephesians', 2, 8, 'Titus', 3, 5, 'related', 'Not by works of righteousness'),
('Ephesians', 2, 9, 'Romans', 4, 5, 'related', 'Faith counted as righteousness'),

-- Great Commission cross-references
('Matthew', 28, 19, 'Mark', 16, 15, 'parallel', 'Go into all the world'),
('Matthew', 28, 19, 'Acts', 1, 8, 'related', 'Witnesses to the ends of earth'),

-- Ten Commandments cross-references
('Exodus', 20, 3, 'Deuteronomy', 5, 7, 'parallel', 'First commandment repeated'),
('Exodus', 20, 12, 'Ephesians', 6, 2, 'quotation', 'Honor your parents quoted'),

-- Prophecy fulfillments
('Isaiah', 7, 14, 'Matthew', 1, 23, 'fulfillment', 'Virgin birth prophecy'),
('Isaiah', 53, 5, '1 Peter', 2, 24, 'fulfillment', 'By His wounds we are healed'),
('Micah', 5, 2, 'Matthew', 2, 6, 'fulfillment', 'Birthplace prophecy'),

-- Love commandments
('Deuteronomy', 6, 5, 'Matthew', 22, 37, 'quotation', 'Greatest commandment'),
('Leviticus', 19, 18, 'Matthew', 22, 39, 'quotation', 'Love your neighbor'),
('John', 13, 34, '1 John', 4, 11, 'related', 'Love one another'),

-- Faith references
('Hebrews', 11, 1, 'Romans', 10, 17, 'related', 'Faith comes by hearing'),
('Hebrews', 11, 6, 'James', 2, 19, 'related', 'Faith without works'),
('Habakkuk', 2, 4, 'Romans', 1, 17, 'quotation', 'The just shall live by faith'),

-- Prayer references
('Matthew', 6, 9, 'Luke', 11, 2, 'parallel', 'Lord''s Prayer'),
('1 Thessalonians', 5, 17, 'Luke', 18, 1, 'related', 'Pray without ceasing'),
('James', 5, 16, 'Matthew', 21, 22, 'related', 'Effective prayer'),

-- Salvation references
('Acts', 2, 38, 'Acts', 16, 31, 'related', 'Believe and be saved'),
('Acts', 4, 12, 'John', 3, 16, 'related', 'No other name for salvation'),
('Romans', 10, 9, 'Romans', 10, 13, 'related', 'Confession and calling'),

-- Armor of God
('Ephesians', 6, 11, 'Romans', 13, 12, 'related', 'Put on armor of light'),
('Ephesians', 6, 14, 'Isaiah', 59, 17, 'related', 'Breastplate of righteousness'),

-- Fruit of the Spirit
('Galatians', 5, 22, 'Colossians', 3, 12, 'related', 'Virtues to put on'),
('Galatians', 5, 22, 'James', 3, 17, 'related', 'Wisdom from above'),

-- Second Coming
('1 Thessalonians', 4, 16, 'Matthew', 24, 30, 'related', 'Coming on clouds'),
('Revelation', 1, 7, 'Acts', 1, 11, 'related', 'Return in like manner'),

-- Creation and New Creation
('2 Corinthians', 5, 17, 'Revelation', 21, 5, 'related', 'All things made new'),
('Isaiah', 65, 17, 'Revelation', 21, 1, 'fulfillment', 'New heaven and earth');
