# Vibe-Enhanced Next.js SaaS Starter Kit

A production-ready, feature-rich SaaS boilerplate built with Next.js 14, TypeScript, and modern best practices. Launch your SaaS product in days, not months.

## Features

### Authentication
- Email/password authentication with NextAuth.js v5
- OAuth providers (Google, GitHub)
- Session management with JWT
- Protected routes and middleware

### Billing & Subscriptions
- Stripe integration for subscriptions
- Multiple pricing tiers (Free, Starter, Pro, Enterprise)
- Customer portal for subscription management
- Webhook handling for subscription events
- Invoice tracking

### Role-Based Access Control (RBAC)
- User roles (User, Admin, Super Admin)
- Team roles (Viewer, Member, Admin, Owner)
- Permission-based access control
- Middleware for route protection

### Team Management
- Multi-tenant architecture
- Team creation and management
- Team invitations
- Role-based team permissions

### AI Prompt Management
- Pre-built prompt templates
- Custom prompt creation
- Variable substitution in prompts
- OpenAI integration
- Usage tracking and analytics

### UI Components
- shadcn/ui component system
- Dark/light mode support
- Responsive design
- Accessible components
- Custom animations

### Developer Experience
- TypeScript throughout
- Prisma ORM with PostgreSQL
- ESLint configuration
- Modular architecture
- API route handlers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Email**: Resend
- **AI**: OpenAI SDK

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database
- Stripe account
- (Optional) OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/vibe-saas-starter.git
cd vibe-saas-starter
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Copy the environment file:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="your-secret"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# OpenAI (optional)
OPENAI_API_KEY="..."
```

5. Set up the database:
```bash
npm run db:push
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/
│   ├── layout/            # Layout components
│   ├── ui/                # UI components
│   └── providers.tsx      # Context providers
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── rbac.ts            # Role-based access control
│   ├── stripe.ts          # Stripe utilities
│   └── utils.ts           # Utility functions
└── middleware.ts          # Route protection
```

## Key Features Explained

### Authentication Flow

The authentication system supports:
- Email/password registration and login
- Google and GitHub OAuth
- Session management with JWT tokens
- Automatic free subscription creation on signup

### Subscription Management

Users can:
- View available plans on the billing page
- Subscribe via Stripe Checkout
- Manage subscriptions through Stripe Customer Portal
- Webhook handling updates subscription status automatically

### AI Prompts

The prompt system includes:
- System-provided prompt templates
- User-created custom prompts
- Variable substitution (e.g., `{{topic}}`, `{{tone}}`)
- Usage tracking and analytics
- OpenAI integration for generation

### RBAC System

Permissions are defined in `src/lib/rbac.ts`:
- Global roles: USER, ADMIN, SUPER_ADMIN
- Team roles: VIEWER, MEMBER, ADMIN, OWNER
- Permission checking functions
- Middleware integration

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed the database
npm run db:studio    # Open Prisma Studio
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

### Docker

```bash
docker build -t vibe-saas .
docker run -p 3000:3000 vibe-saas
```

## Demo Credentials

After seeding the database:

- **Admin**: admin@example.com / admin123
- **Demo User**: demo@example.com / demo123

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - feel free to use this for your own projects.

## Support

- [Documentation](https://docs.example.com)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/example)

---

Built with love using Next.js, TypeScript, and modern web technologies.
