import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Edit3, Plus, Search, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, type GlossaryTermRecord } from '../../utils/api';
import { StatusBanner } from '../ui/StatusBanner';

export const GlossaryModule: React.FC = () => {
  const { adminStatus, openAuthModal } = useAuth();
  const [terms, setTerms] = useState<GlossaryTermRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Admin editor state
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [termName, setTermName] = useState('');
  const [termCat, setTermCat] = useState('Investing');
  const [termFormula, setTermFormula] = useState('');
  const [termSummary, setTermSummary] = useState('');
  const [termExample, setTermExample] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ items: GlossaryTermRecord[] }>('/api/glossary');
      setTerms(res.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTerms();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(terms.map((t) => t.category));
    return ['All', ...Array.from(set).sort()];
  }, [terms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((t) => {
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.formula.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [terms, query, categoryFilter]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const payload = {
        term: termName,
        category: termCat,
        formula: termFormula,
        summary: termSummary,
        example: termExample,
      };
      if (editingId) {
        await apiRequest(`/api/admin/glossary/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/admin/glossary', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setEditingId(null);
      setTermName('');
      setTermFormula('');
      setTermSummary('');
      setTermExample('');
      setShowAdminForm(false);
      await loadTerms();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Admin update failed.');
    }
  };

  const handleAdminDelete = async (id: number) => {
    await apiRequest(`/api/admin/glossary/${id}`, { method: 'DELETE' });
    await loadTerms();
  };

  return (
    <div className="space-y-6">
      <div className="aurora-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-[#38BDF8]" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                Indian Finance &amp; Taxation Glossary ({terms.length} terms)
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Formulas, statutory references, and practical INR examples stored in SQLite.
              </p>
            </div>
          </div>

          {adminStatus.isAdminSession ? (
            <button
              type="button"
              onClick={() => {
                setShowAdminForm((prev) => !prev);
                setEditingId(null);
              }}
              className="aurora-btn-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{showAdminForm ? 'Close Editor' : 'Add Glossary Term'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('admin')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/12 px-3 py-1.5 text-xs font-semibold text-[#C084FC] hover:bg-[#8B5CF6]/22 cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Admin Manage</span>
            </button>
          )}
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="aurora-input flex items-center gap-2 px-3.5 py-2 md:max-w-sm w-full">
            <Search className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 87A, XIRR, SIP, CIBIL, Amortization..."
              aria-label="Search glossary terms"
              className="w-full bg-transparent text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#8B5CF6] text-[#F8FAFC] font-semibold'
                    : 'border border-[#6366F1]/25 bg-[#080D1B] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Protected Admin Create/Edit Panel */}
      {adminStatus.isAdminSession && showAdminForm && (
        <form onSubmit={handleAdminSubmit} className="aurora-card-accent p-6 space-y-4">
          <h4 className="text-sm font-semibold text-[#F8FAFC]">
            {editingId ? 'Edit Glossary Term' : 'Create New Glossary Term'}
          </h4>
          <StatusBanner error={errorMsg} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              placeholder="Term Name"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              className="aurora-input px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Category (e.g., Taxation)"
              value={termCat}
              onChange={(e) => setTermCat(e.target.value)}
              className="aurora-input px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Formula / Rule"
              value={termFormula}
              onChange={(e) => setTermFormula(e.target.value)}
              className="aurora-input px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>
          <textarea
            required
            rows={2}
            placeholder="Clear plain-English definition..."
            value={termSummary}
            onChange={(e) => setTermSummary(e.target.value)}
            className="aurora-input w-full px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
          />
          <input
            type="text"
            placeholder="Practical ₹ Example (optional)"
            value={termExample}
            onChange={(e) => setTermExample(e.target.value)}
            className="aurora-input w-full px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
          />
          <button
            type="submit"
            className="aurora-btn-primary rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            {editingId ? 'Update Term' : 'Publish Term to SQLite'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="aurora-card p-8 text-center text-xs text-[#94A3B8]">Loading glossary...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="aurora-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#F8FAFC] min-w-0 break-words">{item.term}</h4>
                  <span className="rounded-lg border border-[#6366F1]/30 bg-[#6366F1]/15 px-2 py-0.5 text-[10px] font-semibold text-[#38BDF8] shrink-0">
                    {item.category}
                  </span>
                </div>
                {item.formula && (
                  <p className="rounded-xl border border-[#06B6D4]/25 bg-[#080D1B]/80 px-2.5 py-1.5 font-mono text-[11px] text-[#38BDF8] break-words overflow-x-auto">
                    {item.formula}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-[#E2E8F0]">{item.summary}</p>
                {item.example && (
                  <p className="text-[11px] leading-relaxed text-[#94A3B8]">
                    <strong className="text-[#10B981]">Example:</strong> {item.example}
                  </p>
                )}
              </div>

              {adminStatus.isAdminSession && (
                <div className="flex justify-end gap-1.5 border-t border-[#6366F1]/18 pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setTermName(item.term);
                      setTermCat(item.category);
                      setTermFormula(item.formula);
                      setTermSummary(item.summary);
                      setTermExample(item.example);
                      setShowAdminForm(true);
                    }}
                    aria-label={`Edit ${item.term}`}
                    className="rounded-lg border border-[#6366F1]/30 p-1.5 text-[#38BDF8] cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAdminDelete(item.id)}
                    aria-label={`Delete ${item.term}`}
                    className="rounded-lg border border-red-400/25 p-1.5 text-red-300 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
