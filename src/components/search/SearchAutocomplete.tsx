import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/use-products';
import { formatRupiah } from '@/lib/format';

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Highlight matching text in search results
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || query.length < 2) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-primary/20 text-primary font-semibold rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

const SEARCH_HISTORY_KEY = 'aquagas-search-history';
const MAX_HISTORY_ITEMS = 5;

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
}

// Helper functions for search history
const getSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const addToSearchHistory = (query: string) => {
  const history = getSearchHistory().filter(h => h.toLowerCase() !== query.toLowerCase());
  const newHistory = [query, ...history].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
};

const removeFromSearchHistory = (query: string) => {
  const history = getSearchHistory().filter(h => h !== query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
};

const clearSearchHistory = () => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
};

export default function SearchAutocomplete({ 
  className = '', 
  placeholder = 'Cari produk...',
  onClose 
}: SearchAutocompleteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: products, isLoading } = useProducts();

  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Filter products based on debounced search query
  const suggestions = useMemo(() => {
    if (debouncedQuery.trim().length < 2) return [];
    
    return (products || [])
      .filter(p => 
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.variantLabel?.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [products, debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      addToSearchHistory(query.trim());
      setSearchHistory(getSearchHistory());
      navigate(`/produk?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleSelectProduct = (productId: string) => {
    navigate(`/produk/${productId}`);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  const handleSelectHistory = (historyQuery: string) => {
    addToSearchHistory(historyQuery);
    setSearchHistory(getSearchHistory());
    navigate(`/produk?search=${encodeURIComponent(historyQuery)}`);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  const handleRemoveHistory = (e: React.MouseEvent, historyQuery: string) => {
    e.stopPropagation();
    removeFromSearchHistory(historyQuery);
    setSearchHistory(getSearchHistory());
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setSearchHistory([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const showHistory = query.trim().length < 2 && searchHistory.length > 0;
  const showSuggestions = query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-4 h-10 rounded-full border-border bg-muted/50 focus:bg-card"
            autoComplete="off"
          />
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (showHistory || showSuggestions) && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card rounded-xl shadow-elevated border border-border overflow-hidden z-50 animate-fade-in">
          {/* Search History */}
          {showHistory && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">Riwayat Pencarian</span>
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-xs text-primary hover:underline"
                >
                  Hapus Semua
                </button>
              </div>
              <ul>
                {searchHistory.map((historyItem) => (
                  <li key={historyItem}>
                    <button
                      type="button"
                      onClick={() => handleSelectHistory(historyItem)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm truncate">{historyItem}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveHistory(e, historyItem)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Product Suggestions */}
          {showSuggestions && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectProduct(product.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            <HighlightText text={product.name} query={debouncedQuery} />
                          </p>
                          {product.variantLabel && (
                            <p className="text-xs text-muted-foreground">
                              <HighlightText text={product.variantLabel} query={debouncedQuery} />
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-secondary shrink-0">
                          {formatRupiah(product.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      className="w-full p-3 text-sm text-primary font-medium hover:bg-muted/50 transition-colors border-t border-border"
                    >
                      Lihat semua hasil untuk "{query}"
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Tidak ada produk ditemukan
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
