import type { GrowthChartDatum } from '../components/ui/GrowthChart';
import type { FinancialYearId } from '../data/taxRules';
import type { WorkspaceSummary } from '../utils/api';
import { calculateIndianIncomeTax } from './calculators';

export interface InvestmentProjectionInput {
  principalAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  tenureYears: number;
  stepUpPercent?: number;
  inflationRate?: number;
}

export interface InvestmentProjectionResult {
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
  inflationAdjustedValue: number;
  schedule: GrowthChartDatum[];
}

export function calculateInvestmentProjection(
  input: InvestmentProjectionInput
): InvestmentProjectionResult {
  const principal = Math.max(0, input.principalAmount);
  const baseMonthly = Math.max(0, input.monthlyContribution);
  const annualRate = Math.max(0, input.annualReturn);
  const years = Math.max(0.5, input.tenureYears);
  const stepUp = Math.max(0, input.stepUpPercent ?? 0) / 100;
  const inflation = Math.max(0, input.inflationRate ?? 6) / 100;

  const totalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 12 / 100;

  let balance = principal;
  let invested = principal;
  const schedule: GrowthChartDatum[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const yearIdx = Math.floor((m - 1) / 12);
    const currentSip = baseMonthly * Math.pow(1 + stepUp, yearIdx);
    balance = balance * (1 + monthlyRate) + currentSip;
    invested += currentSip;

    schedule.push({
      label: `Month ${m}`,
      period: m,
      principal: invested,
      monthlyInterest: balance * monthlyRate,
      interestEarned: Math.max(0, balance - invested),
      totalAmount: balance,
    });
  }

  const futureValue = balance;
  const estimatedReturns = Math.max(0, futureValue - invested);
  const inflationAdjustedValue = futureValue / Math.pow(1 + inflation, years);

  return {
    totalInvested: invested,
    estimatedReturns,
    futureValue,
    inflationAdjustedValue,
    schedule,
  };
}

export interface LoanSimulationResult {
  monthlyEmi: number;
  remainingBalance: number;
  remainingMonthsBaseline: number;
  baselineInterestRemaining: number;
  acceleratedMonths: number;
  acceleratedInterest: number;
  interestSaved: number;
  monthsSaved: number;
}

export function simulateLoanPayoff(params: {
  principalAmount: number;
  annualRate: number;
  tenureMonths: number;
  monthsPaid: number;
  extraMonthlyPayment: number;
}): LoanSimulationResult {
  const principal = Math.max(0, params.principalAmount);
  const annualRate = Math.max(0, params.annualRate);
  const totalMonths = Math.max(1, Math.round(params.tenureMonths));
  const paid = Math.min(totalMonths - 1, Math.max(0, Math.round(params.monthsPaid)));
  const extra = Math.max(0, params.extraMonthlyPayment);
  const r = annualRate / 12 / 100;

  let monthlyEmi = 0;
  if (principal > 0) {
    if (r === 0) {
      monthlyEmi = principal / totalMonths;
    } else {
      const f = Math.pow(1 + r, totalMonths);
      monthlyEmi = (principal * r * f) / (f - 1);
    }
  }

  // Compute balance after `paid` regular EMIs
  let remainingBalance = principal;
  for (let m = 0; m < paid; m++) {
    const interest = remainingBalance * r;
    const principalPaid = Math.min(remainingBalance, monthlyEmi - interest);
    remainingBalance = Math.max(0, remainingBalance - principalPaid);
  }

  const remainingMonthsBaseline = Math.max(1, totalMonths - paid);
  let balBase = remainingBalance;
  let baselineInterestRemaining = 0;
  for (let m = 0; m < remainingMonthsBaseline && balBase > 0.01; m++) {
    const interest = balBase * r;
    const pPaid = Math.min(balBase, Math.max(0, monthlyEmi - interest));
    baselineInterestRemaining += interest;
    balBase = Math.max(0, balBase - pPaid);
  }

  let balAccel = remainingBalance;
  let acceleratedInterest = 0;
  let acceleratedMonths = 0;
  const maxIter = remainingMonthsBaseline + 12;
  while (balAccel > 0.01 && acceleratedMonths < maxIter) {
    const interest = balAccel * r;
    const payment = monthlyEmi + extra;
    const principalPaid = Math.min(balAccel, Math.max(0.01, payment - interest));
    acceleratedInterest += interest;
    balAccel = Math.max(0, balAccel - principalPaid);
    acceleratedMonths++;
  }

  return {
    monthlyEmi,
    remainingBalance,
    remainingMonthsBaseline,
    baselineInterestRemaining,
    acceleratedMonths,
    acceleratedInterest,
    interestSaved: Math.max(0, baselineInterestRemaining - acceleratedInterest),
    monthsSaved: Math.max(0, remainingMonthsBaseline - acceleratedMonths),
  };
}

