export interface SeedGlossaryTerm {
  slug: string;
  term: string;
  category: string;
  formula: string;
  summary: string;
  example: string;
}

export interface SeedEducationQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SeedEducationLesson {
  slug: string;
  title: string;
  category: string;
  level: string;
  readMinutes: number;
  summary: string;
  keyTakeaways: string[];
  contentParagraphs: string[];
  quiz: SeedEducationQuizQuestion[];
}

export const INITIAL_GLOSSARY_TERMS: SeedGlossaryTerm[] = [
  {
    slug: 'compound-interest',
    term: 'Compound Interest',
    category: 'Investing',
    formula: 'A = P × (1 + r/n)^(n × t)',
    summary: 'Interest calculated on both the initial principal and the accumulated interest from prior periods.',
    example: '₹1,00,000 at 10% compounded annually grows to ₹1,33,100 in 3 years instead of ₹1,30,000 under simple interest.',
  },
  {
    slug: 'sip',
    term: 'Systematic Investment Plan (SIP)',
    category: 'Investing',
    formula: 'FV = P × [((1 + i)^n − 1) / i] × (1 + i)',
    summary: 'Disciplined periodic investing of a fixed sum into mutual funds, benefiting from rupee-cost averaging and compounding.',
    example: 'Investing ₹10,000/month at 12% p.a. over 15 years accumulates roughly ₹50.46 Lakh on ₹18 Lakh invested.',
  },
  {
    slug: 'ear',
    term: 'Effective Annual Rate (EAR)',
    category: 'Banking',
    formula: 'EAR = (1 + r/n)^n − 1',
    summary: 'The true annual yield earned or paid after accounting for intra-year compounding frequency.',
    example: '12% nominal rate compounded monthly gives an EAR of 12.68%.',
  },
  {
    slug: 'emi',
    term: 'Equated Monthly Installment (EMI)',
    category: 'Loans',
    formula: 'EMI = [P × i × (1 + i)^N] ÷ [(1 + i)^N − 1]',
    summary: 'Fixed monthly loan payment combining interest on the reducing balance and principal repayment.',
    example: 'A ₹50 Lakh loan at 8.75% for 20 years has an EMI of ₹44,186.',
  },
  {
    slug: 'amortization',
    term: 'Loan Amortization',
    category: 'Loans',
    formula: 'Closing = Opening − (EMI − Opening × i)',
    summary: 'Step-by-step paydown of loan principal over time; early EMIs are interest-heavy while later EMIs retire more principal.',
    example: 'Prepaying even 1 extra EMI per year on a 20-year home loan can cut 3+ years off tenure.',
  },
  {
    slug: 'section-87a',
    term: 'Section 87A Rebate',
    category: 'Taxation',
    formula: 'Rebate = min(Slab Tax, Statutory Cap)',
    summary: 'Income tax rebate available to resident individuals whose taxable income falls within the statutory ceiling.',
    example: 'Under New Regime FY 2025–26, salaried individuals up to ₹12.75 Lakh gross pay ₹0 slab tax after ₹75,000 standard deduction and 87A.',
  },
  {
    slug: 'section-115bac',
    term: 'Section 115BAC (New Tax Regime)',
    category: 'Taxation',
    formula: 'Lower slab rates with Standard Deduction, without most Chapter VI-A deductions',
    summary: 'Default simplified Indian income tax regime with wider slabs and lower rates in exchange for foregoing most exemptions.',
    example: 'Allows ₹75,000 standard deduction for salaried taxpayers in FY 2025–26.',
  },
  {
    slug: 'section-80c',
    term: 'Section 80C Deductions',
    category: 'Taxation',
    formula: 'Max Deduction = ₹1,50,000 (Old Regime)',
    summary: 'Tax-saving investments and expenses such as EPF, PPF, ELSS, LIC, NSC, and home loan principal under the Old Regime.',
    example: 'Invest ₹1,50,000 in ELSS/PPF under Old Regime to save ₹46,800 in the 30% + 4% cess bracket.',
  },
  {
    slug: 'section-80d',
    term: 'Section 80D (Health Insurance)',
    category: 'Taxation',
    formula: 'Up to ₹25,000 (self) + ₹25,000–₹50,000 (parents)',
    summary: 'Old Regime deduction for medical insurance premiums and preventive health check-ups for self, family, and parents.',
    example: 'Senior parents premium qualifies up to ₹50,000 deduction.',
  },
  {
    slug: 'nps-80ccd1b',
    term: 'NPS Section 80CCD(1B)',
    category: 'Taxation',
    formula: 'Additional ₹50,000 above Section 80C cap',
    summary: 'Exclusive additional retirement contribution deduction for National Pension System Tier-I under the Old Regime.',
    example: 'Combines with ₹1.5L 80C for ₹2.0L combined retirement deduction.',
  },
  {
    slug: 'marginal-relief',
    term: 'Marginal Relief',
    category: 'Taxation',
    formula: 'Relief = max(0, Tax − (Taxable Income − Threshold))',
    summary: 'Ensures incremental tax payable just above an exemption or surcharge threshold never exceeds the extra income earned.',
    example: 'If taxable income is ₹12,10,000 (₹10,000 above ₹12L), tax cannot exceed ₹10,000 before cess under marginal relief.',
  },
  {
    slug: 'emergency-fund',
    term: 'Emergency Fund',
    category: 'Personal Finance',
    formula: 'Target = 6 × Essential Monthly Expenses',
    summary: 'Liquid cash reserve held in high-liquidity instruments (sweep FD / liquid fund) to cover unexpected income disruptions.',
    example: 'Monthly essentials of ₹45,000 call for a ₹2,70,000 emergency buffer.',
  },
  {
    slug: 'debt-to-income',
    term: 'Debt-to-Income Ratio (DTI)',
    category: 'Loans',
    formula: 'DTI (%) = (Total Monthly EMIs ÷ Net Monthly Income) × 100',
    summary: 'Proportion of monthly take-home pay consumed by debt EMIs; lenders generally prefer DTI below 35–40%.',
    example: '₹30,000 total EMI on ₹1,00,000 income equals a healthy 30% DTI.',
  },
  {
    slug: 'cagr',
    term: 'Compound Annual Growth Rate (CAGR)',
    category: 'Investing',
    formula: 'CAGR = (Ending Value ÷ Beginning Value)^(1/n) − 1',
    summary: 'Smoothed annual geometric return rate of an investment over multiple years.',
    example: '₹1,00,000 growing to ₹2,00,000 in 6 years delivers a 12.25% CAGR.',
  },
  {
    slug: 'xirr',
    term: 'Extended Internal Rate of Return (XIRR)',
    category: 'Investing',
    formula: 'Σ Cashflow_i / (1 + XIRR)^((Date_i − Date_0)/365) = 0',
    summary: 'Accurate annualized return metric when multiple irregular cashflows (like SIPs or top-ups) occur on different dates.',
    example: 'Use XIRR rather than CAGR to evaluate staggered mutual fund SIP returns.',
  },
  {
    slug: 'rule-of-72',
    term: 'Rule of 72',
    category: 'Personal Finance',
    formula: 'Doubling Years ≈ 72 ÷ Annual Return (%)',
    summary: 'Mental shortcut to estimate how many years it takes an investment to double at a fixed compound return.',
    example: 'At 12% p.a., corpus doubles roughly every 72 ÷ 12 = 6 years.',
  },
  {
    slug: 'inflation-real-return',
    term: 'Real Rate of Return',
    category: 'Retirement',
    formula: 'Real Return = ((1 + Nominal) ÷ (1 + Inflation)) − 1',
    summary: 'Purchasing-power return remaining after adjusting nominal returns for annual inflation.',
    example: 'An 11% return with 6% inflation yields a 4.72% real return.',
  },
  {
    slug: 'swp',
    term: 'Systematic Withdrawal Plan (SWP)',
    category: 'Retirement',
    formula: 'Drawdown adjusted monthly against remaining portfolio yield',
    summary: 'Structured periodic withdrawal from an accumulated retirement corpus while keeping the remainder invested.',
    example: 'Withdrawing ₹60,000/month from a ₹1.5 Cr debt-hybrid corpus.',
  },
  {
    slug: 'elss',
    term: 'Equity Linked Savings Scheme (ELSS)',
    category: 'Taxation',
    formula: '3-year statutory lock-in · Up to ₹1.5L u/s 80C',
    summary: 'Diversified equity mutual fund offering Section 80C deduction under Old Regime with the shortest lock-in among 80C options.',
    example: 'Compared to 5-year tax-saver FD or 15-year PPF, ELSS carries a 3-year lock-in.',
  },
  {
    slug: 'ppf',
    term: 'Public Provident Fund (PPF)',
    category: 'Investing',
    formula: 'EEE Tax Status · 15-year maturity',
    summary: 'Government-backed long-term savings scheme with Exempt-Exempt-Exempt tax treatment across contribution, interest, and maturity.',
    example: 'Deposits up to ₹1.5L/year earn tax-free sovereign-backed interest.',
  },
  {
    slug: 'net-worth',
    term: 'Net Worth',
    category: 'Personal Finance',
    formula: 'Net Worth = Total Assets − Total Liabilities',
    summary: 'Snapshot of personal wealth measuring investments and cash reserves minus outstanding loans.',
    example: '₹28 Lakh in investments/goals minus ₹12 Lakh loan principal = ₹16 Lakh net worth.',
  },
  {
    slug: 'savings-rate',
    term: 'Savings Rate',
    category: 'Personal Finance',
    formula: 'Savings Rate = ((Income − Expenses) ÷ Income) × 100',
    summary: 'Percentage of monthly income retained for investments, goals, and debt principal reduction.',
    example: 'Saving ₹35,000 out of ₹1,00,000 monthly income equals a 35% savings rate.',
  },
  {
    slug: 'avalanche-vs-snowball',
    term: 'Debt Avalanche vs Snowball',
    category: 'Loans',
    formula: 'Avalanche = Highest APR first · Snowball = Smallest balance first',
    summary: 'Two proven multi-loan payoff strategies: Avalanche minimizes total interest cost while Snowball builds quick psychological wins.',
    example: 'Paying off a 16% personal loan before an 8.75% home loan saves thousands in interest.',
  },
  {
    slug: 'cess',
    term: 'Health & Education Cess',
    category: 'Taxation',
    formula: 'Cess = 4% × (Income Tax + Surcharge)',
    summary: 'Mandatory 4% levy computed on total income tax plus surcharge in India.',
    example: 'If slab tax after rebate is ₹50,000, add ₹2,000 cess for ₹52,000 total liability.',
  },
  {
    slug: 'step-up-sip',
    term: 'Step-Up SIP',
    category: 'Investing',
    formula: 'Annual Contribution_{y} = Contribution_{y-1} × (1 + g)',
    summary: 'Automatically increasing monthly SIP contributions every year in line with salary increments.',
    example: 'A 10% annual step-up on a ₹10,000 SIP over 15 years nearly doubles final corpus vs flat SIP.',
  },
  {
    slug: 'asset-allocation',
    term: 'Asset Allocation',
    category: 'Investing',
    formula: 'Portfolio Split across Equity, Debt, Gold & Cash',
    summary: 'Balancing growth assets (equity) and stability assets (debt/gold) according to horizon and risk tolerance.',
    example: '70% Equity / 20% Debt / 10% Gold for a 15-year retirement goal.',
  },
  {
    slug: 'tds',
    term: 'Tax Deducted at Source (TDS)',
    category: 'Taxation',
    formula: 'Balance Payable = Total Liability − TDS Credits',
    summary: 'Advance tax withheld by employers or banks and credited against annual income tax liability in Form 26AS / AIS.',
    example: 'Excess TDS deducted during the year results in an income tax refund upon filing ITR.',
  },
  {
    slug: 'corpus-multiple',
    term: 'Retirement Corpus Multiple (25x Rule)',
    category: 'Retirement',
    formula: 'Baseline Corpus ≈ 25 to 30 × First-Year Retirement Expenses',
    summary: 'Rule-of-thumb multiplier estimating retirement capital required to sustain inflation-adjusted withdrawals for 25–30 years.',
    example: '₹12 Lakh annual retirement expense needs roughly ₹3.0–3.6 Crore depending on post-retirement return and inflation.',
  },
  {
    slug: 'hra-exemption',
    term: 'HRA Tax Exemption',
    category: 'Taxation',
    formula: 'min(Actual HRA, Rent − 10% Basic, 50%/40% Basic)',
    summary: 'Old Regime exemption for salaried individuals paying house rent, computed as the lowest of three statutory limits.',
    example: 'Metro cities (Mumbai, Delhi, Kolkata, Chennai) qualify for 50% of basic salary ceiling.',
  },
  {
    slug: 'sinking-fund',
    term: 'Sinking Fund',
    category: 'Personal Finance',
    formula: 'Monthly Target = Goal Cost ÷ Months Remaining',
    summary: 'Dedicated recurring savings bucket built ahead of predictable large expenses such as annual insurance, travel, or car upgrades.',
    example: 'Setting aside ₹5,000/month avoids putting a ₹60,000 annual trip on credit.',
  },
];

