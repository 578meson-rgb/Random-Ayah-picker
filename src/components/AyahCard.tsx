import React, { useState, useRef, useEffect } from "react";
import { AyahApiResponse } from "../types";
import { PRIMARY_TRANSLATIONS, SECONDARY_LANGUAGES } from "../translationOptions";
import { 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Play, 
  Square, 
  Loader2, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { SURAH_LIST } from "../surahData";

interface AyahCardProps {
  ayah: AyahApiResponse;
  primaryTranslationId: string;
  secondaryLanguageId: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onFetchRandom: () => void;
  onFetchSpecific: (surahNum: number, ayahNum: number) => void;
  isLoading: boolean;
  autoPlayAudio: boolean;
  arabicFontSize?: "small" | "medium" | "large" | "xlarge";
  onCycleFontSize?: () => void;
  showEnglishTranslation?: boolean;
  showSecondaryTranslation?: boolean;
  onToggleEnglishTranslation?: () => void;
  onToggleSecondaryTranslation?: () => void;
}

export const AyahCard: React.FC<AyahCardProps> = ({
  ayah,
  primaryTranslationId,
  secondaryLanguageId,
  isBookmarked,
  onToggleBookmark,
  onFetchRandom,
  onFetchSpecific,
  isLoading,
  autoPlayAudio,
  arabicFontSize = "large",
  onCycleFontSize,
  showEnglishTranslation = true,
  showSecondaryTranslation = true,
  onToggleEnglishTranslation,
  onToggleSecondaryTranslation,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { arabic, primary, secondary } = ayah;

  // Resolve translator names
  const primaryTranslator = PRIMARY_TRANSLATIONS.find(t => t.id === primaryTranslationId)?.author || "Translator";
  const secondaryTranslator = SECONDARY_LANGUAGES.find(l => l.id === secondaryLanguageId)?.name || "Translation";
  const secondaryLangName = SECONDARY_LANGUAGES.find(l => l.id === secondaryLanguageId)?.language || "Translation";

  // Audio configuration using absolute ayah number (1 to 6236)
  const ayahAbsoluteNumber = arabic.number;
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahAbsoluteNumber}.mp3`;

  // Autoplay and audio element handling
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setIsAudioLoading(false);
    }

    if (autoPlayAudio && !isLoading) {
      playRecitation();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [ayahAbsoluteNumber, isLoading]);

  const playRecitation = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    setIsAudioLoading(true);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setIsAudioLoading(false);
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Audio playback error:", e);
        setIsAudioLoading(false);
      });
    };

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      console.error("Audio failed to load");
      setIsAudioLoading(false);
      setIsPlaying(false);
      audioRef.current = null;
    };
  };

  const handleCopyText = () => {
    const shareText = `📖 RANDOM AYAH PICKER
───────────────────────────────
${arabic.surah.englishName} (${arabic.surah.name}) - Verse ${arabic.numberInSurah}

﴾ ${arabic.text} ﴿

${showEnglishTranslation ? `English Translation (${primaryTranslator}):\n"${primary.text}"\n\n` : ''}${
  showSecondaryTranslation && secondary ? `Translation (${secondaryTranslator}):\n"${secondary.text}"\n\n` : ''
}Surah: ${arabic.surah.englishName} (Chapter ${arabic.surah.number})
Verse Position: ${arabic.numberInSurah} of ${arabic.surah.numberOfAyahs}
Shared from Random Ayah Picker.`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  };

  const handleNativeShare = () => {
    const shareData = {
      title: `Random Ayah Picker: ${arabic.surah.englishName} [${arabic.surah.number}:${arabic.numberInSurah}]`,
      text: `﴾ ${arabic.text} ﴿\n\n"${primary.text}" - ${primaryTranslator}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => console.warn("Native share cancelled or failed:", err));
    } else {
      handleCopyText();
    }
  };

  const loadPreviousVerse = () => {
    const currentSurahNum = arabic.surah.number;
    const currentAyahNum = arabic.numberInSurah;

    if (currentAyahNum > 1) {
      onFetchSpecific(currentSurahNum, currentAyahNum - 1);
    } else {
      let targetSurahNum = currentSurahNum - 1;
      if (targetSurahNum < 1) targetSurahNum = 114;
      const targetSurahMeta = SURAH_LIST.find(s => s.number === targetSurahNum);
      if (targetSurahMeta) {
        onFetchSpecific(targetSurahNum, targetSurahMeta.numberOfAyahs);
      }
    }
  };

  const loadNextVerse = () => {
    const currentSurahNum = arabic.surah.number;
    const currentAyahNum = arabic.numberInSurah;

    if (currentAyahNum < arabic.surah.numberOfAyahs) {
      onFetchSpecific(currentSurahNum, currentAyahNum + 1);
    } else {
      let targetSurahNum = currentSurahNum + 1;
      if (targetSurahNum > 114) targetSurahNum = 1;
      onFetchSpecific(targetSurahNum, 1);
    }
  };

  // Font size classes including small
  const fontSizes = {
    small: "text-xl md:text-2xl leading-[2.3]",
    medium: "text-2xl md:text-3xl leading-[2.5]",
    large: "text-3xl md:text-4xl lg:text-[2.65rem] leading-[2.7]",
    xlarge: "text-4xl md:text-5xl leading-[2.9]"
  };

  const fontSizeLabels: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    xlarge: "Extra Large"
  };

  const hasAnyTranslationActive = showEnglishTranslation || (showSecondaryTranslation && secondary && secondaryLanguageId !== "none");

  return (
    <div 
      id="ayah-card-container"
      className="w-full max-w-2xl bg-white border border-[#ebdcb9] rounded-3xl shadow-lg overflow-hidden gold-glow relative transition-all duration-300 hover:border-[#c5a059] flex flex-col"
    >
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c5a059]/5 rounded-tr-full pointer-events-none" />

      {/* 📖 Header with Juz and font size control */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#fbf9f2] border-b border-[#ebdcb9]/60 text-[#aa843d] relative">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕌</span>
          <h2 className="font-sans font-bold tracking-widest text-xs uppercase">
            Random Ayah Picker
          </h2>
          {arabic.juz && (
            <span className="text-[11px] font-sans font-medium text-[#8c7456] hidden sm:inline">
              • Juz {arabic.juz}
            </span>
          )}
        </div>

        {/* Font size badge button */}
        {onCycleFontSize && (
          <button
            onClick={onCycleFontSize}
            className="text-[11px] font-bold text-[#8c7456] hover:text-[#524430] bg-[#faf8f4] border border-[#ebdcb9] px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Click to cycle Arabic text size"
          >
            Font: <span className="text-[#aa843d]">{fontSizeLabels[arabicFontSize]}</span>
          </button>
        )}
      </div>

      {/* Main content body */}
      <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-6">
        
        {/* SURAH NAME - Verse [Number] */}
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-widest text-[#8c7456] font-semibold block mb-1">
            Now Reflecting
          </span>
          <h3 className="font-display font-medium text-2xl text-[#2c251d] tracking-normal">
            {arabic.surah.englishName} <span className="text-[#c5a059] font-sans">/</span> Verse {arabic.numberInSurah}
          </h3>
          <p className="text-xs text-[#8c7456] font-medium font-serif mt-0.5">
            {arabic.surah.englishNameTranslation}
          </p>
        </div>

        {/* ﴾ Arabic Text Here ﴿ */}
        <div className="my-2 py-5 flex flex-col items-center justify-center bg-[#faf8f4] rounded-2xl p-4 md:p-6 border border-[#ebdcb9]/40 relative">
          <p 
            id="arabic-verse-text"
            dir="rtl" 
            className={`font-arabic ${fontSizes[arabicFontSize]} text-[#7d5d21] text-center tracking-wide px-2 selection:bg-[#ebdcb9]/40 font-medium`}
          >
            {arabic.text}
            <span className="inline-flex items-center justify-center text-[#c5a059] mx-1 text-2xl" aria-label="End of verse">
              {' '}۝
            </span>
          </p>
        </div>

        {/* Translation Visibility Controls Bar */}
        <div className="flex items-center justify-between text-xs py-1 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7456]">
            Translations:
          </span>
          <div className="flex items-center gap-2">
            {onToggleEnglishTranslation && (
              <button
                onClick={onToggleEnglishTranslation}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  showEnglishTranslation 
                    ? "bg-[#faf6ed] text-[#aa843d] border-[#aa843d]" 
                    : "bg-[#faf8f4] text-[#8c7456] border-[#ebdcb9] opacity-75"
                }`}
                title="Toggle English Translation"
              >
                {showEnglishTranslation ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>English: {showEnglishTranslation ? "On" : "Off"}</span>
              </button>
            )}

            {secondary && secondaryLanguageId !== "none" && onToggleSecondaryTranslation && (
              <button
                onClick={onToggleSecondaryTranslation}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  showSecondaryTranslation 
                    ? "bg-[#faf6ed] text-[#aa843d] border-[#aa843d]" 
                    : "bg-[#faf8f4] text-[#8c7456] border-[#ebdcb9] opacity-75"
                }`}
                title={`Toggle ${secondaryLangName} Translation`}
              >
                {showSecondaryTranslation ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{secondaryLangName}: {showSecondaryTranslation ? "On" : "Off"}</span>
              </button>
            )}
          </div>
        </div>

        {/* English Translation Section */}
        {showEnglishTranslation && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8c7456]">
                English Translation:
              </h4>
              <span className="text-[10px] text-[#8c7456] font-medium italic">
                — {primaryTranslator}
              </span>
            </div>
            <p className="font-display text-sm md:text-base text-[#3c3226] leading-relaxed italic font-normal selection:bg-[#ebdcb9]/40">
              "{primary.text}"
            </p>
          </div>
        )}

        {/* Additional Translation Section (Only if enabled) */}
        {showSecondaryTranslation && secondary && secondaryLanguageId !== "none" && (
          <>
            {showEnglishTranslation && <div className="border-t border-[#ebdcb9]/40 my-1" />}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8c7456]">
                  Translation ({secondaryLangName}):
                </h4>
                <span className="text-[10px] text-[#8c7456] font-medium italic">
                  — {secondaryTranslator}
                </span>
              </div>
              <p className={`text-xs md:text-sm text-[#3c3226] leading-relaxed selection:bg-[#ebdcb9]/40 ${
                secondaryLanguageId.startsWith("bn") ? "font-bangla font-medium text-sm md:text-base text-[#26211a]" : "italic"
              }`}>
                "{secondary.text}"
              </p>
            </div>
          </>
        )}

        {/* When both translations are hidden (Arabic Only Quran Mode) */}
        {!hasAnyTranslationActive && (
          <div className="text-center py-4 px-3 bg-[#faf8f4] border border-dashed border-[#ebdcb9] rounded-xl text-xs text-[#8c7456]">
            <span>✨ Pure Arabic recitation view (Translations hidden). </span>
            {onToggleEnglishTranslation && (
              <button 
                onClick={onToggleEnglishTranslation} 
                className="text-[#aa843d] font-bold hover:underline ml-1 cursor-pointer"
              >
                Show English
              </button>
            )}
          </div>
        )}

        <div className="border-t border-[#ebdcb9]/40 my-2" />

        {/* EXACT PREVIOUS LAYOUT: Chapter Details on left, < Prev Verse and Next Verse > on right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-[#8c7456] space-y-1">
            <div>
              <span className="font-semibold text-[#5c4a37]">Surah:</span> {arabic.surah.englishName} ({arabic.surah.name}) • Chapter {arabic.surah.number}
            </div>
            <div>
              <span className="font-semibold text-[#5c4a37]">Verse Position:</span> {arabic.numberInSurah} of {arabic.surah.numberOfAyahs}
              {arabic.juz && <span className="ml-2 font-normal text-[#8c7456]">• Juz {arabic.juz}</span>}
            </div>
          </div>

          {/* Inline Navigation Buttons matching the user's screenshot */}
          <div className="flex items-center gap-2">
            <button
              id="prev-ayah-btn"
              onClick={loadPreviousVerse}
              disabled={isLoading}
              className="inline-flex items-center justify-center space-x-1 px-3.5 py-1.5 bg-[#f5eedc] hover:bg-[#ebdcb9] text-[#7d5d21] disabled:opacity-50 font-sans font-bold text-xs rounded-xl transition-all border border-[#ebdcb9] cursor-pointer"
              title="Previous Verse"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              <span>Prev Verse</span>
            </button>
            <button
              id="next-ayah-btn"
              onClick={loadNextVerse}
              disabled={isLoading}
              className="inline-flex items-center justify-center space-x-1 px-4 py-1.5 bg-[#aa843d] hover:bg-[#c5a059] text-white disabled:opacity-50 font-sans font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              title="Next Verse"
            >
              <span>Next Verse</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* EXACT PREVIOUS LAYOUT: Bottom Action Buttons Row matching screenshot */}
      <div className="bg-[#fcfbfa] p-4 md:p-6 border-t border-[#ebdcb9] flex flex-wrap gap-3 items-center justify-between">
        {/* Play Recitation, Bookmark, Copy/Share Buttons */}
        <div className="flex items-center gap-2">
          {/* Audio Player Button */}
          <button
            id="play-audio-btn"
            onClick={playRecitation}
            disabled={isLoading || isAudioLoading}
            className={`flex items-center space-x-1 px-4 py-2 bg-[#faf9f6] hover:bg-[#f5eedc] text-[#524430] rounded-xl transition-all cursor-pointer border border-[#ebdcb9] text-xs md:text-sm font-medium ${isAudioLoading ? "opacity-75" : ""}`}
            title="Listen to recitation"
          >
            {isAudioLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#aa843d]" />
                <span className="hidden xs:inline">Loading...</span>
              </>
            ) : isPlaying ? (
              <>
                <Square className="w-4 h-4 text-red-600 fill-red-600" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-[#aa843d] fill-[#aa843d]" />
                <span>Listen</span>
              </>
            )}
          </button>

          {/* Bookmark Button */}
          <button
            id="toggle-bookmark-btn"
            onClick={onToggleBookmark}
            className={`flex items-center space-x-1 px-4 py-2 rounded-xl transition-all cursor-pointer text-xs md:text-sm font-medium border ${
              isBookmarked 
                ? "bg-[#faf6ed] text-[#aa843d] border-[#aa843d]" 
                : "bg-[#faf9f6] hover:bg-[#f5eedc] text-[#524430] border-[#ebdcb9] hover:border-[#aa843d]/40"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Ayah"}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-4 h-4 fill-[#aa843d] text-[#aa843d]" />
                <span>Bookmarked</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-[#8c7456]" />
                <span>Bookmark</span>
              </>
            )}
          </button>

          {/* Share/Copy Button */}
          <button
            id="share-ayah-btn"
            onClick={handleNativeShare}
            className="flex items-center space-x-1 px-3 py-2 bg-[#faf9f6] hover:bg-[#f5eedc] text-[#524430] rounded-xl transition-all cursor-pointer border border-[#ebdcb9] text-xs md:text-sm"
            title="Share this Ayah"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="hidden xs:inline">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#aa843d]" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Pick Random Ayah (Next Random) matching screenshot */}
        <button
          id="fetch-random-ayah-btn"
          onClick={onFetchRandom}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-[#c5a059] hover:bg-[#aa843d] text-white font-sans font-bold rounded-xl transition-all cursor-pointer shadow-md text-sm disabled:opacity-50 active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Seeking Verse...</span>
            </>
          ) : (
            <>
              <span>Pick Random Ayah</span>
              <span className="text-base font-normal">✨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
