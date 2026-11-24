import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Sunrise, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculateRetirementProjection } from '../../logic/suiteCalculators';
import { apiRequest, type RetirementPlanRecord } from '../../utils/api';
import { formatINR, formatINRCompact } from '../../utils/formatters';
import { NumberInput } from '../ui/NumberInput';
import { StatusBanner } from '../ui/StatusBanner';
import { VaultPromptBanner } from '../ui/VaultPromptBanner';

export const RetirementPlannerModule: React.FC = () => {
  const { user, workspace, refreshWorkspace, openAuthModal } = useAuth();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [planName, setPlanName] = useState('Financial Freedom at 60');
  const [currentAgeStr, setCurrentAgeStr] = useState('30');
  const [retireAgeStr, setRetireAgeStr] = useState('60');
  const [lifeExpStr, setLifeExpStr] = useState('85');
  const [monthlyExpStr, setMonthlyExpStr] = useState('60000');
  const [inflationStr, setInflationStr] = useState('6');
  const [currentCorpusStr, setCurrentCorpusStr] = useState('500000');
  const [monthlySipStr, setMonthlySipStr] = useState('25000');
  const [preReturnStr, setPreReturnStr] = useState('12');
  const [postReturnStr, setPostReturnStr] = useState('8');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const curAge = Math.min(75, Math.max(18, Math.round(Number(currentAgeStr) || 30)));
  const retAge = Math.min(85, Math.max(curAge + 1, Math.round(Number(retireAgeStr) || 60)));
  const lifeExp = Math.min(105, Math.max(retAge + 1, Math.round(Number(lifeExpStr) || 85)));

  const projection = useMemo(() => {
    return calculateRetirementProjection({
      currentAge: curAge,
      retirementAge: retAge,
      lifeExpectancy: lifeExp,
      currentMonthlyExpense: Math.max(1000, Number(monthlyExpStr) || 1000),
      inflationRate: Math.min(20, Math.max(0, Number(inflationStr) || 0)),
      currentCorpus: Math.max(0, Number(currentCorpusStr) || 0),
      monthlySip: Math.max(0, Number(monthlySipStr) || 0),
      preRetireReturn: Math.min(30, Math.max(1, Number(preReturnStr) || 1)),
      postRetireReturn: Math.min(20, Math.max(1, Number(postReturnStr) || 1)),
    });
  }, [
    curAge,
    retAge,
    lifeExp,
    monthlyExpStr,
    inflationStr,
    currentCorpusStr,
    monthlySipStr,
    preReturnStr,
    postReturnStr,
  ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);
    if (!user) {
      openAuthModal('register');
      return;
    }
    const rawCur = Math.round(Number(currentAgeStr));
    const rawRet = Math.round(Number(retireAgeStr));
    const rawLife = Math.round(Number(lifeExpStr));
    if (planName.trim().length < 2 || rawRet <= rawCur || rawLife <= rawRet) {
      setErrorMsg('Ensure Current Age < Retirement Age < Life Expectancy.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        plan_name: planName.trim(),
        current_age: rawCur,
        retirement_age: rawRet,
        life_expectancy: rawLife,
        current_monthly_expense: Number(monthlyExpStr) || 1000,
        inflation_rate: Number(inflationStr) || 0,
        current_corpus: Number(currentCorpusStr) || 0,
        monthly_sip: Number(monthlySipStr) || 0,
        pre_retire_return: Number(preReturnStr) || 1,
        post_retire_return: Number(postReturnStr) || 1,
      };
      if (editingId) {
        await apiRequest(`/api/retirement-plans/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setFeedback('Retirement plan updated in SQLite.');
      } else {
        await apiRequest('/api/retirement-plans', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFeedback('Retirement plan saved to SQLite.');
      }
      setEditingId(null);
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save retirement plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rp: RetirementPlanRecord) => {
    setEditingId(rp.id);
    setPlanName(rp.plan_name);
    setCurrentAgeStr(String(rp.current_age));
    setRetireAgeStr(String(rp.retirement_age));
    setLifeExpStr(String(rp.life_expectancy));
    setMonthlyExpStr(String(rp.current_monthly_expense));
    setInflationStr(String(rp.inflation_rate));
    setCurrentCorpusStr(String(rp.current_corpus));
    setMonthlySipStr(String(rp.monthly_sip));
    setPreReturnStr(String(rp.pre_retire_return));
    setPostReturnStr(String(rp.post_retire_return));
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    await apiRequest(`/api/retirement-plans/${id}`, { method: 'DELETE' });
    if (editingId === id) setEditingId(null);
    await refreshWorkspace();
  };

  // SVG Timeline Chart metrics
  const maxCorpus = Math.max(...projection.timeline.map((p) => p.corpus), 1);
  const svgW = 640;
  const svgH = 220;
  const pad = { top: 18, right: 20, bottom: 30, left: 66 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const points = projection.timeline.map((pt, i) => {
    const x =
      projection.timeline.length <= 1
        ? pad.left + plotW / 2
        : pad.left + (i / (projection.timeline.length - 1)) * plotW;
    const y = pad.top + plotH - (pt.corpus / maxCorpus) * plotH;
    return { x, y, pt };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const retirePt = points.find((p) => p.pt.age === retAge);

  return (
    <div className="space-y-6">
      <VaultPromptBanner moduleLabel="Retirement Planner" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <form onSubmit={handleSave} className="aurora-card p-6 space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingId ? 'Edit Retirement Plan' : 'Retirement & SWP Planner'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Model inflation-adjusted expenses, accumulation SIP, and post-retirement drawdown.
              </p>
            </div>
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

          <StatusBanner feedback={feedback} error={errorMsg} />

          <div className="space-y-1.5">
            <label htmlFor="ret-name" className="block text-xs font-medium text-[#F8FAFC]">
              Plan Name
            </label>
            <input
              id="ret-name"
              type="text"
              required
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none"
            />
          </div>

          <div className="grid gap-3 grid-cols-3">
            <NumberInput
              id="ret-cur-age"
              label="Current Age"
              min={18}
              max={75}
              value={currentAgeStr}
              onChange={setCurrentAgeStr}
            />
            <NumberInput
              id="ret-age"
              label="Retire Age"
              min={30}
              max={85}
              value={retireAgeStr}
              onChange={setRetireAgeStr}
            />
            <NumberInput
              id="ret-life"
              label="Life Exp."
              min={55}
              max={105}
              value={lifeExpStr}
              onChange={setLifeExpStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="ret-exp"
              label="Current Monthly Expense"
              prefix="₹"
              min={1000}
              value={monthlyExpStr}
              onChange={setMonthlyExpStr}
            />
            <NumberInput
              id="ret-inf"
              label="Annual Inflation"
              suffix="%"
              min={0}
              max={20}
              step={0.5}
              value={inflationStr}
              onChange={setInflationStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="ret-corpus"
              label="Existing Corpus"
              prefix="₹"
              min={0}
              value={currentCorpusStr}
              onChange={setCurrentCorpusStr}
            />
            <NumberInput
              id="ret-sip"
              label="Monthly SIP"
              prefix="₹"
              min={0}
              value={monthlySipStr}
              onChange={setMonthlySipStr}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              id="ret-pre"
              label="Pre-Retire Yield"
              suffix="%"
              min={1}
              max={30}
              step={0.5}
              value={preReturnStr}
              onChange={setPreReturnStr}
            />
            <NumberInput
              id="ret-post"
              label="Post-Retire Yield"
              suffix="%"
              min={1}
              max={20}
              step={0.5}
              value={postReturnStr}
              onChange={setPostReturnStr}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="aurora-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>
              {saving ? 'Saving...' : editingId ? 'Update Retirement Plan' : 'Save Plan to SQLite'}
            </span>
          </button>
        </form>

        <div className="space-y-5 lg:col-span-7">
          <div className="aurora-card-accent p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6366F1]/22 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#38BDF8]">
                  Projected Corpus at Age {retAge}
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-[#F8FAFC] tabular-nums">
                  {formatINRCompact(projection.projectedCorpus)}
                </p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    projection.corpusGapOrSurplus >= 0 ? 'text-[#10B981]' : 'text-[#E879F9]'
                  }`}
                >
                  {projection.corpusGapOrSurplus >= 0
                    ? `Surplus of ${formatINRCompact(projection.corpusGapOrSurplus)} above required target`
                    : `Shortfall of ${formatINRCompact(Math.abs(projection.corpusGapOrSurplus))} · Suggested SIP: ${formatINR(projection.recommendedMonthlySip)}/mo`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#94A3B8]">Required Corpus</p>
                <p className="font-mono text-lg font-bold text-[#C084FC]">
                  {formatINRCompact(projection.requiredCorpus)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">Expense at Age {retAge}</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#F8FAFC]">
                  {formatINR(projection.monthlyExpenseAtRetirement)}/mo
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">Accumulation Window</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#38BDF8]">
                  {projection.yearsToRetire} years
                </p>
              </div>
              <div className="aurora-subcard p-3.5">
                <p className="text-xs text-[#94A3B8]">Corpus Longevity</p>
                <p className="mt-1 font-mono text-base font-semibold text-[#10B981]">
                  {projection.depletesAtAge
                    ? `Depletes at Age ${projection.depletesAtAge}`
                    : `Sustains past Age ${lifeExp}`}
                </p>
              </div>
            </div>
          </div>

          {/* Accumulation & Retirement SWP SVG Curve */}
          <div className="aurora-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#F8FAFC]">
                Lifecycle Corpus Curve (Age {curAge} → {lifeExp})
              </h4>
              <span className="text-xs text-[#38BDF8]">Peak at Age {retAge}</span>
            </div>

            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="retireCurveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#D946EF" />
                </linearGradient>
              </defs>
              {[0, 0.5, 1].map((r) => {
                const y = pad.top + plotH - r * plotH;
                return (
                  <g key={r}>
                    <line
                      x1={pad.left}
                      y1={y}
                      x2={svgW - pad.right}
                      y2={y}
                      stroke="rgba(99,102,241,0.18)"
                      strokeDasharray={r === 0 ? undefined : '3 4'}
                    />
                    <text
                      x={pad.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {formatINRCompact(maxCorpus * r)}
                    </text>
                  </g>
                );
              })}

              {retirePt && (
                <line
                  x1={retirePt.x}
                  y1={pad.top}
                  x2={retirePt.x}
                  y2={pad.top + plotH}
                  stroke="#10B981"
                  strokeDasharray="4 3"
                  strokeWidth="1.25"
                />
              )}

              <path
                d={linePath}
                fill="none"
                stroke="url(#retireCurveGrad)"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points
                .filter((_, idx) => idx === 0 || idx === points.length - 1 || points[idx].pt.age === retAge)
                .map((p) => (
                  <text
                    key={p.pt.age}
                    x={p.x}
                    y={svgH - 8}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    Age {p.pt.age}
                  </text>
                ))}
            </svg>
          </div>

          {/* Saved Retirement Plans */}
          <div className="aurora-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-[#F8FAFC]">
                Saved Retirement Plans ({workspace.retirementPlans.length})
              </h4>
            </div>

            {workspace.retirementPlans.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {user
                  ? 'No retirement plans saved yet. Save one using the form on the left.'
                  : 'Sign in above to persist your retirement corpus plans in SQLite.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {workspace.retirementPlans.map((rp) => (
                  <div
                    key={rp.id}
                    className="aurora-subcard flex flex-wrap items-center justify-between gap-2 p-3.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">{rp.plan_name}</p>
                      <p className="font-mono text-xs text-[#94A3B8]">
                        Age {rp.current_age} → {rp.retirement_age} · SIP {formatINR(rp.monthly_sip)}
                        /mo · Exp {formatINR(rp.current_monthly_expense)}/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(rp)}
                        aria-label={`Edit ${rp.plan_name}`}
                        className="rounded-lg border border-[#6366F1]/30 p-2 text-[#38BDF8] cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(rp.id)}
                        aria-label={`Delete ${rp.plan_name}`}
                        className="rounded-lg border border-red-400/25 p-2 text-red-300 cursor-pointer"
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
