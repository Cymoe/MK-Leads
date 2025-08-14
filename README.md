# Lead Tracker - Market Coverage Workflow

A React application for systematically collecting and managing leads across multiple markets using a 3-phase approach with Supabase and Apify integration.

## Features

- **Market Coverage Workflow**: Systematically collect leads across all markets
- **3-Phase Lead Collection**:
  - Phase 1: Google Maps foundation coverage
  - Phase 2: Facebook Ads active advertisers
  - Phase 3: Instagram manual targeting
- **Apify Integration**: Import leads from Apify actor runs (manual and automatic)
- **Real-time Updates**: Live synchronization with Supabase
- **Dashboard Analytics**: Track lead generation metrics and coverage
- **Claude AI Assistant**: Built-in AI chat for lead analysis

## Tech Stack

- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS with custom design system
- **Icons**: Lucide React
- **API Integration**: Apify for web scraping
- **Routing**: React Router DOM

## Setup

### 1. Clone the repository

```bash
git clone [your-repo-url]
cd reactleads
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Apify Configuration
VITE_APIFY_TOKEN=your_apify_token
```

### 4. Set up Supabase database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key to the `.env` file

### 5. Configure Apify (Optional)

1. Create an Apify account at [apify.com](https://apify.com)
2. Get your API token from Account Settings
3. Add the token to your `.env` file

### 6. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── MarketsSidebar   # Left sidebar with markets list
│   ├── MarketActivity   # Main activity panel with phases
│   ├── ImportModal      # Modal for importing from Apify
│   ├── Navigation       # Top navigation bar
│   ├── ClaudeChat      # AI assistant interface
│   └── LeadGenDashboard # Analytics dashboard
├── pages/              # Page components
│   └── MarketCoverage  # Main market coverage page
├── services/           # API and database services
│   ├── apify.js        # Apify API integration
│   └── database.js     # Supabase database operations
├── lib/                # Configuration
│   └── supabase.js     # Supabase client setup
└── App.jsx             # Main app component
```

## Database Schema

The application uses the following main tables:

- **markets**: Cities/markets being tracked
- **leads**: Business leads collected
- **import_history**: Record of data imports
- **market_phases**: Track progress of each collection phase

## Import Methods

### Manual Import from Previous Runs
1. Click "Import from Google Maps"
2. Select "Manual Import" tab
3. Choose previous Apify runs to import
4. Click "Import Leads"

### Automatic Sync
1. Click "Import from Google Maps"
2. Select "Automatic Sync" tab
3. Configure Apify token and actor ID
4. Set sync schedule
5. Enable automatic synchronization

## Development

### Adding New Service Types

Edit the service types in your market data or configure them in the database.

### Customizing Phases

Modify the phases in `MarketActivity.jsx` to add or change collection phases.

### Extending Lead Fields

1. Update the schema in `supabase/schema.sql`
2. Modify the transform function in `services/apify.js`
3. Update the UI components to display new fields

## Deployment

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## License

[Your License]

## Support

For questions or issues, please [open an issue](your-repo-issues-url) or contact support.# MK-Leads