export interface GoalCalculationResult {
  progressPercent: number;
  remainingAmount: number;
  monthsUntilTarget: number;
  projectedValueAtTarget: number;
  requiredMonthlySip: number;
  onTrack: boolean;
}

export function calculateGoalProgress(params: {
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  expectedReturn: number;
  targetDate: string;
}): GoalCalculationResult {
  const target = Math.max(1, params.targetAmount);
  const saved = Math.max(0, params.savedAmount);
  const monthly = Math.max(0, params.monthlyContribution);
  const r = Math.max(0, params.expectedReturn) / 12 / 100;

  const now = new Date();
  const due = new Date(`${params.targetDate}T00:00:00`);
  const diffMonths = Number.isNaN(due.getTime())
    ? 12
    : Math.max(
        1,
        (due.getFullYear() - now.getFullYear()) * 12 + (due.getMonth() - now.getMonth())
      );

  const growthFactor = Math.pow(1 + r, diffMonths);
  const fvSaved = saved * growthFactor;
  const fvSip = r === 0 ? monthly * diffMonths : monthly * ((growthFactor - 1) / r);
  const projectedValueAtTarget = fvSaved + fvSip;

  const shortfallAtTarget = Math.max(0, target - fvSaved);
  const requiredMonthlySip =
    shortfallAtTarget <= 0
      ? 0
      : r === 0
      ? shortfallAtTarget / diffMonths
      : shortfallAtTarget / ((growthFactor - 1) / r);

  return {
    progressPercent: Math.min(100, (saved / target) * 100),
    remainingAmount: Math.max(0, target - saved),
    monthsUntilTarget: diffMonths,
    projectedValueAtTarget,
    requiredMonthlySip,
    onTrack: projectedValueAtTarget >= target * 0.99,
  };
}

export interface RetirementYearPoint {
  age: number;
  phase: 'Accumulation' | 'Retirement';
  corpus: number;
  annualWithdrawal: number;
}

export interface RetirementProjectionResult {
  yearsToRetire: number;
  retirementYears: number;
  monthlyExpenseAtRetirement: number;
  annualExpenseAtRetirement: number;
  requiredCorpus: number;
  projectedCorpus: number;
  corpusGapOrSurplus: number;
  recommendedMonthlySip: number;
  depletesAtAge: number | null;
  timeline: RetirementYearPoint[];
}

