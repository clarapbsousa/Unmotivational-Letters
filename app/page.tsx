'use client';

import '@/app/i18n/config';
import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FormPanel from './components/FormPanel/FormPanel';
import OutputPanel from './components/OutputPanel/OutputPanel';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher';
import { generatePDF } from '@/lib/pdf';
import { generateLetterViaProxy } from '@/lib/api';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt';
import styles from './page.module.css';

interface GenerationData {
  personalInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  companyName: string;
  jobDescription: string;
  cvText: string;
  additionalContext: string;
  style: string;
  tone: string;
  letterLanguage: string;
  variationInstructions?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const [letter, setLetter] = useState('');
  const [editedLetter, setEditedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [previousLetter, setPreviousLetter] = useState('');
  const [showVariation, setShowVariation] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'ok' | 'err'; show: boolean }>({
    message: '',
    type: 'ok',
    show: false,
  });
  const [cooldown, setCooldown] = useState(0);
  const toastTimeout = useRef<NodeJS.Timeout>();
  const cooldownInterval = useRef<NodeJS.Timeout>();

  const showToast = useCallback((message: string, type: 'ok' | 'err' = 'ok') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type, show: true });
    toastTimeout.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, type === 'err' ? 10000 : 2500);
  }, []);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    cooldownInterval.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownInterval.current) clearInterval(cooldownInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleGenerate = useCallback(async (data: GenerationData) => {
    if (cooldown > 0) {
      showToast(t('toast.waitCooldown', { seconds: cooldown }), 'err');
      return;
    }

    setIsGenerating(true);
    setCompanyName(data.companyName);
    setPersonalInfo(data.personalInfo);

    if (!data.variationInstructions) {
      setPreviousLetter(letter);
    }

    try {
      const systemPrompt = buildSystemPrompt(data.style, data.tone, data.letterLanguage);
      const userPrompt = buildUserPrompt(
        data.jobDescription,
        data.cvText,
        data.additionalContext,
        data.letterLanguage,
        data.variationInstructions,
        data.variationInstructions ? previousLetter || letter : undefined
      );

      const generated = await generateLetterViaProxy([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      if (!generated) {
        throw new Error(t('toast.noResponse'));
      }

      setLetter(generated);
      setEditedLetter(generated);
      setShowVariation(true);
      showToast(t('toast.generated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.noResponse');
      showToast(message, 'err');
      
      // Start cooldown on rate limit errors
      if (message.includes('Rate limit') || message.includes('429')) {
        startCooldown(15);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [letter, previousLetter, showToast, cooldown, startCooldown, t]);

  const handleLetterChange = useCallback((text: string) => {
    setEditedLetter(text);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editedLetter).then(() => {
      showToast(t('toast.copied'));
    });
  }, [editedLetter, showToast, t]);

  const handleDownload = useCallback(async () => {
    try {
      await generatePDF(editedLetter, companyName, personalInfo);
      showToast(t('toast.pdfDownloaded'));
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast(t('toast.pdfFailed'), 'err');
    }
  }, [editedLetter, companyName, personalInfo, showToast, t]);

  const handleRegenerate = useCallback(() => {
    setShowVariation(true);
    const variationField = document.getElementById('variation-instructions');
    if (variationField) {
      variationField.scrollIntoView({ behavior: 'smooth' });
      variationField.focus();
    }
  }, []);

  const isEdited = letter.length > 0 && editedLetter !== letter;

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <a href="/" className={styles.navBrand}>
          {t('nav.title')}
        </a>
        <LanguageSwitcher />
      </nav>

      <div className={styles.container}>
        <FormPanel
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          showVariation={showVariation}
          cooldown={cooldown}
        />
        <OutputPanel
          letter={editedLetter}
          originalLetter={letter}
          isGenerating={isGenerating}
          companyName={companyName}
          personalInfo={personalInfo}
          isEdited={isEdited}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onRegenerate={handleRegenerate}
          onChange={handleLetterChange}
        />
      </div>

      {/* Toast */}
      <div
        className={`${styles.toast} ${toast.type === 'ok' ? styles.toastOk : styles.toastErr} ${toast.show ? styles.toastVisible : styles.toastHidden}`}
      >
        <div className={styles.toastMessage}>{toast.message}</div>
      </div>
    </main>
  );
}