export const INITIAL_EDUCATION_LESSONS: SeedEducationLesson[] = [
  {
    slug: 'compounding-rule-72',
    title: 'Mastering Compounding & Time Value of Money',
    category: 'Investing Fundamentals',
    level: 'Beginner',
    readMinutes: 5,
    summary: 'Why starting 5 years earlier outweighs doubling your monthly contribution later, and how compounding frequency alters Effective Annual Rate.',
    keyTakeaways: [
      'Compounding turns time into an exponential multiplier via (1 + r/n)^(n × t).',
      'Rule of 72 estimates doubling time: 72 ÷ annual return %.',
      'Step-Up SIPs aligned with annual salary hikes accelerate wealth far faster than flat SIPs.',
    ],
    contentParagraphs: [
      'Simple interest grows linearly because interest is only ever applied to your original principal. Compound interest reinvests each period’s interest so future interest earns interest on top of previous gains.',
      'For example, ₹5,00,000 invested at 12% p.a. for 20 years grows to ₹17,00,000 under simple interest—but compounds to ₹48,23,147 annually and ₹54,46,277 under monthly compounding.',
      'When evaluating bank FDs or debt instruments, compare the Effective Annual Rate (EAR) rather than headline nominal rates, because quarterly compounding yields higher effective returns than annual payouts.',
    ],
    quiz: [
      {
        question: 'Using the Rule of 72, roughly how many years does ₹1 Lakh take to double at 12% p.a.?',
        options: ['4 years', '6 years', '8 years', '12 years'],
        correctIndex: 1,
        explanation: '72 ÷ 12 = 6 years approximately.',
      },
      {
        question: 'Which compounding frequency produces the highest Effective Annual Rate for the same 10% nominal rate?',
        options: ['Annually', 'Half-yearly', 'Quarterly', 'Monthly'],
        correctIndex: 3,
        explanation: 'More frequent compounding intervals (monthly, n = 12) generate a higher EAR.',
      },
    ],
  },
  {
    slug: 'new-vs-old-tax-regime',
    title: 'New vs Old Tax Regime & Section 87A Break-Even Math',
    category: 'Indian Taxation',
    level: 'Intermediate',
    readMinutes: 6,
    summary: 'How to evaluate whether Section 80C, 80D, NPS, and HRA deductions under Old Regime actually beat the lower slabs of Section 115BAC.',
    keyTakeaways: [
      'Salaried individuals under New Regime (FY 2025–26) receive ₹75,000 standard deduction and enhanced 87A rebate.',
      'Old Regime only wins when your total Chapter VI-A + HRA + Home Loan deductions exceed the break-even threshold.',
      'Always compare net tax liability across both regimes with 4% Health & Education Cess included.',
    ],
    contentParagraphs: [
      'Under Section 115BAC (New Regime), slab rates are lower and wider, making it optimal for taxpayers with moderate deductions. For FY 2025–26, taxable income up to ₹12,00,000 receives full Section 87A relief (meaning zero slab tax for salaried gross income up to ₹12.75 Lakh).',
      'The Old Regime retains exemptions such as Section 80C (₹1.5L), 80D health insurance, 80CCD(1B) NPS (₹50k), HRA, and Section 24(b) housing loan interest. However, its higher 20% and 30% slabs kick in much earlier at ₹5L and ₹10L.',
      'Use our Tax Planner module to log your actual deductions and automatically see your break-even gap and optimal regime.',
    ],
    quiz: [
      {
        question: 'What is the maximum combined deduction under Section 80C and Section 80CCD(1B) in the Old Regime?',
        options: ['₹1,50,000', '₹2,00,000', '₹2,50,000', '₹75,000'],
        correctIndex: 1,
        explanation: '₹1,50,000 under 80C plus ₹50,000 exclusive NPS deduction under 80CCD(1B) equals ₹2,00,000.',
      },
      {
        question: 'At what percentage is Health & Education Cess levied on Income Tax + Surcharge in India?',
        options: ['2%', '3%', '4%', '5%'],
        correctIndex: 2,
        explanation: 'Health & Education Cess is 4% of (Income Tax after rebate + Surcharge).',
      },
    ],
  },
  {
    slug: 'smart-loan-prepayment',
    title: 'Loan Amortization & Prepayment Snowball vs Avalanche',
    category: 'Debt Management',
    level: 'Intermediate',
    readMinutes: 5,
    summary: 'Understand why early EMIs mostly service interest, and how extra principal payments slash total interest outflow and loan tenure.',
    keyTakeaways: [
      'Prepaying principal directly reduces the base on which all future monthly interest is calculated.',
      'Debt Avalanche targets highest-interest loans first to save maximum rupees.',
      'Keep total EMIs (DTI ratio) below 35–40% of net monthly income for financial resilience.',
    ],
    contentParagraphs: [
      'On a 20-year ₹50 Lakh home loan at 8.75%, roughly 82% of your Year 1 EMIs go purely toward bank interest while only 18% reduces loan principal.',
      'Adding even ₹5,000 extra per month directly toward principal reduces the closing balance every single month—cutting over 4 years of EMIs and saving more than ₹14 Lakh in lifetime interest.',
      'When managing multiple loans (e.g., Personal Loan at 14% alongside Home Loan at 8.75%), prioritizing extra payments on the 14% loan (Avalanche method) yields an immediate guaranteed 14% post-tax return.',
    ],
    quiz: [
      {
        question: 'Which multi-loan repayment strategy minimizes total interest paid mathematically?',
        options: ['Debt Snowball', 'Debt Avalanche', 'Minimum EMI only', 'Extending loan tenure'],
        correctIndex: 1,
        explanation: 'Debt Avalanche prioritizes the highest interest-rate loan first, minimizing total interest outflow.',
      },
    ],
  },
  {
    slug: 'budgeting-emergency-buffer',
    title: '50-30-20 Budgeting & Emergency Corpus Sizing',
    category: 'Personal Finance',
    level: 'Beginner',
    readMinutes: 4,
    summary: 'Build an unbreakable cashflow foundation by categorizing Needs, Wants, and Savings before locking funds into long-term investments.',
    keyTakeaways: [
      'Target at least 20–30% of take-home income toward savings, goals, and debt reduction.',
      'Maintain 6 months of essential expenses in liquid accounts before aggressive equity investing.',
      'Track recurring leaks using category limits in the Expense & Budget Manager.',
    ],
    contentParagraphs: [
      'A budget is a forward-looking cashflow plan, not a restriction. The 50-30-20 framework allocates roughly 50% to essential Needs (rent, groceries, utilities, base EMIs), 30% to discretionary Wants, and at least 20% to Savings & Goals.',
      'Before locking savings into equity or illiquid real estate, prioritize building an Emergency Fund covering 6 months of non-discretionary living expenses.',
      'Consistency beats perfection: logging daily expenses and setting monthly category caps prevents lifestyle creep from eroding raises.',
    ],
    quiz: [
      {
        question: 'What is the standard recommended Emergency Fund buffer for salaried households?',
        options: ['1 week of expenses', '1 month of expenses', '6 months of essential expenses', '5 years of salary'],
        correctIndex: 2,
        explanation: '6 months of essential expenses protects against job transitions or medical emergencies without selling long-term investments.',
      },
    ],
  },
  {
    slug: 'retirement-inflation-math',
    title: 'Inflation-Adjusted Retirement Planning & Safe Withdrawal',
    category: 'Retirement',
    level: 'Advanced',
    readMinutes: 7,
    summary: 'Why ₹50,000/month today requires ₹1.6+ Lakh/month in 20 years, and how to balance pre-retirement equity with post-retirement SWP.',
    keyTakeaways: [
      '6% annual inflation halves money’s purchasing power roughly every 12 years.',
      'Calculate required corpus on inflation-adjusted expenses at retirement age, not today’s expenses.',
      'Maintain a positive real return spread after retirement to avoid outliving your corpus.',
    ],
    contentParagraphs: [
      'The biggest mistake in retirement planning is projecting today’s monthly budget linearly without inflation. At 6% inflation, ₹60,000 in current monthly expenses escalates to ₹1,92,428/month twenty years later.',
      'During your earning years, higher expected equity returns help beat inflation. Near retirement, shifting part of the corpus into stable income buckets prevents sequence-of-returns risk during market downturns.',
      'Our Retirement Planner models both accumulation up to retirement age and inflation-escalated monthly SWP drawdowns through life expectancy.',
    ],
    quiz: [
      {
        question: 'If nominal post-retirement portfolio return is 8% and inflation is 6%, what is the approximate real return?',
        options: ['14%', '8%', '1.89%', '6%'],
        correctIndex: 2,
        explanation: 'Real return = (1.08 / 1.06) − 1 ≈ 1.89%.',
      },
    ],
  },
  {
    slug: 'financial-statements-ratios',
    title: 'Reading Personal Financial Health Ratios & Reports',
    category: 'Financial Analytics',
    level: 'Intermediate',
    readMinutes: 5,
    summary: 'Audit your own finances like a CFO using Net Worth, Liquidity Coverage, Savings Ratio, and EMI Burden benchmarks.',
    keyTakeaways: [
      'Positive Net Worth trend matters more than single-month market swings.',
      'Liquidity Ratio = Liquid Emergency Cash ÷ Monthly Essential Spend.',
      'Export periodic CSV and PDF Financial Reports to review quarterly progress.',
    ],
    contentParagraphs: [
      'Professional wealth managers track four core personal ratios: Savings Rate (>25% target), Debt-to-Income (<35% target), Emergency Runway (≥6 months), and Net Worth growth.',
      'Tracking these together inside the Financial Insights Dashboard helps identify whether surplus cashflow is best deployed into high-interest loan prepayment, tax-saving deductions, or long-term SIPs.',
      'Use the Financial Reports module quarterly to export clean PDF or CSV snapshots of your complete financial balance sheet.',
    ],
    quiz: [
      {
        question: 'How is personal Net Worth calculated?',
        options: [
          'Monthly Salary × 12',
          'Total Assets minus Total Liabilities',
          'Gross Income minus Taxes',
          'Total Savings minus Monthly Rent',
        ],
        correctIndex: 1,
        explanation: 'Net Worth equals all owned assets (investments + savings) minus outstanding debt liabilities.',
      },
    ],
  },
];
