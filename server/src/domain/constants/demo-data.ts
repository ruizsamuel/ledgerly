/**
 * Demo user mock data
 * Used to seed the demo account with realistic sample data
 */

export const DEMO_EMAIL = "demo@ledgerly.local";
export const DEMO_NAME = "Demo User";

interface DemoTransaction {
  description: string;
  amount: number;
  date: string;
}

interface MonthProfile {
  salary: number;
  freelance: number;
  rent: number;
  groceries: number;
  utilities: number;
  transport: number;
  leisure: number;
  bonus: number;
  shock: number;
  extraExpense: number;
  extraIncome: number;
  salaryDay: number;
  expenseDay: number;
}

const clampDayToMonth = (year: number, month: number, desiredDay: number): number => {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Math.min(desiredDay, lastDay);
};

const buildMonthDateIso = (year: number, month: number, day: number): string => {
  const validDay = clampDayToMonth(year, month, day);
  return new Date(Date.UTC(year, month, validDay, 12, 0, 0, 0)).toISOString();
};

const monthProfiles: MonthProfile[] = [
  { salary: 2410, freelance: 0, rent: 930, groceries: 220, utilities: 124, transport: 82, leisure: 72, bonus: 0, shock: 0, extraExpense: 0, extraIncome: 0, salaryDay: 3, expenseDay: 8 },
  { salary: 2445, freelance: 360, rent: 950, groceries: 232, utilities: 128, transport: 86, leisure: 78, bonus: 180, shock: 0, extraExpense: 0, extraIncome: 0, salaryDay: 4, expenseDay: 10 },
  { salary: 2480, freelance: 0, rent: 915, groceries: 240, utilities: 122, transport: 84, leisure: 74, bonus: 0, shock: 0, extraExpense: 210, extraIncome: 0, salaryDay: 3, expenseDay: 11 },
  { salary: 2510, freelance: 420, rent: 940, groceries: 228, utilities: 126, transport: 88, leisure: 82, bonus: 140, shock: 0, extraExpense: 0, extraIncome: 0, salaryDay: 5, expenseDay: 12 },
  { salary: 2540, freelance: 0, rent: 955, groceries: 236, utilities: 130, transport: 90, leisure: 80, bonus: 0, shock: 0, extraExpense: 0, extraIncome: 120, salaryDay: 2, expenseDay: 9 },
  { salary: 2570, freelance: 470, rent: 920, groceries: 244, utilities: 132, transport: 92, leisure: 84, bonus: 220, shock: 0, extraExpense: 180, extraIncome: 0, salaryDay: 4, expenseDay: 13 },
  { salary: 2595, freelance: 0, rent: 945, groceries: 250, utilities: 134, transport: 95, leisure: 88, bonus: 0, shock: 0, extraExpense: 0, extraIncome: 160, salaryDay: 3, expenseDay: 14 },
  { salary: 2620, freelance: 520, rent: 960, groceries: 242, utilities: 136, transport: 97, leisure: 86, bonus: 160, shock: 0, extraExpense: 240, extraIncome: 0, salaryDay: 5, expenseDay: 15 },
  { salary: 2650, freelance: 0, rent: 935, groceries: 230, utilities: 130, transport: 89, leisure: 78, bonus: 0, shock: 0, extraExpense: 0, extraIncome: 0, salaryDay: 2, expenseDay: 12 },
  { salary: 2680, freelance: 560, rent: 975, groceries: 248, utilities: 138, transport: 96, leisure: 90, bonus: 200, shock: 0, extraExpense: 190, extraIncome: 0, salaryDay: 4, expenseDay: 16 },
  { salary: 2710, freelance: 0, rent: 950, groceries: 236, utilities: 132, transport: 90, leisure: 80, bonus: 0, shock: 0, extraExpense: 0, extraIncome: 180, salaryDay: 3, expenseDay: 13 },
  { salary: 2740, freelance: 620, rent: 985, groceries: 252, utilities: 140, transport: 98, leisure: 92, bonus: 260, shock: 0, extraExpense: 220, extraIncome: 0, salaryDay: 5, expenseDay: 18 }
];

