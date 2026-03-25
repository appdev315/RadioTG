import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={twMerge(
            "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
            activeCategory === cat.id
              ? "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
              : "bg-[var(--tg-theme-hint-color)]/10 text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-hint-color)]/20"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
