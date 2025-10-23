# Expense Tracker (Next.js Version)

** Production Version:** Next.js migration of the original Vite Expense Tracker.
Original Vite version: [expense-tracker](https://github.com/PinkSheep27/expense-tracker)

Full-stack expense tracking application built with Next.js 14, featuring server-side rendering and API routes.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, API Routes

**New Features:**
- File-based routing
- Server Components for performance
- API routes for backend functionality
- Server-side rendering
- Automatic optimizations

**Migration Highlights:**
- Migrated from Vite to Next.js (Week 6)
- Added `'use client'` to interactive components
- Converted to file-based routing
- Built API endpoints for CRUD operations
- Improved performance with SSR

## Technical Architecture
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Backend**: Next.js API routes with AWS Lambda
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud**: AWS (S3, Lambda, Aurora DSQL)
- **Testing**: Vitest with 70% coverage target
- **Deployment**: GitHub Actions CI/CD

## Prerequisites
- Node.js 18.17.0 or higher
- npm 9.6.7 or higher
- Git configured with your credentials
- GitHub account with Copilot access

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/[yourusername]/expense-tracker
   cd expense-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cd .env.example .env.local
   # Add your confuguration values
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
## Contributing
Please read our Contributing Guidelines and Code of Conduct before submitting PRs.

## Architecture Decision Records
See docs/ADR/ for technical decision documentation.

## License
MIT License - see LICENSE for details.