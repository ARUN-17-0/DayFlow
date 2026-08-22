import Link from 'next/link'
import { DayflowLogo } from '@/components/dayflow/logo/DayflowLogo'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <DayflowLogo size="lg" />
        </div>

        {/* Tagline */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Every workday, perfectly aligned.</h1>
        <p className="text-sm text-slate-600 font-medium mb-8">
          Complete HR Management System for employees, Admins, and HR Officers.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold transition-all shadow-lg shadow-purple-600/25 text-sm"
          >
            Sign In to Dayflow →
          </Link>
          <a
            href="https://github.com/ARUN-17-0/DayFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold hover:bg-slate-50 transition-colors text-sm"
          >
            GitHub Repository
          </a>
        </div>

        {/* Demo credentials */}
        <div className="mt-10 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Quick Demo Accounts</h3>
          <div className="space-y-2 text-xs">
            {[
              { role: 'Admin', email: 'admin@dayflow.io', password: 'Admin@123' },
              { role: 'HR Officer', email: 'hr@dayflow.io', password: 'HR@123' },
              { role: 'Employee', email: 'arun.karthik@dayflow.io', password: 'Employee@123' },
            ].map((cred) => (
              <div key={cred.role} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 w-24">{cred.role}</span>
                <span className="text-slate-600 font-mono text-xs">{cred.email}</span>
                <span className="text-purple-700 font-mono font-bold text-xs">{cred.password}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-500 font-medium">
          Dayflow HRMS &copy; 2025 • All Rights Reserved
        </p>
      </div>
    </main>
  )
}
