# Hapi Academics

A modern educational platform built with React, TypeScript, and Supabase.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Framer Motion
- **Backend**: Supabase
- **AI Integration**: Anthropic Claude, OpenAI
- **Routing**: React Router v7

## 📁 Project Structure

```
├── chrome-extension/  # Chrome extension for study notes
├── docs/              # Documentation
│   ├── setup/        # Setup and configuration guides
│   ├── design/       # Design documents and reviews
│   ├── features/     # Feature plans and implementations
│   └── integrations/ # Integration documentation
├── scripts/          # Setup and utility scripts
├── src/              # Source code
├── supabase/         # Supabase migrations and config
└── public/           # Static assets
```

## 🔌 Chrome Extension

**Hapi Study Notes** - Convert any website into AI-generated study notes!

- 📚 One-click website analysis
- 🤖 AI-powered note generation (Claude/GPT)
- 🔍 Firecrawl web scraping integration
- 💾 Secure local storage

[Setup Guide](chrome-extension/SETUP.md) | [Documentation](docs/features/CHROME_EXTENSION.md)

## 📚 Documentation

- [Setup Guide](docs/setup/README_SETUP.md)
- [Supabase Setup](docs/setup/NEW_SUPABASE_SETUP.md)
- [Demo Accounts](docs/setup/DEMO_ACCOUNTS.md)
- [Design Documentation](docs/design/)
- [Feature Plans](docs/features/)
- [Integration Guides](docs/integrations/)

## 🔧 Setup Scripts

Setup scripts are located in the `scripts/` directory:
- `create-demo-users.sh` - Create demo user accounts
- `update-profiles.sh` - Update user profiles
- `QUICK_SETUP.sql` - Quick database setup
- `setup-demo-accounts.sql` - Setup demo accounts

## 🤝 Contributing

Please refer to the documentation in the `docs/` directory for development guidelines and feature implementation plans.

## 📄 License

Private project
