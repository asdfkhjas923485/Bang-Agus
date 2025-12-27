import { useState, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
}

const presetThemes: { id: string; name: string; config: ThemeConfig }[] = [
  { 
    id: 'teal', 
    name: 'Teal Classic', 
    config: { primary: '173 58% 39%', secondary: '16 85% 60%', accent: '210 80% 55%' }
  },
  { 
    id: 'ocean', 
    name: 'Ocean Blue', 
    config: { primary: '210 80% 50%', secondary: '25 90% 55%', accent: '180 70% 45%' }
  },
  { 
    id: 'forest', 
    name: 'Forest Green', 
    config: { primary: '142 70% 40%', secondary: '35 90% 55%', accent: '170 60% 45%' }
  },
  { 
    id: 'purple', 
    name: 'Royal Purple', 
    config: { primary: '270 60% 50%', secondary: '330 70% 55%', accent: '200 70% 55%' }
  },
  { 
    id: 'orange', 
    name: 'Sunset', 
    config: { primary: '25 90% 55%', secondary: '350 80% 55%', accent: '45 90% 50%' }
  },
  { 
    id: 'rose', 
    name: 'Rose Gold', 
    config: { primary: '350 70% 55%', secondary: '25 80% 60%', accent: '280 60% 55%' }
  },
];

const colorOptions = [
  { label: 'Teal', value: '173 58% 39%' },
  { label: 'Blue', value: '210 80% 50%' },
  { label: 'Green', value: '142 70% 40%' },
  { label: 'Purple', value: '270 60% 50%' },
  { label: 'Orange', value: '25 90% 55%' },
  { label: 'Rose', value: '350 70% 55%' },
  { label: 'Amber', value: '35 90% 50%' },
  { label: 'Cyan', value: '180 70% 45%' },
];

const THEME_KEY = 'aquagas-theme-config';

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ThemeConfig>({
    primary: '173 58% 39%',
    secondary: '16 85% 60%',
    accent: '210 80% 55%',
  });
  const [activePreset, setActivePreset] = useState<string>('teal');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed.config);
        setActivePreset(parsed.preset || 'custom');
        applyTheme(parsed.config);
      } catch {}
    }
  }, []);

  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', themeConfig.primary);
    root.style.setProperty('--secondary', themeConfig.secondary);
    root.style.setProperty('--accent', themeConfig.accent);
    root.style.setProperty('--ring', themeConfig.primary);
  };

  const handlePresetSelect = (preset: typeof presetThemes[0]) => {
    setConfig(preset.config);
    setActivePreset(preset.id);
    applyTheme(preset.config);
    localStorage.setItem(THEME_KEY, JSON.stringify({ preset: preset.id, config: preset.config }));
  };

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setActivePreset('custom');
    applyTheme(newConfig);
    localStorage.setItem(THEME_KEY, JSON.stringify({ preset: 'custom', config: newConfig }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Kustomisasi tema</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Kustomisasi Tema
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Preset Themes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tema Preset</Label>
            <div className="grid grid-cols-3 gap-2">
              {presetThemes.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`relative p-3 rounded-xl border-2 transition-all ${
                    activePreset === preset.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: `hsl(${preset.config.primary})` }} 
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: `hsl(${preset.config.secondary})` }} 
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: `hsl(${preset.config.accent})` }} 
                    />
                  </div>
                  <p className="text-xs font-medium truncate">{preset.name}</p>
                  {activePreset === preset.id && (
                    <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Warna Kustom</Label>
            
            {/* Primary Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Warna Utama (Primary)</span>
                <div 
                  className="w-6 h-6 rounded-full border border-border" 
                  style={{ backgroundColor: `hsl(${config.primary})` }} 
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={`primary-${color.value}`}
                    onClick={() => handleColorChange('primary', color.value)}
                    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                      config.primary === color.value ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Warna Sekunder</span>
                <div 
                  className="w-6 h-6 rounded-full border border-border" 
                  style={{ backgroundColor: `hsl(${config.secondary})` }} 
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={`secondary-${color.value}`}
                    onClick={() => handleColorChange('secondary', color.value)}
                    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                      config.secondary === color.value ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Warna Aksen</span>
                <div 
                  className="w-6 h-6 rounded-full border border-border" 
                  style={{ backgroundColor: `hsl(${config.accent})` }} 
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={`accent-${color.value}`}
                    onClick={() => handleColorChange('accent', color.value)}
                    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                      config.accent === color.value ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="flex gap-2 p-4 bg-muted rounded-xl">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary" style={{ backgroundColor: `hsl(${config.secondary})`, color: 'white' }}>
                Secondary
              </Button>
              <Button size="sm" variant="outline" style={{ borderColor: `hsl(${config.accent})`, color: `hsl(${config.accent})` }}>
                Accent
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
