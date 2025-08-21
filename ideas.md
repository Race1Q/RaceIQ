# RaceIQ: Product & Technical Specification

## 1. TL;DR

RaceIQ is a full-stack web application designed for Formula 1 fans, data analysts, and fantasy players. It provides deep, post-race analytics, driver-team performance comparisons, and a lightweight fantasy sports experience. The platform ingests and processes data from the OpenF1 API to deliver rich, interactive visualizations and metrics that go beyond standard broadcast information.

Access is governed by a simple Role-Based Access Control (RBAC) system. The public can view static pages, while authenticated **members** can access detailed dashboards, compare drivers, and participate in the fantasy league. **Admins** have access to a system management dashboard for data ingestion monitoring and user management.

---

## 2. Information Architecture

The application is structured into public, member-only, and admin-only sections to manage access and provide a clear user journey.

- **Public Pages**
  - `/` (**Home**): A marketing landing page for unauthenticated users.
  - `/about` (**About**): A static page describing the project's mission and team.
- **Member Pages** (Requires authentication)
  - `/home` (**User Home**): A personalized dashboard with links to manage fantasy teams (`Create`, `Edit`, `View`).
  - `/drivers` (**Drivers**): An index of all current season drivers, displayed as "FIFA-style" stat cards.
  - `/drivers/:driverId` (**Driver Dashboard**): A detailed deep-dive page for a single driver's performance.
  - `/races/:raceId` (**Race/Track**): A comprehensive summary of a specific race event, including track info, aggregate stats, and key moments.
  - `/teams` (**Teams/Fantasy**): The hub for the fantasy league, including leaderboards and team management.
- **Admin Pages** (Requires `admin` role)
  - `/admin` (**System Dashboard**): Tools for monitoring data ingestion jobs, viewing system health, and managing users.

**Navigation Map:**
`Public Home` → `Login` → `Member Home` → (`Drivers`, `Races`, `Teams`) → `Driver Dashboard` or `Race/Track Details`

---

## 3. Feature Details (by Page)

### Drivers Index Page (`/drivers`)

This page serves as the main entry point for exploring driver data.

- **Layout**: A responsive grid of "FIFA-style" driver cards.
- **Functionality**: Click a card to navigate to the full `Driver Dashboard`. Includes filters for team and sorting by key metrics.
- **Driver Card Mini-Metrics**:

| Metric                  | Description                                          | Data Source              |
| :---------------------- | :--------------------------------------------------- | :----------------------- |
| **Headshot & Number**   | Official driver photo and racing number.             | `drivers` table          |
| **Team Logo & Name**    | Current constructor logo and name.                   | `teams` table            |
| **Form (Last 5)**       | A sparkline chart of the last 5 finishing positions. | `race_results` (derived) |
| **Avg. Pit Time**       | Average stationary pit stop time this season.        | `pit_stops` (derived)    |
| **Quali vs Race Δ**     | Avg. change between qualifying and finishing pos.    | `race_results` (derived) |
| **Best Overtaker Rank** | Season-wide rank based on total overtakes.           | `overtakes` (derived)    |

### Driver Dashboard (`/drivers/:driverId`)

The central hub for analyzing a single driver's performance, organized into sections/tabs.

- **Header**: Driver name, team, headshot, and key summary stats (Wins, Podiums, Poles this season).
- **Sections / Tabs**:

  1.  **Race Performance**:
      - **Race Trace (Gap to Leader)**: Line chart showing the time gap to the race leader on each lap. _Why it matters: Instantly shows if a driver is closing in or falling behind._
      - **Position by Lap**: A simple line chart illustrating the driver's position throughout the race. _Why it matters: Visualizes the narrative of their race—a good start, a mid-race struggle, a late charge._
      - **Speed vs. Distance**: A plot showing speed over the course of a lap. _Why it matters: Identifies where on the track a driver is fastest or slowest compared to others._
  2.  **Strategy & Pit Stops**:
      - **Tire Stint Timeline**: Horizontal bars showing each tire stint's compound and duration. _Why it matters: Makes complex tire strategies easy to understand at a glance._
      - **Pit Stop Durations**: Bar chart comparing the driver's pit stop times to the race average/best. _Why it matters: Highlights operational excellence or costly errors by the pit crew._
  3.  **Advanced Analytics**:
      - **DRS Usage Timeline**: A timeline indicating laps where DRS was activated. _Why it matters: Correlates DRS usage with overtaking opportunities and straight-line speed advantages._
      - **Incidents/Flags Overlay**: Markers on timelines indicating yellow/red flags or incidents involving the driver. _Why it matters: Provides context for sudden changes in pace or position._