export function calculateRetirementProjection(params: {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentMonthlyExpense: number;
  inflationRate: number;
  currentCorpus: number;
  monthlySip: number;
  preRetireReturn: number;
  postRetireReturn: number;
}): RetirementProjectionResult {
  const yearsToRetire = Math.max(1, params.retirementAge - params.currentAge);
  const retirementYears = Math.max(1, params.lifeExpectancy - params.retirementAge);
  const inf = Math.max(0, params.inflationRate) / 100;
  const preR = Math.max(0, params.preRetireReturn) / 100;
  const postR = Math.max(0, params.postRetireReturn) / 100;

  const monthlyExpenseAtRetirement =
    params.currentMonthlyExpense * Math.pow(1 + inf, yearsToRetire);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // Present value of inflation-growing annual withdrawals during retirement
  let requiredCorpus = 0;
  if (Math.abs(postR - inf) < 1e-6) {
    requiredCorpus = annualExpenseAtRetirement * retirementYears;
  } else {
    const ratio = (1 + inf) / (1 + postR);
    requiredCorpus =
      (annualExpenseAtRetirement * (1 - Math.pow(ratio, retirementYears))) / (postR - inf);
  }
  requiredCorpus = Math.max(0, requiredCorpus);

  const preMonthlyR = preR / 12;
  const accMonths = yearsToRetire * 12;
  const fvExisting = params.currentCorpus * Math.pow(1 + preMonthlyR, accMonths);
  const fvSip =
    preMonthlyR === 0
      ? params.monthlySip * accMonths
      : params.monthlySip *
        ((Math.pow(1 + preMonthlyR, accMonths) - 1) / preMonthlyR) *
        (1 + preMonthlyR);
  const projectedCorpus = fvExisting + fvSip;

  const missingCorpus = Math.max(0, requiredCorpus - fvExisting);
  const recommendedMonthlySip =
    missingCorpus <= 0
      ? 0
      : preMonthlyR === 0
      ? missingCorpus / accMonths
      : missingCorpus /
        (((Math.pow(1 + preMonthlyR, accMonths) - 1) / preMonthlyR) * (1 + preMonthlyR));

  // Build age-by-age timeline from currentAge -> lifeExpectancy
  const timeline: RetirementYearPoint[] = [];
  let corpus = params.currentCorpus;
  let depletesAtAge: number | null = null;

  for (let y = 0; y <= yearsToRetire + retirementYears; y++) {
    const age = params.currentAge + y;
    if (age < params.retirementAge) {
      timeline.push({
        age,
        phase: 'Accumulation',
        corpus,
        annualWithdrawal: 0,
      });
      for (let m = 0; m < 12; m++) {
        corpus = corpus * (1 + preMonthlyR) + params.monthlySip;
      }
    } else {
      const retireOffset = age - params.retirementAge;
      const annualWithdrawal = annualExpenseAtRetirement * Math.pow(1 + inf, retireOffset);
      timeline.push({
        age,
        phase: 'Retirement',
        corpus: Math.max(0, corpus),
        annualWithdrawal,
      });
      corpus = Math.max(0, corpus * (1 + postR) - annualWithdrawal);
      if (corpus <= 0 && depletesAtAge === null && age < params.lifeExpectancy) {
        depletesAtAge = age + 1;
      }
    }
  }

  return {
    yearsToRetire,
    retirementYears,
    monthlyExpenseAtRetirement,
    annualExpenseAtRetirement,
    requiredCorpus,
    projectedCorpus,
    corpusGapOrSurplus: projectedCorpus - requiredCorpus,
    recommendedMonthlySip,
    depletesAtAge,
    timeline,
  };
}

export function compareTaxRegimesWithDeductions(params: {
  financialYear: FinancialYearId;
  grossSalary: number;
  otherIncome: number;
  sec80c: number;
  sec80d: number;
  nps80ccd1b: number;
  hraExemption: number;
  homeLoanInterest: number;
  tdsPaid: number;
}) {
  const sec80c = Math.min(150000, Math.max(0, params.sec80c));
  const sec80d = Math.min(100000, Math.max(0, params.sec80d));
  const nps = Math.min(50000, Math.max(0, params.nps80ccd1b));
  const hra = Math.max(0, params.hraExemption);
  const homeInt = Math.min(200000, Math.max(0, params.homeLoanInterest));
  const eligibleDeductions = sec80c + sec80d + nps + hra + homeInt;

  const newRes = calculateIndianIncomeTax({
    financialYear: params.financialYear,
    regime: 'new',
    salaryIncome: Math.max(0, params.grossSalary),
    otherIncome: Math.max(0, params.otherIncome),
    eligibleDeductions,
    tdsAndCredits: Math.max(0, params.tdsPaid),
  });
  const oldRes = calculateIndianIncomeTax({
    financialYear: params.financialYear,
    regime: 'old',
    salaryIncome: Math.max(0, params.grossSalary),
    otherIncome: Math.max(0, params.otherIncome),
    eligibleDeductions,
    tdsAndCredits: Math.max(0, params.tdsPaid),
  });

  const optimalRegime: 'new' | 'old' =
    newRes.totalTaxLiability <= oldRes.totalTaxLiability ? 'new' : 'old';
  const taxSavings = Math.abs(newRes.totalTaxLiability - oldRes.totalTaxLiability);

  return {
    newRes,
    oldRes,
    optimalRegime,
    taxSavings,
    headroom80C: Math.max(0, 150000 - sec80c),
    headroomNps: Math.max(0, 50000 - nps),
    sec80c,
    nps,
  };
}

