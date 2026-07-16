import React, { useState, useRef } from "react";
import { MOODS_LIST, MoodInfo, MoodPreset } from "../moodData";
import { AyahApiResponse, GeminiReflection, UserPreferences } from "../types";
import { Sparkles, Heart, RefreshCw, BookOpen, ArrowRight, HelpCircle, AlertCircle, Quote } from "lucide-react";

interface MoodPortalProps {
  onSelectAyah: (surahNum: number, ayahNum: number) => void;
  currentAyah: AyahApiResponse | null;
  currentReflection: GeminiReflection | null;
  isLoading: boolean;
  isReflectionLoading: boolean;
  preferences: UserPreferences;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
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
      // Prevent picking the exact same ayah twice in a row
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
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Introduction Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pb-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#f5eedc] text-[#aa843d] rounded-full text-xs font-bold border border-[#ebdcb9] shadow-sm uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-[#aa843d]/10" />
          <span>Spiritual Remedy Deck</span>
        </div>
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#aa843d]">
          How does your heart feel today?
        </h2>
        <p className="text-xs md:text-sm text-[#8c7456] leading-relaxed">
          The Quran offers ultimate solace and light for every emotional state. Select your current mood below to retrieve a tailored divine prescription, translation, and live AI reflection.
        </p>
      </div>

