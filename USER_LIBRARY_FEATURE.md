# User Library & Personalization Feature

## Overview
This feature enables users to manage their personal Bible study materials (highlights, bookmarks, notes) and customize their reading preferences (font size, theme, Bible version). All data is persisted in Supabase and synchronized across devices.

---

## 🗄️ Database Schema

### Tables Created (Migration: `20251027000002_create_user_library.sql`)

#### 1. **user_settings**
Stores user preferences and settings.
- `id` - UUID primary key
- `user_id` - UUID reference to auth.users
- `font_size` - INTEGER (12-32, default: 16)
- `theme` - TEXT ('light' | 'dark')
- `bible_version` - TEXT (default: 'KJV')
- `font_family` - TEXT ('serif' | 'sans-serif' | 'monospace')
- `reader_font_family` - TEXT
- `color_scheme` - TEXT ('default' | 'warm' | 'cool' | 'high-contrast')
- `created_at`, `updated_at` - Timestamps

#### 2. **user_activity_log**
Tracks user interactions and reading history.
- `id` - UUID primary key
- `user_id` - UUID reference to auth.users
- `action` - TEXT ('read' | 'highlight' | 'bookmark' | 'note' | 'search')
- `source_type` - TEXT ('verse' | 'chapter' | 'sermon' | 'note')
- `source_id` - TEXT (identifier of the content)
- `metadata` - JSONB (additional context)
- `created_at` - Timestamp

#### 3. **bookmarks**
User-saved Bible verses for quick access.
- `id` - UUID primary key
- `user_id` - UUID reference to auth.users
- `book` - TEXT (Bible book name)
- `chapter` - INTEGER
- `verse` - INTEGER
- `verse_text` - TEXT (optional, cached verse text)
- `created_at` - Timestamp

#### 4. **highlights**
Highlighted verses with color coding and notes.
- `id` - UUID primary key
- `user_id` - UUID reference to auth.users
- `book`, `chapter`, `verse` - Location
- `verse_text` - TEXT (cached verse text)
- `color` - TEXT ('yellow' | 'green' | 'blue' | 'pink' | 'purple')
- `note` - TEXT (optional note about the highlight)
- `created_at`, `updated_at` - Timestamps

### Security
- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Policies for SELECT, INSERT, UPDATE, DELETE based on `auth.uid()`

---

## 🧩 Components & Files Created

### 1. **Hooks** (`/src/hooks/`)

#### `useBookmarks.ts`
Manages bookmark operations:
- `fetchBookmarks()` - Load all user bookmarks
- `createBookmark(input)` - Add new bookmark
- `deleteBookmark(id)` - Remove bookmark
- `isBookmarked(book, chapter, verse)` - Check if verse is bookmarked

#### `useHighlights.ts`
Manages highlight operations:
- `fetchHighlights()` - Load all highlights
- `createHighlight(input)` - Add new highlight with color and note
- `updateHighlight(id, input)` - Update color or note
- `deleteHighlight(id)` - Remove highlight
- `getHighlight(book, chapter, verse)` - Get highlight for specific verse

#### `useActivityLog.ts`
Tracks and retrieves user activity:
- `fetchActivities(limit)` - Load recent activity
- `logActivity(input)` - Record new activity
- `getRecentActivity(limit)` - Get recent activities

### 2. **Context** (`/src/contexts/`)

#### Updated `SettingsContext.tsx`
Enhanced to sync with Supabase:
- **Features:**
  - Loads settings from Supabase on user login
  - Auto-syncs changes to database
  - Falls back to localStorage for offline use
  - Applies settings to DOM (theme, fonts, etc.)
- **New Fields:**
  - `bibleVersion` - User's preferred Bible translation
  - `loading` - State during settings fetch

### 3. **Pages** (`/src/pages/`)

#### `Library.tsx` (NEW)
Comprehensive dashboard showing all user library items:

**Features:**
- **Tabbed Interface:**
  - **All** - Overview of all library items
  - **Bookmarks** - List of saved verses
  - **Highlights** - Color-coded highlighted verses
  - **Notes** - Study notes (links to Notes page)
  - **Recent** - Activity history

- **Functionality:**
  - Click items to navigate to verse/chapter
  - Delete bookmarks and highlights inline
  - Real-time updates with loading states
  - Empty states for new users
  - Responsive design for mobile/desktop

#### Updated `Settings.tsx`
Added Bible version selection:
- **New Section:** "Bible Version"
  - Dropdown with 8 popular translations (KJV, NIV, ESV, NKJV, NLT, NASB, AMP, CSB)
  - Persists selection to Supabase
  - Shows success toast on change

#### Updated `More.tsx`
Added "My Library" link in Study Tools section.

### 4. **Routing** (`App.tsx`)
- Added `/library` route (protected)
- Imported and configured Library component

