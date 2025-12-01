import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sparkles,
  Zap,
  Shield,
  Users,
  CreditCard,
  Code,
  ArrowRight,
  Check,
  Github,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Authentication',
    description:
      'Complete authentication system with NextAuth.js, supporting email/password and OAuth providers.',
  },
  {
    icon: CreditCard,
    title: 'Stripe Billing',
    description:
      'Full Stripe integration for subscriptions, invoices, and customer portal.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description:
      'Multi-tenant architecture with teams, roles, and permission management.',
  },
  {
    icon: Sparkles,
    title: 'AI Prompts',
    description:
      'Built-in AI prompt management system with templates and usage tracking.',
  },
  {
    icon: Code,
    title: 'Developer Experience',
    description:
      'TypeScript, Prisma ORM, and modern tooling for a great DX.',
  },
  {
    icon: Zap,
    title: 'Production Ready',
    description:
      'Best practices, security, and performance optimizations out of the box.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '5 AI prompts per day',
      'Basic templates',
      'Community support',
      '1 team member',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing teams',
    featured: true,
    features: [
      'Unlimited AI prompts',
      'All templates + custom',
      'Priority support',
      '20 team members',
      'Advanced API access',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Dedicated support',
      'Custom SLA',
      'On-premise option',
    ],
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">Vibe SaaS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              Next.js 14 + TypeScript + Tailwind
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              The Ultimate{' '}
              <span className="gradient-text">SaaS Starter Kit</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Launch your SaaS product in days, not months. Authentication,
              billing, teams, AI prompts, and beautiful UI components included.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/register">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="https://github.com" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Start building in minutes.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 bg-muted/50">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to Ship Fast
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built with modern technologies and best practices
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the plan that works best for you
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.featured ? 'border-primary shadow-lg' : ''}
                >
                  {plan.featured && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.featured ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24 bg-muted/50">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Build Your SaaS?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of developers who are shipping faster with Vibe
              SaaS.
            </p>
            <Button size="xl" className="mt-8" asChild>
              <Link href="/register">
                Start Building Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold">Vibe SaaS</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/docs"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Docs
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Vibe SaaS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