export function computeWorkspaceAnalytics(workspace: WorkspaceSummary) {
  const investmentRows = workspace.investments.map((item) => ({
    item,
    proj: calculateInvestmentProjection({
      principalAmount: item.principal_amount,
      monthlyContribution: item.monthly_contribution,
      annualReturn: item.annual_return,
      tenureYears: item.tenure_years,
    }),
  }));

  const loanRows = workspace.loans.map((loan) => ({
    loan,
    sim: simulateLoanPayoff({
      principalAmount: loan.principal_amount,
      annualRate: loan.annual_rate,
      tenureMonths: loan.tenure_months,
      monthsPaid: loan.months_paid,
      extraMonthlyPayment: loan.extra_monthly_payment,
    }),
  }));

  const goalRows = workspace.goals.map((goal) => ({
    goal,
    calc: calculateGoalProgress({
      targetAmount: goal.target_amount,
      savedAmount: goal.saved_amount,
      monthlyContribution: goal.monthly_contribution,
      expectedReturn: goal.expected_return,
      targetDate: goal.target_date,
    }),
  }));

  const investmentCurrentValue = investmentRows.reduce(
    (sum, r) => sum + r.item.principal_amount,
    0
  );
  const investmentProjectedTotal = investmentRows.reduce(
    (sum, r) => sum + r.proj.futureValue,
    0
  );
  const totalMonthlySip = investmentRows.reduce(
    (sum, r) => sum + r.item.monthly_contribution,
    0
  );

  const goalsSaved = goalRows.reduce((sum, r) => sum + r.goal.saved_amount, 0);
  const goalsTarget = goalRows.reduce((sum, r) => sum + r.goal.target_amount, 0);
  const goalsCompletion = goalsTarget > 0 ? Math.min(100, (goalsSaved / goalsTarget) * 100) : 0;

  const totalDebtRemaining = loanRows.reduce((sum, r) => sum + r.sim.remainingBalance, 0);
  const totalMonthlyEmi = loanRows.reduce((sum, r) => sum + r.sim.monthlyEmi, 0);

  const totalAssets = investmentCurrentValue + goalsSaved;
  const netWorth = totalAssets - totalDebtRemaining;

  const monthlyIncome = workspace.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = workspace.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netCashflow = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (netCashflow / monthlyIncome) * 100 : 0;
  const dtiRatio = monthlyIncome > 0 ? (totalMonthlyEmi / monthlyIncome) * 100 : 0;

  const taxRows = workspace.taxPlans.map((tp) => {
    const cmp = compareTaxRegimesWithDeductions({
      financialYear: tp.financial_year,
      grossSalary: tp.gross_salary,
      otherIncome: tp.other_income,
      sec80c: tp.sec_80c,
      sec80d: tp.sec_80d,
      nps80ccd1b: tp.nps_80ccd1b,
      hraExemption: tp.hra_exemption,
      homeLoanInterest: tp.home_loan_interest,
      tdsPaid: tp.tds_paid,
    });
    return { tp, ...cmp };
  });

  const taxRecommendedSavings = taxRows[0]?.taxSavings ?? 0;

  let healthScore = 50;
  if (savingsRate >= 30) healthScore += 18;
  else if (savingsRate >= 15) healthScore += 10;
  else if (monthlyExpense > monthlyIncome && monthlyIncome > 0) healthScore -= 15;

  if (dtiRatio > 0 && dtiRatio <= 30) healthScore += 12;
  else if (dtiRatio > 45) healthScore -= 15;
  else if (totalDebtRemaining === 0 && totalAssets > 0) healthScore += 12;

  if (goalsCompletion >= 50) healthScore += 10;
  else if (workspace.goals.length > 0) healthScore += 5;

  if (workspace.investments.length > 0) healthScore += 10;
  healthScore = Math.max(15, Math.min(100, Math.round(healthScore)));

  const spendByCategory = new Map<string, number>();
  for (const tx of workspace.transactions) {
    if (tx.type === 'expense') {
      spendByCategory.set(tx.category, (spendByCategory.get(tx.category) ?? 0) + tx.amount);
    }
  }
  const topCategories = Array.from(spendByCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    investmentRows,
    loanRows,
    goalRows,
    taxRows,
    investmentCurrentValue,
    investmentProjectedTotal,
    totalMonthlySip,
    goalsSaved,
    goalsTarget,
    goalsCompletion,
    totalDebtRemaining,
    totalMonthlyEmi,
    totalAssets,
    netWorth,
    monthlyIncome,
    monthlyExpense,
    netCashflow,
    savingsRate,
    dtiRatio,
    taxRecommendedSavings,
    healthScore,
    topCategories,
  };
}
