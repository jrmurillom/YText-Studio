import React from 'react';
import { ProposalCard } from '@/types';
import { Sparkles, Check } from 'lucide-react';

interface ProposalsListProps {
  proposals: ProposalCard[];
  selectedId: string | null;
  onSelectProposal: (proposal: ProposalCard) => void;
  isLoading: boolean;
}

export const ProposalsList: React.FC<ProposalsListProps> = ({
  proposals,
  selectedId,
  onSelectProposal,
  isLoading,
}) => {
  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Propuestas de Composición
        </label>
        <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>IA Director</span>
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-14 rounded-lg bg-slate-100 animate-pulse border border-slate-200"></div>
          <div className="h-14 rounded-lg bg-slate-100 animate-pulse border border-slate-200"></div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 text-xs">
          Pulsa "Analizar con IA" para generar variantes adaptadas a la imagen.
        </div>
      ) : (
        <div className="space-y-2">
          {proposals.map((prop) => {
            const isSelected = selectedId === prop.id;
            return (
              <div
                key={prop.id}
                onClick={() => onSelectProposal(prop)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{prop.title}</span>
                  <span className="text-[10px] text-slate-500 block">{prop.subtitle}</span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
