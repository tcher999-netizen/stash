# Scene Analysis Handover Document

## Overview
This document contains all context needed to continue the scene analysis and recommendation task for the Stash instance.

## Stash Instance Details
- **GraphQL Endpoint**: `https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZG1pbiIsInN1YiI6IkFQSUtleSIsImlhdCI6MTc2NDQxNTQwM30.ytdPutZy9RSSqn3XS_UY4jUEMkGcC5CpOd8dm-Jhslg`
- **Internal Port**: localhost:9999
- **Total Scenes**: ~28,746
- **Database Schema**: 76

## Files Created

### 1. series_candidates.csv (in project root)
Contains scenes detected as part of multi-episode series.

**Columns**:
- `id` - Stash scene ID
- `title` - Scene title (may be blank)
- `filename` - File basename (use when title is blank)
- `studio` - Studio name
- `category` - Western / Japanese / Anime
- `duration_min` - Duration in minutes
- `pattern_type` - Type of series pattern (Part, Episode, Season/Episode, Volume, Scene, Numbered, Roman, etc.)
- `pattern_match` - Actual matched pattern text
- `series_name` - Extracted base series name
- `performers` - Top 5 performers (semicolon-separated)

**Stats**: 1,371 series candidates total

### 2. feature_length.csv (in project root)
Contains scenes over 90 minutes duration.

**Columns**:
- `id` - Stash scene ID
- `title` - Scene title (may be blank)
- `filename` - File basename
- `studio` - Studio name
- `category` - Western / Japanese / Anime
- `duration_min` - Duration in minutes
- `performers` - Top 5 performers

**Stats**: 487 feature-length scenes total

### 3. scene_analysis.json (in project root)
Combined JSON with all data for programmatic access.

---

## User Preference Profile (from O count > 0 analysis)

