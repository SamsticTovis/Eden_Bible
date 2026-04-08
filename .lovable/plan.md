

## Fix & Unify Core Progression System

### Problem Summary
- Manna is stored in **localStorage** (`getManna`/`addManna`), not the database — it's lost on logout, doesn't sync across devices, and the leaderboard (`leaderboard_entries`) has separate manna values
- Games award manna to localStorage only, never to the database
- Daily tasks are inferred from `recent_activity` queries but never explicitly tracked or rewarded in a structured way
- Streak updates are disconnected from daily task completion

### Architecture

```text
┌──────────────────────────────────────────────────┐
│              useManna() hook (new)                │
│  Single source of truth — reads from DB           │
│  Exposes: manna, weeklyManna, earnManna(), refresh│
│  Real-time subscription on leaderboard_entries     │
└──────────────┬───────────────────────────────────┘
               │ called by
    ┌──────────┼──────────┬──────────────┐
    │          │          │              │
  Games    AI Chat    Bible Reader   Prayer
    │          │          │              │
    └──────────┴──────────┴──────────────┘
               │
    ┌──────────▼──────────────────────────┐
    │     useActivityLogger (updated)      │
    │  logs activity + awards manna + updates streak + marks daily task │
    └─────────────────────────────────────┘
```

### Plan

#### 1. Database Migration
- Create `daily_tasks` table: `user_id`, `task_date (date, unique per user)`, `bible_read`, `quiz_completed`, `prayer_done`, `ai_chat_used`, `manna_awarded (int default 0)`
- Add RLS: users can read/insert/update own rows
- Add unique constraint on `(user_id, task_date)`

#### 2. Create `useManna` Hook (replaces localStorage)
- On mount, fetch `total_manna` and `weekly_manna` from `leaderboard_entries` for the current user
- Subscribe to real-time changes on `leaderboard_entries` filtered by `user_id`
- Expose `earnManna(amount, description)` that:
  - Upserts `leaderboard_entries` (increment `total_manna`, `weekly_manna`, `games_played`)
  - Inserts into `manna_transactions` for audit trail
  - Updates local state immediately (optimistic)
- Expose `manna`, `weeklyManna`, `mannaToday` (sum from `manna_transactions` today)

#### 3. Rewrite `useActivityLogger` → Unified Activity Handler
- When `logActivity()` is called:
  1. Insert into `recent_activity` (existing)
  2. Upsert `daily_tasks` row for today — set the matching boolean to `true`
  3. Award task manna via `useManna.earnManna()` (only if that task wasn't already true — prevent duplicates)
  4. Call streak logic: if at least one task is now true and `last_activity_date !== today`, update streak in `user_progress`
- Map activity types to daily task fields: `bible_read→bible_read`, `game_played/game_won→quiz_completed`, `circle_joined/prayer→prayer_done`, `chat→ai_chat_used`

#### 4. Update Streak Logic in `useStreak`
- Remove standalone `recordActivity()` — streak is now triggered inside `useActivityLogger`
- Keep `useStreak` as read-only: `streak`, `justIncremented`, `fetchStreak()`
- Streak increments only when the first daily task of a new day is completed

#### 5. Remove localStorage Manna
- Delete `getManna()` and `addManna()` from `MannaTracker.tsx`
- Update `MannaTracker` component to use `useManna()` hook
- Update `HomeDashboard` to use `useManna()` instead of `getManna()`
- Update `ProfilePage` to use `useManna()`
- Update all game components (`TriviaChallenge`, `BibleWordSearch`, `MemoryVerseGame`, `MultiplayerTrivia`) to call `useManna().earnManna()` instead of `addManna()`

#### 6. Update `SpiritualGoals` Component
- Read from `daily_tasks` table instead of querying `recent_activity`
- Subscribe to real-time changes on `daily_tasks` for instant UI updates
- Show `mannaToday` from `useManna()` hook

#### 7. Streak Rewards
- In the streak update logic, award bonus manna at milestones:
  - 3-day streak: +20 manna
  - 7-day streak: +50 manna
  - 30-day streak: +200 manna
- Record these as `manna_transactions` with type `streak_bonus`

### Files Changed
- **New**: `src/hooks/useManna.ts`
- **New migration**: `daily_tasks` table
- **Modified**: `src/hooks/useActivityLogger.ts` — unified handler
- **Modified**: `src/hooks/useStreak.ts` — read-only, no standalone recordActivity
- **Modified**: `src/components/MannaTracker.tsx` — use DB manna
- **Modified**: `src/components/HomeDashboard.tsx` — use `useManna()`
- **Modified**: `src/components/ProfilePage.tsx` — use `useManna()`
- **Modified**: `src/components/SpiritualGoals.tsx` — read from `daily_tasks`
- **Modified**: `src/components/games/TriviaChallenge.tsx` — use `earnManna()`
- **Modified**: `src/components/games/BibleWordSearch.tsx` — use `earnManna()`
- **Modified**: `src/components/games/MemoryVerseGame.tsx` — use `earnManna()`
- **Modified**: `src/components/games/MultiplayerTrivia.tsx` — use `earnManna()`
- **Modified**: `src/components/AIComfortChat.tsx` — remove standalone `recordActivity()`
- **Modified**: `src/components/FullBibleReader.tsx` — remove standalone `recordActivity()`
- **Modified**: `src/components/PrayerCircles.tsx` — remove standalone `recordActivity()`

