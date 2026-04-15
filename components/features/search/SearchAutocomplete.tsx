'use client';

import './SearchAutocomplete.css';
import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import axiosInstance from '@/lib/axios';

// ─── Tiplər ──────────────────────────────────────────────────────────────────

interface SuggestionItem {
  text: string;
  category: string;
  categoryId: string;
  subCategory?: string | null;
  subCategoryId?: string | null;
  count: number;
}

interface SuggestionResponse {
  searchTerm: string;
  suggestions: SuggestionItem[];
}

// ─── Yardımçı: Mətndəki term-i <mark> ilə vurgula ─────────────────────────────

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── LocalStorage: Axtarış tarixi ─────────────────────────────────────────────

const HISTORY_KEY = 'elanaz_search_history';
const MAX_HISTORY = 6;

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(term: string) {
  if (!term.trim() || term.trim().length < 2) return;
  const prev = getSearchHistory().filter((t) => t !== term.trim());
  const updated = [term.trim(), ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

function removeFromHistory(term: string) {
  const updated = getSearchHistory().filter((t) => t !== term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

// ─── Komponent Props ──────────────────────────────────────────────────────────

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  showButton?: boolean;
  buttonLabel?: string | React.ReactNode;
  initialValue?: string;
}

// ─── Ana Komponent ────────────────────────────────────────────────────────────

export default function SearchAutocomplete({
  placeholder = 'Əşya və ya xidmət axtarışı',
  className = '',
  showButton = true,
  buttonLabel = 'Axtar',
  initialValue = '',
}: SearchAutocompleteProps) {
  const router = useRouter();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // ─── Ref-lər ────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── API Sorğusu (axiosInstance + AbortController) ────────────────────────
  const fetchSuggestions = useCallback(async (term: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (term.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    try {
      const response = await axiosInstance.get<SuggestionResponse>(
        '/search/suggestions',
        {
          params: { term, limit: 10 },
          signal: controller.signal,
        }
      );

      const data = response.data;
      setSuggestions(data.suggestions || []);
      setSearchTerm(data.searchTerm || term);
      setIsOpen(true);
      setShowHistory(false);
      setActiveIndex(-1);
    } catch (err: any) {
      // Axios ləğv xətaları — narahat olma
      if (err?.code !== 'ERR_CANCELED' && err?.name !== 'AbortError' && err?.name !== 'CanceledError') {
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Debounce: 350ms gözlə ───────────────────────────────────────────────
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, fetchSuggestions]);

  // ─── Kənara klikləmə ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowHistory(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Axtarışı aparmaq ────────────────────────────────────────────────────
  const doSearch = useCallback(
    (q: string, item?: any) => {
      setIsOpen(false);
      setShowHistory(false);
      const trimmed = q.trim();
      if (!trimmed && !item) return;

      if (trimmed) {
        saveToHistory(trimmed);
        setHistory(getSearchHistory());
      }

      // API-dən gələn sahə adları bəzən PascalCase, bəzən camelCase ola bilər
      const categorySlug = item?.categorySlug || item?.CategorySlug;
      const subCategorySlug = item?.subCategorySlug || item?.SubCategorySlug;
      const categoryId = item?.categoryId || item?.CategoryId;
      const subCategoryId = item?.subCategoryId || item?.SubCategoryId;

      // URL Qurma məntiqi
      let baseUrl: string = ROUTES.LISTINGS; // Çox vaxt '/elanlar'

      if (categorySlug) {
        // Əgər slug-lar varsa təmiz URL qururuq
        // baseUrl-in sonunda / yoxdursa əlavə et
        const pathPrefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        baseUrl = `${pathPrefix}${categorySlug}`;

        if (subCategorySlug) {
          baseUrl += `/${subCategorySlug}`;
        }
      }

      // Query parametrlərini hazırla
      const params = new URLSearchParams();

      // Əgər item mətni kateqoriya və ya brend adı ilə eynidirsə, 'q' parametrini göndərmirik
      const isPureCategoryOrBrand = item && (
        trimmed.toLowerCase() === (item.category || '').toLowerCase() ||
        trimmed.toLowerCase() === (item.subCategory || '').toLowerCase()
      );

      if (trimmed && !isPureCategoryOrBrand) {
        params.set('q', trimmed);
      }

      // Əgər slug yoxdursa ID-ləri fallback kimi istifadə et
      if (item && !categorySlug) {
        if (categoryId) params.set('categoryId', categoryId);
        if (subCategoryId) params.set('subCategoryId', subCategoryId);
      }

      const queryString = params.toString();
      const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      console.log('Search Navigation:', { finalUrl, item });
      router.push(finalUrl);
    },
    [router]
  );

  // ─── Klaviatura naviqasiyası ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === 'Enter') doSearch(query);
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            const s = suggestions[activeIndex];
            setQuery(s.text);
            doSearch(s.text, s);
          } else {
            doSearch(query);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setShowHistory(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, suggestions, activeIndex, query, doSearch]
  );

  // ─── Suggestion klikləndikdə ─────────────────────────────────────────────
  const handleSuggestionClick = useCallback(
    (item: SuggestionItem) => {
      setQuery(item.text);
      doSearch(item.text, item);
    },
    [doSearch]
  );

  // ─── Input dəyişikliyi ────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    if (val.trim().length >= 2) {
      setShowHistory(false);
    }
  };

  // ─── Input təmizlə (X düyməsi) ────────────────────────────────────────────
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setShowHistory(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // ─── Görünmə məntiqi ─────────────────────────────────────────────────────
  const showDropdown = isOpen && (suggestions.length > 0 || isLoading);
  const showHistoryDropdown = showHistory && !showDropdown && history.length > 0;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={`search-autocomplete-wrapper ${className}`}>

      {/* ── Axtarış sahəsi ── */}
      <div className="search-input-row">
        <div className="search-icon-left">
          <span className="material-symbols-outlined">search</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            const h = getSearchHistory();
            setHistory(h);
            if (query.trim().length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            } else if (query.trim().length < 2 && h.length > 0) {
              setShowHistory(true);
            }
          }}
          autoComplete="off"
          aria-label="Axtarış"
          aria-autocomplete="list"
          aria-expanded={showDropdown || showHistoryDropdown}
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          role="combobox"
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="search-spinner" aria-hidden="true">
            <div className="search-spinner-circle" />
          </div>
        )}

        {/* X — inputu təmizlə */}
        {query.length > 0 && !isLoading && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Axtarışı təmizlə"
            tabIndex={-1}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}

        {/* Axtar düyməsi */}
        {showButton && (
          <button
            type="button"
            onClick={() => doSearch(query)}
            className="search-btn"
            aria-label="Axtar"
          >
            {buttonLabel}
          </button>
        )}
      </div>

      {/* ── Suggestion Dropdown ── */}
      {showDropdown && (
        <div className="search-dropdown" role="listbox" aria-label="Axtarış təklifləri">
          {isLoading && suggestions.length === 0 ? (
            <div className="search-dropdown-loading">
              <div className="search-skeleton" />
              <div className="search-skeleton search-skeleton--short" />
              <div className="search-skeleton" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="search-no-results">
              <span className="material-symbols-outlined search-no-results-icon">search_off</span>
              <span>Nəticə tapılmadı</span>
            </div>
          ) : (
            <ul className="search-suggestion-list">
              {suggestions.map((item, index) => (
                <li
                  key={`${item.text}-${item.categoryId}-${index}`}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`search-suggestion-item ${index === activeIndex ? 'search-suggestion-item--active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(item);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="material-symbols-outlined search-suggestion-icon">search</span>

                  <div className="search-suggestion-content">
                    <span className="search-suggestion-text">
                      {highlightText(item.text, searchTerm)}
                    </span>
                    <div className="search-suggestion-meta">
                      <span className="search-suggestion-category">
                        {item.category}
                        {item.subCategory && (
                          <span className="search-suggestion-subcategory"> › {item.subCategory}</span>
                        )}
                      </span>
                      {item.count > 0 && (
                        <span className="search-suggestion-count">{item.count} elan</span>
                      )}
                    </div>
                  </div>

                  <span className="material-symbols-outlined search-suggestion-arrow">north_west</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Avito kimi: Son Axtarışlar (Tarix) ── */}
      {showHistoryDropdown && (
        <div className="search-dropdown" role="listbox" aria-label="Son axtarışlar">
          <div className="search-history-header">
            <span>Son axtarışlar</span>
            <button
              className="search-history-clear-all"
              onMouseDown={(e) => {
                e.preventDefault();
                localStorage.removeItem(HISTORY_KEY);
                setHistory([]);
                setShowHistory(false);
              }}
            >
              Hamısını sil
            </button>
          </div>
          <ul className="search-suggestion-list">
            {history.map((term, i) => (
              <li
                key={`hist-${i}`}
                className="search-suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(term);
                  doSearch(term);
                }}
              >
                <span className="material-symbols-outlined search-suggestion-icon" style={{ color: '#9ca3af' }}>
                  history
                </span>
                <div className="search-suggestion-content">
                  <span className="search-suggestion-text" style={{ fontWeight: 400 }}>{term}</span>
                </div>
                <button
                  className="search-history-remove"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeFromHistory(term);
                    const updated = getSearchHistory();
                    setHistory(updated);
                    if (updated.length === 0) setShowHistory(false);
                  }}
                  aria-label="Axtarışı sil"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#9ca3af' }}>close</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
