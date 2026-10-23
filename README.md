# World War Bot Indonesia

An automated geopolitical battle simulation bot covering all 507 Indonesian cities and regencies (*Kota & Kabupaten*) across 38 provinces. Generates high-definition tactical map graphics (1920x1080) and publishes battle dispatches directly to Facebook Pages via the Meta Graph API.

---

## Features

- **507 Administrative Regions**: Complete official GeoJSON polygon dataset encompassing all autonomous cities and regencies from Sabang to Merauke.
- **Connected Island Adjacency Graph**: Comprehensive topological connectivity including both land borders and critical maritime straits (Sunda Strait, Bali Strait, Lombok Strait, Madura Strait, Makassar Strait, etc.), ensuring all islands can engage in combat.
- **Dynamic 1920x1080 Map Renderer**: High-resolution PNG visualizer powered by `@resvg/resvg-js`. Features matte geopolitical color palettes, nautical coordinate graticules, live 3.4x satellite radar insets for the battlefield, battle trajectory indicators, and unified leaderboard statistics.
- **Dual Visual Themes**: Configurable between an editorial **Light Theme** (Modern Cartographic Atlas) and a **Dark Theme** (Tactical Military Command Center).
- **Satirical War Narrative Engine**: Generates witty wartime news dispatches reflecting real-world Indonesian cultural lore and news events up to October 2026 (governance controversies, financial markets, local rivalries, infrastructure debates).
- **Facebook Graph API Integration**: Automatically uploads battle photos and news bulletins directly to a designated Facebook Page feed. Includes an automatic dry-run fallback when credentials are unconfigured.
- **Zero-Cost GitHub Actions Deployment**: Pre-configured CI/CD workflow that runs hourly, processes turns, publishes to Facebook, and commits state history back to GitHub without external server costs.

---

## Prerequisites

- **Node.js**: Version 18.0 or newer (tested on Node.js 20, 22, and 24).
- **Meta / Facebook Account**: Only required for publishing to a live Facebook Page.

---

## Quickstart

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mbayue/iwb.git
cd iwb
npm install
```

### 2. Local Configuration (Dry-Run Mode)

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

If `FB_PAGE_ID` and `FB_PAGE_ACCESS_TOKEN` are omitted, the bot defaults to **Dry-Run Mode**. In this mode, generated 1080p map images and dispatches are saved locally to the `output/` directory without making network requests to Facebook.

To test a single simulation turn:

```bash
npm run dry
```

Output files will appear in:
- `output/round_00001.png` (High-definition map image)
- `output/round_00001.txt` (Facebook caption text)

---

## Automated Deployment (GitHub Actions)

This repository includes a scheduled GitHub Actions workflow (`.github/workflows/warbot.yml`) that executes hourly runs at zero cost.

1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/mbayue/iwb.git
   git branch -M main
   git push -u origin main
   ```
2. Navigate to **Settings** → **Secrets and variables** → **Actions** in your repository.
3. Add two Repository Secrets:
   - `FB_PAGE_ID`: Your numerical Facebook Page ID.
   - `FB_PAGE_ACCESS_TOKEN`: Your permanent long-lived Page Access Token.
4. Go to **Settings** → **Actions** → **General** → **Workflow permissions**, select **Read and write permissions**, and save.
5. In the **Actions** tab, select **World War Bot Indonesia - Hourly Turn** and click **Run workflow** to verify execution.

Once enabled, GitHub Actions automatically executes a turn every hour on the hour (`0 * * * *`), updates `data/state.json`, and commits progress back to the repository.

---

## Local & Server Execution

### Continuous Interval Mode

To run an autonomous background loop locally or on a server:

```bash
npm run auto
```

The default interval is 3600 seconds (1 hour). Customize this by setting `POST_INTERVAL_SECONDS` in `.env` or passing seconds as an argument:

```bash
node index.js auto 1800 # Runs every 30 minutes
```

### Linux Crontab (VPS)

Add a crontab entry to trigger a turn at the top of every hour:

