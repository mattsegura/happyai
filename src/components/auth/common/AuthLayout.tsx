
import { Sparkles } from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/15 px-4 py-10 dark:from-primary/20 dark:to-accent/20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.25), transparent 55%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.18), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/40 transition-transform duration-300 hover:scale-105">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>

          <h1 className="mb-3 text-center text-3xl font-semibold tracking-tight text-foreground sm:text-3xl">
            <span className="bg-gradient-to-r from-primary via-accent to-primary/80 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">{subtitle}</p>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
