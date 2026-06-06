'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, ChevronDown, ChevronUp, Lock, Eye, EyeOff, Info } from 'lucide-react';
import { extractTextFromFile } from '@/lib/extract';
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/crypto';

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
    model: string;
    apiKey: string;
    baseUrl: string;
    letterLanguage: string;
    variationInstructions?: string;
  }) => void;
  isGenerating: boolean;
  showVariation: boolean;
  cooldown: number;
}

const HARD_CODED_MODEL = 'gpt-4o-mini';

const STORAGE_KEYS = {
  API_KEY: 'ul_api_key',
  BASE_URL: 'ul_base_url',
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
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [showApiSettings, setShowApiSettings] = useState(false);
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
    const savedApiKey = loadFromStorage(STORAGE_KEYS.API_KEY);
    const savedBaseUrl = loadFromStorage(STORAGE_KEYS.BASE_URL);
    const savedCv = loadFromStorage(STORAGE_KEYS.CV_TEXT);
    const savedPersonal = loadFromStorage(STORAGE_KEYS.PERSONAL_INFO);

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedBaseUrl) setBaseUrl(savedBaseUrl);
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
    if (apiKey) saveToStorage(STORAGE_KEYS.API_KEY, apiKey);
    if (baseUrl) saveToStorage(STORAGE_KEYS.BASE_URL, baseUrl);
    if (cvText) saveToStorage(STORAGE_KEYS.CV_TEXT, cvText);
    saveToStorage(STORAGE_KEYS.PERSONAL_INFO, JSON.stringify(personalInfo));
  }, [apiKey, baseUrl, cvText, personalInfo]);

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
      model: HARD_CODED_MODEL,
      apiKey,
      baseUrl,
      letterLanguage,
      variationInstructions: showVariation ? variationInstructions : undefined,
    });
  };

  const requiredStar = <span className="text-error ml-0.5">{t('form.required')}</span>;

  return (
    <div className="panel">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
        <div>
          <div className="text-[0.95rem] font-medium">{t('form.yourInformation')}</div>
          <div className="text-[0.8rem] text-text-muted mt-0.5">{t('form.fillDetails')}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">{t('form.personalDetails')}</label>
          <div className="grid grid-cols-2 gap-3">
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
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">
            {t('form.companyName')} {requiredStar}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={t('form.companyPlaceholder')}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="text-[0.75rem] text-text-muted mt-2">{t('form.companyFilename')}</p>
        </div>

        {/* Job Description */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">
            {t('form.jobDescription')} {requiredStar}
          </label>
          <textarea
            className="form-input min-h-[140px] leading-relaxed"
            placeholder={t('form.jobPlaceholder')}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="text-right text-[0.7rem] text-text-muted mt-1">
            {t('form.chars', { count: jobDescription.length })}
          </div>
        </div>

        {/* CV Upload */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">
            {t('form.cvUpload')} {requiredStar}
          </label>
          <div
            className={`border border-dashed border-border rounded-md p-6 text-center cursor-pointer transition-colors duration-200 bg-bg hover:border-text-muted ${dropActive ? 'border-text bg-surface-hover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
            onDragLeave={() => setDropActive(false)}
            onDrop={handleDrop}
          >
            {fileName ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm"><strong>{fileName}</strong></span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearCV(); }}
                  className="text-text-muted hover:text-error"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="text-[0.85rem] text-text-muted flex items-center justify-center gap-2">
                  <Upload size={16} />
                  {t('form.uploadHint')}
                </div>
                <div className="text-[0.75rem] text-[#555] mt-1">{t('form.uploadFormats')}</div>
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
          <div className="text-center text-[0.75rem] text-text-muted my-2">{t('form.orPaste')}</div>
          <textarea
            className="form-input min-h-[140px] leading-relaxed"
            placeholder={t('form.cvPlaceholder')}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
          />
          <div className="text-right text-[0.7rem] text-text-muted mt-1">
            {t('form.chars', { count: cvText.length })}
          </div>

          {/* CV Preview */}
          {cvText.trim().length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowCvPreview((v) => !v)}
                className="flex items-center gap-2 text-[0.8rem] text-text-muted hover:text-text transition-colors mb-2"
              >
                {showCvPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showCvPreview ? t('form.hidePreview') : t('form.showPreview')}
              </button>
              {showCvPreview && (
                <div className="bg-bg border border-border rounded-md p-4 text-[0.8rem] text-text-muted leading-relaxed whitespace-pre-wrap max-h-[240px] overflow-y-auto scrollbar-thin">
                  {cvText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Context */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">
            {t('form.additionalContext')} <span className="font-normal text-text-muted">({t('form.optional')})</span>
          </label>
          <textarea
            className="form-input min-h-[80px] leading-relaxed"
            placeholder={t('form.additionalPlaceholder')}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
          <div className="text-right text-[0.7rem] text-text-muted mt-1">
            {t('form.chars', { count: additionalContext.length })}
          </div>
        </div>

        {/* Style */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">{t('form.writingStyle')}</label>
          <div className="grid grid-cols-3 gap-2">
            {['formal', 'balanced', 'creative'].map((s) => (
              <div key={s} className="relative">
                <input
                  type="radio"
                  name="style"
                  id={`style-${s}`}
                  value={s}
                  checked={style === s}
                  onChange={() => setStyle(s)}
                  className="absolute opacity-0"
                />
                <label
                  htmlFor={`style-${s}`}
                  className={`block py-2 px-3 bg-bg border border-border rounded-md text-center text-[0.8rem] cursor-pointer transition-all duration-200 ${style === s ? 'border-text text-text bg-surface-hover' : 'text-text-muted'}`}
                >
                  {t(`form.style_${s}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">{t('form.tone')}</label>
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
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">{t('form.letterLanguage')}</label>
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
          <div className="mb-5" ref={variationRef}>
            <label className="block text-[0.85rem] font-medium mb-2">
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

        {/* API Settings Toggle */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="flex items-center gap-2 text-[0.85rem] text-text-muted hover:text-text transition-colors"
            >
              <Lock size={14} />
              {t('form.apiSettings')}
              {showApiSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <div className="relative group">
              <Info size={14} className="text-text-muted hover:text-text transition-colors cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[260px] p-3 bg-surface border border-border rounded-md text-[0.75rem] text-text-muted leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg">
                <p className="font-medium text-text mb-1">{t('form.tooltipTitle')}</p>
                <p className="mb-2">
                  <span className="text-text">{t('form.tooltipBaseUrl')}:</span> {t('form.tooltipProviderEndpoint')}
                </p>
                <ul className="list-disc pl-4 mb-2 space-y-0.5">
                  <li>OpenAI: <span className="font-mono text-[0.7rem]">https://api.openai.com/v1</span></li>
                  <li>OpenRouter: <span className="font-mono text-[0.7rem]">https://openrouter.ai/api/v1</span></li>
                </ul>
                <p>
                  <span className="text-text">{t('form.tooltipApiKey')}:</span> {t('form.tooltipCreateKey')}
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>OpenAI: <span className="font-mono text-[0.7rem]">platform.openai.com/api-keys</span></li>
                  <li>OpenRouter: <span className="font-mono text-[0.7rem]">openrouter.ai/keys</span></li>
                </ul>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-surface border-r border-b border-border rotate-45 -mt-1" />
              </div>
            </div>
          </div>
          {showApiSettings && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-[0.8rem] font-medium mb-1.5">{t('form.baseUrl')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={t('form.baseUrlPlaceholder')}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[0.8rem] font-medium">{t('form.apiKey')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setApiKey('');
                      setBaseUrl('https://api.openai.com/v1');
                      clearStorage(STORAGE_KEYS.API_KEY);
                      clearStorage(STORAGE_KEYS.BASE_URL);
                    }}
                    className="text-[0.7rem] text-text-muted hover:text-error transition-colors"
                  >
                    {t('form.clearCredentials')}
                  </button>
                </div>
                <input
                  type="password"
                  className="form-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('form.apiKeyPlaceholder')}
                />
                <p className="text-[0.75rem] text-text-muted mt-1">
                  {t('form.storedEncrypted')}
                </p>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={isGenerating || cooldown > 0}>
          {isGenerating ? t('form.generating') : cooldown > 0 ? t('form.waitSeconds', { seconds: cooldown }) : showVariation ? t('form.regenerate') : t('form.generate')}
        </button>
      </form>
    </div>
  );
}
