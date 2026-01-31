import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Car,
  TrendingUp,
  Users,
  MapPin,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Monitor,
  LayoutDashboard,
  BarChart3,
  Receipt,
  UserCircle,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { useTransactions } from '../context/TransactionContext';
import { staff } from '../data/staff';
import { formatCurrency, formatTime, isToday, getHour } from '../data/utils';

const LOGO_URL = 'https://i.postimg.cc/fTVfbx1T/Whats-App-Image-2026-01-31-at-16-36-44.jpg';
const PIE_COLORS = ['#10B981', '#64748B'];

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Dashboard() {
  const { transactions, resetData } = useTransactions();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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

  const totalCommissions = useMemo(
    () => todayTxns.reduce((sum, t) => sum + t.staffCommission, 0),
    [todayTxns]
  );

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

  const paymentData = useMemo(() => {
    const mpesa = todayTxns.filter((t) => t.paymentMethod === 'M-Pesa').length;
    const cash = todayTxns.length - mpesa;
    return [
      { name: 'M-Pesa', value: mpesa },
      { name: 'Cash', value: cash },
    ];
  }, [todayTxns]);

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

  const recentTxns = useMemo(
    () => [...todayTxns].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10),
    [todayTxns]
  );

  const allTxnsSorted = useMemo(
    () => [...todayTxns].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [todayTxns]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-bg-darker flex flex-col shrink-0 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Executive Car Wash"
              className="w-11 h-11 rounded-lg object-contain"
            />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-sm text-brand-gold leading-tight truncate">
                EXECUTIVE
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider">
                CAR & CARPET WASH
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 pt-2 pb-1">
            Main Menu
          </p>
          {NAV_SECTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-brand-red text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}

          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 pt-5 pb-1">
            Quick Links
          </p>
          <Link
            to="/pos"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Monitor className="w-4 h-4 shrink-0" />
            POS Terminal
          </Link>
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            Landing Page
          </Link>
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-700/50">
          <button
            onClick={resetData}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            Reset Demo Data
          </button>
          <div className="flex items-center gap-3 px-3 py-3 mt-1">
            <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-brand-red" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">Mercy (Owner)</p>
              <p className="text-[10px] text-gray-500">Kikuyu Branch</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display font-bold text-gray-900 text-lg leading-tight">
                {NAV_SECTIONS.find((s) => s.id === activeSection)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-KE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pos"
              className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Open POS</span>
            </Link>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === 'overview' && (
            <OverviewSection
              todayTxns={todayTxns}
              todayRevenue={todayRevenue}
              avgService={avgService}
              activeStaffIds={activeStaffIds}
              totalCommissions={totalCommissions}
              serviceBreakdown={serviceBreakdown}
              staffPerf={staffPerf}
              paymentData={paymentData}
              hourlyData={hourlyData}
              recentTxns={recentTxns}
              navigate={navigate}
            />
          )}
          {activeSection === 'transactions' && (
            <TransactionsSection transactions={allTxnsSorted} />
          )}
          {activeSection === 'staff' && (
            <StaffSection staffPerf={staffPerf} navigate={navigate} />
          )}
          {activeSection === 'analytics' && (
            <AnalyticsSection
              hourlyData={hourlyData}
              paymentData={paymentData}
              serviceBreakdown={serviceBreakdown}
              todayRevenue={todayRevenue}
              todayTxns={todayTxns}
              totalCommissions={totalCommissions}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ======== OVERVIEW SECTION ======== */
function OverviewSection({
  todayTxns, todayRevenue, avgService, activeStaffIds, totalCommissions,
  serviceBreakdown, staffPerf, paymentData, hourlyData, recentTxns, navigate,
}) {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Today's Revenue" value={formatCurrency(todayRevenue)} change={12} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={Car} label="Total Transactions" value={todayTxns.length} change={8} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={TrendingUp} label="Average Service" value={formatCurrency(avgService)} change={-3} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={Users} label="Active Staff" value={`${activeStaffIds.size}/${staff.length}`} color="text-purple-600" bg="bg-purple-50" />
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
              <p className="text-lg font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{todayTxns.length}</p>
              <p className="text-xs text-gray-500">Cars Today</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">+12%</p>
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
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-green-500" />M-Pesa</div>
            <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-slate-500" />Cash</div>
          </div>
        </div>
      </div>

      {/* Top Services + Staff Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Staff Performance</h3>
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
                {staffPerf.slice(0, 5).map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/staff/${s.id}`)}>
                    <td className="py-2.5">
                      <span className="text-brand-red font-medium">{s.name}</span>
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
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.paymentMethod === 'M-Pesa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {t.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======== TRANSACTIONS SECTION ======== */
function TransactionsSection({ transactions }) {
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');

  const filtered = useMemo(() => {
    let result = transactions;
    if (search) {
      const q = search.toUpperCase();
      result = result.filter(
        (t) => t.vehicleReg.includes(q) || t.id.includes(q) || t.vehicleMake.toUpperCase().includes(q)
      );
    }
    if (filterPayment !== 'All') {
      result = result.filter((t) => t.paymentMethod === filterPayment);
    }
    return result;
  }, [transactions, search, filterPayment]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by vehicle reg, ID, or make..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
        />
        <div className="flex gap-2">
          {['All', 'M-Pesa', 'Cash'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPayment(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterPayment === p
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">All Transactions Today</h3>
          <span className="text-sm text-gray-500">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">ID</th>
                <th className="text-left py-2 text-gray-500 font-medium">Time</th>
                <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                <th className="text-left py-2 text-gray-500 font-medium">Services</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                <th className="text-left py-2 text-gray-500 font-medium">Staff</th>
                <th className="text-left py-2 text-gray-500 font-medium">Payment</th>
                <th className="text-right py-2 text-gray-500 font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 text-xs text-gray-400 font-mono">{t.id}</td>
                  <td className="py-2.5 text-gray-600">{formatTime(t.timestamp)}</td>
                  <td className="py-2.5">
                    <p className="font-medium">{t.vehicleReg}</p>
                    <p className="text-xs text-gray-400">{t.vehicleMake}</p>
                  </td>
                  <td className="py-2.5 text-gray-600 max-w-[180px] truncate">
                    {t.services.map((s) => s.name).join(', ')}
                  </td>
                  <td className="py-2.5 text-right font-semibold">{formatCurrency(t.total)}</td>
                  <td className="py-2.5 text-gray-600">{t.staffName}</td>
                  <td className="py-2.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.paymentMethod === 'M-Pesa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {t.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-green-600 font-medium">{formatCurrency(t.staffCommission)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======== STAFF SECTION ======== */
function StaffSection({ staffPerf, navigate }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {staff.map((member) => {
          const perf = staffPerf.find((p) => p.id === member.id);
          return (
            <div
              key={member.id}
              onClick={() => navigate(`/staff/${member.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-red hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-red">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <span className="ml-auto text-xs bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full font-medium">
                  {(member.commissionRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-lg font-bold text-gray-900">{perf?.cars || 0}</p>
                  <p className="text-[10px] text-gray-500">Cars</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(perf?.revenue || 0)}</p>
                  <p className="text-[10px] text-gray-500">Revenue</p>
                </div>
                <div className="bg-green-50 rounded-lg py-2">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(perf?.commission || 0)}</p>
                  <p className="text-[10px] text-gray-500">Commission</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======== ANALYTICS SECTION ======== */
function AnalyticsSection({ hourlyData, paymentData, serviceBreakdown, todayRevenue, todayTxns, totalCommissions }) {
  const mpesaRevenue = useMemo(
    () => todayTxns.filter((t) => t.paymentMethod === 'M-Pesa').reduce((s, t) => s + t.total, 0),
    [todayTxns]
  );
  const cashRevenue = todayRevenue - mpesaRevenue;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Commissions Paid</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCommissions)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">Net After Commissions</p>
          <p className="text-3xl font-bold text-brand-red">{formatCurrency(todayRevenue - totalCommissions)}</p>
        </div>
      </div>

      {/* Revenue over time */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Revenue by Hour</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> M-Pesa</span>
              <span className="font-semibold">{formatCurrency(mpesaRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500" /> Cash</span>
              <span className="font-semibold">{formatCurrency(cashRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Service rankings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Service Rankings</h3>
          <div className="space-y-3">
            {serviceBreakdown.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-brand-gold text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-brand-red rounded-full h-1.5"
                      style={{ width: `${(s.revenue / serviceBreakdown[0].revenue) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{formatCurrency(s.revenue)}</p>
                  <p className="text-xs text-gray-400">{s.count} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======== STAT CARD ======== */
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
