import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { formatRupiah } from '@/lib/format';

const CATEGORIES = [
  { id: 'air_mineral', label: 'Air Mineral' },
  { id: 'galon_air', label: 'Galon Air' },
  { id: 'gas_lpg', label: 'Gas LPG' },
];

const RATING_OPTIONS = [
  { value: 4, label: '4 ke atas' },
  { value: 3, label: '3 ke atas' },
  { value: 2, label: '2 ke atas' },
];

interface ProductFiltersProps {
  selectedCategories: string[];
  priceRange: [number, number];
  minRating: number | null;
  minPrice: number;
  maxPrice: number;
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  onPriceRangeChange: (value: [number, number]) => void;
  onMinRatingChange: (rating: number | null) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function ProductFilters({
  selectedCategories,
  priceRange,
  minRating,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceRangeChange,
  onMinRatingChange,
  onReset,
  hasActiveFilters,
}: ProductFiltersProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Kategori</h3>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <Checkbox
                id={cat.id}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={(checked) => onCategoryChange(cat.id, checked as boolean)}
                className="rounded-md"
              />
              <label htmlFor={cat.id} className="text-sm text-foreground cursor-pointer flex-1">
                {cat.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Rentang Harga</h3>
        <Slider
          value={priceRange}
          min={minPrice}
          max={maxPrice}
          step={5000}
          onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          className="mb-4"
        />
        <div className="flex justify-between text-sm">
          <span className="font-medium text-primary">{formatRupiah(priceRange[0])}</span>
          <span className="text-muted-foreground">—</span>
          <span className="font-medium text-primary">{formatRupiah(priceRange[1])}</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Rating Minimum</h3>
        <div className="space-y-3">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onMinRatingChange(minRating === option.value ? null : option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                minRating === option.value
                  ? 'bg-primary/10 border border-primary/30 text-primary'
                  : 'bg-muted/50 hover:bg-muted border border-transparent'
              }`}
            >
              <Star className={`h-4 w-4 ${minRating === option.value ? 'fill-primary text-primary' : 'fill-amber-400 text-amber-400'}`} />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={onReset} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Reset Filter
        </Button>
      )}
    </div>
  );
}
