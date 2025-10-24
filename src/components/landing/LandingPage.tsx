import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  LogIn
} from 'lucide-react';
import { AuthGate } from '../auth/AuthGate';

const navigation = [
  { label: 'Platform', href: '#platform' },
  { label: 'Students', href: '#students' },
  { label: 'Teachers', href: '#teachers' },
  { label: 'Security', href: '#security' },
];

const studentHighlights = [
  {
    title: 'Daily mood pulse',
    description: 'One-minute reflections help students recognise patterns and name the why behind their mood.',
    icon: Sparkles,
  },
  {
    title: 'Academic snapshot',
    description: 'Assignments and Canvas grades surface alongside emotions so students can plan with context.',
    icon: BookOpen,
  },
  {
    title: 'Guided next steps',
    description: 'Hapi Companion offers grounding prompts, study tips, and goal suggestions tailored to each check-in.',
    icon: Brain,
  },
];

const teacherHighlights = [
  {
    title: 'Pulse analytics',
    description: 'Class sentiment, participation, and engagement trends update automatically from daily check-ins.',
    icon: BarChart3,
  },
  {
    title: 'Actionable briefs',
    description: 'Weekly digests flag students who may need support and celebrate moments of progress.',
    icon: Users,
  },
  {
    title: 'Instructional signals',
    description: 'Detect topics that correlate with stress or confidence, so teaching plans adapt in real time.',
    icon: GraduationCap,
  },
];

const workflowSteps = [
  {
    title: 'Collect meaningful signals',
    description: 'Mood pulses, peer recognitions, Canvas performance, and calendar events flow into a unified hub.',
  },
  {
    title: 'Synthesize for every role',
    description: 'Student Companion, Teacher Analyst, and System Bridge prepare views tuned to individual needs.',
  },
  {
    title: 'Deliver timely guidance',
    description: 'AI-generated nudges, study plans, and alerts keep wellness and learning aligned day by day.',
  },
];

