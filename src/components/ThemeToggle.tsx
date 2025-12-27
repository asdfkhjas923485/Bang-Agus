import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium">
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Light</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-all"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-amber-500" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
