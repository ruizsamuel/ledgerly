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

const clampDayToMonth = (year: number, month: number, desiredDay: number): number => {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Math.min(desiredDay, lastDay);
};

const buildMonthDateIso = (year: number, month: number, day: number): string => {
  const validDay = clampDayToMonth(year, month, day);
  return new Date(Date.UTC(year, month, validDay, 12, 0, 0, 0)).toISOString();
};

const buildDemoTransactions = (now: Date): DemoTransaction[] => {
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const previousYear = currentYear - 1;

  const transactions: DemoTransaction[] = [];

  const pushMonthTransactions = (year: number, month: number, isCurrentMonth: boolean) => {
    const today = now.getUTCDate();
    const day = (base: number) => (isCurrentMonth ? Math.max(1, Math.min(base, today)) : base);

    const salary = 2400 + (month % 5) * 220;
    const freelance = month % 3 === 0 ? 650 + (month % 4) * 120 : 0;
    const rent = -(900 + (month % 4) * 120);
    const groceries = -(220 + (month % 5) * 70);
    const utilities = -(120 + (month % 3) * 55);
    const transport = -(90 + (month % 4) * 45);
    const leisure = -(80 + (month % 6) * 65);

    const shockExpense =
      month % 5 === 1 ? -1600 :
      month % 5 === 3 ? -950 :
      month % 7 === 0 ? -1300 :
      0;

    const positiveExtra =
      month % 4 === 0 ? 1100 :
      month % 6 === 2 ? 700 :
      0;

    transactions.push(
      { description: "Monthly Salary", amount: salary, date: buildMonthDateIso(year, month, day(3)) },
      { description: "Rent Payment", amount: rent, date: buildMonthDateIso(year, month, day(5)) },
      { description: "Groceries", amount: groceries, date: buildMonthDateIso(year, month, day(11)) },
      { description: "Utilities", amount: utilities, date: buildMonthDateIso(year, month, day(16)) },
      { description: "Transport", amount: transport, date: buildMonthDateIso(year, month, day(20)) },
      { description: "Leisure", amount: leisure, date: buildMonthDateIso(year, month, day(24)) }
    );

    if (freelance !== 0) {
      transactions.push({ description: "Freelance Project", amount: freelance, date: buildMonthDateIso(year, month, day(9)) });
    }

    if (shockExpense !== 0) {
      transactions.push({ description: "Unexpected Expense", amount: shockExpense, date: buildMonthDateIso(year, month, day(27)) });
    }

    if (positiveExtra !== 0) {
      transactions.push({ description: "Bonus / Refund", amount: positiveExtra, date: buildMonthDateIso(year, month, day(13)) });
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
      balance: 2500.50,
      description: "Primary bank account for everyday expenses"
    },
    {
      name: "Savings",
      balance: 5000.00,
      description: "Savings account for emergency fund"
    }
  ],
  transactions: buildDemoTransactions(new Date())
};
