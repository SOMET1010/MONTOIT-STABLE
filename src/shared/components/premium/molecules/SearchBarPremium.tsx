import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, TrendingUp, X, Loader2 } from 'lucide-react';
import { InputPremium } from '../atoms/InputPremium';
import { ButtonPremium } from '../atoms/ButtonPremium';
import { cn } from '@/shared/utils/cn';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'city' | 'neighborhood' | 'recent' | 'popular';
  icon?: React.ReactNode;
}

export interface SearchBarPremiumProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularSearches?: string[];
  isLoading?: boolean;
  className?: string;
}

export const SearchBarPremium: React.FC<SearchBarPremiumProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Où cherchez-vous ? (Ville, quartier...)',
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  isLoading = false,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine all suggestions
  const allSuggestions: SearchSuggestion[] = [
    ...suggestions,
    ...recentSearches.map((search, i) => ({
      id: `recent-${i}`,
      text: search,
      type: 'recent' as const,
      icon: <Clock className="h-4 w-4" />,
    })),
    ...popularSearches.map((search, i) => ({
      id: `popular-${i}`,
      text: search,
      type: 'popular' as const,
      icon: <TrendingUp className="h-4 w-4" />,
    })),
  ];

  // Filter suggestions based on input
  const filteredSuggestions = value.trim()
    ? allSuggestions.filter((s) =>
        s.text.toLowerCase().includes(value.toLowerCase())
      )
    : allSuggestions.slice(0, 8); // Show max 8 suggestions when empty

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay to allow click on suggestions
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Save to recent searches (localStorage)
    saveToRecentSearches(suggestion.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSearch(value);
      setShowSuggestions(false);
      saveToRecentSearches(value);
    }
  };

  const handleClear = () => {
    onChange('');
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const saveToRecentSearches = (search: string) => {
    try {
      const recent = JSON.parse(
        localStorage.getItem('montoit_recent_searches') || '[]'
      );
      const updated = [search, ...recent.filter((s: string) => s !== search)].slice(0, 5);
      localStorage.setItem('montoit_recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'city':
        return <MapPin className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full h-14 pl-12 pr-24 rounded-xl',
            'bg-white/80 backdrop-blur-md',
            'border-2 border-neutral-300',
            'text-base text-neutral-900 placeholder:text-neutral-400',
            'transition-all duration-200',
            'hover:border-neutral-400',
            'focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20',
            'shadow-lg hover:shadow-xl',
            isFocused && 'border-primary-500 ring-4 ring-primary-500/20'
          )}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
            aria-label="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Search button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <ButtonPremium
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="h-10"
          >
            Rechercher
          </ButtonPremium>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-white/95 backdrop-blur-md rounded-xl',
            'border border-neutral-200 shadow-2xl',
            'overflow-hidden',
            'animate-fade-in'
          )}
        >
          {/* Recent searches header */}
          {value.trim() === '' && recentSearches.length > 0 && (
            <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Recherches récentes
              </p>
            </div>
          )}

          {/* Suggestions list */}
          <ul className="max-h-80 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'text-left transition-colors',
                    'hover:bg-primary-50',
                    selectedIndex === index && 'bg-primary-50',
                    index !== filteredSuggestions.length - 1 && 'border-b border-neutral-100'
                  )}
                >
                  <span className="text-neutral-400 flex-shrink-0">
                    {suggestion.icon || getIconForType(suggestion.type)}
                  </span>
                  <span className="flex-1 text-neutral-900">{suggestion.text}</span>
                  {suggestion.type === 'popular' && (
                    <span className="text-xs text-primary-600 font-medium">Populaire</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Popular searches footer */}
          {value.trim() === '' && popularSearches.length > 0 && (
            <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
              <p className="text-xs font-medium text-neutral-500 mb-2">Recherches populaires</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.slice(0, 5).map((search, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick({
                      id: `popular-chip-${i}`,
                      text: search,
                      type: 'popular',
                    })}
                    className="px-3 py-1 rounded-full bg-white border border-neutral-300 text-sm text-neutral-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SearchBarPremium.displayName = 'SearchBarPremium';
