import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Printer,
  MessageSquare,
  Plus,
  Car,
  Clock,
  CreditCard,
  Banknote,
  LayoutDashboard,
  ChevronRight,
  Home,
  Monitor,
  Receipt,
  History,
  Menu,
  UserCircle,
  MapPin,
  Search,
} from 'lucide-react';
import { services, serviceCategories } from '../data/services';
import { staff } from '../data/staff';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency, formatTime, isToday } from '../data/utils';

const LOGO_URL = 'https://i.postimg.cc/fTVfbx1T/Whats-App-Image-2026-01-31-at-16-36-44.jpg';

const POS_TABS = [
  { id: 'new-sale', label: 'New Sale', icon: Monitor },
  { id: 'recent', label: 'Recent Sales', icon: History },
];

function generateMpesaCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function POS() {
  const { transactions, addTransaction } = useTransactions();
  const [activeTab, setActiveTab] = useState('new-sale');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [vehicleReg, setVehicleReg] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [selectedStaff, setSelectedStaff] = useState(staff[0].id);
  const [receipt, setReceipt] = useState(null);

  const filteredServices = useMemo(() => {
    if (category === 'All') return services;
    return services.filter((s) => s.category === category);
  }, [category]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const staffMember = staff.find((s) => s.id === selectedStaff);
  const commission = Math.round(subtotal * (staffMember?.commissionRate || 0));

  const todayTxns = useMemo(
    () => transactions.filter((t) => isToday(t.timestamp)).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [transactions]
  );
  const todayRevenue = useMemo(() => todayTxns.reduce((sum, t) => sum + t.total, 0), [todayTxns]);

  function addToCart(service) {
    setCart((prev) => {
      const existing = prev.find((i) => i.serviceId === service.id);
      if (existing) {
        return prev.map((i) =>
          i.serviceId === service.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { serviceId: service.id, name: service.name, price: service.price, quantity: 1 }];
    });
  }

  function removeFromCart(serviceId) {
    setCart((prev) => prev.filter((i) => i.serviceId !== serviceId));
  }

  function completeTransaction() {
    if (!vehicleReg.trim() || cart.length === 0) return;

    const mpesaCode = paymentMethod === 'M-Pesa' ? generateMpesaCode() : null;
    const txn = {
      id: `TXN-2026-${String(transactions.length + 1).padStart(4, '0')}`,
      locationId: 1,
      vehicleReg: vehicleReg.trim().toUpperCase(),
      vehicleMake: vehicleMake.trim() || 'Unknown',
      services: cart.map((i) => ({ ...i })),
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod,
      mpesaCode,
      staffId: staffMember.id,
      staffName: staffMember.name,
      staffCommission: commission,
      timestamp: new Date().toISOString(),
      receiptSent: true,
    };

    addTransaction(txn);
    setReceipt(txn);
  }

  function newTransaction() {
    setReceipt(null);
    setCart([]);
    setVehicleReg('');
    setVehicleMake('');
    setPaymentMethod('M-Pesa');
    setSelectedStaff(staff[0].id);
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
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

        {/* Location */}
        <div className="px-5 py-3 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-xs text-gray-400">Kikuyu Branch</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500">
            <MapPin className="w-3 h-3" />
            Dagoretti Road, Kikuyu
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 pt-2 pb-1">
            POS Terminal
          </p>
          {POS_TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
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
            to="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Owner Dashboard
          </Link>
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            Landing Page
          </Link>

          {/* Today's quick stats */}
          <div className="mt-6 mx-2 bg-white/5 rounded-xl p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              Today's Stats
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Sales</span>
              <span className="text-sm font-bold text-white">{todayTxns.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Revenue</span>
              <span className="text-sm font-bold text-brand-gold">{formatCurrency(todayRevenue)}</span>
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-700/50">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-brand-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">Cashier</p>
              <p className="text-[10px] text-gray-500">POS Terminal</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display font-bold text-gray-900 text-lg leading-tight">
                {POS_TABS.find((t) => t.id === activeTab)?.label || 'POS Terminal'}
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
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-600">
              <Receipt className="w-4 h-4" />
              <span className="font-medium">{todayTxns.length}</span>
              <span className="text-gray-400">today</span>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'new-sale' && (
            <NewSaleView
              category={category}
              setCategory={setCategory}
              filteredServices={filteredServices}
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              vehicleReg={vehicleReg}
              setVehicleReg={setVehicleReg}
              vehicleMake={vehicleMake}
              setVehicleMake={setVehicleMake}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              selectedStaff={selectedStaff}
              setSelectedStaff={setSelectedStaff}
              staffMember={staffMember}
              subtotal={subtotal}
              commission={commission}
              completeTransaction={completeTransaction}
            />
          )}
          {activeTab === 'recent' && (
            <RecentSalesView transactions={todayTxns} />
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <img src={LOGO_URL} alt="Executive Car Wash" className="w-16 h-16 rounded-xl object-contain" />
                </div>
                <h3 className="font-display font-bold text-lg">EXECUTIVE CAR & CARPET WASH</h3>
                <p className="text-sm text-gray-500">Kikuyu, Dagoretti Road</p>
                <p className="text-sm text-gray-500">Tel: 0722 807 XXX</p>
              </div>

              <div className="border-t border-dashed border-gray-300 my-4" />

              <div className="text-center mb-4">
                <p className="font-semibold text-sm">TRANSACTION RECEIPT</p>
                <p className="text-xs text-gray-500">#{receipt.id}</p>
                <p className="text-xs text-gray-500">
                  {new Date(receipt.timestamp).toLocaleDateString('en-KE', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}{' '}
                  {new Date(receipt.timestamp).toLocaleTimeString('en-KE', {
                    hour: '2-digit', minute: '2-digit', hour12: true,
                  })}
                </p>
              </div>

              <div className="mb-4 text-sm">
                <p><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{receipt.vehicleReg}</span></p>
                <p><span className="text-gray-500">Make:</span> <span className="font-medium">{receipt.vehicleMake}</span></p>
              </div>

              <div className="border-t border-dashed border-gray-300 my-4" />

              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-gray-500">Services:</p>
                {receipt.services.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="font-medium">{formatCurrency(s.price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 my-4" />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>{formatCurrency(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount:</span>
                  <span>{formatCurrency(receipt.discount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(receipt.total)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-4" />

              <div className="text-sm space-y-1">
                <p><span className="text-gray-500">Payment:</span> <span className="font-medium">{receipt.paymentMethod}</span></p>
                {receipt.mpesaCode && (
                  <p><span className="text-gray-500">Code:</span> <span className="font-mono font-medium">{receipt.mpesaCode}</span></p>
                )}
                <p><span className="text-gray-500">Served by:</span> <span className="font-medium">{receipt.staffName}</span></p>
              </div>

              <div className="border-t border-dashed border-gray-300 my-4" />

              <div className="text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
                <p>Drive safely.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6">
                <button className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  SMS
                </button>
                <button
                  onClick={newTransaction}
                  className="flex items-center justify-center gap-1 bg-brand-red hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======== NEW SALE VIEW ======== */
function NewSaleView({
  category, setCategory, filteredServices, cart, addToCart, removeFromCart,
  vehicleReg, setVehicleReg, vehicleMake, setVehicleMake,
  paymentMethod, setPaymentMethod, selectedStaff, setSelectedStaff,
  staffMember, subtotal, commission, completeTransaction,
}) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left - Service Selection */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-brand-red text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => addToCart(service)}
              className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-brand-red hover:shadow-md transition-all group"
            >
              <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{service.name}</h4>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{service.description}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration}
                  </p>
                </div>
                <div className="bg-brand-red/10 group-hover:bg-brand-red rounded-lg p-2 transition-colors">
                  <Plus className="w-4 h-4 text-brand-red group-hover:text-white transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right - Transaction Panel */}
      <div className="w-80 lg:w-96 bg-white border-l border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-lg text-gray-900">Current Transaction</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Vehicle Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Registration *</label>
              <input
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder="KXX 123Y"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Make/Model</label>
              <input
                type="text"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                placeholder="Toyota Corolla"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
          </div>

          {/* Cart Items */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Services</h3>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select services from the left</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.serviceId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity > 1 ? `${item.quantity} x ` : ''}
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                      <button
                        onClick={() => removeFromCart(item.serviceId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-gray-400">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>TOTAL</span>
                <span className="text-brand-red">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('M-Pesa')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  paymentMethod === 'M-Pesa'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                M-Pesa
              </button>
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  paymentMethod === 'Cash'
                    ? 'bg-amber-50 border-amber-500 text-amber-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Cash
              </button>
            </div>
          </div>

          {/* Staff */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Served By</h3>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.role}
                </option>
              ))}
            </select>
            {cart.length > 0 && (
              <div className="mt-2 bg-green-50 rounded-lg px-3 py-2 flex justify-between items-center">
                <span className="text-xs text-green-700">Commission ({(staffMember?.commissionRate * 100).toFixed(0)}%)</span>
                <span className="text-sm font-semibold text-green-700">{formatCurrency(commission)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Complete Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={completeTransaction}
            disabled={!vehicleReg.trim() || cart.length === 0}
            className="w-full bg-brand-red hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            Complete Transaction
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======== RECENT SALES VIEW ======== */
function RecentSalesView({ transactions }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return transactions;
    const q = search.toUpperCase();
    return transactions.filter(
      (t) => t.vehicleReg.includes(q) || t.id.includes(q) || t.staffName.toUpperCase().includes(q)
    );
  }, [transactions, search]);

  const totalRevenue = filtered.reduce((sum, t) => sum + t.total, 0);
  const mpesaCount = filtered.filter((t) => t.paymentMethod === 'M-Pesa').length;
  const cashCount = filtered.length - mpesaCount;

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          <p className="text-xs text-gray-500">Total Sales</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-brand-red">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{mpesaCount}</p>
          <p className="text-xs text-gray-500">M-Pesa</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{cashCount}</p>
          <p className="text-xs text-gray-500">Cash</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle reg, ID, or staff name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Today's Transactions</h3>
          <span className="text-sm text-gray-500">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Time</th>
                <th className="text-left py-2 text-gray-500 font-medium">ID</th>
                <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                <th className="text-left py-2 text-gray-500 font-medium">Services</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                <th className="text-left py-2 text-gray-500 font-medium">Staff</th>
                <th className="text-left py-2 text-gray-500 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 text-gray-600">{formatTime(t.timestamp)}</td>
                  <td className="py-2.5 text-xs text-gray-400 font-mono">{t.id}</td>
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
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
