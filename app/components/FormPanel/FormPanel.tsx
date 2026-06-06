'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Eye, EyeOff } from 'lucide-react';
import { extractTextFromFile } from '@/lib/extract';
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/crypto';
import styles from './FormPanel.module.css';

interface FormPanelProps {
  onGenerate: (data: {
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
  }) => void;
  isGenerating: boolean;
  showVariation: boolean;
  cooldown: number;
}

const STORAGE_KEYS = {
  CV_TEXT: 'ul_cv_text',
  PERSONAL_INFO: 'ul_personal_info',
};

const LETTER_LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'da', label: 'Dansk' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
];

export default function FormPanel({ onGenerate, isGenerating, showVariation, cooldown }: FormPanelProps) {
  const { t, i18n } = useTranslation();
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [cvText, setCvText] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [style, setStyle] = useState('balanced');
  const [tone, setTone] = useState('confident');
  const [letterLanguage, setLetterLanguage] = useState(i18n.language);
  const [fileName, setFileName] = useState('');
  const [variationInstructions, setVariationInstructions] = useState('');
  const [dropActive, setDropActive] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const variationRef = React.useRef<HTMLDivElement>(null);

  // Sync letter language with UI language when it changes
  useEffect(() => {
    setLetterLanguage(i18n.language);
  }, [i18n.language]);

  // Load saved data
  useEffect(() => {
    const savedCv = loadFromStorage(STORAGE_KEYS.CV_TEXT);
    const savedPersonal = loadFromStorage(STORAGE_KEYS.PERSONAL_INFO);

    if (savedCv) {
      setCvText(savedCv);
      setFileName(t('form.uploadHint'));
    }
    if (savedPersonal) {
      try {
        setPersonalInfo(JSON.parse(savedPersonal));
      } catch {
        // ignore
      }
    }
  }, [t]);

  // Save data when changed
  useEffect(() => {
    if (cvText) saveToStorage(STORAGE_KEYS.CV_TEXT, cvText);
    saveToStorage(STORAGE_KEYS.PERSONAL_INFO, JSON.stringify(personalInfo));
  }, [cvText, personalInfo]);

  // Scroll to variation when shown
  useEffect(() => {
    if (showVariation && variationRef.current) {
      variationRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showVariation]);

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      setCvText(text);
      saveToStorage(STORAGE_KEYS.CV_TEXT, text);
    } catch (error) {
      alert(error instanceof Error ? error.message : t('validation.fileError'));
      setFileName('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const clearCV = () => {
    setCvText('');
    setFileName('');
    clearStorage(STORAGE_KEYS.CV_TEXT);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      alert(t('validation.jobDescriptionRequired'));
      return;
    }
    if (!companyName.trim()) {
      alert(t('validation.companyNameRequired'));
      return;
    }
    if (!cvText.trim()) {
      alert(t('validation.cvRequired'));
      return;
    }

    onGenerate({
      personalInfo,
      companyName,
      jobDescription,
      cvText,
      additionalContext,
      style,
      tone,
      letterLanguage,
      variationInstructions: showVariation ? variationInstructions : undefined,
    });
  };

  const requiredStar = <span className={styles.requiredStar}>{t('form.required')}</span>;

  return (
    <div className="panel">
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{t('form.yourInformation')}</div>
          <div className={styles.subtitle}>{t('form.fillDetails')}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className={styles.section}>
          <label className={styles.label}>{t('form.personalDetails')}</label>
          <div className={styles.grid2}>
            <input
              type="text"
              placeholder={t('form.fullName')}
              className="form-input"
              value={personalInfo.name}
              onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('form.email')}
              className="form-input"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('form.phone')}
              className="form-input"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('form.address')}
              className="form-input"
              value={personalInfo.address}
              onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
            />
          </div>
        </div>

        {/* Company Name */}
        <div className={styles.section}>
          <label className={styles.label}>
            {t('form.companyName')} {requiredStar}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={t('form.companyPlaceholder')}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className={styles.hint}>{t('form.companyFilename')}</p>
        </div>

        {/* Job Description */}
        <div className={styles.section}>
          <label className={styles.label}>
            {t('form.jobDescription')} {requiredStar}
          </label>
          <textarea
            className="form-input min-h-[140px] leading-relaxed"
            placeholder={t('form.jobPlaceholder')}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className={styles.charCount}>
            {t('form.chars', { count: jobDescription.length })}
          </div>
        </div>

        {/* CV Upload */}
        <div className={styles.section}>
          <label className={styles.label}>
            {t('form.cvUpload')} {requiredStar}
          </label>
          <div
            className={dropActive ? styles.dropzoneActive : styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
            onDragLeave={() => setDropActive(false)}
            onDrop={handleDrop}
          >
            {fileName ? (
              <div className={styles.fileDisplay}>
                <span className="text-sm"><strong>{fileName}</strong></span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearCV(); }}
                  className={styles.removeFile}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className={styles.uploadHint}>
                  <Upload size={16} />
                  {t('form.uploadHint')}
                </div>
                <div className={styles.uploadFormats}>{t('form.uploadFormats')}</div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>
          <div className={styles.divider}>{t('form.orPaste')}</div>
          <textarea
            className="form-input min-h-[140px] leading-relaxed"
            placeholder={t('form.cvPlaceholder')}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
          />
          <div className={styles.charCount}>
            {t('form.chars', { count: cvText.length })}
          </div>

          {/* CV Preview */}
          {cvText.trim().length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowCvPreview((v) => !v)}
                className={styles.togglePreview}
              >
                {showCvPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showCvPreview ? t('form.hidePreview') : t('form.showPreview')}
              </button>
              {showCvPreview && (
                <div className={`${styles.cvPreview} scrollbar-thin`}>
                  {cvText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Context */}
        <div className={styles.section}>
          <label className={styles.label}>
            {t('form.additionalContext')} <span className="font-normal text-text-muted">({t('form.optional')})</span>
          </label>
          <textarea
            className="form-input min-h-[80px] leading-relaxed"
            placeholder={t('form.additionalPlaceholder')}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
          <div className={styles.charCount}>
            {t('form.chars', { count: additionalContext.length })}
          </div>
        </div>

        {/* Style */}
        <div className={styles.section}>
          <label className={styles.label}>{t('form.writingStyle')}</label>
          <div className={styles.grid3}>
            {['formal', 'balanced', 'creative'].map((s) => (
              <div key={s} className="relative">
                <input
                  type="radio"
                  name="style"
                  id={`style-${s}`}
                  value={s}
                  checked={style === s}
                  onChange={() => setStyle(s)}
                  className={styles.radioInput}
                />
                <label
                  htmlFor={`style-${s}`}
                  className={style === s ? styles.radioLabelActive : styles.radioLabel}
                >
                  {t(`form.style_${s}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className={styles.section}>
          <label className={styles.label}>{t('form.tone')}</label>
          <select
            className="form-input"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="enthusiastic">{t('form.tone_enthusiastic')}</option>
            <option value="confident">{t('form.tone_confident')}</option>
            <option value="humble">{t('form.tone_humble')}</option>
            <option value="assertive">{t('form.tone_assertive')}</option>
          </select>
        </div>

        {/* Letter Language */}
        <div className={styles.section}>
          <label className={styles.label}>{t('form.letterLanguage')}</label>
          <select
            className="form-input"
            value={letterLanguage}
            onChange={(e) => setLetterLanguage(e.target.value)}
          >
            {LETTER_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Variation Instructions */}
        {showVariation && (
          <div className={styles.section} ref={variationRef}>
            <label className={styles.label}>
              {t('form.variationInstructions')}
            </label>
            <textarea
              id="variation-instructions"
              className="form-input min-h-[60px] leading-relaxed"
              placeholder={t('form.variationPlaceholder')}
              value={variationInstructions}
              onChange={(e) => setVariationInstructions(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={isGenerating || cooldown > 0}>
          {isGenerating ? t('form.generating') : cooldown > 0 ? t('form.waitSeconds', { seconds: cooldown }) : showVariation ? t('form.regenerate') : t('form.generate')}
        </button>
      </form>
    </div>
  );
}
