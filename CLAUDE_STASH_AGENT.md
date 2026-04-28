# Stash Scene Analysis & Recommendation Agent

This document provides complete context for an AI agent to perform scene analysis, research, and personalized recommendations on this Stash instance.

---

## Table of Contents

1. [Stash Instance Connection Details](#1-stash-instance-connection-details)
2. [GraphQL API Reference](#2-graphql-api-reference)
3. [Data Schemas](#3-data-schemas)
4. [User Preference Profile](#4-user-preference-profile)
5. [Category Detection Logic](#5-category-detection-logic)
6. [Series Pattern Detection](#6-series-pattern-detection)
7. [Existing Data Files](#7-existing-data-files)
8. [Common Tasks & Workflows](#8-common-tasks--workflows)
9. [Work Completed Summary](#9-work-completed-summary)

---

## 1. Stash Instance Connection Details

### Endpoints

| Property | Value |
|----------|-------|
| **GraphQL Endpoint** | `https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql` |
| **Internal Endpoint** | `http://localhost:9999/graphql` |
| **Method** | POST |
| **Content-Type** | `application/json` |

### Authentication

```
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg
```

### Base curl Command Template

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "YOUR_GRAPHQL_QUERY_HERE"}'
```

### Instance Statistics

| Metric | Value |
|--------|-------|
| Total Scenes | ~28,746 |
| Database Schema Version | 76 |
| Scenes with O count > 0 | 519 |
| Series Candidates | 1,371 |
| Feature-Length Scenes (90+ min) | 487 |

---

## 2. GraphQL API Reference

### 2.1 Query: Find Scenes (Paginated)

**Use Case**: Retrieve scenes with filtering, sorting, and pagination.

```graphql
query FindScenes($filter: FindFilterType, $scene_filter: SceneFilterType) {
  findScenes(filter: $filter, scene_filter: $scene_filter) {
    count
    scenes {
      id
      title
      details
      date
      rating100
      o_counter
      play_count
      created_at
      updated_at
      files {
        id
        path
        basename
        duration
        size
        width
        height
        video_codec
        audio_codec
        frame_rate
        bit_rate
      }
      studio {
        id
        name
        parent_studio {
          id
          name
        }
      }
      performers {
        id
        name
        gender
        birthdate
        ethnicity
        country
        favorite
      }
      tags {
        id
        name
      }
      scene_markers {
        id
        title
        seconds
        primary_tag {
          id
          name
        }
      }
    }
  }
}
```

**Variables Example**:
```json
{
  "filter": {
    "per_page": 100,
    "page": 1,
    "sort": "created_at",
    "direction": "DESC"
  },
  "scene_filter": {
    "duration": {
      "value": 840,
      "modifier": "GREATER_THAN"
    },
    "resolution": {
      "value": "FULL_HD",
      "modifier": "GREATER_THAN"
    }
  }
}
```

**curl Example - Get 100 Most Recent Scenes**:
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScenes(filter: { per_page: 100, page: 1, sort: \"created_at\", direction: DESC }) { count scenes { id title files { basename duration } studio { name } performers { name gender } o_counter } } }"}'
```

**Expected Response Structure**:
```json
{
  "data": {
    "findScenes": {
      "count": 28746,
      "scenes": [
        {
          "id": "28272",
          "title": "Scene Title Here",
          "files": [
            {
              "basename": "filename.mp4",
              "duration": 1800.5
            }
          ],
          "studio": {
            "name": "Studio Name"
          },
          "performers": [
            {
              "name": "Performer Name",
              "gender": "FEMALE"
            }
          ],
          "o_counter": 0
        }
      ]
    }
  }
}
```

### 2.2 Query: Get All Scenes with O Counter > 0

**Use Case**: Find all watched/completed scenes.

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScenes(filter: { per_page: -1 }, scene_filter: { o_counter: { value: 0, modifier: GREATER_THAN }}) { count scenes { id title studio { name } performers { name } o_counter } } }"}'
```

**Note**: Use `per_page: -1` to get ALL results (no pagination).

### 2.3 Query: Find Single Scene by ID

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScene(id: \"12345\") { id title files { basename path duration } studio { name } performers { name gender } tags { name } o_counter play_count } }"}'
```

### 2.4 Query: Find Performers

**Find performer by name**:
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findPerformers(performer_filter: { name: { value: \"Sophia Burns\", modifier: EQUALS }}) { performers { id name gender scene_count } } }"}'
```

**Get all performers**:
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findPerformers(filter: { per_page: -1, sort: \"scene_count\", direction: DESC }) { performers { id name gender scene_count favorite } } }"}'
```

### 2.5 Query: Find Studios

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findStudios(filter: { per_page: -1, sort: \"scene_count\", direction: DESC }) { studios { id name scene_count parent_studio { name } } } }"}'
```

### 2.6 Query: Find Tags

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findTags(filter: { per_page: -1, sort: \"scene_count\", direction: DESC }) { tags { id name scene_count } } }"}'
```

### 2.7 Query: Scenes by Performer ID

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScenes(scene_filter: { performers: { value: [\"PERFORMER_ID\"], modifier: INCLUDES }}) { count scenes { id title studio { name } } } }"}'
```

### 2.8 Query: Scenes by Studio ID

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScenes(scene_filter: { studios: { value: [\"STUDIO_ID\"], modifier: INCLUDES, depth: 1 }}) { count scenes { id title performers { name } } } }"}'
```

### 2.9 Query: Scenes by Duration Range

**Feature-length scenes (90+ minutes = 5400+ seconds)**:
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScenes(filter: { per_page: -1 }, scene_filter: { duration: { value: 5400, modifier: GREATER_THAN }}) { count scenes { id title files { basename duration } studio { name } performers { name } } } }"}'
```

### 2.10 Query: Statistics

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ stats { scene_count scenes_size scenes_duration performer_count studio_count tag_count total_o_count total_play_count total_play_duration } }"}'
```

**Expected Response**:
```json
{
  "data": {
    "stats": {
      "scene_count": 28746,
      "scenes_size": 12345678901234,
      "scenes_duration": 98765432.5,
      "performer_count": 5432,
      "studio_count": 876,
      "tag_count": 543,
      "total_o_count": 529,
      "total_play_count": 1234,
      "total_play_duration": 54321.5
    }
  }
}
```

---

## 3. Data Schemas

### 3.1 Filter Modifiers (CriterionModifier enum)

| Modifier | Description |
|----------|-------------|
| `EQUALS` | Exact match |
| `NOT_EQUALS` | Not equal |
| `GREATER_THAN` | Greater than value |
| `LESS_THAN` | Less than value |
| `IS_NULL` | Field is null |
| `NOT_NULL` | Field is not null |
| `INCLUDES` | Array includes value(s) |
| `INCLUDES_ALL` | Array includes all values |
| `EXCLUDES` | Array excludes value(s) |
| `MATCHES_REGEX` | Matches regex pattern |
| `NOT_MATCHES_REGEX` | Does not match regex |
| `BETWEEN` | Between two values |
| `NOT_BETWEEN` | Not between two values |

**IMPORTANT**: `GREATER_THAN_OR_EQUALS` does NOT exist. Use `GREATER_THAN` with value-1 instead.

### 3.2 Resolution Values (ResolutionEnum)

| Value | Resolution |
|-------|------------|
| `VERY_LOW` | 240p |
| `LOW` | 360p |
| `R360P` | 360p |
| `STANDARD` | 480p |
| `STANDARD_HD` | 540p |
| `WEB_HD` | 720p |
| `FULL_HD` | 1080p |
| `QUAD_HD` | 1440p |
| `VR_HD` | VR 1920 |
| `FOUR_K` | 2160p |
| `FIVE_K` | 2880p |
| `SIX_K` | 3240p |
| `EIGHT_K` | 4320p |

### 3.3 Gender Values (GenderEnum)

| Value | Description |
|-------|-------------|
| `MALE` | Male |
| `FEMALE` | Female |
| `TRANSGENDER_MALE` | Trans male |
| `TRANSGENDER_FEMALE` | Trans female |
| `INTERSEX` | Intersex |
| `NON_BINARY` | Non-binary |

### 3.4 Sort Direction (SortDirectionEnum)

| Value | Description |
|-------|-------------|
| `ASC` | Ascending |
| `DESC` | Descending |

### 3.5 Scene Filter Fields (SceneFilterType)

```graphql
input SceneFilterType {
  AND: [SceneFilterType!]
  OR: [SceneFilterType!]
  NOT: SceneFilterType

  # String filters
  title: StringCriterionInput
  details: StringCriterionInput
  path: StringCriterionInput
  oshash: StringCriterionInput
  checksum: StringCriterionInput
  phash: StringCriterionInput
  url: StringCriterionInput

  # Numeric filters
  id: IntCriterionInput
  rating100: IntCriterionInput
  o_counter: IntCriterionInput
  play_count: IntCriterionInput
  play_duration: IntCriterionInput
  duration: IntCriterionInput
  file_count: IntCriterionInput

  # Resolution filter
  resolution: ResolutionCriterionInput

  # Relationship filters
  studios: HierarchicalMultiCriterionInput
  performers: MultiCriterionInput
  tags: HierarchicalMultiCriterionInput
  performer_tags: HierarchicalMultiCriterionInput

  # Date filters
  date: DateCriterionInput
  created_at: TimestampCriterionInput
  updated_at: TimestampCriterionInput

  # Boolean filters
  organized: Boolean
  performer_favorite: Boolean
  interactive: Boolean
  interactive_speed: IntCriterionInput
}
```

### 3.6 Find Filter Type

```graphql
input FindFilterType {
  q: String           # Search query
  page: Int           # Page number (1-indexed)
  per_page: Int       # Items per page (-1 for all)
  sort: String        # Field to sort by
  direction: SortDirectionEnum
}
```

**Common sort fields**: `title`, `date`, `created_at`, `updated_at`, `rating100`, `o_counter`, `play_count`, `duration`, `random`

---

## 4. User Preference Profile

### 4.1 Content Preferences

| Category | Preference | Percentage |
|----------|------------|------------|
| Category | Western | 93% |
| Category | Japanese | 4.2% |
| Category | Anime | 2.5% |
| Resolution | Full HD 1080p | 87% |

### 4.2 Theme Preferences (from watched content)

| Theme | % of Watched |
|-------|--------------|
| **Threesome/Group** | 55.5% |
| **Interracial** | 55.1% |
| Teen/Young | 43.4% |
| Facial | 41.6% |
| **Taboo/Family** | 37.0% |
| BDSM/Kinky | 24.5% |
| MILF | 21.4% |
| Creampie | 16.0% |
| Anal | 14.8% |

### 4.3 Duration Preferences

| Duration Range | Preference |
|----------------|------------|
| Average watched | 44.8 min |
| **Sweet spot** | 30-45 min (34.7%) |
| 45-60 min | 21.6% |
| 15-30 min | 15.8% |
| Feature (90+ min) | 7.3% |

### 4.4 Favorite Studios (by O-weighted count)

| Rank | Studio | O-Weighted | Scenes |
|------|--------|------------|--------|
| 1 | **Pure Taboo** | 41 | 41 |
| 2 | Brazzers Exxtra | 18 | 18 |
| 3 | Daughter Swap | 14 | 13 |
| 4 | Family Strokes | 13 | 13 |
| 5 | Perv Therapy | 12 | 11 |
| 6 | Sis Swap | 12 | 12 |
| 7 | Dorcel Club | 11 | 8 |
| 8 | Hunter | 9 | 9 |
| 9 | DP World | 9 | 9 |

**Additional preferred studios**: MissaX, Deeper, Vixen, Family Swap, Step Siblings, Bratty Sis, My Family Pies

### 4.5 Favorite Female Performers (3+ scenes watched)

| Rank | Performer | Scenes | O-Weighted |
|------|-----------|--------|------------|
| 1 | **Sophia Burns** | 11 | 12 |
| 2 | **Lucy Foxx** | 11 | 11 |
| 3 | **Penny Barber** | 11 | 11 |
| 4 | Gal Ritchie | 9 | 9 |
| 5 | **Kenna James** | 8 | 11 |
| 6 | Kwini Kim | 8 | 9 |
| 7 | **Lexi Lore** | 8 | 8 |
| 8 | **Maya Woulfe** | 8 | 8 |
| 9 | **Vanna Bardot** | 8 | 8 |
| 10 | **Anna Claire Clouds** | 7 | 11 |
| 11 | **Cory Chase** | 7 | 7 |
| 12 | Scarlett Alexis | 6 | 9 |
| 13 | Luxe LaFox | 6 | 6 |
| 14 | Casey Calvert | 6 | 6 |
| 15 | Lilith Grace | 6 | 6 |
| 16 | Alex Coal | 6 | 6 |
| 17 | Whitney Wright | 6 | 6 |
| 18 | Vienna Black | 6 | 6 |

### 4.6 Favorite Male Performers

| Performer | Scenes | O-Weighted |
|-----------|--------|------------|
| Codey Steele | 17 | 17 |
| Seth Gamble | 13 | 16 |
| Isiah Maxwell | 10 | 13 |
| Donnie Rock | 12 | 13 |
| Tommy Pistol | 13 | 13 |
| Charles Dera | 12 | 12 |

### 4.7 Recommendation Scoring System

When generating recommendations, use this weighted scoring:

| Criterion | Points |
|-----------|--------|
| Favorite studio match | +3 |
| Favorite performer match | +3 |
| Theme match (taboo, swap, threesome, interracial) | +2 |
| Duration in sweet spot (30-60 min) | +1 |
| Western category (required filter) | Required |
| Already watched (o_counter > 0) | Exclude |

---

## 5. Category Detection Logic

### 5.1 Japanese Studios (case-insensitive match)

```
s1 no.1 style, sodstar, sod create, madonna, moodyz, wanz factory,
ideapocket, fitch, kawaii, premium, faleno, hunter, hunter black,
glory quest, dahlia, maxing, honnaka, rookie, real, chijo heaven,
royal, shigeki, japan hdv, heyzo, fc2, zukkon, bakkon
```

### 5.2 Anime Studios (case-insensitive match)

```
pink pineapple, t-rex, queen bee, mary jane, pixy, pixy soft,
mediabank, suzuki mirano, magin label, green bunny, ms pictures,
bunnywalker, antechinus, edge
```

### 5.3 Japanese Content Detection

Detect Japanese characters in title/filename:
- Hiragana: `[\u3040-\u309F]`
- Katakana: `[\u30A0-\u30FF]`
- Kanji: `[\u4E00-\u9FAF]`

### 5.4 Category Assignment Logic

```
if studio in JAPANESE_STUDIOS or title contains Japanese chars:
    category = "Japanese"
elif studio in ANIME_STUDIOS:
    category = "Anime"
else:
    category = "Western"
```

---

## 6. Series Pattern Detection

### 6.1 Pattern Definitions

| Pattern Type | Regex | Example Matches |
|--------------|-------|-----------------|
| Part | `Part\s*(\d+\|One\|Two\|Three\|Four\|Five)` | "Part 1", "Part Two" |
| Episode | `Episode\s*(\d+)` | "Episode 4" |
| Season/Episode | `S(\d+)\s*:?\s*E(\d+)` | "S3E4", "S3:E4" |
| Volume | `Vol\.?\s*(\d+)` | "Vol 1", "Vol. 2" |
| Scene | `Scene\s*(\d+)` | "Scene 3" |
| Numbered | `#(\d+)` or `\s-\s(\d+)$` | "#5", "Title - 2" |
| Roman | `\b(II\|III\|IV\|V\|VI\|VII\|VIII\|IX\|X)` | "Nymphomaniac II" |
| Tape | `Tape\s*(\d+)` | "Tape 3" |
| Chapter | `Chapter\s*(\d+)` | "Chapter 2" |
| Act | `Act\s*(\d+)` | "Act 5" |
| X of Y | `(\d+)\s*Of\s*(\d+)` | "1 Of 3" |

### 6.2 Series Name Extraction

To extract the base series name, remove the pattern match from the title:
```
series_name = title.replace(pattern_match, "").strip()
```

---

## 7. Existing Data Files

### 7.1 series_candidates.csv

**Location**: `/home/claudedev/stash/my-stashapp/series_candidates.csv`

**Schema**:
```csv
id,title,filename,studio,category,duration_min,pattern_type,pattern_match,series_name,performers
```

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Stash scene ID |
| title | string | Scene title (may be blank) |
| filename | string | File basename (use when title blank) |
| studio | string | Studio name |
| category | string | Western / Japanese / Anime |
| duration_min | integer | Duration in minutes |
| pattern_type | string | Type of series pattern detected |
| pattern_match | string | Actual matched pattern text |
| series_name | string | Extracted base series name |
| performers | string | Top 5 performers (semicolon-separated) |

**Stats**: 1,371 series candidates

### 7.2 feature_length.csv

**Location**: `/home/claudedev/stash/my-stashapp/feature_length.csv`

**Schema**:
```csv
id,title,filename,studio,category,duration_min,performers
```

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Stash scene ID |
| title | string | Scene title (may be blank) |
| filename | string | File basename |
| studio | string | Studio name |
| category | string | Western / Japanese / Anime |
| duration_min | integer | Duration in minutes |
| performers | string | Top 5 performers (semicolon-separated) |

**Stats**: 487 feature-length scenes (90+ minutes)

### 7.3 scene_analysis.json

**Location**: `/home/claudedev/stash/my-stashapp/scene_analysis.json`

Combined JSON with all data for programmatic access.

### 7.4 Temp Files

| File | Description |
|------|-------------|
| `/tmp/o_count_scenes.json` | All scenes with O count > 0 (519 scenes) |
| `/tmp/all_scenes_with_files.json` | All 8517 filtered scenes with file info |
| `/tmp/watched_scene_ids.txt` | List of all watched scene IDs (one per line) |

---

## 8. Common Tasks & Workflows

### 8.1 Get All Watched Scene IDs

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScenes(filter: { per_page: -1 }, scene_filter: { o_counter: { value: 0, modifier: GREATER_THAN }}) { scenes { id } } }"}' \
  | jq -r '.data.findScenes.scenes[].id' | sort -n
```

### 8.2 Search CSV Files by Performer

```bash
# Search series_candidates.csv
grep -i "Sophia Burns" /home/claudedev/stash/my-stashapp/series_candidates.csv

# Search feature_length.csv
grep -i "Vanna Bardot" /home/claudedev/stash/my-stashapp/feature_length.csv
```

### 8.3 Search CSV Files by Studio

```bash
# Find all MissaX series
grep ",MissaX," /home/claudedev/stash/my-stashapp/series_candidates.csv

# Find all Pure Taboo feature-length
grep ",Pure Taboo," /home/claudedev/stash/my-stashapp/feature_length.csv
```

### 8.4 Search CSV Files by Category

```bash
# Western only
grep ",Western," /home/claudedev/stash/my-stashapp/series_candidates.csv

# Exclude Japanese and Anime
grep -v ",Japanese,\|,Anime," /home/claudedev/stash/my-stashapp/feature_length.csv
```

### 8.5 Generate Recommendations Workflow

1. **Get watched scene IDs**:
   ```bash
   # Save to file for reference
   curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
     -H "Content-Type: application/json" \
     -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
     -d '{"query": "{ findScenes(filter: { per_page: -1 }, scene_filter: { o_counter: { value: 0, modifier: GREATER_THAN }}) { scenes { id } } }"}' \
     | jq -r '.data.findScenes.scenes[].id' > /tmp/watched_ids.txt
   ```

2. **Search CSVs for favorite performers/studios**:
   ```bash
   grep -E "Sophia Burns|Penny Barber|Kenna James|Anna Claire Clouds|Vanna Bardot" \
     /home/claudedev/stash/my-stashapp/series_candidates.csv | grep ",Western,"
   ```

3. **Filter out watched scenes**:
   ```bash
   # Check if scene ID is in watched list
   grep "^SCENE_ID$" /tmp/watched_ids.txt
   ```

4. **Score and rank results** based on preference scoring system

### 8.6 Check Scene Details by ID

```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScene(id: \"9493\") { id title studio { name } performers { name } tags { name } o_counter files { duration } } }"}' | jq
```

---

## 9. Work Completed Summary

### 9.1 Data Extraction (Completed)

| Task | Status | Output |
|------|--------|--------|
| Extract all scenes with file info | ✅ Done | 8,517 scenes |
| Detect series patterns | ✅ Done | 1,371 candidates |
| Extract feature-length (90+ min) | ✅ Done | 487 scenes |
| Categorize content (Western/Japanese/Anime) | ✅ Done | All scenes |
| Build user preference profile | ✅ Done | From 519 watched |

### 9.2 User Preference Analysis (Completed)

| Analysis | Status | Key Finding |
|----------|--------|-------------|
| Top studios by O-count | ✅ Done | Pure Taboo #1 |
| Top female performers | ✅ Done | Sophia Burns, Lucy Foxx, Penny Barber |
| Top male performers | ✅ Done | Codey Steele #1 |
| Theme preferences | ✅ Done | Threesome 55%, Interracial 55% |
| Duration preferences | ✅ Done | Sweet spot 30-45 min |
| Category preferences | ✅ Done | 93% Western |

### 9.3 Recommendation Generation (Completed)

Generated personalized recommendations cross-referencing:
- CSV data with user preferences
- Filtered to Western only
- Checked watched status (o_counter > 0)
- Prioritized favorite studios and performers

#### Top Series Recommendations (Unwatched)

| Rank | Series | Studio | Parts | Key Performers |
|------|--------|--------|-------|----------------|
| 1 | Lawless | Deeper | 5 | Kenna James, Anna Claire Clouds |
| 2 | Pushing Boundaries | MissaX | 5 | Kenna James |
| 3 | In Love With Daddy II-IV | MissaX | 3 | Penny Barber, Maya Woulfe |
| 4 | Influence: Vanna Bardot | Tushy/Blacked | 5 | Vanna Bardot |
| 5 | Second Chance | MissaX | 2 | Penny Barber |
| 6 | Muse + Muse 2 | Deeper | 10 | Vanna Bardot (Ep 4) |
| 7 | Raw | Blockbuster | 4 | Anna Claire Clouds |
| 8 | The Three Fucks Of Christmas | Brazzers Exxtra | 3 | Cherie DeVille |
| 9 | Curse of the Skull Swap | Sis Swap | 2 | Angel Gostosa, Lily Lou |
| 10 | Obsession | MissaX | 4 | Cherie DeVille, Jill Kassidy |

#### Top Feature-Length Recommendations (Unwatched)

| Rank | Title | Studio | Duration | Key Performers |
|------|-------|--------|----------|----------------|
| 1 | A Mother's Test pt.1 | MissaX | 109 min | Vanna Bardot, Reagan Foxx |
| 2 | The Bucket List | Pure Taboo | 96 min | Vanna Bardot, Codey Steele |
| 3 | Releasing The Tension | Perv Therapy | 90 min | Penny Barber |
| 4 | Aiden Ashley's House Party | Bellesa | 97 min | Kenna James |
| 5 | MILF Oasis | Transfixed | 101 min | Penny Barber, Casey Calvert |
| 6 | Triangle of Lies | MissaX | 96 min | Kristen Scott, AJ Applegate |
| 7 | Luxure - My Wife's Friends | Dorcel Vision | 136 min | Euro cast |
| 8 | Brazzers 20 For 20 | Brazzers Exxtra | 90 min | Gal Ritchie, massive orgy |

### 9.4 Key Scene IDs Reference

**Watched scenes to exclude** (partial list of notable ones):
- 9493 (Lawless Part 1 - Kenna James)
- 8944 (Strip - Dorcel)
- 9147 (Vanna's Easy A)
- 10377 (The Secrets We Share)
- 28000, 28001, 28022 (Swinging In The Neighborhood 1-3)
- 19039 (Gen ZZ Part 1)
- 10380, 10381, 10977 (Peeping Gal 1-3)
- 11017, 11018, 11019 (Grinders Parts 2-4)
- 8690 (The Blueprint Part 1 - Lexi Lore)

---

## Appendix A: Quick Reference Commands

### Get Total Scene Count
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findScenes { count } }"}' | jq '.data.findScenes.count'
```

### Get Performer ID by Name
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findPerformers(performer_filter: { name: { value: \"Sophia Burns\", modifier: EQUALS }}) { performers { id name } } }"}' | jq
```

### Get Studio ID by Name
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findStudios(filter: { q: \"Pure Taboo\" }) { studios { id name } } }"}' | jq
```

### Get Tag ID by Name
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg" \
  -d '{"query": "{ findTags(filter: { q: \"Threesome\" }) { tags { id name scene_count } } }"}' | jq
```

---

## Appendix B: Common Pitfalls

1. **GREATER_THAN_OR_EQUALS does not exist** - Use `GREATER_THAN` with value-1

2. **per_page: -1 returns ALL results** - Be careful with large datasets

3. **Titles may be blank** - Always fall back to `files.basename` when title is empty

4. **Duration is in seconds** - Convert to minutes by dividing by 60

5. **performers array may be empty** - Handle gracefully

6. **studio may be null** - Check before accessing `.name`

7. **Japanese character detection** - Use proper Unicode ranges

8. **CSV files have commas in quoted fields** - Parse carefully with proper CSV handling

---

## Appendix C: Error Handling

### Common GraphQL Errors

**Invalid enum value**:
```json
{"errors":[{"message":"Value \"INVALID\" does not exist in \"CriterionModifier!\" enum."}]}
```
→ Check CriterionModifier enum values in section 3.1

**Null data response**:
```json
{"data":{"findScenes":null}}
```
→ Check authentication header is correct

**Rate limiting** (unlikely but possible):
→ Add delays between requests if making many calls

---

*Document created: 2026-01-20*
*Last updated: 2026-01-20*
*Stash version: Compatible with schema 76*
