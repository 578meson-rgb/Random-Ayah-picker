import React from "react";
import { PRIMARY_TRANSLATIONS, SECONDARY_LANGUAGES } from "../translationOptions";
import { UserPreferences } from "../types";
import { Settings, X, Palette, Type, BookOpen, Volume2, Eye, EyeOff } from "lucide-react";

interface PreferencePanelProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencePanel: React.FC<PreferencePanelProps> = ({
  preferences,
  onUpdatePreferences,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentTheme = preferences.theme || "emerald";
  const currentFontSize = preferences.arabicFontSize || "small";
  const showEnglish = preferences.showEnglishTranslation !== false;
  const showSecondary = preferences.showSecondaryTranslation !== false;

  const themes: { id: "emerald" | "midnight" | "sandalwood"; name: string; preview: string }[] = [
    { id: "emerald", name: "Sacred Emerald", preview: "bg-[#0e3e31] text-[#b38637]" },
    { id: "midnight", name: "Celestial Midnight", preview: "bg-[#09101d] text-[#d4a74a]" },
    { id: "sandalwood", name: "Sandalwood Warmth", preview: "bg-[#853e1a] text-[#f5ede1]" },
  ];

  const fontSizes = [
    { id: "small" as const, label: "Small" },
    { id: "medium" as const, label: "Medium" },
    { id: "large" as const, label: "Large" },
    { id: "xlarge" as const, label: "Extra Large" }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="preference-panel-card"
        className="w-full max-w-lg bg-white border border-[#ebdcb9] rounded-2xl md:rounded-3xl shadow-2xl gold-glow overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#fbf9f2] border-b border-[#ebdcb9]/60">
          <div className="flex items-center space-x-2 text-[#aa843d]">
            <Settings className="w-5 h-5" />
            <h3 className="font-sans font-bold text-base tracking-wide text-[#5c4a37]">Preferences & Settings</h3>
          </div>
          <button 
            id="close-preference-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c7456] hover:text-[#2c251d] hover:bg-[#faf6ed] transition-colors cursor-pointer border border-[#ebdcb9]"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* 1. Translation Visibility Controls (English / Bangla / Both Off) */}
          <div className="space-y-3 p-4 bg-[#faf8f4] rounded-2xl border border-[#ebdcb9]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5c4a37] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#aa843d]" />
                <span>Translation Visibility Options</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ showEnglishTranslation: true, showSecondaryTranslation: true })}
                  className="text-[10px] font-bold text-[#aa843d] hover:underline cursor-pointer"
                >
                  Both On
                </button>
                <span className="text-[#8c7456]">·</span>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ showEnglishTranslation: false, showSecondaryTranslation: false })}
                  className="text-[10px] font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  Both Off (Arabic Only)
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#8c7456] leading-relaxed">
              Choose which translations to display, or turn both off for an authentic pure Arabic Quran recitation view.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* English Toggle */}
              <button
                type="button"
                onClick={() => onUpdatePreferences({ showEnglishTranslation: !showEnglish })}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  showEnglish 
                    ? "bg-white border-[#aa843d] text-[#aa843d] shadow-2xs" 
                    : "bg-[#f5eedc]/50 border-[#ebdcb9] text-[#8c7456]"
                }`}
              >
                <span>English Text</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#faf8f4] border border-[#ebdcb9]">
                  {showEnglish ? "Shown" : "Hidden"}
                </span>
              </button>

              {/* Bangla / Secondary Toggle */}
              <button
                type="button"
                onClick={() => onUpdatePreferences({ showSecondaryTranslation: !showSecondary })}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  showSecondary 
                    ? "bg-white border-[#aa843d] text-[#aa843d] shadow-2xs" 
                    : "bg-[#f5eedc]/50 border-[#ebdcb9] text-[#8c7456]"
                }`}
              >
                <span>Second (Bangla)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#faf8f4] border border-[#ebdcb9]">
                  {showSecondary ? "Shown" : "Hidden"}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Arabic Font Size with Small option */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#5c4a37] uppercase tracking-wider">
              <Type className="w-3.5 h-3.5 text-[#aa843d]" />
              <span>Arabic Calligraphy Scale</span>
            </label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {fontSizes.map((sz) => {
                const isSelected = currentFontSize === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => onUpdatePreferences({ arabicFontSize: sz.id })}
                    className={`py-2 px-2 rounded-xl border text-xs text-center transition-all cursor-pointer font-semibold ${
                      isSelected
                        ? "border-[#aa843d] ring-1 ring-[#aa843d] bg-[#faf6ed] text-[#aa843d]"
                        : "border-[#ebdcb9] hover:border-[#aa843d]/60 bg-white text-[#524430]"
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Automatic Audio Recitation Toggle (PREVIOUS VERSION IOS-STYLE SWITCH) */}
          <div className="flex items-center justify-between p-4 bg-[#faf8f4] rounded-2xl border border-[#ebdcb9]">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-[#5c4a37] block">
                Automatic Audio Recitation
              </span>
              <p className="text-[11px] text-[#8c7456] leading-relaxed">
                Play recitation automatically by default when discovering a new verse.
              </p>
            </div>
            <button
              id="toggle-audio-pref-btn"
              type="button"
              onClick={() => onUpdatePreferences({ audioEnabled: !preferences.audioEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                preferences.audioEnabled ? "bg-[#c5a059]" : "bg-gray-300"
              }`}
              aria-label="Toggle auto audio recitation"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                  preferences.audioEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* 4. Primary English Translation Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-[#5c4a37] uppercase tracking-wider">
              <span>Primary English Translation Edition</span>
            </label>
            <select
              id="primary-translation-select"
              value={preferences.primaryTranslation}
              onChange={(e) => onUpdatePreferences({ primaryTranslation: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#faf8f4] border border-[#ebdcb9] focus:border-[#aa843d] text-[#2c251d] rounded-xl outline-none cursor-pointer text-xs"
            >
              {PRIMARY_TRANSLATIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.author})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Secondary Translation Language Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5c4a37] uppercase tracking-wider">
              Secondary Translation Language (Bangla, Urdu, etc.)
            </label>
            <select
              id="secondary-translation-select"
              value={preferences.secondaryLanguage}
              onChange={(e) => onUpdatePreferences({ secondaryLanguage: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#faf8f4] border border-[#ebdcb9] focus:border-[#aa843d] text-[#2c251d] rounded-xl outline-none cursor-pointer text-xs"
            >
              {SECONDARY_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Theme Aesthetic Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#5c4a37] uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-[#aa843d]" />
              <span>Aesthetic Color Palette</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {themes.map((th) => {
                const isSelected = currentTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => onUpdatePreferences({ theme: th.id })}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#aa843d] ring-1 ring-[#aa843d] bg-[#faf6ed] font-bold text-[#aa843d]"
                        : "border-[#ebdcb9] hover:border-[#aa843d]/60 bg-white text-[#524430]"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${th.preview} shadow-xs`}>
                      {isSelected ? "✓" : ""}
                    </div>
                    <span className="text-[11px] text-center leading-tight">
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fbf9f2] border-t border-[#ebdcb9]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#c5a059] hover:bg-[#aa843d] text-white transition-colors cursor-pointer shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
