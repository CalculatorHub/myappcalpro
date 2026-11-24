import React, { useMemo, useState } from 'react';
import { Download, Edit3, Plus, Trash2, WalletCards } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, type TransactionRecord } from '../../utils/api';
import { downloadCsvFile } from '../../utils/exportUtils';
import { formatINR } from '../../utils/formatters';
import { NumberInput } from '../ui/NumberInput';
import { StatusBanner } from '../ui/StatusBanner';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';

const EXPENSE_CATEGORIES = [
  'Housing & Rent',
  'Groceries & Dining',
  'Utilities & Internet',
  'Transport & Fuel',
  'Healthcare',
  'Insurance',
  'Education',
  'Lifestyle & Shopping',
  'Investments',
];
const INCOME_CATEGORIES = ['Salary', 'Freelance / Business', 'Dividends & Interest', 'Other Income'];
const PAYMENT_MODES = ['UPI', 'Card', 'NetBanking', 'Cash', 'Auto-Debit'] as const;

export const ExpenseBudgetModule: React.FC = () => {
  const { user, workspace, refreshWorkspace, openAuthModal } = useAuth();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Groceries & Dining');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState<string>('UPI');

  const [budgetCat, setBudgetCat] = useState('Groceries & Dining');
  const [budgetLimitStr, setBudgetLimitStr] = useState('15000');

  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredTxns = useMemo(() => {
    if (!filterMonth) return workspace.transactions;
    return workspace.transactions.filter((t) => t.txn_date.startsWith(filterMonth));
  }, [workspace.transactions, filterMonth]);

  const cashflow = useMemo(() => {
    const income = filteredTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = filteredTxns
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const byCat = new Map<string, number>();
    for (const tx of filteredTxns) {
      if (tx.type === 'expense') {
        byCat.set(tx.category, (byCat.get(tx.category) ?? 0) + tx.amount);
      }
    }
    return { income, expense, net: income - expense, byCat };
  }, [filteredTxns]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!user) {
      openAuthModal('register');
      return;
    }
    const amt = Number(amountStr);
    if (title.trim().length < 2 || !Number.isFinite(amt) || amt <= 0) {
      setErrorMsg('Enter a valid description and positive amount.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type,
        category,
        title: title.trim(),
        amount: amt,
        txn_date: txnDate,
        payment_mode: paymentMode,
        notes: '',
      };
      if (editingId) {
        await apiRequest(`/api/transactions/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/transactions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setEditingId(null);
      setTitle('');
      setAmountStr('');
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!user) {
      openAuthModal('register');
      return;
    }
    const limit = Number(budgetLimitStr);
    if (!Number.isFinite(limit) || limit < 0) {
      setErrorMsg('Budget limit cannot be negative.');
      return;
    }
    await apiRequest('/api/budgets', {
      method: 'PUT',
      body: JSON.stringify({ category: budgetCat, monthly_limit: limit }),
    });
    await refreshWorkspace();
  };

  const handleEditTxn = (tx: TransactionRecord) => {
    setEditingId(tx.id);
    setType(tx.type);
    setCategory(tx.category);
    setTitle(tx.title);
    setAmountStr(String(tx.amount));
    setTxnDate(tx.txn_date);
    setPaymentMode(tx.payment_mode);
  };

  const handleDeleteTxn = async (id: number) => {
    if (!user) return;
    await apiRequest(`/api/transactions/${id}`, { method: 'DELETE' });
    if (editingId === id) setEditingId(null);
    await refreshWorkspace();
  };

  const handleDeleteBudget = async (id: number) => {
    if (!user) return;
    await apiRequest(`/api/budgets/${id}`, { method: 'DELETE' });
    await refreshWorkspace();
  };

  const handleExportCsv = () => {
    downloadCsvFile(
      `calhub-ledger-${filterMonth || 'all'}.csv`,
      ['Date', 'Type', 'Category', 'Title', 'Amount (INR)', 'Payment Mode'],
      filteredTxns.map((t) => [t.txn_date, t.type, t.category, t.title, t.amount.toFixed(2), t.payment_mode])
    );
  };

  const categoryOptions = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="space-y-6">
      <VaultPromptBanner moduleLabel="Expense & Budget Manager" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Add Transaction + Set Category Budget */}
        <div className="space-y-5 lg:col-span-5">
          <form onSubmit={handleSaveTransaction} className="aurora-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingId ? 'Edit Transaction' : 'Log Income / Expense'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-xs font-semibold text-[#38BDF8] cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <StatusBanner error={errorMsg} />

            <div className="flex rounded-xl border border-[#6366F1]/25 bg-[#080D1B] p-1">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategory(t === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
                  }}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    type === t
                      ? t === 'expense'
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-[#F8FAFC]'
                        : 'bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-[#080D1B]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tx-title" className="block text-xs font-medium text-[#F8FAFC]">
                Description
              </label>
              <input
                id="tx-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Monthly Rent or Salary Credit"
                className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NumberInput
                id="tx-amount"
                label="Amount"
                prefix="₹"
                min={1}
                value={amountStr}
                onChange={setAmountStr}
                placeholder="0"
              />
              <div className="space-y-1.5">
                <label htmlFor="tx-date" className="block text-sm font-medium text-[#F8FAFC]">
                  Date
                </label>
                <input
                  id="tx-date"
                  type="date"
                  required
                  value={txnDate}
                  onChange={(e) => setTxnDate(e.target.value)}
                  className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="tx-cat" className="block text-xs font-medium text-[#F8FAFC]">
                  Category
                </label>
                <select
                  id="tx-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="aurora-input w-full px-3 py-2.5 text-xs font-medium text-[#F8FAFC] focus:outline-none cursor-pointer"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c} className="bg-[#0B1020]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="tx-mode" className="block text-xs font-medium text-[#F8FAFC]">
                  Payment Mode
                </label>
                <select
                  id="tx-mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="aurora-input w-full px-3 py-2.5 text-xs font-medium text-[#F8FAFC] focus:outline-none cursor-pointer"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m} className="bg-[#0B1020]">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="aurora-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Transaction'}</span>
            </button>
          </form>

          {/* Monthly Budget Cap Form */}
          <form onSubmit={handleSaveBudget} className="aurora-card p-6 space-y-4">
            <h4 className="text-sm font-semibold text-[#F8FAFC]">Set Monthly Category Budget</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="budget-cat" className="block text-xs font-medium text-[#F8FAFC]">
                  Expense Category
                </label>
                <select
                  id="budget-cat"
                  value={budgetCat}
                  onChange={(e) => setBudgetCat(e.target.value)}
                  className="aurora-input w-full px-3 py-2.5 text-xs font-medium text-[#F8FAFC] focus:outline-none cursor-pointer"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0B1020]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <NumberInput
                id="budget-limit"
                label="Monthly Cap"
                prefix="₹"
                min={0}
                value={budgetLimitStr}
                onChange={setBudgetLimitStr}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl border border-[#06B6D4]/40 bg-[#06B6D4]/12 py-2 text-xs font-semibold text-[#38BDF8] hover:bg-[#06B6D4]/22 cursor-pointer"
            >
              Save Budget Cap to SQLite
            </button>
          </form>
        </div>

        {/* Right Column: Cashflow KPIs, Budget Bars & Ledger */}
        <div className="space-y-5 lg:col-span-7 min-w-0">
          <div className="aurora-card-accent p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#38BDF8]">
                  Monthly Cashflow Summary
                </p>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-[#F8FAFC] tabular-nums break-words">
                  {formatINR(cashflow.net)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="month"
                  aria-label="Filter transactions by month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="aurora-input px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none"
                />
                {filteredTxns.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#06B6D4]/35 bg-[#0B1020] px-3 py-1.5 text-xs font-semibold text-[#38BDF8] cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>CSV</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="aurora-subcard p-3.5 min-w-0">
                <p className="text-xs text-[#10B981]">Total Income</p>
                <p className="mt-1 font-mono text-lg font-bold text-[#F8FAFC] break-words">
                  {formatINR(cashflow.income)}
                </p>
              </div>
              <div className="aurora-subcard p-3.5 min-w-0">
                <p className="text-xs text-[#E879F9]">Total Expenses</p>
                <p className="mt-1 font-mono text-lg font-bold text-[#F8FAFC] break-words">
                  {formatINR(cashflow.expense)}
                </p>
              </div>
            </div>
          </div>

          {/* Budget Utilization Meters */}
          {workspace.budgets.length > 0 && (
            <div className="aurora-card p-5 space-y-3.5">
              <h4 className="text-sm font-semibold text-[#F8FAFC]">Budget vs Actual Spend</h4>
              {workspace.budgets.map((b) => {
                const spent = cashflow.byCat.get(b.category) ?? 0;
                const pct = b.monthly_limit > 0 ? (spent / b.monthly_limit) * 100 : 0;
                const barColor =
                  pct > 100
                    ? 'from-red-500 to-[#D946EF]'
                    : pct > 80
                    ? 'from-amber-400 to-[#A855F7]'
                    : 'from-[#10B981] to-[#06B6D4]';
                return (
                  <div key={b.id} className="aurora-subcard p-3.5 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#F8FAFC]">{b.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#94A3B8]">
                          {formatINR(spent)} / {formatINR(b.monthly_limit)} ({pct.toFixed(0)}%)
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDeleteBudget(b.id)}
                          aria-label={`Remove ${b.category} budget`}
                          className="text-red-300 hover:text-red-200 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#080D1B] overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, pct)}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Transaction Ledger */}
          <div className="aurora-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-[#F8FAFC]">
                  Ledger Entries ({filteredTxns.length})
                </h4>
              </div>
              {filterMonth && (
                <button
                  type="button"
                  onClick={() => setFilterMonth('')}
                  className="text-xs text-[#38BDF8] cursor-pointer"
                >
                  Show All Dates
                </button>
              )}
            </div>

            {filteredTxns.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {user
                  ? 'No transactions found for the selected month.'
                  : 'Sign in above to save your income, expenses, and category budgets in SQLite.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredTxns.map((tx) => (
                  <div
                    key={tx.id}
                    className="aurora-subcard flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F8FAFC] truncate">{tx.title}</p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {tx.txn_date} · {tx.category} · {tx.payment_mode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-mono text-sm font-bold tabular-nums ${
                          tx.type === 'income' ? 'text-[#10B981]' : 'text-[#E879F9]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatINR(tx.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditTxn(tx)}
                        aria-label={`Edit ${tx.title}`}
                        className="rounded-lg border border-[#6366F1]/25 p-1.5 text-[#38BDF8] cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteTxn(tx.id)}
                        aria-label={`Delete ${tx.title}`}
                        className="rounded-lg border border-red-400/25 p-1.5 text-red-300 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
