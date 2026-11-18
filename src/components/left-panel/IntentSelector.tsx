import React from 'react';
import { IntentType } from '@/types';
import { useTranslation, TranslationKey } from '@/i18n';

interface IntentSelectorProps {
  selectedIntent: IntentType;
  onSelectIntent: (intent: IntentType) => void;
  customIntentText?: string;
  onCustomIntentTextChange?: (text: string) => void;
}

const INTENTS: Array<{
  id: IntentType;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  icon: string;
}> = [
  { id: 'hype', nameKey: 'modals.intentHypeName', descKey: 'modals.intentHypeDesc', icon: '⚡' },
  { id: 'horror', nameKey: 'modals.intentHorrorName', descKey: 'modals.intentHorrorDesc', icon: '👻' },
  { id: 'mystery', nameKey: 'modals.intentMysteryName', descKey: 'modals.intentMysteryDesc', icon: '🕵️' },
  { id: 'tech', nameKey: 'modals.intentTechName', descKey: 'modals.intentTechDesc', icon: '🔬' },
  { id: 'alert', nameKey: 'modals.intentAlertName', descKey: 'modals.intentAlertDesc', icon: '🚨' },
  { id: 'authority', nameKey: 'modals.intentAuthorityName', descKey: 'modals.intentAuthorityDesc', icon: '💼' },
  { id: 'other', nameKey: 'modals.intentOtherName', descKey: 'modals.intentOtherDesc', icon: '✨' },
];

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onSelectIntent,
  customIntentText = '',
  onCustomIntentTextChange,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
        {t('modals.thumbnailTone')}
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {INTENTS.map((item) => {
          const isSelected = selectedIntent === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectIntent(item.id)}
              className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600/30'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              } ${item.id === 'other' ? 'col-span-2' : ''}`}
            >
              <span className="text-sm shrink-0">{item.icon}</span>
              <div className="min-w-0 flex-1 leading-tight">
                <span className="text-[11px] font-bold block text-slate-900 leading-tight">
                  {t(item.nameKey)}
                </span>
                <span className="text-[9px] text-slate-400 block truncate leading-tight">
                  {t(item.descKey)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Input de texto libre cuando se selecciona 'other' */}
      {selectedIntent === 'other' && (
        <div className="mt-2 animate-in fade-in duration-200">
          <label className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
            {t('modals.customPromptLabel')}
          </label>
          <input
            type="text"
            value={customIntentText}
            onChange={(e) => onCustomIntentTextChange?.(e.target.value)}
            placeholder={t('modals.customPromptPlaceholder')}
            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/20 font-medium text-slate-800"
          />
        </div>
      )}
    </div>
  );
};
