# ♔ ChessTourney — Chess Tournament Management System

A feature-rich Chess Tournament Management System built with **Svelte + JavaScript**.

## 🚀 Live Demo

> Deploy on Vercel / Netlify — see instructions below.

## ✨ Features

### ♟ Player Management
- Full CRUD (Create, Read, Update, Delete) for players
- ELO rating tracking with skill labels (Beginner → Grandmaster)
- Country and club/organization fields
- Live search and filtering
- Rating statistics dashboard

### 🏆 Tournament Management
- Full CRUD for tournaments
- Formats: Swiss, Round Robin, Single/Double Elimination, Blitz
- Player enrollment system (add/remove players per tournament)
- Status tracking: Upcoming → In Progress → Completed
- Match count and player preview

### ⚔ Match System
- Random player pairing using Fisher-Yates shuffle
- Automatic BYE handling for odd player counts
- Round-by-round simulation with random winner selection
- Complete match result recording

### 🥇 Rankings
- Animated 🥇🥈🥉 Champions Podium
- Full leaderboard table with Wins / Losses / Byes / Points
- Filter rankings by individual tournament or view overall standings

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 5 |
| Language | JavaScript |
| State | Svelte Reactive Stores |
| Persistence | Browser LocalStorage |
| Styling | Vanilla CSS with custom design tokens |
| Build Tool | Vite |
| Fonts | Google Fonts (Playfair Display + Inter) |

## 📦 Installation & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd chess-tournament

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗 Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── stores/
│   │   ├── players.js      # Player CRUD store + localStorage
│   │   ├── tournaments.js  # Tournament CRUD store + localStorage
│   │   └── matches.js      # Match results store + localStorage
│   ├── components/
│   │   ├── Navbar.svelte          # Sidebar navigation
│   │   ├── Modal.svelte           # Reusable dialog
│   │   ├── PlayersView.svelte     # Player management page
│   │   ├── TournamentsView.svelte # Tournament list page
│   │   ├── TournamentDetail.svelte# Match system & rounds
│   │   └── RankingsView.svelte    # Podium & leaderboard
│   └── utils/
│       └── matchmaker.js  # Pairing algorithm, simulation, ranking
├── routes/
│   ├── +layout.svelte
│   └── +page.svelte       # Main app shell + routing
└── app.css                # Global design system
```

## 🎯 How to Use

1. **Add Players** — Go to Players tab, click "+ Add Player"
2. **Create Tournament** — Go to Tournaments tab, click "+ New Tournament"
3. **Enroll Players** — Open a tournament, click "+ Add Players"
4. **Run Matches** — Click "Generate Round" to create pairings, "Simulate Round" to assign winners
5. **View Rankings** — Go to Rankings tab to see the podium and full leaderboard

## 📝 Git Commit History

This project follows the [Angular Commit Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type):

```
feat: initialize svelte project with base structure and routing
feat: implement player management with full CRUD and localStorage
feat: add tournament management with player enrollment system
feat: implement random match pairing and winner simulation
feat: add rankings system with animated podium display
style: add chess-themed dark UI with glassmorphism and animations
docs: add README with setup instructions and feature overview
```

## 📄 License

MIT License — built for the Bytelogik technical assignment.
