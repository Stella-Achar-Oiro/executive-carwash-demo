import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  DollarSign,
  TrendingUp,
  Calendar,
  CalendarDays,
  Clock,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { staff } from '../data/staff';
import { formatCurrency, formatTime, isToday } from '../data/utils';

const LOGO_URL = 'https://i.postimg.cc/fTVfbx1T/Whats-App-Image-2026-01-31-at-16-36-44.jpg';

export default function StaffView() {
  const { id } = useParams();
  const staffId = Number(id);
  const { transactions } = useTransactions();

  const member = staff.find((s) => s.id === staffId);

  const staffTxns = useMemo(
    () => transactions.filter((t) => t.staffId === staffId),
    [transactions, staffId]
  );

  const todayTxns = useMemo(
    () => staffTxns.filter((t) => isToday(t.timestamp)),
    [staffTxns]
  );

  const todayRevenue = todayTxns.reduce((sum, t) => sum + t.total, 0);
  const todayCommission = todayTxns.reduce((sum, t) => sum + t.staffCommission, 0);

  // Simulate week and month data (multiply today proportionally)
  const weekMultiplier = 5.8;
  const monthMultiplier = 22;
  const weekCars = Math.round(todayTxns.length * weekMultiplier);
  const weekRevenue = Math.round(todayRevenue * weekMultiplier);
  const weekCommission = Math.round(todayCommission * weekMultiplier);
  const monthCars = Math.round(todayTxns.length * monthMultiplier);
  const monthRevenue = Math.round(todayRevenue * monthMultiplier);
  const monthCommission = Math.round(todayCommission * monthMultiplier);

  const recentTxns = useMemo(
    () => [...todayTxns].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [todayTxns]
  );

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Staff member not found</p>
          <Link to="/dashboard" className="text-brand-red hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bg-dark text-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src={LOGO_URL} alt="Executive Car Wash" className="w-9 h-9 rounded-lg object-contain" />
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Staff Performance</h1>
            <p className="text-xs text-gray-400">Executive Car & Carpet Wash</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Staff Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-red/10 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-brand-red">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
              <p className="text-gray-500">{member.role}</p>
              <p className="text-sm text-brand-gold font-medium">
                Commission Rate: {(member.commissionRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Today's Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard icon={Car} label="Cars Washed" value={todayTxns.length} />
            <SummaryCard icon={DollarSign} label="Revenue Generated" value={formatCurrency(todayRevenue)} />
            <SummaryCard icon={TrendingUp} label="Commission Earned" value={formatCurrency(todayCommission)} highlight />
          </div>
        </div>

        {/* This Week */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> This Week
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{weekCars}</p>
                <p className="text-xs text-gray-500">Cars</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(weekRevenue)}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(weekCommission)}</p>
                <p className="text-xs text-gray-500">Commission</p>
              </div>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> This Month
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{monthCars}</p>
                <p className="text-xs text-gray-500">Cars</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthRevenue)}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthCommission)}</p>
                <p className="text-xs text-gray-500">Commission</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Transactions</h3>
          {recentTxns.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No transactions today</p>
          ) : (
            <div className="space-y-3">
              {recentTxns.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="text-sm text-gray-500 w-16 shrink-0">{formatTime(t.timestamp)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{t.vehicleReg}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {t.services.map((s) => s.name).join(' + ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{formatCurrency(t.total)}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        t.paymentMethod === 'M-Pesa'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {t.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${highlight ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className={`rounded-lg p-2 w-fit mx-auto mb-2 ${highlight ? 'bg-green-100' : 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${highlight ? 'text-green-600' : 'text-gray-600'}`} />
      </div>
      <p className={`text-xl font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
