import React from 'react';
import { Search } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  suggestions?: string[];
  onSelectSuggestion?: (s: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  suggestions,
  onSelectSuggestion,
}) => {
  return (
    <div className="w-full py-12 px-4 text-center bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
        {icon || <Search className="w-6 h-6" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-ink-950">{title}</h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-stone-500 mb-2">Try searching for:</div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSelectSuggestion && onSelectSuggestion(s)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-ink-900 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
