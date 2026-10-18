import React from 'react';

export interface Task {
  id: string;
  name: string;
  category: string;
  assignedTo: 'Florian' | 'Sophie' | 'Florian & Sophie';
  date: string;
  status: 'À faire' | 'Terminé';
  isRecurrent?: boolean;
}

export interface Expense {
  id: string;
  desc: string;
  cat: string;
  amt: number;
  rec: boolean;
  owner: string;
  date: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  cat: string;
  unit: string;
  quantity: number;
  price: number;
  checked: boolean;
}

export interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: 'Communication' | 'Psychologie' | 'Vie Quotidienne' | 'Finances';
  readTime: string;
  image: string;
  content: string;
  date: string;
  lead?: string;
  quote?: string;
}

export interface ArchivedShoppingList {
  id: string;
  name: string;
  date: string;
  itemsCount: number;
  total: number;
  items: ShoppingItem[];
}