Based on **519 scenes** with O counter > 0 (529 total O's):

### Top Studios (by O-weighted count)
| Studio | O-Weighted | Scenes |
|--------|------------|--------|
| **Pure Taboo** | 41 | 41 |
| Brazzers Exxtra | 18 | 18 |
| Daughter Swap | 14 | 13 |
| Family Strokes | 13 | 13 |
| Perv Therapy | 12 | 11 |
| Sis Swap | 12 | 12 |
| Dorcel Club | 11 | 8 |
| Hunter | 9 | 9 |
| DP World | 9 | 9 |

### Top Female Performers (3+ scenes watched)
| Performer | Scenes | O-Weighted |
|-----------|--------|------------|
| **Sophia Burns** | 11 | 12 |
| **Lucy Foxx** | 11 | 11 |
| **Penny Barber** | 11 | 11 |
| Gal Ritchie | 9 | 9 |
| Kenna James | 8 | 11 |
| Kwini Kim | 8 | 9 |
| Lexi Lore | 8 | 8 |
| Maya Woulfe | 8 | 8 |
| Vanna Bardot | 8 | 8 |
| Anna Claire Clouds | 7 | 11 |
| Cory Chase | 7 | 7 |
| Scarlett Alexis | 6 | 9 |
| FAV | 6 | 6 |
| Luxe LaFox | 6 | 6 |
| Casey Calvert | 6 | 6 |
| Lilith Grace | 6 | 6 |
| Alex Coal | 6 | 6 |
| Whitney Wright | 6 | 6 |
| Vienna Black | 6 | 6 |

### Top Male Performers
| Performer | Scenes | O-Weighted |
|-----------|--------|------------|
| Codey Steele | 17 | 17 |
| Seth Gamble | 13 | 16 |
| Isiah Maxwell | 10 | 13 |
| Donnie Rock | 12 | 13 |
| Tommy Pistol | 13 | 13 |
| Charles Dera | 12 | 12 |

### Content Theme Preferences
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

### Duration Preference
- **Average**: 44.8 min
- **Sweet spot**: 30-45 min (34.7% of watched)
- 45-60 min: 21.6%
- 15-30 min: 15.8%
- Feature length (90+ min): 7.3%

### Other Preferences
- **Category**: 93% Western, 4.2% Japanese, 2.5% Anime
- **Resolution**: 87% Full HD 1080p
- **Body type**: Slight preference for natural/small tits (30%) over big tits (27%)

### Highest O-Count Scene
- **"Strip"** (Dorcel Club) - O count: 4

### Top Performer Pairing
- Anna Claire Clouds + Kenna James: 6 scenes together

---

## Pending Task: Cross-Reference Recommendations

The next step is to cross-reference the series_candidates.csv and feature_length.csv with the user's preferences to generate personalized recommendations.

### Recommendation Criteria (weighted scoring)
1. **Studio match** (+3 points): Pure Taboo, Brazzers Exxtra, Daughter Swap, Family Strokes, Perv Therapy, Sis Swap, Dorcel, MissaX, Deeper, Vixen, Family Swap, Step Siblings, Bratty Sis, My Family Pies
2. **Theme match** (+2 points): taboo, family, step, therapy, swap, threesome, group, interracial, bbc, blacked
3. **Performer match** (+3 points): Any of the top performers listed above
4. **Duration in sweet spot 30-60 min** (+1 point)
5. **Western category only** (filter out Japanese/Anime unless requested)

### Already Generated Recommendations (need performer cross-reference)

**Top Series Recommendations**:
1. Curse of the Skull Swap (Sis Swap, 2 eps)
2. Nymphomaniac (MissaX, 2 eps)
3. The Three Fucks Of Christmas (Brazzers Exxtra, 3 eps)
4. Gen ZZ (Brazzers Exxtra, 3 eps)
5. Indecent (MissaX, 3 eps)
6. Obsession (MissaX, 3 eps)
7. Lawless (Deeper, 5 eps)
8. Muse (Deeper, 5 eps)
9. The Summoning (Sis Swap, 3 eps)
10. TroubleMakerzz (Brazzers Exxtra, 2 eps)

**Top Feature-Length Recommendations**:
1. Hard Outdoor Threesome with Dani Daniels & Lexi Lowe (Dorcel Club, 116m)
2. Luxure - My Wife's Friends (Dorcel Vision, 136m)
3. A Mother's Test pt.1 (MissaX, 109m)
4. The Secrets We Share (Pure Taboo, 153m)
5. The Bucket List (Pure Taboo, 96m)
6. Triangle of Lies (MissaX, 96m)
7. Releasing The Tension (Perv Therapy, 90m)

---

## GraphQL Query Templates

### Get scenes with all details (including filename)
```graphql
query {
  findScenes(filter: { per_page: 100, page: 1, sort: "created_at", direction: DESC },
    scene_filter: {
      duration: { value: 840, modifier: GREATER_THAN },
      resolution: { value: WEB_HD, modifier: GREATER_THAN },
      tags: { value: ["1697"], modifier: EXCLUDES }  # Excludes Deepfake tag
    }) {
    count
    scenes {
      id
      title
      files { basename path duration width height }
      studio { name }
      performers { name gender }
      tags { name }
      o_counter
      play_count
      date
      created_at
    }
  }
}
```

### Get scenes by specific performer
```graphql
query {
  findScenes(scene_filter: {
    performers: { value: ["PERFORMER_ID"], modifier: INCLUDES }
  }) {
    scenes { id title studio { name } }
  }
}
```

### Get performer ID by name
```graphql
query {
  findPerformers(performer_filter: { name: { value: "Sophia Burns", modifier: EQUALS }}) {
    performers { id name }
  }
}
```

---

## Category Detection Logic

**Japanese Studios** (lowercase match):
s1 no.1 style, sodstar, sod create, madonna, moodyz, wanz factory, ideapocket, fitch, kawaii, premium, faleno, hunter, hunter black, glory quest, dahlia, maxing, honnaka, rookie, real, chijo heaven, royal, shigeki, japan hdv, heyzo, fc2, zukkon, bakkon

**Anime Studios** (lowercase match):
pink pineapple, t-rex, queen bee, mary jane, pixy, pixy soft, mediabank, suzuki mirano, magin label, green bunny, ms pictures, bunnywalker, antechinus, edge

**Japanese title detection**: Contains Japanese characters (hiragana, katakana, kanji)

---

## Series Pattern Detection

| Pattern | Regex | Example |
|---------|-------|---------|
| Part | `Part\s*(\d+\|One\|Two...)` | "Part 1", "Part Two" |
| Episode | `Episode\s*(\d+)` | "Episode 4" |
| Season/Episode | `S(\d+)\s*:?\s*E(\d+)` | "S3E4", "S3:E4" |
| Volume | `Vol\.?\s*(\d+)` | "Vol 1", "Vol. 2" |
| Scene | `Scene\s*(\d+)` | "Scene 3" |
| Numbered | `#(\d+)` or trailing ` - \d+` | "#5", "Title - 2" |
| Roman | `\b(II\|III\|IV\|V...)` | "Nymphomaniac II" |
| Tape | `Tape\s*(\d+)` | "Tape 3" |

---

## Temp Files Location

- `/tmp/o_count_scenes.json` - All scenes with O count > 0 (519 scenes)
- `/tmp/all_scenes_with_files.json` - All 8517 filtered scenes with file info

---

## Next Steps for Continuation

1. **Cross-reference performers**: Query the series/feature-length scenes to check which ones contain the user's favorite performers
2. **Filter already watched**: Remove scenes where O count > 0 from recommendations
3. **Generate final ranked list**: Combine studio, theme, performer, and duration scores
4. **Present recommendations**: Format as easy-to-browse list with scene IDs for direct access

### Sample bash command to check if performer is in a scene:
```bash
curl -s -X POST "https://stash.jkhsdfkjhkjw4rsfd.xyz/graphql" \
  -H "Content-Type: application/json" \
  -H "ApiKey: YOUR_API_KEY" \
  -d '{"query": "{ findScene(id: \"SCENE_ID\") { performers { name } } }"}' | jq '.data.findScene.performers[].name'
```

---

## Summary

User prefers Western, professional taboo/family-themed content with threesome scenarios from studios like Pure Taboo, Brazzers Exxtra, and Dorcel. Favorite performers include Sophia Burns, Penny Barber, Lucy Foxx, Kenna James, and Anna Claire Clouds. Optimal duration is 30-45 minutes. The CSV files now include filename column for scenes with blank titles.