```cron
0 * * * * cd /path/to/iwb && node index.js turn >> /var/log/warbot.log 2>&1
```

### Windows Task Scheduler

1. Open **Task Scheduler** on Windows.
2. Select **Create Basic Task...** and name it `World War Bot Indonesia`.
3. Set the trigger to **Daily**, repeating every 1 hour.
4. Set the action to **Start a program**:
   - Program: `node`
   - Arguments: `index.js turn`
   - Start in: `C:\path\to\iwb`

---

## Facebook Page API Setup

To obtain credentials for automated Facebook Page publishing:

1. Visit the [Meta for Developers Portal](https://developers.facebook.com/) and register or log in.
2. Create an App with the **Business** or **None** type.
3. In the top navigation, select **Tools** → **Graph API Explorer**.
4. In the **User or Page** dropdown, select **Get Page Access Token** and authorize the target Page.
5. Under **Add a Permission**, add:
   - `pages_manage_posts`
   - `pages_read_engagement`
6. Click **Generate Access Token**.
7. In the **User or Page** dropdown, switch from *User Token* to your specific **Page Token**.
8. Open the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/), paste the token, and click **Debug**.
9. Click **Extend Access Token** at the bottom of the page to generate a permanent token (*Expires: Never*).
10. Store the Page ID and extended token in `.env` or GitHub Secrets.

---

## CLI Reference

| Command | Action |
| :--- | :--- |
| `npm run turn` | Executes one battle turn, renders the map, and publishes to Facebook (or saves to `output/` if credentials are unconfigured). |
| `npm run dry` | Explicitly runs one turn in local dry-run mode without publishing. |
| `npm run status` | Displays current simulation stats, remaining factions, and the top 10 leaderboard in the console. |
| `npm run preview` | Renders the current war state to `preview.png`. |
| `npm run auto` | Runs an automated loop every hour (or configured interval). |
| `npm run sim 20` | Fast-forwards 20 simulation turns in memory without publishing. |
| `npm run reset` | Resets the simulation state back to Round 0 (all 507 regions independent). |

---

## Configuration Reference

Variables supported in `.env`:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `FB_PAGE_ID` | String | `""` | Numerical Facebook Page ID. |
| `FB_PAGE_ACCESS_TOKEN` | String | `""` | Long-lived Facebook Page Access Token. |
| `MAP_THEME` | String | `"light"` | Visual theme: `"light"` (Cartographic Atlas) or `"dark"` (Tactical Command). |
| `POST_INTERVAL_SECONDS` | Number | `3600` | Automated execution interval in seconds for `npm run auto`. |
| `START_YEAR` | Number | `2026` | In-game simulation start year. |
| `START_MONTH` | Number | `1` | In-game simulation start month (1 = January). |
| `ATTACKER_BASE_WIN_RATE` | Number | `0.62` | Base probability for an attacking faction to conquer an enemy territory. |
| `SIZE_BONUS_FACTOR` | Number | `0.015` | Win probability modifier per territory difference between attacker and defender. |

---

## Project Structure

```text
iwb/
├── .github/
│   └── workflows/
│       └── warbot.yml                # Hourly GitHub Actions workflow
├── data/
│   ├── indonesia_kabupaten.geojson   # Boundary polygons for 507 regions
│   ├── graph.json                    # Precomputed topological adjacency graph
│   └── state.json                    # Persistent war state (round, owners, history)
├── src/
│   ├── config.js                     # Environment variables and configuration loader
│   ├── graph.js                      # Adjacency graph builder and projection utilities
│   ├── simulation.js                 # Combat resolution engine and state management
│   ├── warNarratives.js              # Lore, casus belli, and battle incident generator
│   ├── renderer.js                   # High-definition SVG/PNG map visualizer
│   ├── postFormatter.js              # Facebook caption generator
│   └── facebook.js                   # Meta Graph API photo upload client
├── output/                           # Local archive of rendered PNGs and captions
├── index.js                          # CLI entry point
├── .env.example                      # Configuration template
├── .gitignore
└── package.json
```