const seededNoise = (year: number, month: number, salt: number) => {
  const value = Math.sin((year + 1) * 12.9898 + (month + 1) * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

const buildDemoTransactions = (now: Date): DemoTransaction[] => {
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const previousYear = currentYear - 1;

  const transactions: DemoTransaction[] = [];

  const pushMonthTransactions = (year: number, month: number, isCurrentMonth: boolean) => {
    const today = now.getUTCDate();
    const profile = monthProfiles[month];
    const yearTrend = year === currentYear ? 1.04 : 0.97;
    const currentMonthAdjustment = isCurrentMonth ? 0.98 + (today / 240) : 1;
    const amountNoise = 0.97 + seededNoise(year, month, 1) * 0.06;
    const costNoise = 0.98 + seededNoise(year, month, 2) * 0.05;

    const day = (base: number) => {
      const drift = Math.round(seededNoise(year, month, base) * 2) - 1;
      const target = base + drift;
      return isCurrentMonth ? Math.max(1, Math.min(target, today)) : Math.max(1, target);
    };

    const salary = Math.round(profile.salary * yearTrend * currentMonthAdjustment * amountNoise);
    const freelance = profile.freelance > 0 && seededNoise(year, month, 3) > 0.18
      ? Math.round(profile.freelance * yearTrend * (0.94 + seededNoise(year, month, 4) * 0.1))
      : 0;
    const rent = -Math.round(profile.rent * (0.98 + seededNoise(year, month, 5) * 0.03));
    const groceries = -Math.round(profile.groceries * costNoise);
    const utilities = -Math.round(profile.utilities * (0.97 + seededNoise(year, month, 6) * 0.06));
    const transport = -Math.round(profile.transport * (0.95 + seededNoise(year, month, 7) * 0.08));
    const leisure = -Math.round(profile.leisure * (0.94 + seededNoise(year, month, 8) * 0.1));

    const shockExpense = profile.shock > 0
      ? -Math.round(profile.shock * (0.95 + seededNoise(year, month, 9) * 0.08))
      : 0;

    const positiveExtra = profile.bonus > 0
      ? Math.round(profile.bonus * (0.96 + seededNoise(year, month, 10) * 0.06))
      : 0;

    const extraExpense = profile.extraExpense > 0
      ? -Math.round(profile.extraExpense * (0.95 + seededNoise(year, month, 11) * 0.08))
      : 0;

    const extraIncome = profile.extraIncome > 0
      ? Math.round(profile.extraIncome * (0.96 + seededNoise(year, month, 12) * 0.06))
      : 0;

    const seasonalPenalty = month === 6 || month === 7
      ? -Math.round(160 + seededNoise(year, month, 13) * 120)
      : 0;

    const repairMonth = month === 2 || month === 10
      ? -Math.round(260 + seededNoise(year, month, 14) * 180)
      : 0;

    transactions.push(
      { description: "Monthly Salary", amount: salary, date: buildMonthDateIso(year, month, day(profile.salaryDay)) },
      { description: "Rent Payment", amount: rent, date: buildMonthDateIso(year, month, day(profile.expenseDay)) },
      { description: "Groceries", amount: groceries, date: buildMonthDateIso(year, month, day(profile.expenseDay + 3)) },
      { description: "Utilities", amount: utilities, date: buildMonthDateIso(year, month, day(profile.expenseDay + 7)) },
      { description: "Transport", amount: transport, date: buildMonthDateIso(year, month, day(profile.expenseDay + 11)) },
      { description: "Leisure", amount: leisure, date: buildMonthDateIso(year, month, day(profile.expenseDay + 16)) }
    );

    if (freelance !== 0) {
      transactions.push({ description: "Freelance Project", amount: freelance, date: buildMonthDateIso(year, month, day(profile.expenseDay - 1)) });
    }

    if (shockExpense !== 0) {
      transactions.push({ description: "Unexpected Expense", amount: shockExpense, date: buildMonthDateIso(year, month, day(profile.expenseDay + 19)) });
    }

    if (positiveExtra !== 0) {
      transactions.push({ description: "Bonus / Refund", amount: positiveExtra, date: buildMonthDateIso(year, month, day(profile.expenseDay + 5)) });
    }

    if (extraExpense !== 0) {
      transactions.push({ description: "Extra Expense", amount: extraExpense, date: buildMonthDateIso(year, month, day(profile.expenseDay + 9)) });
    }

    if (extraIncome !== 0) {
      transactions.push({ description: "Extra Income", amount: extraIncome, date: buildMonthDateIso(year, month, day(profile.expenseDay + 13)) });
    }

    if (seasonalPenalty !== 0) {
      transactions.push({ description: "Vacation", amount: seasonalPenalty, date: buildMonthDateIso(year, month, day(profile.expenseDay + 14)) });
    }

    if (repairMonth !== 0) {
      transactions.push({ description: "Home Repair", amount: repairMonth, date: buildMonthDateIso(year, month, day(profile.expenseDay + 21)) });
    }
  };

  // Full previous year (12 months)
  for (let month = 0; month <= 11; month++) {
    pushMonthTransactions(previousYear, month, false);
  }

  // Current year until current month (inclusive)
  for (let month = 0; month <= currentMonth; month++) {
    pushMonthTransactions(currentYear, month, month === currentMonth);
  }

  return transactions;
};

export const demomockdata = {
  accounts: [
    {
      name: "Main Checking",
      balance: 0,
      description: "Primary bank account for everyday expenses"
    },
    {
      name: "Savings",
      balance: 0,
      description: "Savings account for emergency fund"
    }
  ],
  transactions: buildDemoTransactions(new Date())
};
