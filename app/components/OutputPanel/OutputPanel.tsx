'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, RefreshCw, Pencil } from 'lucide-react';
import styles from './OutputPanel.module.css';

interface OutputPanelProps {
  letter: string;
  originalLetter: string;
  isGenerating: boolean;
  companyName: string;
  personalInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  isEdited: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
  onChange?: (text: string) => void;
}

export default function OutputPanel({
  letter,
  originalLetter,
  isGenerating,
  isEdited,
  onCopy,
  onDownload,
  onRegenerate,
  onChange,
}: OutputPanelProps) {
  const { t } = useTranslation();
  const hasContent = originalLetter.length > 0;

  return (
    <div className="panel relative">
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{t('output.title')}</div>
          <div className={styles.subtitle}>
            {hasContent
              ? isEdited
                ? t('output.edited')
                : t('output.generated')
              : t('output.placeholderTitle')}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>{t('output.crafting')}</div>
          <LoadingSteps />
        </div>
      )}

      {/* Placeholder */}
      {!hasContent && !isGenerating && (
        <div className={styles.placeholder}>
          <h3 className={styles.placeholderTitle}>{t('output.placeholderTitle')}</h3>
          <p className={styles.placeholderText}>{t('output.placeholderText')}</p>
        </div>
      )}

      {/* Output Content */}
      {hasContent && !isGenerating && (
        <div className={styles.content}>
          <div className={styles.editHint}>
            <Pencil size={12} />
            <span>{t('output.editHint')}</span>
          </div>
          <textarea
            className={`${styles.letterTextarea} scrollbar-thin`}
            value={letter}
            onChange={(e) => onChange?.(e.target.value)}
            spellCheck={false}
          />
          <div className={styles.buttonGroup}>
            <button onClick={onCopy} className="btn-secondary">
              <Copy size={16} />
              {t('output.copy')}
            </button>
            <button onClick={onDownload} className="btn-secondary">
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
    <div className={styles.loadingSteps}>
      {steps.map((step, i) => (
        <div key={i} className={styles.loadingStep}>
          <div className={styles.stepDot} />
          {step}
        </div>
      ))}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBar} />
      </div>
    </div>
  );
}
