import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-lavender via-white to-mist-grey flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal-purple to-soft-violet flex items-center justify-center shadow-lg shadow-royal-purple/30">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-charcoal">Dayflow</h1>
            <p className="text-sm text-zinc-grey">HRMS Platform</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xl text-zinc-grey mb-2">Every workday, perfectly aligned.</p>
        <p className="text-sm text-zinc-grey/70 mb-10">
          Complete HR management — employees, attendance, leaves & payroll.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-royal-purple text-white font-semibold hover:bg-deep-violet transition-colors shadow-lg shadow-royal-purple/30"
          >
            Sign In to Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-df-border bg-white text-charcoal font-semibold hover:bg-mist-grey transition-colors"
          >
            View Docs
          </a>
        </div>

        {/* Demo credentials */}
        <div className="mt-12 p-6 rounded-2xl bg-white/70 border border-df-border backdrop-blur-sm text-left">
          <h3 className="text-sm font-semibold text-charcoal mb-4">Demo Credentials</h3>
          <div className="space-y-2 text-sm">
            {[
              { role: 'Admin', email: 'admin@dayflow.io', password: 'Admin@123' },
              { role: 'HR Officer', email: 'hr@dayflow.io', password: 'HR@123' },
              { role: 'Employee', email: 'arun.karthik@dayflow.io', password: 'Employee@123' },
            ].map((cred) => (
              <div key={cred.role} className="flex items-center justify-between p-2 rounded-lg hover:bg-mist-grey">
                <span className="font-medium text-charcoal w-24">{cred.role}</span>
                <span className="text-zinc-grey font-mono text-xs">{cred.email}</span>
                <span className="text-royal-purple font-mono text-xs">{cred.password}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-grey/50">
          Dayflow HRMS — Phase 1 Foundation &copy; 2025
        </p>
      </div>
    </main>
  )
}
