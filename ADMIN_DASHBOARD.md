# Admin Dashboard Documentation

## Overview

The MessageGuide Admin Dashboard provides comprehensive content management for Bible verses, WMB Sermons, and Cross References. Access is restricted to users with the `admin` role.

## Features

### 1. Bible Verses Management
- **CRUD Operations**: Create, Read, Update, and Delete Bible verses
- **Search**: Search by book name or verse text
- **Bulk Import**: Import multiple verses via JSON
- **Fields**:
  - Book (from predefined list)
  - Chapter & Verse numbers
  - Text content
  - Translation (KJV, NIV, ESV, NKJV)
  - Jesus's words flag (red letter)

### 2. Sermons Management
- **CRUD Operations**: Manage William Branham sermons
- **Content Editor**: Add sermon metadata and paragraph content
- **Search**: Search by title or location
- **Bulk Import**: Import complete sermons with paragraphs
- **Fields**:
  - Title
  - Date
  - Location
  - Paragraphs (automatic numbering)

### 3. Cross References Management
- **CRUD Operations**: Create verse-to-verse relationships
- **Relationship Types**: 
  - Related
  - Parallel
  - Quotation
  - Fulfillment
  - Contrast
- **Bulk Import**: Import multiple cross-references
- **Fields**:
  - From verse (book, chapter, verse)
  - To verse (book, chapter, verse, optional verse range)
  - Relationship type
  - Notes

### 4. User Management
- View all registered users
- See user roles (admin, moderator, user)
- Monitor user registration dates

## Access Control

### Admin Role Required
Only users with the `admin` role can access the dashboard. The role is managed via the `user_roles` table in Supabase.

### Grant Admin Access
To grant admin access to a user:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

## Bulk Import Formats

### Bible Verses (JSON)
```json
[
  {
    "book": "John",
    "chapter": 3,
    "verse": 16,
    "text": "For God so loved the world...",
    "translation": "KJV",
    "is_jesus_words": true
  }
]
```

### Sermons (JSON)
```json
[
  {
    "title": "The Spoken Word",
    "date": "1962-03-18",
    "location": "Jeffersonville, IN",
    "paragraphs": [
      "First paragraph content...",
      "Second paragraph content..."
    ]
  }
]
```

### Cross References (JSON)
```json
[
  {
    "from_book": "John",
    "from_chapter": 3,
    "from_verse": 16,
    "to_book": "Romans",
    "to_chapter": 5,
    "to_verse": 8,
    "to_verse_end": 10,
    "relationship_type": "related",
    "notes": "God's love demonstrated"
  }
]
```

## Sample Data

Sample data files are available in `/public/sample-data/`:
- `bible-verses-sample.json`
- `sermons-sample.json`
- `cross-references-sample.json`

## Database Schema

### bible_verses
```sql
CREATE TABLE bible_verses (
  id UUID PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation TEXT DEFAULT 'KJV',
  is_jesus_words BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(book, chapter, verse, translation)
);
```

### sermons & sermon_paragraphs
```sql
CREATE TABLE sermons (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE sermon_paragraphs (
  id UUID PRIMARY KEY,
  sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
  paragraph_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(sermon_id, paragraph_number)
);
```

### cross_references
```sql
CREATE TABLE cross_references (
  id UUID PRIMARY KEY,
  from_book TEXT NOT NULL,
  from_chapter INTEGER NOT NULL,
  from_verse INTEGER NOT NULL,
  to_book TEXT NOT NULL,
  to_chapter INTEGER NOT NULL,
  to_verse INTEGER NOT NULL,
  to_verse_end INTEGER,
  relationship_type TEXT DEFAULT 'related',
  notes TEXT,
  created_at TIMESTAMP,
  UNIQUE(from_book, from_chapter, from_verse, to_book, to_chapter, to_verse)
);
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Public Read**: Anyone can read content
- **Admin Write**: Only admins can insert, update, or delete

The admin check is performed using the `has_role()` function:
```sql
public.has_role(auth.uid(), 'admin')
```

## Search Functions

### search_bible_verses(search_query, result_limit)
Full-text search across Bible verses with relevance ranking.

### search_sermon_content(search_query, result_limit)
Full-text search across sermon paragraphs with context.

## Navigation

Access the dashboard at: `/admin`

The dashboard has 5 tabs:
1. **Overview**: Statistics and system status
2. **Bible**: Manage Bible verses
3. **Sermons**: Manage WMB sermons
4. **Cross Refs**: Manage cross-references
5. **Users**: View user list and roles

## Best Practices

1. **Bulk Imports**: Use bulk import for large datasets (100+ items)
2. **Verse Uniqueness**: Each verse is unique per translation
3. **Cross References**: Add notes to explain the relationship
4. **Sermon Paragraphs**: Separate paragraphs with double line breaks
5. **Search**: Use specific terms for better results

## Troubleshooting

### "Permission denied" errors
- Verify you have the admin role assigned
- Check your authentication session is active
- Confirm RLS policies are properly configured

### Bulk import fails
- Validate JSON format (use a JSON validator)
- Ensure all required fields are present
- Check for duplicate entries (unique constraints)

### Search not working
- Rebuild text search indexes if needed
- Check that content exists in the database
- Verify the search query syntax

## Security Notes

- All admin actions are logged via Supabase
- Database functions use SECURITY DEFINER for role checks
- RLS policies prevent unauthorized access
- Admin role assignment requires database access

## Support

For issues or questions, contact the development team or refer to the Supabase documentation.
