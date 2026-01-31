import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Car,
  TrendingUp,
  Users,
  MapPin,
  ArrowLeft,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Monitor,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { useTransactions } from '../context/TransactionContext';
import { staff } from '../data/staff';
import { formatCurrency, formatTime, isToday, getHour } from '../data/utils';

const PIE_COLORS = ['#10B981', '#64748B'];

export default function Dashboard() {
  const { transactions, resetData } = useTransactions();

  const todayTxns = useMemo(
    () => transactions.filter((t) => isToday(t.timestamp)),
    [transactions]
  );

  const todayRevenue = useMemo(
    () => todayTxns.reduce((sum, t) => sum + t.total, 0),
    [todayTxns]
  );

  const avgService = todayTxns.length > 0 ? Math.round(todayRevenue / todayTxns.length) : 0;

  const activeStaffIds = useMemo(
    () => new Set(todayTxns.map((t) => t.staffId)),
    [todayTxns]
  );

  // Service breakdown
  const serviceBreakdown = useMemo(() => {
    const map = {};
    todayTxns.forEach((t) => {
      t.services.forEach((s) => {
        if (!map[s.name]) map[s.name] = { name: s.name, count: 0, revenue: 0 };
        map[s.name].count += 1;
        map[s.name].revenue += s.price;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [todayTxns]);

  // Staff performance
  const staffPerf = useMemo(() => {
    const map = {};
    todayTxns.forEach((t) => {
      if (!map[t.staffId]) {
        const s = staff.find((st) => st.id === t.staffId);
        map[t.staffId] = { id: t.staffId, name: t.staffName, role: s?.role || '', cars: 0, revenue: 0, commission: 0 };
      }
      map[t.staffId].cars += 1;
      map[t.staffId].revenue += t.total;
      map[t.staffId].commission += t.staffCommission;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [todayTxns]);

  // Payment breakdown
  const paymentData = useMemo(() => {
    const mpesa = todayTxns.filter((t) => t.paymentMethod === 'M-Pesa').length;
    const cash = todayTxns.length - mpesa;
    return [
      { name: 'M-Pesa', value: mpesa },
      { name: 'Cash', value: cash },
    ];
  }, [todayTxns]);

  // Hourly revenue
  const hourlyData = useMemo(() => {
    const hours = {};
    for (let h = 8; h <= 17; h++) hours[h] = 0;
    todayTxns.forEach((t) => {
      const h = getHour(t.timestamp);
      if (hours[h] !== undefined) hours[h] += t.total;
    });
    return Object.entries(hours).map(([h, rev]) => ({
      hour: `${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`,
      revenue: rev,
    }));
  }, [todayTxns]);

  // Recent transactions (last 10)
  const recentTxns = useMemo(
    () => [...todayTxns].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10),
    [todayTxns]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bg-dark text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-brand-red rounded-lg p-2">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">Owner Dashboard</h1>
                <p className="text-xs text-gray-400">Executive Car & Carpet Wash</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pos"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Monitor className="w-4 h-4" />
              Open POS
            </Link>
            <button
              onClick={resetData}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            change={12}
            color="text-green-600"
            bg="bg-green-50"
          />
          <StatCard
            icon={Car}
            label="Total Transactions"
            value={todayTxns.length}
            change={8}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            icon={TrendingUp}
            label="Average Service"
            value={formatCurrency(avgService)}
            change={-3}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            icon={Users}
            label="Active Staff"
            value={`${activeStaffIds.size}/${staff.length}`}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* Location cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-brand-red" />
              <h3 className="font-semibold text-gray-900">Kikuyu Branch</h3>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Dagoretti Road, Kikuyu</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{todayTxns.length}</p>
                <p className="text-xs text-gray-500">Cars Today</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">+12%</p>
                <p className="text-xs text-gray-500">vs Yesterday</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-5 flex flex-col items-center justify-center text-center">
            <MapPin className="w-8 h-8 text-gray-300 mb-2" />
            <h3 className="font-semibold text-gray-400">Future Branch</h3>
            <p className="text-sm text-gray-400 mt-1">Coming Soon</p>
            <p className="text-xs text-gray-400 mt-2">Location: To Be Announced</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hourly Revenue */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Hourly Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2} dot={{ fill: '#DC2626', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                M-Pesa
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                Cash
              </div>
            </div>
          </div>
        </div>

        {/* Top Services + Staff Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Services */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Top Services Today</h3>
            {serviceBreakdown.length === 0 ? (
              <p className="text-gray-400 text-sm">No services today</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceBreakdown.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={130} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="revenue" fill="#DC2626" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Staff Performance Today</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Staff</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Cars</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerf.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5">
                        <Link to={`/staff/${s.id}`} className="text-brand-red hover:underline font-medium">
                          {s.name}
                        </Link>
                        <p className="text-xs text-gray-400">{s.role}</p>
                      </td>
                      <td className="text-right py-2.5 font-medium">{s.cars}</td>
                      <td className="text-right py-2.5 font-medium">{formatCurrency(s.revenue)}</td>
                      <td className="text-right py-2.5 font-semibold text-green-600">{formatCurrency(s.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Time</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Services</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Staff</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 text-gray-600">{formatTime(t.timestamp)}</td>
                    <td className="py-2.5">
                      <p className="font-medium">{t.vehicleReg}</p>
                      <p className="text-xs text-gray-400">{t.vehicleMake}</p>
                    </td>
                    <td className="py-2.5 text-gray-600 max-w-[200px] truncate">
                      {t.services.map((s) => s.name).join(', ')}
                    </td>
                    <td className="py-2.5 text-right font-semibold">{formatCurrency(t.total)}</td>
                    <td className="py-2.5 text-gray-600">{t.staffName}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          t.paymentMethod === 'M-Pesa'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {t.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`${bg} rounded-lg p-2`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {change >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {Math.abs(change)}% vs yesterday
        </div>
      )}
    </div>
  );
}
