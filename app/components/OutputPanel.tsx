'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface OutputPanelProps {
  letter: string;
  isGenerating: boolean;
  companyName: string;
  personalInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  onCopy: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
}

export default function OutputPanel({
  letter,
  isGenerating,
  onCopy,
  onDownload,
  onRegenerate,
}: OutputPanelProps) {
  const { t } = useTranslation();
  const hasContent = letter.length > 0;

  return (
    <div className="panel relative" style={{ position: 'relative' }}>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
        <div>
          <div className="text-[0.95rem] font-medium">{t('output.title')}</div>
          <div className="text-[0.8rem] text-text-muted mt-0.5">
            {hasContent ? t('output.generated') : t('output.placeholderTitle')}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-[rgba(10,10,10,0.95)] rounded-[10px] flex flex-col items-center justify-center gap-5 z-10">
          <div className="w-8 h-8 border-2 border-border border-t-text rounded-full animate-spin-slow" />
          <div className="text-[0.85rem] text-text-muted">{t('output.crafting')}</div>
          <LoadingSteps />
        </div>
      )}

      {/* Placeholder */}
      {!hasContent && !isGenerating && (
        <div className="flex flex-col items-center justify-center min-h-[320px] text-center text-text-muted">
          <h3 className="text-[0.95rem] mb-1 text-text font-medium">{t('output.placeholderTitle')}</h3>
          <p className="text-[0.85rem] max-w-[260px]">
            {t('output.placeholderText')}
          </p>
        </div>
      )}

      {/* Output Content */}
      {hasContent && !isGenerating && (
        <div className="flex flex-col gap-3">
          <div className="bg-bg border border-border rounded-md p-6 text-[0.9rem] leading-[1.8] whitespace-pre-wrap min-h-[280px] max-h-[450px] overflow-y-auto text-text-muted scrollbar-thin">
            {letter}
          </div>
          <div className="flex gap-2">
            <button onClick={onCopy} className="btn-secondary flex-1">
              <Copy size={16} />
              {t('output.copy')}
            </button>
            <button onClick={onDownload} className="btn-secondary flex-1">
              <Download size={16} />
              {t('output.downloadPDF')}
            </button>
          </div>
          <button onClick={onRegenerate} className="btn-primary">
            <RefreshCw size={16} />
            {t('output.regenerate')}
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingSteps() {
  const { t } = useTranslation();
  const steps = [
    t('output.step1'),
    t('output.step2'),
    t('output.step3'),
    t('output.step4'),
  ];

  return (
    <div className="flex flex-col gap-2 w-[220px]">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3 text-[0.8rem] text-text-muted">
          <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-border flex-shrink-0" />
          {step}
        </div>
      ))}
      <div className="w-full h-0.5 bg-border rounded-sm mt-2">
        <div className="h-full bg-text rounded-sm animate-pulse w-1/4" />
      </div>
    </div>
  );
}