### 5. **Types** (`/src/integrations/supabase/types.ts`)
Updated with new table definitions:
- `user_settings` table types
- `user_activity_log` table types
- `bookmarks` table types
- `highlights` table types

---

## 🚀 Usage

### For Users:

#### Access Library
1. Navigate to **More** → **My Library**
2. View all bookmarks, highlights, notes, and recent activity
3. Switch between tabs to filter by type

#### Create Bookmarks
```typescript
import { useBookmarks } from "@/hooks/useBookmarks";

const { createBookmark } = useBookmarks();

await createBookmark({
  book: "John",
  chapter: 3,
  verse: 16,
  verse_text: "For God so loved the world..."
});
```

#### Create Highlights
```typescript
import { useHighlights } from "@/hooks/useHighlights";

const { createHighlight } = useHighlights();

await createHighlight({
  book: "Psalm",
  chapter: 23,
  verse: 1,
  verse_text: "The Lord is my shepherd...",
  color: "yellow",
  note: "Important verse for comfort"
});
```

#### Log Activity
```typescript
import { useActivityLog } from "@/hooks/useActivityLog";

const { logActivity } = useActivityLog();

await logActivity({
  action: "read",
  source_type: "chapter",
  source_id: "John 3",
  metadata: { duration: 300 }
});
```

#### Update Settings
```typescript
import { useSettings } from "@/contexts/SettingsContext";

const { settings, updateSettings } = useSettings();

// Change Bible version
await updateSettings({ bibleVersion: "NIV" });

// Change theme
await updateSettings({ theme: "dark" });

// Change font size
await updateSettings({ fontSize: 18 });
```

---

## 📊 Data Flow

1. **User Interaction** → Component calls hook method
2. **Hook** → Makes Supabase API call
3. **Supabase** → Validates with RLS policies
4. **Database** → Stores/retrieves data
5. **Hook** → Updates local state & shows toast
6. **Component** → Re-renders with new data

---

## 🔐 Security Features

- **Authentication Required:** All library features require user login
- **Row-Level Security:** Users can only access their own data
- **Protected Routes:** Library and related pages wrapped in `ProtectedRoute`
- **Secure API:** All operations validated server-side by Supabase

---

## 🎨 UI/UX Features

- **Responsive Design:** Works on mobile, tablet, and desktop
- **Loading States:** Skeleton loaders during data fetch
- **Empty States:** Friendly messages for new users
- **Error Handling:** Toast notifications for errors
- **Success Feedback:** Confirmation toasts for actions
- **Dark Mode Support:** Full theme integration
- **Accessibility:** Semantic HTML and ARIA labels

---

## 🧪 Testing Checklist

- [ ] Create bookmark and see it in Library
- [ ] Create highlight with different colors
- [ ] Add note to highlight
- [ ] Delete bookmark and highlight
- [ ] Change Bible version in Settings
- [ ] Toggle dark mode and verify persistence
- [ ] Log out and back in - verify settings persist
- [ ] View activity log
- [ ] Test on mobile device
- [ ] Test with no data (empty states)

---

## 🔄 Future Enhancements

- **Collections:** Group bookmarks into custom collections
- **Search Library:** Search within bookmarks/highlights
- **Export Data:** Download library as PDF or JSON
- **Sync Status:** Show when data is syncing
- **Offline Mode:** Queue changes when offline
- **Verse Highlighting:** Inline highlighting in Reader
- **Color Themes:** More color scheme options
- **Bible Version API:** Actually switch Bible text based on version

---

## 📝 Notes

- Settings sync automatically when user is logged in
- Falls back to localStorage for non-authenticated users
- Activity logging is silent (no success toasts)
- All dates use `date-fns` for formatting
- Highlights support 5 colors: yellow, green, blue, pink, purple
- Bible versions currently stored but need API integration for actual text switching

---

## 🐛 Known Issues / Limitations

- Bible version selection doesn't actually change Bible text (requires API integration)
- Recent verses still use localStorage (consider migrating to activity_log)
- No batch operations for bookmarks/highlights
- No undo functionality

---

## 📚 Dependencies

- `@supabase/supabase-js` - Database client
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `sonner` - Toast notifications
- Shadcn UI components

---

## 🎯 Success Metrics

This feature enables:
✅ **Personalization** - Users can customize their reading experience
✅ **Organization** - Easy management of study materials
✅ **Persistence** - Data saved across devices
✅ **Tracking** - Activity history for reading habits
✅ **Engagement** - Users more likely to return with saved content

---

**Feature Status:** ✅ **COMPLETE**

All requirements met:
- ✅ User Library dashboard with highlights, bookmarks, notes, and recent activity
- ✅ Settings page with font size, theme, and Bible version
- ✅ Supabase integration with proper schema and RLS
- ✅ Context for global settings management
- ✅ Full CRUD operations for all library items
- ✅ Activity logging system
- ✅ Responsive UI with loading/empty states
- ✅ Type-safe implementation