- **Data Handling**: Telemetry-heavy charts like "Speed vs. Distance" should initially show data for a representative lap (e.g., fastest lap) with an option to load other laps on demand to manage initial load times.

### Race/Track Page (`/races/:raceId`)

An aggregate view of a single race event.

- **Header**: Track name, country, circuit map, and date.
- **Key Info Block**: Weather conditions, fastest lap (driver and time), total overtakes.
- **Visualizations & Data**:
  - **Flags Timeline**: A timeline of the entire race showing periods of yellow, red, or safety car flags.
  - **Pace Distribution**: A histogram/boxplot showing the distribution of lap times for all drivers.
  - **Tire Strategy Summary**: A chart showing the most common tire strategies used across the grid (e.g., M-H, S-M-H).
  - **Historical Stats**: A small table with historical data for the track, such as the all-time lap record holder and previous winners.

### Teams/Fantasy (MVP)

A lightweight fantasy implementation for user engagement.

- **Create Team**: Users select a predefined number of drivers for their fantasy team before a race weekend.
- **Edit Team**: Users can modify their driver lineup before a specified deadline (e.g., start of qualifying).
- **View Team**: Displays the user's current team and their total points for the season.
- **Leaderboard**: A simple ranked list of all users based on their total fantasy points.
- **Scoring (MVP Rules)**:
  - Win: **+25** points
  - Podium (2nd/3rd): **+15** points
  - Fastest Lap: **+10** points
  - Position Gained (vs. start): **+1** point per position
  - Did Not Finish (DNF): **-5** points
  - Pole Position: **+8** points

---

## 4. Visualizations (Catalog)

Charts are central to the RaceIQ experience. The recommended library is **Recharts** for its simplicity and composability, but alternatives like Chart.js or D3 could be used. Performance is key; virtualize lists and memoize chart components.

| Chart Name             | Inputs (per driver/race)                        | Interpretation                                                           |
| :--------------------- | :---------------------------------------------- | :----------------------------------------------------------------------- |
| **Race Trace**         | `(lap, gap_to_leader_seconds)`                  | Shows the time evolution between a driver and the leader.                |
| **Position/Lap**       | `(lap, position)`                               | A narrative of the driver's progress or regress through the field.       |
| **Speed vs. Distance** | `(distance_meters, speed_kmh)` for a single lap | Pinpoints parts of the track where a driver excels or struggles.         |
| **Tire Timeline**      | `(stint_start_lap, stint_end_lap, compound)`    | Visualizes the entire tire strategy in a compact format.                 |
| **Pit Stop Bars**      | `(driver, pit_duration_seconds)`                | Compares pit stop efficiency against competitors.                        |
| **DRS Timeline**       | `(lap, drs_activated_boolean)`                  | Indicates when a driver had a significant straight-line speed advantage. |
| **Sector Heatmap**     | `(driver, sector_number, avg_time)`             | Highlights which drivers are dominant in specific sectors of the track.  |
| **Degradation Slope**  | `(lap_in_stint, lap_time)`                      | A line chart showing lap time increase, indicating tire wear.            |
| **Form Trend**         | `(race_date, finishing_position)`               | A simple line chart (sparkline) showing recent performance trends.       |

---

## 5. Data Model (Supabase)

The schema is designed to be relational, with clear links between events, drivers, and results.

