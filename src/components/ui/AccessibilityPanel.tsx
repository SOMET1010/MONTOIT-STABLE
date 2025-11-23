import { useState, useEffect } from 'react';
import { Eye, EyeOff, Type, ZoomIn, ZoomOut, Contrast, Sun, Moon, Volume2, VolumeX } from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  colorBlind: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    darkMode: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true,
    colorBlind: 'none'
  });

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres d\'accessibilité:', error);
      }
    }
  }, []);

  // Sauvegarder les paramètres et appliquer les styles
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applyAccessibilityStyles(settings);
  }, [settings]);

  const applyAccessibilityStyles = (currentSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Taille de police
    root.style.setProperty('--base-font-size', `${currentSettings.fontSize}px`);
    
    // Contraste élevé
    if (currentSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Mode sombre
    if (currentSettings.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    
    // Mouvement réduit
    if (currentSettings.reducedMotion) {
      root.style.setProperty('--transition-speed', '0ms');
      root.classList.add('reduced-motion');
    } else {
      root.style.setProperty('--transition-speed', '300ms');
      root.classList.remove('reduced-motion');
    }
    
    // Navigation clavier
    if (currentSettings.keyboardNavigation) {
      root.setAttribute('data-keyboard-nav', 'true');
    } else {
      root.removeAttribute('data-keyboard-nav');
    }
    
    // Focus visible
    if (currentSettings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
    
    // Daltonisme
    root.setAttribute('data-color-blind', currentSettings.colorBlind);
    
    // Lecteur d'écran
    if (currentSettings.screenReader) {
      root.setAttribute('aria-live', 'polite');
      root.classList.add('screen-reader-mode');
    } else {
      root.removeAttribute('aria-live');
      root.classList.remove('screen-reader-mode');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const increaseFontSize = () => {
    updateSetting('fontSize', Math.min(settings.fontSize + 2, 24));
  };

  const decreaseFontSize = () => {
    updateSetting('fontSize', Math.max(settings.fontSize - 2, 12));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      highContrast: false,
      darkMode: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusVisible: true,
      colorBlind: 'none'
    };
    setSettings(defaultSettings);
  };

  const announceToScreenReader = (message: string) => {
    if (settings.screenReader) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton d'ouverture du panneau */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Options d'accessibilité"
        aria-expanded={isOpen}
      >
        {isOpen ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
      </button>

      {/* Panneau d'accessibilité */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Accessibilité</h2>
          
          {/* Taille de police */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille du texte
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={decreaseFontSize}
                className="p-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Réduire la taille du texte"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-medium">
                {settings.fontSize}px
              </span>
              <button
                onClick={increaseFontSize}
                className="p-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Augmenter la taille du texte"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contraste élevé */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Contrast className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Contraste élevé
              </span>
            </label>
          </div>

          {/* Mode sombre */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSetting('darkMode', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                Mode {settings.darkMode ? 'sombre' : 'clair'}
              </span>
            </label>
          </div>

          {/* Mouvement réduit */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Type className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Réduire les animations
              </span>
            </label>
          </div>

          {/* Navigation clavier */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Type className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Navigation au clavier
              </span>
            </label>
          </div>

          {/* Focus visible */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.focusVisible}
                onChange={(e) => updateSetting('focusVisible', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Eye className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Focus visible
              </span>
            </label>
          </div>

          {/* Daltonisme */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode daltonien
            </label>
            <select
              value={settings.colorBlind}
              onChange={(e) => updateSetting('colorBlind', e.target.value as AccessibilitySettings['colorBlind'])}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Aucun</option>
              <option value="protanopia">Protanopie (rouge)</option>
              <option value="deuteranopia">Deutéranopie (vert)</option>
              <option value="tritanopia">Tritanopie (bleu)</option>
            </select>
          </div>

          {/* Bouton de réinitialisation */}
          <button
            onClick={resetSettings}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Réinitialiser les paramètres
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;