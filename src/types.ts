export interface Expense {
  id: string;
  category: string;
  amount: number;
  jeanAmount?: number;
  moniqueAmount?: number;
  date: string;
  description: string;
  partner: string;
  isRecurring: boolean;
  endDate?: string;
  debtId?: string;
  objectiveId?: string;
}

export interface PlanningEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  partner: string;
  description: string;
  imageUrl?: string;
  isSurprise?: boolean;
}

export interface PlanningCategory {
  id: string;
  name: string;
  color: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  checked: boolean;
}

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
}

export interface Objective {
  id: string;
  title: string;
  partner: string;
  targetAmount: number;
  currentAmount: number;
  jeanAmount?: number;
  moniqueAmount?: number;
  targetJeanMonthly?: number;
  targetMoniqueMonthly?: number;
  realJeanMonthly?: number;
  realMoniqueMonthly?: number;
  startDate: string;
  endDate: string;
  bankAccountId?: string;
  isRecurring?: boolean;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
}

export interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  endDate: string;
  type: 'Prêt' | 'Crédit' | 'Autre' | 'Équilibre';
  isInternal?: boolean;
  borrower?: string;
  lender?: string;
  payments?: DebtPayment[];
}

export interface BankAccount {
  id: string;
  name: string;
  bankName?: string;
  balance: number;
  isDefault?: boolean;
  syncWithSavings?: boolean;
}

export interface FinanceConfig {
  jeanSalary: number;
  moniqueSalary: number;
  targetBudget: number;
  jeanContributionPercent: number;
  moniqueContributionPercent: number;
  jeanContribution: number;
  moniqueContribution: number;
  jeanIsRecurring: boolean;
  moniqueIsRecurring: boolean;
  totalIsRecurring: boolean;
  bankAccounts?: BankAccount[];
}
