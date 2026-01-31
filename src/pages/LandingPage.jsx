import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  Shield,
  Users,
  TrendingUp,
  MapPin,
  Smartphone,
  Car,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const features = [
  { icon: Shield, title: 'Theft Prevention', desc: 'Every transaction logged and tracked with digital receipts' },
  { icon: Users, title: 'Staff Commission Tracking', desc: 'Auto-calculated commissions per service and staff member' },
  { icon: TrendingUp, title: 'Real-Time Revenue Monitoring', desc: 'Live dashboards showing revenue, services, and trends' },
  { icon: MapPin, title: 'Multi-Location Management', desc: 'Manage multiple branches from a single dashboard' },
  { icon: Smartphone, title: 'M-Pesa Integration', desc: 'Accept and track M-Pesa payments with confirmation codes' },
  { icon: Car, title: 'Vehicle Tracking', desc: 'Full service history per vehicle registration number' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-darker">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-darker via-bg-dark to-bg-darker" />
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
          {/* Logo area */}
          <div className="mb-8 flex justify-center">
            <div className="bg-gradient-to-br from-brand-red via-brand-gold to-brand-blue p-1 rounded-2xl">
              <div className="bg-bg-darker rounded-2xl p-6 flex items-center gap-4">
                <div className="bg-brand-red rounded-xl p-3">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="font-display text-2xl font-extrabold text-brand-gold tracking-wide leading-tight">
                    EXECUTIVE
                  </h1>
                  <p className="font-display text-sm font-bold text-brand-red tracking-widest">
                    CAR & CARPET WASH
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
            <MapPin className="w-4 h-4" />
            <span>Dagoretti Road, Kikuyu, Nairobi</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4 leading-tight">
            Professional Car Care,{' '}
            <span className="text-brand-gold">Smart Business</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            The complete Point of Sale system designed for car wash businesses.
            Track every transaction, manage staff commissions, and prevent revenue loss.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              <LayoutDashboard className="w-5 h-5" />
              View Owner Dashboard
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pos"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors border border-white/20 text-lg"
            >
              <Monitor className="w-5 h-5" />
              View POS Terminal
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h3 className="text-center text-2xl font-display font-bold text-white mb-10">
          Everything You Need to Run Your Car Wash
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-bg-dark border border-gray-700 rounded-xl p-6 hover:border-brand-gold/50 transition-colors"
            >
              <div className="bg-brand-red/10 rounded-lg p-3 w-fit mb-4">
                <f.icon className="w-6 h-6 text-brand-red" />
              </div>
              <h4 className="text-white font-semibold mb-2">{f.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-gray-700 bg-bg-dark">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-display font-bold text-brand-gold">7+</p>
            <p className="text-gray-400 text-sm mt-1">Staff Members</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-brand-gold">13</p>
            <p className="text-gray-400 text-sm mt-1">Service Options</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-brand-gold">2</p>
            <p className="text-gray-400 text-sm mt-1">Locations (Planned)</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-brand-gold">24/7</p>
            <p className="text-gray-400 text-sm mt-1">Transaction Tracking</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-darker border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>Executive Car & Carpet Wash POS Demo</span>
          </div>
          <p>Kikuyu, Dagoretti Road, Nairobi</p>
        </div>
      </footer>
    </div>
  );
}