      {/* Mood Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOODS_LIST.map((mood) => {
          const isActive = activeMoodId === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                isActive
                  ? "bg-white border-[#aa843d] ring-2 ring-[#aa843d]/20 shadow-md transform -translate-y-0.5"
                  : mood.color + " border-[#ebdcb9]/40 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl" role="img" aria-label={mood.name}>
                    {mood.emoji}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#aa843d] text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-sans font-bold text-sm text-[#2c251d]">
                  {mood.name}
                </h3>
                <p className="text-xs text-[#5c4a37]/80 font-medium leading-relaxed">
                  {mood.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#ebdcb9]/20 text-[10px] font-bold uppercase tracking-wider text-[#aa843d]">
                <span>{mood.presets.length} Prescribed Verses</span>
                <span className="flex items-center gap-1">
                  Seek Remedy <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Prescription Panel */}
      {activeMood && (
        <div className="bg-white border border-[#ebdcb9] rounded-3xl p-6 md:p-8 shadow-xl space-y-6 md:space-y-8 animate-fade-in">
          {/* Prescription Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdcb9]/40 pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-[#faf8f4] border border-[#ebdcb9] rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                {activeMood.emoji}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#aa843d] uppercase tracking-widest block">
                  Active Divine Prescription
                </span>
                <h4 className="font-serif font-bold text-lg text-[#2c251d]">
                  Solace for: <span className="text-[#aa843d]">{activeMood.name}</span>
                </h4>
              </div>
            </div>

            <button
              onClick={() => triggerRandomPreset(activeMood)}
              disabled={isLoading}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#f5eedc] hover:bg-[#ebdcb9] text-[#7d5d21] disabled:opacity-50 font-sans font-bold text-xs rounded-xl transition-all border border-[#ebdcb9] cursor-pointer shadow-sm self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Get Another Remedy Verse</span>
            </button>
          </div>

          {/* Active Verse Presentation */}
          {isLoading ? (
            <div className="py-12 space-y-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[#aa843d] animate-spin"></div>
              <p className="text-xs font-semibold text-[#8c7456] tracking-wide animate-pulse">
                Consulting Quran database & retrieving remedy...
              </p>
            </div>
          ) : currentAyah ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: Quran Verse text (Arabic & Translation) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#faf8f4] border border-[#ebdcb9]/60 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-4 left-4 text-xs font-mono font-bold text-[#aa843d]/40">
                    VERSE PRESCRIPTION
                  </div>
                  <Quote className="absolute right-4 top-4 w-12 h-12 text-[#ebdcb9]/20" />

                  <div className="space-y-6 pt-4">
                    {/* Arabic Text */}
                    <div className="text-right leading-loose font-arabic text-2xl md:text-3xl text-[#7d5d21] font-medium tracking-wide" dir="rtl">
                      {currentAyah.arabic.text}
                    </div>

                    {/* Primary English Translation */}
                    <div className="space-y-2 border-t border-[#ebdcb9]/40 pt-4">
                      <div className="text-xs font-bold uppercase text-[#aa843d] tracking-wider flex items-center justify-between">
                        <span>Translation ({currentAyah.primary.edition.name})</span>
                        <span className="font-mono text-[10px] text-[#8c7456]">
                          {currentAyah.arabic.surah.englishName} [{currentAyah.arabic.surah.number}:{currentAyah.arabic.numberInSurah}]
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-[#3c3226] leading-relaxed italic font-normal">
                        "{currentAyah.primary.text}"
                      </p>
                    </div>

                    {/* Secondary Language if configured */}
                    {currentAyah.secondary && (
                      <div className="space-y-1.5 border-t border-[#ebdcb9]/40 pt-4">
                        <span className="text-[10px] font-bold uppercase text-[#8c7456] tracking-wider block">
                          Second Translation ({currentAyah.secondary.edition.name})
                        </span>
                        <p className="text-xs md:text-sm text-[#4c3e30] leading-relaxed">
                          {currentAyah.secondary.text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Metadata Box */}
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex gap-3">
                  <BookOpen className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-emerald-900 uppercase">Surah Reference Details</h5>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      This verse resides in <strong>Surah {currentAyah.arabic.surah.englishName} ({currentAyah.arabic.surah.name})</strong>, Chapter {currentAyah.arabic.surah.number}, Verse {currentAyah.arabic.numberInSurah}. In total, this chapter consists of {currentAyah.arabic.surah.numberOfAyahs} verses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Live AI Reflection Summary */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-[#ebdcb9] rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center space-x-2 text-[#aa843d]">
                    <Sparkles className="w-4 h-4" />
                    <h5 className="font-sans font-bold text-xs uppercase tracking-wider">Divine Spiritual Remedy</h5>
                  </div>

                  {isReflectionLoading ? (
                    <div className="py-12 space-y-3 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#aa843d] animate-spin"></div>
                      <p className="text-[11px] font-semibold text-[#8c7456] tracking-wide animate-pulse">
                        Generating spiritual remedy reflection...
                      </p>
                    </div>
                  ) : currentReflection ? (
                    <div className="space-y-5 divide-y divide-[#ebdcb9]/40 text-xs text-[#3c3226] leading-relaxed">
                      {/* Context */}
                      <div className="space-y-1.5 pb-4">
                        <span className="font-bold text-[#8c7456] uppercase text-[9px] tracking-wider block">Context & Significance</span>
                        <p className="font-medium text-[#4c3e30]">{currentReflection.context}</p>
                      </div>

                      {/* Spiritual Remedy / Practical insight */}
                      <div className="space-y-1.5 py-4">
                        <span className="font-bold text-[#aa843d] uppercase text-[9px] tracking-wider block">Heart Healing & Reflection</span>
                        <p className="font-semibold text-[#2c251d] text-xs leading-relaxed bg-[#fbf9f2] p-3 rounded-xl border border-[#ebdcb9]/30">
                          {currentReflection.reflection}
                        </p>
                      </div>

                      {/* Tafsir Brief */}
                      <div className="space-y-1.5 pt-4">
                        <span className="font-bold text-[#8c7456] uppercase text-[9px] tracking-wider block">Brief Commentary / Meaning</span>
                        <p className="text-[#4c3e30] font-medium">{currentReflection.explanation}</p>
                      </div>

                      {/* Keywords */}
                      {currentReflection.keywords && currentReflection.keywords.length > 0 && (
                        <div className="pt-4 space-y-1.5 border-t border-[#ebdcb9]/40">
                          <span className="font-bold text-[#8c7456] uppercase text-[9px] tracking-wider block">Thematic Tags</span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {currentReflection.keywords.map((kw, i) => (
                              <span 
                                key={i} 
                                className="px-2.5 py-1 bg-[#faf8f4] border border-[#ebdcb9] text-[#aa843d] rounded-full text-[10px] font-bold"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-2">
                      <AlertCircle className="w-5 h-5 text-amber-700" />
                      <p className="text-xs font-semibold text-amber-900">No active interpretation found.</p>
                      <p className="text-[10px] text-amber-800">Please try requesting another verse remedy.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#8c7456] font-medium bg-[#faf8f4] rounded-2xl border border-[#ebdcb9]/40">
              Please click the "Get Remedy Verse" button above to prescribe your verse.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
