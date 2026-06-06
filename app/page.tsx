'use client';

import React, { useState, useRef, useCallback } from 'react';
import FormPanel from './components/FormPanel';
import OutputPanel from './components/OutputPanel';
import { generatePDF } from '@/lib/pdf';
import { generateLetterViaProxy } from '@/lib/api';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt';

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
  model: string;
  apiKey: string;
  baseUrl: string;
  variationInstructions?: string;
}

export default function Home() {
  const [letter, setLetter] = useState('');
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
      showToast(`Please wait ${cooldown}s before trying again`, 'err');
      return;
    }

    setIsGenerating(true);
    setCompanyName(data.companyName);
    setPersonalInfo(data.personalInfo);

    if (!data.variationInstructions) {
      setPreviousLetter(letter);
    }

    try {
      const systemPrompt = buildSystemPrompt(data.style, data.tone);
      const userPrompt = buildUserPrompt(
        data.jobDescription,
        data.cvText,
        data.additionalContext,
        data.variationInstructions,
        data.variationInstructions ? previousLetter || letter : undefined
      );

      const generated = await generateLetterViaProxy(data.baseUrl, data.apiKey, data.model, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      if (!generated) {
        throw new Error('No response from API');
      }

      setLetter(generated);
      setShowVariation(true);
      showToast('Cover letter generated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate letter';
      showToast(message, 'err');
      
      // Start cooldown on rate limit errors
      if (message.includes('Rate limit') || message.includes('429')) {
        startCooldown(15);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [letter, previousLetter, showToast, cooldown, startCooldown]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(letter).then(() => {
      showToast('Copied to clipboard');
    });
  }, [letter, showToast]);

  const handleDownload = useCallback(async () => {
    try {
      await generatePDF(letter, companyName, personalInfo);
      showToast('PDF downloaded');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Failed to generate PDF', 'err');
    }
  }, [letter, companyName, personalInfo, showToast]);

  const handleRegenerate = useCallback(() => {
    setShowVariation(true);
    const variationField = document.getElementById('variation-instructions');
    if (variationField) {
      variationField.scrollIntoView({ behavior: 'smooth' });
      variationField.focus();
    }
  }, []);

  return (
    <main className="min-h-screen bg-bg text-text font-inter">
      <nav className="flex justify-between items-center px-[6%] py-5 border-b border-border sticky top-0 bg-bg z-[100]">
        <a href="/" className="font-semibold text-[1.1rem] text-text no-underline tracking-tight">
          Unmotivational Letters
        </a>
        <span className="text-[0.9rem] text-text-muted">by Clara Sousa</span>
      </nav>

      <div className="max-w-[1200px] mx-auto px-[6%] py-8 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[calc(100vh-70px)]">
        <FormPanel
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          showVariation={showVariation}
          cooldown={cooldown}
        />
        <OutputPanel
          letter={letter}
          isGenerating={isGenerating}
          companyName={companyName}
          personalInfo={personalInfo}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onRegenerate={handleRegenerate}
        />
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 px-5 py-3 bg-surface border rounded-md text-[0.85rem] font-medium z-[1000] transition-all duration-300 max-w-[400px] ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        } ${toast.type === 'ok' ? 'border-text text-text' : 'border-error text-error'}`}
      >
        <div className="break-words leading-relaxed">{toast.message}</div>
      </div>
    </main>
  );
}
