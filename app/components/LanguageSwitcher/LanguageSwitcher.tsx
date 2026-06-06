'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'da', label: 'Dansk' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[1];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={styles.toggle}
      >
        <Globe size={14} />
        <span>{currentLang.label}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={`${styles.dropdownInner} scrollbar-thin`}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={lang.code === currentLang.code ? styles.itemActive : styles.item}
              >
                <span>{lang.label}</span>
                {lang.code === currentLang.code && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
