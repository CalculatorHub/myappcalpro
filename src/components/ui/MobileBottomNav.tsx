import React from 'react';
import { Home, Scale, TrendingUp } from 'lucide-react';
import type { MainNavSection } from './Header';

interface MobileBottomNavProps {
  activeNavSection: MainNavSection;
  onSelectNavSection: (section: MainNavSection) => void;
}

const ITEMS: { id: MainNavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'interest', label: 'Interest', icon: TrendingUp },
  { id: 'loan-emi', label: 'Loan EMI', icon: Home },
  { id: 'income-tax', label: 'Income Tax', icon: Scale },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNavSection,
  onSelectNavSection,
}) => {
  return (
    <nav
      aria-label="Mobile calculator navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-[#D4AF37]/25 bg-[#08080A]/90 backdrop-blur-xl no-print"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 h-14">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isCurrent = activeNavSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNavSection(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                isCurrent ? 'text-[#F5D76E]' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
