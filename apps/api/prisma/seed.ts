import { PrismaClient, Role, AssetType, TxType, NotifType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(Math.floor(Math.random() * 25) + 1);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('Seeding database...');

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail = 'admin@wealth.dev';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await bcrypt.hash('Admin1234!', 12);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        profile: { create: { fullName: 'System Admin' } },
        settings: { create: { themePreference: 'system', notificationsEnabled: true } },
      },
    });
    console.log(`Created admin: ${admin.email}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  // ── Demo user ───────────────────────────────────────────────────────────────
  const userEmail = 'demo@wealth.dev';
  let user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    const passwordHash = await bcrypt.hash('Demo1234!', 12);
    user = await prisma.user.create({
      data: {
        email: userEmail,
        passwordHash,
        role: Role.USER,
        profile: { create: { fullName: 'Demo User', bio: 'Personal wealth manager enthusiast' } },
        settings: { create: { themePreference: 'dark', notificationsEnabled: true } },
      },
    });
    console.log(`Created demo user: ${user.email}`);
  } else {
    console.log('Demo user already exists.');
  }

  // ── Assets ──────────────────────────────────────────────────────────────────
  const existingAssets = await prisma.asset.count({ where: { userId: user.id } });
  if (existingAssets === 0) {
    await prisma.asset.createMany({
      data: [
        {
          userId: user.id,
          symbol: 'AAPL',
          name: 'Apple Inc.',
          shares: 50,
          avgCost: 162.5,
          currentPrice: 189.5,
          assetType: AssetType.STOCK,
        },
        {
          userId: user.id,
          symbol: 'VTI',
          name: 'Vanguard Total Market ETF',
          shares: 120,
          avgCost: 218.4,
          currentPrice: 245.3,
          assetType: AssetType.STOCK,
        },
        {
          userId: user.id,
          symbol: 'BTC',
          name: 'Bitcoin',
          shares: 0.15,
          avgCost: 58000,
          currentPrice: 62000,
          assetType: AssetType.CRYPTO,
        },
        {
          userId: user.id,
          symbol: 'VNQ',
          name: 'Vanguard Real Estate ETF',
          shares: 80,
          avgCost: 82.1,
          currentPrice: 88.5,
          assetType: AssetType.REAL_ESTATE,
        },
        {
          userId: user.id,
          symbol: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          shares: 60,
          avgCost: 73.2,
          currentPrice: 74.8,
          assetType: AssetType.BOND,
        },
      ],
    });
    console.log('Created demo assets.');
  } else {
    console.log('Assets already exist, skipping.');
  }

  // ── Transactions ────────────────────────────────────────────────────────────
  const existingTx = await prisma.transaction.count({ where: { userId: user.id } });
  if (existingTx === 0) {
    const transactions = [
      // Deposits
      { type: TxType.DEPOSIT,  symbol: null,   name: 'Bank transfer',              amount: 10000, price: null, shares: null, note: 'Initial deposit',       createdAt: monthsAgo(11) },
      { type: TxType.DEPOSIT,  symbol: null,   name: 'Bank transfer',              amount: 5000,  price: null, shares: null, note: 'Monthly top-up',        createdAt: monthsAgo(8)  },
      { type: TxType.DEPOSIT,  symbol: null,   name: 'Bank transfer',              amount: 5000,  price: null, shares: null, note: 'Monthly top-up',        createdAt: monthsAgo(5)  },
      { type: TxType.DEPOSIT,  symbol: null,   name: 'Bank transfer',              amount: 3000,  price: null, shares: null, note: 'Bonus deposit',         createdAt: monthsAgo(2)  },
      // Buy orders
      { type: TxType.BUY,      symbol: 'AAPL', name: 'Apple Inc.',                 amount: 8125,  price: 162.5, shares: 50,  note: null,                    createdAt: monthsAgo(10) },
      { type: TxType.BUY,      symbol: 'VTI',  name: 'Vanguard Total Market ETF',  amount: 13104, price: 218.4, shares: 60,  note: null,                    createdAt: monthsAgo(9)  },
      { type: TxType.BUY,      symbol: 'BTC',  name: 'Bitcoin',                    amount: 8700,  price: 58000, shares: 0.15, note: null,                   createdAt: monthsAgo(7)  },
      { type: TxType.BUY,      symbol: 'VTI',  name: 'Vanguard Total Market ETF',  amount: 13104, price: 218.4, shares: 60,  note: 'Dollar-cost averaging', createdAt: monthsAgo(6)  },
      { type: TxType.BUY,      symbol: 'VNQ',  name: 'Vanguard Real Estate ETF',   amount: 6568,  price: 82.1,  shares: 80,  note: null,                    createdAt: monthsAgo(4)  },
      { type: TxType.BUY,      symbol: 'BND',  name: 'Vanguard Total Bond Market', amount: 4392,  price: 73.2,  shares: 60,  note: 'Portfolio diversification', createdAt: monthsAgo(3) },
      // Dividends
      { type: TxType.DIVIDEND, symbol: 'VTI',  name: 'Vanguard Total Market ETF',  amount: 42,    price: null, shares: null, note: 'Q4 dividend',           createdAt: monthsAgo(3)  },
      { type: TxType.DIVIDEND, symbol: 'VNQ',  name: 'Vanguard Real Estate ETF',   amount: 98,    price: null, shares: null, note: 'Q1 dividend',           createdAt: monthsAgo(1)  },
      { type: TxType.DIVIDEND, symbol: 'BND',  name: 'Vanguard Total Bond Market', amount: 18,    price: null, shares: null, note: 'Q1 dividend',           createdAt: daysAgo(20)   },
      // Recent activity
      { type: TxType.DIVIDEND, symbol: 'AAPL', name: 'Apple Inc.',                 amount: 23,    price: null, shares: null, note: 'Q1 dividend',           createdAt: daysAgo(5)    },
    ];

    for (const tx of transactions) {
      await prisma.transaction.create({
        data: { ...tx, userId: user.id },
      });
    }
    console.log('Created demo transactions.');
  } else {
    console.log('Transactions already exist, skipping.');
  }

  // ── Notifications ───────────────────────────────────────────────────────────
  const existingNotifs = await prisma.notification.count({ where: { userId: user.id } });
  if (existingNotifs === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          title: 'Portfolio milestone reached',
          message: 'Your portfolio has crossed $80,000 for the first time!',
          read: false,
          type: NotifType.SUCCESS,
          createdAt: daysAgo(0),
        },
        {
          userId: user.id,
          title: 'Bitcoin price alert',
          message: 'BTC is up 6.9% this week — your position is in profit.',
          read: false,
          type: NotifType.WARNING,
          createdAt: daysAgo(1),
        },
        {
          userId: user.id,
          title: 'Dividend received — VNQ',
          message: 'A dividend of $98.00 from VNQ has been credited.',
          read: true,
          type: NotifType.INFO,
          createdAt: daysAgo(30),
        },
        {
          userId: user.id,
          title: 'New deposit confirmed',
          message: 'Your bank transfer of $3,000 has been received.',
          read: true,
          type: NotifType.SUCCESS,
          createdAt: daysAgo(60),
        },
      ],
    });
    console.log('Created demo notifications.');
  } else {
    console.log('Notifications already exist, skipping.');
  }

  console.log('\nSeeding complete!');
  console.log('  demo@wealth.dev  / Demo1234!');
  console.log('  admin@wealth.dev / Admin1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
