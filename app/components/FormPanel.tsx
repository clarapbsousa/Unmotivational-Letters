'use client';

import React, { useState, useEffect } from 'react';
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

export default function FormPanel({ onGenerate, isGenerating, showVariation, cooldown }: FormPanelProps) {
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
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [fileName, setFileName] = useState('');
  const [variationInstructions, setVariationInstructions] = useState('');
  const [dropActive, setDropActive] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const variationRef = React.useRef<HTMLDivElement>(null);

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
      setFileName('Previously uploaded CV');
    }
    if (savedPersonal) {
      try {
        setPersonalInfo(JSON.parse(savedPersonal));
      } catch {
        // ignore
      }
    }
  }, []);

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
      alert(error instanceof Error ? error.message : 'Error processing file');
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
      alert('Please enter a job description');
      return;
    }
    if (!companyName.trim()) {
      alert('Please enter the company name');
      return;
    }
    if (!cvText.trim()) {
      alert('Please enter your CV or upload a file');
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
      variationInstructions: showVariation ? variationInstructions : undefined,
    });
  };

  return (
    <div className="panel">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
        <div>
          <div className="text-[0.95rem] font-medium">Your Information</div>
          <div className="text-[0.8rem] text-text-muted mt-0.5">Fill in the details below</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">Personal Details</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name"
              className="form-input"
              value={personalInfo.name}
              onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Email"
              className="form-input"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              className="form-input"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address"
              className="form-input"
              value={personalInfo.address}
              onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
            />
          </div>
        </div>

        {/* Company Name */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">
            Company Name <span className="text-error ml-0.5">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="text-[0.75rem] text-text-muted mt-2">Used for the PDF filename</p>
        </div>

        {/* Job Description */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">
            Job Description <span className="text-error ml-0.5">*</span>
          </label>
          <textarea
            className="form-input min-h-[140px] leading-relaxed"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="text-right text-[0.7rem] text-text-muted mt-1">
            {jobDescription.length} chars
          </div>
        </div>

        {/* CV Upload */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">
            Your CV / Resume <span className="text-error ml-0.5">*</span>
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
                  Click to upload or drag & drop
                </div>
                <div className="text-[0.75rem] text-[#555] mt-1">PDF, DOCX, TXT (max 5MB)</div>
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
          <div className="text-center text-[0.75rem] text-text-muted my-2">or paste below</div>
          <textarea
            className="form-input min-h-[140px] leading-relaxed"
            placeholder="Paste your CV content here..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
          />
          <div className="text-right text-[0.7rem] text-text-muted mt-1">
            {cvText.length} chars
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
                {showCvPreview ? 'Hide extracted preview' : 'Show extracted preview'}
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
            Additional Context <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <textarea
            className="form-input min-h-[80px] leading-relaxed"
            placeholder="Anything else the AI should know?"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
          <div className="text-right text-[0.7rem] text-text-muted mt-1">
            {additionalContext.length} chars
          </div>
        </div>

        {/* Style */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">Writing Style</label>
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
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium mb-2">Tone</label>
          <select
            className="form-input"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="enthusiastic">Enthusiastic</option>
            <option value="confident">Confident</option>
            <option value="humble">Humble</option>
            <option value="assertive">Assertive</option>
          </select>
        </div>

        {/* Variation Instructions */}
        {showVariation && (
          <div className="mb-5" ref={variationRef}>
            <label className="block text-[0.85rem] font-medium mb-2">
              Variation Instructions
            </label>
            <textarea
              id="variation-instructions"
              className="form-input min-h-[60px] leading-relaxed"
              placeholder="What would you like to change in this version? e.g., 'Make it more technical' or 'Emphasize leadership skills'"
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
              API Settings
              {showApiSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <div className="relative group">
              <Info size={14} className="text-text-muted hover:text-text cursor-help transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[260px] p-3 bg-surface border border-border rounded-md text-[0.75rem] text-text-muted leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg">
                <p className="font-medium text-text mb-1">Where to get your credentials</p>
                <p className="mb-2">
                  <span className="text-text">Base URL:</span> Your AI provider&apos;s API endpoint.
                </p>
                <ul className="list-disc pl-4 mb-2 space-y-0.5">
                  <li>OpenAI: <span className="font-mono text-[0.7rem]">https://api.openai.com/v1</span></li>
                  <li>OpenRouter: <span className="font-mono text-[0.7rem]">https://openrouter.ai/api/v1</span></li>
                </ul>
                <p>
                  <span className="text-text">API Key:</span> Create one in your provider&apos;s dashboard.
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
                <label className="block text-[0.8rem] font-medium mb-1.5">Base URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[0.8rem] font-medium">API Key</label>
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
                    Clear saved credentials
                  </button>
                </div>
                <input
                  type="password"
                  className="form-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-[0.75rem] text-text-muted mt-1">
                  Stored encrypted in your browser
                </p>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={isGenerating || cooldown > 0}>
          {isGenerating ? 'Generating...' : cooldown > 0 ? `Wait ${cooldown}s` : showVariation ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
        </button>
      </form>
    </div>
  );
}
