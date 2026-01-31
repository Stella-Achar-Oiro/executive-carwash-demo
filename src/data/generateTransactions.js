import { services } from './services';
import { staff } from './staff';

const prefixes = ['KAA', 'KAB', 'KAC', 'KBY', 'KBZ', 'KCA', 'KCB', 'KXX', 'KDC'];
const makes = [
  'Toyota Corolla', 'Toyota Vitz', 'Toyota Premio', 'Toyota Harrier',
  'Nissan X-Trail', 'Nissan Note', 'Subaru Impreza', 'Subaru Forester',
  'Mercedes Benz C-Class', 'BMW 3 Series', 'Honda Fit', 'Mazda Demio',
];

function generateMpesaCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item.id;
    random -= item.weight;
  }
  return items[0].id;
}

function generateVehicleReg() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${prefix} ${num}${letter}`;
}

function pickServices() {
  const rand = Math.random();
  if (rand < 0.35) {
    return [services.find((s) => s.id === 'basic-wash')];
  } else if (rand < 0.60) {
    return [services.find((s) => s.id === 'standard-wash')];
  } else if (rand < 0.75) {
    const result = [services.find((s) => s.id === 'premium-wash')];
    if (Math.random() > 0.5) {
      result.push(services.find((s) => s.id === 'wax-treatment'));
    }
    return result;
  } else if (rand < 0.90) {
    const detailServices = services.filter((s) => s.category === 'Detailing');
    return [detailServices[Math.floor(Math.random() * detailServices.length)]];
  } else {
    return [
      services.find((s) => s.id === 'premium-wash'),
      services.find((s) => s.id === 'wax-treatment'),
      services.find((s) => s.id === 'engine-wash'),
    ];
  }
}

export function generateDemoTransactions(count = 50, existingCount = 0) {
  const transactions = [];
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);

  const staffWeights = [
    { id: 1, weight: 0.20 },
    { id: 2, weight: 0.15 },
    { id: 3, weight: 0.15 },
    { id: 4, weight: 0.15 },
    { id: 5, weight: 0.15 },
    { id: 6, weight: 0.10 },
    { id: 7, weight: 0.10 },
  ];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(
      startOfDay.getTime() + Math.random() * (now.getTime() - startOfDay.getTime())
    );

    const reg = generateVehicleReg();
    const make = makes[Math.floor(Math.random() * makes.length)];
    const selectedServices = pickServices();
    const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const staffId = weightedRandom(staffWeights);
    const selectedStaff = staff.find((s) => s.id === staffId);
    const commission = subtotal * selectedStaff.commissionRate;

    const paymentMethod = Math.random() < 0.65 ? 'M-Pesa' : 'Cash';
    const mpesaCode = paymentMethod === 'M-Pesa' ? generateMpesaCode() : null;

    const txnNum = existingCount + i + 1;

    transactions.push({
      id: `TXN-2026-${String(txnNum).padStart(4, '0')}`,
      locationId: 1,
      vehicleReg: reg,
      vehicleMake: make,
      services: selectedServices.map((s) => ({
        serviceId: s.id,
        name: s.name,
        price: s.price,
        quantity: 1,
      })),
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod,
      mpesaCode,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      staffCommission: Math.round(commission),
      timestamp: timestamp.toISOString(),
      receiptSent: true,
    });
  }

  return transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function generateSingleTransaction(existingCount) {
  const txns = generateDemoTransactions(1, existingCount);
  const txn = txns[0];
  txn.timestamp = new Date().toISOString();
  return txn;
}
