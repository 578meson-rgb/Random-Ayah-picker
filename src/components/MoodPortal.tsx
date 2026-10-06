import React, { useState, useRef } from "react";
import { MOODS_LIST, MoodInfo } from "../moodData";
import { AyahApiResponse, GeminiReflection, UserPreferences } from "../types";
import { Sparkles, Heart, RefreshCw, BookOpen, ArrowRight, AlertCircle, Quote } from "lucide-react";

interface MoodPortalProps {
  onSelectAyah: (surahNum: number, ayahNum: number) => void;
  currentAyah: AyahApiResponse | null;
  currentReflection: GeminiReflection | null;
  isLoading: boolean;
  isReflectionLoading: boolean;
  preferences: UserPreferences;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
  reflectionError?: string | null;
}

export const MoodPortal: React.FC<MoodPortalProps> = ({
  onSelectAyah,
  currentAyah,
  currentReflection,
  isLoading,
  isReflectionLoading,
  preferences,
  onToggleBookmark,
  isBookmarked,
  reflectionError,
}) => {
  const [activeMoodId, setActiveMoodId] = useState<string | null>(null);
  const lastSelectedPresetRef = useRef<{ [key: string]: number }>({});

  const activeMood = MOODS_LIST.find((m) => m.id === activeMoodId);

  const handleMoodSelect = (mood: MoodInfo) => {
    setActiveMoodId(mood.id);
    triggerRandomPreset(mood);
  };

  const triggerRandomPreset = (mood: MoodInfo) => {
    const presets = mood.presets;
    if (presets.length === 0) return;

    let selectedIndex = 0;
    const lastIndex = lastSelectedPresetRef.current[mood.id];

    if (presets.length > 1) {
      do {
        selectedIndex = Math.floor(Math.random() * presets.length);
      } while (selectedIndex === lastIndex);
    } else {
      selectedIndex = 0;
    }

    lastSelectedPresetRef.current[mood.id] = selectedIndex;
    const chosenPreset = presets[selectedIndex];
    onSelectAyah(chosenPreset.surah, chosenPreset.ayah);
  };

  return (
    <section className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in text-left">
      {/* 1. Curatorial Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
          <Heart className="w-3.5 h-3.5 fill-current opacity-80" />
          <span>Remedies for the Soul</span>
        </div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-[var(--color-text-main)]">
          How Does Your Heart Feel Today?
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed font-serif italic max-w-xl mx-auto">
          "Unquestionably, by the remembrance of Allah hearts find rest." — Ar-Ra'd [13:28].
          Select your current emotional state to receive a prescribed divine verse, scholarly translation, and contemplative reflection.
        </p>
      </div>

      {/* 2. Curated Mood Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOODS_LIST.map((mood) => {
          const isActive = activeMoodId === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 bg-[var(--color-surface)] ${
                isActive
                  ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] shadow-md"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:shadow-sm"
              }`}
            >
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-arabic text-2xl text-[var(--color-text-arabic)] font-medium">
                    {mood.arabicTerm}
                  </span>
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">
                    {mood.transliteration}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-base text-[var(--color-text-main)] flex items-center gap-2">
                    <span>{mood.emoji}</span>
                    <span>{mood.name}</span>
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-1">
                    {mood.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-accent)] font-medium">
                <span>{mood.presets.length} Verses</span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Seek Remedy <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Active Remedy Prescription Display */}
      {activeMood && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl p-6 md:p-8 mushaf-glow space-y-6 md:space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center text-2xl">
                {activeMood.emoji}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold block">
                  Active Divine Prescription
                </span>
                <h4 className="font-display font-semibold text-lg text-[var(--color-text-main)]">
                  Remedy for <span className="text-[var(--color-accent)]">{activeMood.name}</span> ({activeMood.arabicTerm})
                </h4>
              </div>
            </div>

            <button
              onClick={() => triggerRandomPreset(activeMood)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors cursor-pointer self-start md:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--color-accent)] ${isLoading ? "animate-spin" : ""}`} />
              <span>Alternate Verse Remedy</span>
            </button>
          </div>

          {/* Active Verse Content */}
          {isLoading ? (
            <div className="py-16 space-y-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[var(--color-accent)] animate-spin"></div>
              <p className="text-xs text-[var(--color-text-muted)] font-serif italic">
                Retrieving Quranic remedy...
              </p>
            </div>
          ) : currentAyah ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Verse Display */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl p-6 relative manuscript-frame">
                  <div className="space-y-6">
                    {/* Arabic Text */}
                    <div 
                      dir="rtl" 
                      className="font-arabic text-3xl md:text-4xl text-[var(--color-text-arabic)] text-center leading-[2.6] px-2 selection:bg-[var(--color-accent)]/20"
                    >
                      {currentAyah.arabic.text} ۝
                    </div>

                    {/* Primary Translation */}
                    {preferences.showEnglishTranslation !== false && (
                      <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
                        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                          <span className="font-semibold text-[var(--color-accent)]">
                            Surah {currentAyah.arabic.surah.englishName} [{currentAyah.arabic.surah.number}:{currentAyah.arabic.numberInSurah}]
                          </span>
                          <span className="italic">{currentAyah.primary.edition.name}</span>
                        </div>
                        <p className="font-serif text-base text-[var(--color-text-main)] leading-relaxed italic">
                          "{currentAyah.primary.text}"
                        </p>
                      </div>
                    )}

                    {/* Secondary Translation */}
                    {preferences.showSecondaryTranslation !== false && currentAyah.secondary && (
                      <div className="border-t border-[var(--color-border)] pt-3 space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)]">
                          {currentAyah.secondary.edition.name}
                        </span>
                        <p className="text-xs md:text-sm text-[var(--color-text-main)] leading-relaxed">
                          "{currentAyah.secondary.text}"
                        </p>
                      </div>
                    )}

                    {preferences.showEnglishTranslation === false && preferences.showSecondaryTranslation === false && (
                      <div className="pt-3 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)] italic font-serif">
                        Translations hidden (Arabic only mode). You can enable them in Preferences.
                      </div>
                    )}
                  </div>
                </div>

                {/* Chapter Reference */}
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex gap-3 text-xs text-[var(--color-text-muted)]">
                  <BookOpen className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      Surah {currentAyah.arabic.surah.englishName} ({currentAyah.arabic.surah.name})
                    </span>
                    <span> · Chapter {currentAyah.arabic.surah.number} · {currentAyah.arabic.surah.numberOfAyahs} Total Verses</span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Tafsir & Spiritual Heart Healing */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-5">
                  <div className="flex items-center space-x-2 text-[var(--color-accent)]">
                    <Sparkles className="w-4 h-4" />
                    <h5 className="font-display font-semibold text-xs uppercase tracking-wider">
                      Spiritual Tadabbur & Lesson
                    </h5>
                  </div>

                  {isReflectionLoading ? (
                    <div className="py-12 space-y-3 flex flex-col items-center justify-center text-center">
                      <div className="w-7 h-7 rounded-full border-2 border-t-transparent border-[var(--color-accent)] animate-spin"></div>
                      <p className="text-xs text-[var(--color-text-muted)] font-serif italic">
                        Composing contemplation for this remedy...
                      </p>
                    </div>
                  ) : currentReflection ? (
                    <div className="space-y-4 text-xs text-[var(--color-text-main)] leading-relaxed divide-y divide-[var(--color-border)]">
                      {/* Reflection highlight */}
                      <div className="space-y-1.5 pb-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-accent)] block">
                          Heart Medicine & Contemplation
                        </span>
                        <blockquote className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-serif text-sm italic leading-relaxed text-[var(--color-text-main)]">
                          "{currentReflection.reflection}"
                        </blockquote>
                      </div>

                      {/* Tafsir explanation */}
                      <div className="space-y-1.5 pt-3">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] block">
                          Scholarly Tafsir (Meaning)
                        </span>
                        <p className="text-[var(--color-text-muted)]">
                          {currentReflection.explanation}
                        </p>
                      </div>

                      {/* Context */}
                      <div className="space-y-1.5 pt-3">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] block">
                          Historical Revelation
                        </span>
                        <p className="text-[var(--color-text-muted)]">
                          {currentReflection.context}
                        </p>
                      </div>

                      {/* Keywords */}
                      {currentReflection.keywords && currentReflection.keywords.length > 0 && (
                        <div className="pt-3 flex flex-wrap gap-1.5">
                          {currentReflection.keywords.map((kw, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-accent)] border border-[var(--color-border)]"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : reflectionError ? (
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-900 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Reflection Service Notice</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-800">
                        {reflectionError}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      No active contemplation found. Click alternate verse above.
                    </p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[var(--color-text-muted)] font-serif italic">
              Please select a mood above to prescribe your verse.
            </div>
          )}
        </div>
      )}
    </section>
  );
};