const principles = [
  {
    title: 'Privacy by design',
    description: 'Students own their reflections. Sensitive notes stay private unless a risk pattern is detected.',
    icon: ShieldCheck,
  },
  {
    title: 'Evidence over hype',
    description: 'Every insight is grounded in real class data with transparent context for teachers and leaders.',
    icon: CheckCircle2,
  },
  {
    title: 'Built for schools',
    description: 'FERPA-aligned architecture, secure Supabase storage, and clear data governance policies.',
    icon: Users,
  },
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthGate />;
  }

  return (
    <div className="bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary-700">Hapi AI</p>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">Emotional + Academic Intelligence</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-primary-600">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 hover:border-primary-300"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
            <a
              href="mailto:hello@hapiai.example"
              className="hidden rounded-2xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 md:block"
            >
              Contact us
            </a>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-primary-200 hover:text-primary-600 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden" data-hs-collapse>
            <div className="space-y-2 px-4 py-4">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-primary-50 hover:text-primary-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="platform" className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-28">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-accent-50 to-white" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:flex lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 shadow-sm">
                Designed for whole-student care
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                One companion for wellbeing and learning momentum.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                Hapi pairs daily mood pulses with classroom data so students feel heard, teachers see what matters, and leaders act with clarity.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setShowAuth(true)}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <a
                  href="#students"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700 hover:bg-slate-50"
                >
                  Explore the platform
                </a>
              </div>
              <dl className="grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI guides</dt>
                    <dd className="mt-1 font-semibold text-slate-900">Companion, Analyst, Bridge</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Go live</dt>
                    <dd className="mt-1 font-semibold text-slate-900">Under two weeks</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Privacy-first</dt>
                    <dd className="mt-1 font-semibold text-slate-900">FERPA aligned access controls</dd>
                  </div>
                </div>
              </dl>
            </div>
            <div className="mt-12 hidden flex-1 lg:block">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Sample daily briefing</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Tuesday at a glance</h2>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary-400" />
                    <div>
                      <p className="font-semibold text-slate-800">Student companion</p>
                      <p>“Feeling overwhelmed about Biology? Try two 30-minute focus blocks. I’ll check in tomorrow.”</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary-400" />
                    <div>
                      <p className="font-semibold text-slate-800">Teacher analyst</p>
                      <p>82% of Biology II reported “steady” confidence; 3 students still owe today’s pulse.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary-400" />
                    <div>
                      <p className="font-semibold text-slate-800">System bridge</p>
                      <p>Campus mood dips before history midterms. Schedule a quick advisory tomorrow.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="students" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-accent-700">
                Student companion
              </p>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                A private space for students to reflect, plan, and celebrate progress.
              </h2>
              <p className="text-lg leading-relaxed text-slate-600">
                Students check in on their day, gather insights about study habits, and receive guidance that blends
                empathy with action. Echo summaries recap every week so learners stay aware of their emotional journey.
              </p>
              <div className="space-y-4">
                {studentHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-600">Student dashboard preview</h3>
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-primary-600/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Daily pulse</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Mood: “Inspired” · Trigger: “Biology lab planning” · Energy: “Balanced”
                  </p>
                  <p className="mt-3 text-sm font-semibold text-primary-700">
                    Suggested action: “Outline the lab steps tonight and bring questions to tomorrow’s session.”
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assignments in focus</p>
                    <p className="mt-2 text-sm text-slate-600">Economics essay draft · Due Thursday · Confidence 60%</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Echo summary</p>
                    <p className="mt-2 text-sm text-slate-600">“You felt most confident after collaborative study sessions.”</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="teachers" className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="order-2 space-y-6 lg:order-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                Teacher analyst
              </p>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Clear class analytics so teachers can focus on relationships.
              </h2>
              <p className="text-lg leading-relaxed text-slate-600">
                Classroom dashboards connect the dots between emotional tone, participation, and coursework progress.
                Alerts are contextual and respectful, giving teachers insight without overwhelming them with noise.
              </p>
              <div className="space-y-4">
                {teacherHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="order-1 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-2xl lg:order-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-600">Teacher briefing</h3>
              <div className="mt-6 space-y-5 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-semibold text-slate-900">Class sentiment today</p>
                  <p className="mt-1">
                    Biology II students report steady confidence (4.1/5). Three reflections mention project scope—consider a
                    quick clarification tomorrow.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-semibold text-slate-900">Engagement signals</p>
                  <p className="mt-1">
                    Pulse participation remained above 90%. Office-hour slots for Thursday are full; send an encouragement
                    reminder to join the waitlist.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-semibold text-slate-900">Suggested next action</p>
                  <p className="mt-1">
                    Offer a collaborative planning station for the lab project. Students who flagged uncertainty will see a
                    note to stop by.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  System bridge
                </p>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Connect the dots across your campus without losing the human touch.
                </h2>
                <p className="text-lg leading-relaxed text-slate-600">
                  Leadership heatmaps highlight the weeks that matter, anonymized reports surface burnout risks before
                  they escalate, and engagement trends show exactly where support programs are working.
                </p>
              </div>
              <ol className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                      <p className="text-sm text-slate-600">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="security" className="bg-slate-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div className="space-y-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Trust & safety
                </p>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Serious about privacy, accessibility, and responsible AI.
                </h2>
                <p className="text-lg leading-relaxed text-slate-200">
                  Hapi AI respects student agency. Reflections stay private unless escalation thresholds are met, all
                  analytics are role-based, and every recommendation provides transparent context and sources.
                </p>
              </div>
              <div className="space-y-4">
                {principles.map((principle) => {
                  const Icon = principle.icon;
                  return (
                    <div key={principle.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{principle.title}</h3>
                        <p className="text-sm text-slate-200">{principle.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary-200 bg-primary-50 px-8 py-16 shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Ready to champion whole-student success?</h2>
            <p className="mt-4 text-lg text-slate-600">
              Get in touch with our team to learn how Hapi AI can transform emotional intelligence and academic momentum for your district.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:hello@hapiai.example"
                className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-700"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