| Table Name            | Essential Fields                                                                     | Notes                                                                     |
| :-------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `drivers`             | `id`, `full_name`, `country_code`, `team_id` (FK), `driver_number`                   | Core driver entity.                                                       |
| `teams`               | `id`, `name`, `base_location`                                                        | Constructor teams.                                                        |
| `circuits`            | `id`, `name`, `location`, `country`, `length_km`                                     | Track information.                                                        |
| `races`               | `id`, `circuit_id` (FK), `year`, `race_date`, `weather` (JSON)                       | A specific race event.                                                    |
| `race_results`        | `id`, `race_id` (FK), `driver_id` (FK), `start_pos`, `finish_pos`                    | Final results for each driver in a race. Index on `(race_id, driver_id)`. |
| `stints`              | `id`, `race_id` (FK), `driver_id` (FK), `start_lap`, `end_lap`, `compound`           | Tire stint data.                                                          |
| `pit_stops`           | `id`, `race_id` (FK), `driver_id` (FK), `lap`, `duration_sec`                        | Pit stop events.                                                          |
| `lap_times`           | `race_id` (FK), `driver_id` (FK), `lap`, `time_sec`, `position`                      | Individual lap data. PK on `(race_id, driver_id, lap)`.                   |
| `flags`               | `id`, `race_id` (FK), `flag_type`, `start_lap`, `end_lap`                            | Race-wide events like Safety Cars.                                        |
| `drs_events`          | `race_id` (FK), `driver_id` (FK), `lap`                                              | Records each lap DRS was used.                                            |
| `overtakes` (derived) | `id`, `race_id` (FK), `overtaking_driver_id` (FK), `overtaken_driver_id` (FK), `lap` | Calculated during post-race derivation.                                   |
| `user_teams`          | `id`, `user_id` (FK to `auth.users`), `team_name`                                    | A user's fantasy team.                                                    |
| `user_team_drivers`   | `user_team_id` (FK), `driver_id` (FK)                                                | Joins users' fantasy teams to drivers. PK on `(user_team_id, driver_id)`. |
| `fantasy_scores`      | `id`, `user_id` (FK), `race_id` (FK), `points`                                       | Stores points scored by a user for a given race.                          |

**RLS Note**: Row Level Security policies will be enabled on `user_teams` and `user_team_drivers` to ensure users can only read/write their own fantasy data (`user_id = auth.uid()`).

---

## 6. API Surface (NestJS)

Endpoints are protected by JWT guards checking for appropriate permissions (scopes).

### Driver Endpoints

| Method | Path                         | Permission (Scope) | Response Summary                                   |
| :----- | :--------------------------- | :----------------- | :------------------------------------------------- |
| `GET`  | `/drivers`                   | `read:drivers`     | Array of all drivers with summary stats for cards. |
| `GET`  | `/drivers/:id`               | `read:drivers`     | Full profile for one driver.                       |
| `GET`  | `/drivers/:id/results/:year` | `read:drivers`     | Detailed race-by-race results for a given year.    |

### Race Endpoints

| Method | Path                 | Permission (Scope) | Response Summary                                            |
| :----- | :------------------- | :----------------- | :---------------------------------------------------------- |
| `GET`  | `/races`             | `read:races`       | Array of all races in the system, grouped by year.          |
| `GET`  | `/races/:id`         | `read:races`       | Detailed summary of a race event, including flags, weather. |
| `GET`  | `/races/:id/results` | `read:races`       | Full finishing order and results for a specific race.       |

### Fantasy Team Endpoints

| Method | Path                 | Permission (Scope) | Response Summary                                   |
| :----- | :------------------- | :----------------- | :------------------------------------------------- |
| `GET`  | `/teams/me`          | `read:teams`       | The authenticated user's fantasy team and drivers. |
| `POST` | `/teams/me`          | `write:teams`      | Creates a new fantasy team for the user.           |
| `PUT`  | `/teams/me`          | `write:teams`      | Updates the user's fantasy team driver lineup.     |
| `GET`  | `/teams/leaderboard` | `read:teams`       | An array of users and their total fantasy scores.  |

### Admin Endpoints

| Method | Path                    | Permission (Scope) | Response Summary                                   |
| :----- | :---------------------- | :----------------- | :------------------------------------------------- |
| `POST` | `/admin/ingest/:raceId` | `admin:all`        | Triggers a data ingestion job for a specific race. |
| `GET`  | `/admin/jobs`           | `admin:all`        | Status of recent ingestion jobs.                   |

### Example Responses

**`GET /drivers/max_verstappen`**

```json
{
  "driverId": "max_verstappen",
  "fullName": "Max Verstappen",
  "team": { "teamId": "red_bull", "name": "Red Bull Racing" },
  "seasonStats": {
    "wins": 12,
    "podiums": 15,
    "poles": 8,
    "avgPitTime": 2.45
  }
}
```
