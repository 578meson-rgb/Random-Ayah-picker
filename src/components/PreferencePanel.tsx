import React from "react";
import { PRIMARY_TRANSLATIONS, SECONDARY_LANGUAGES } from "../translationOptions";
import { UserPreferences } from "../types";
import { Settings, Check, Volume2, VolumeX } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        id="preference-panel-card"
        className="w-full max-w-md overflow-hidden bg-white border border-[#ebdcb9] rounded-3xl shadow-2xl gold-glow animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#fbf9f2] border-b border-[#ebdcb9]/60">
          <div className="flex items-center space-x-2 text-[#aa843d]">
            <Settings className="w-5 h-5 animate-spin-slow text-[#c5a059]" />
            <h3 className="font-sans font-bold text-base tracking-wide text-[#5c4a37]">Preferences</h3>
          </div>
          <button 
            id="close-preference-btn"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-[#524430] hover:text-[#2c251d] border border-[#ebdcb9] hover:bg-[#faf6ed] rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Primary English Translation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8c7456]">
              English Translation Edition
            </label>
            <div className="relative">
              <select
                id="primary-translation-select"
                value={preferences.primaryTranslation}
                onChange={(e) => onUpdatePreferences({ primaryTranslation: e.target.value })}
                className="w-full px-4 py-3 bg-[#faf8f4] border border-[#ebdcb9] focus:border-[#aa843d] text-[#2c251d] rounded-xl outline-none appearance-none cursor-pointer transition-all focus:ring-1 focus:ring-[#aa843d] text-sm"
              >
                {PRIMARY_TRANSLATIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.author})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#aa843d]">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Secondary Translation Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8c7456]">
              Secondary Translation Language
            </label>
            <div className="relative">
              <select
                id="secondary-translation-select"
                value={preferences.secondaryLanguage}
                onChange={(e) => onUpdatePreferences({ secondaryLanguage: e.target.value })}
                className="w-full px-4 py-3 bg-[#faf8f4] border border-[#ebdcb9] focus:border-[#aa843d] text-[#2c251d] rounded-xl outline-none appearance-none cursor-pointer transition-all focus:ring-1 focus:ring-[#aa843d] text-sm"
              >
                {SECONDARY_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#aa843d]">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-[#8c7456] leading-relaxed">
              Display a translation in your native language alongside the primary English translation.
            </p>
          </div>

          {/* Audio Settings Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#faf8f4] rounded-2xl border border-[#ebdcb9]">
            <div className="flex flex-col space-y-0.5">
              <div className="flex items-center space-x-2 text-[#5c4a37]">
                {preferences.audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#aa843d]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#8c7456]" />
                )}
                <span className="text-sm font-semibold">Auto-Play Recitation</span>
              </div>
              <span className="text-[11px] text-[#8c7456]">Play recitation automatically when loaded.</span>
            </div>
            <button
              id="audio-settings-toggle-btn"
              onClick={() => onUpdatePreferences({ audioEnabled: !preferences.audioEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                preferences.audioEnabled ? "bg-[#c5a059]" : "bg-[#ebdcb9]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.audioEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#fbf9f2] border-t border-[#ebdcb9]/60 flex justify-end">
          <button
            id="preferences-save-btn"
            onClick={onClose}
            className="flex items-center space-x-1 px-5 py-2.5 bg-[#c5a059] hover:bg-[#aa843d] text-white font-sans font-bold rounded-xl transition-colors cursor-pointer text-sm shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Apply Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
