import React, { useState, useRef, useEffect } from "react";
import { AyahApiResponse } from "../types";
import { PRIMARY_TRANSLATIONS, SECONDARY_LANGUAGES } from "../translationOptions";
import { Share2, Bookmark, BookmarkCheck, Play, Square, Loader2, Copy, Check, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
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
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { arabic, primary, secondary } = ayah;

  // Resolve translator names
  const primaryTranslator = PRIMARY_TRANSLATIONS.find(t => t.id === primaryTranslationId)?.author || "Translator";
  const secondaryTranslator = SECONDARY_LANGUAGES.find(l => l.id === secondaryLanguageId)?.name || "Translation";

  // Audio configuration using absolute ayah number (1 to 6236)
  const ayahAbsoluteNumber = arabic.number;
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahAbsoluteNumber}.mp3`;

  // Autoplay and audio element handling
  useEffect(() => {
    // Stop any existing audio
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
${arabic.surah.englishName} - Verse ${arabic.numberInSurah}

﴾ ${arabic.text} ﴿

English Translation (${primaryTranslator}):
"${primary.text}"

${secondary ? `Additional Translation (${secondaryTranslator}):\n"${secondary.text}"\n` : ''}
Surah: ${arabic.surah.englishName} (Chapter ${arabic.surah.number})
Total Ayahs in this Surah: ${arabic.surah.numberOfAyahs}
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

  // Helper functions to navigate ayahs inside the app
  const loadPreviousVerse = () => {
    const currentSurahNum = arabic.surah.number;
    const currentAyahNum = arabic.numberInSurah;

    if (currentAyahNum > 1) {
      onFetchSpecific(currentSurahNum, currentAyahNum - 1);
    } else {
      // Go to previous surah
      let targetSurahNum = currentSurahNum - 1;
      if (targetSurahNum < 1) {
        targetSurahNum = 114; // Wrap around to An-Nas
      }
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
      // Go to next surah
      let targetSurahNum = currentSurahNum + 1;
      if (targetSurahNum > 114) {
        targetSurahNum = 1; // Wrap around to Al-Fatihah
      }
      onFetchSpecific(targetSurahNum, 1);
    }
  };

  return (
    <div 
      id="ayah-card-container"
      className="w-full max-w-2xl bg-white border border-[#ebdcb9] rounded-3xl shadow-lg overflow-hidden gold-glow relative transition-all duration-300 hover:border-[#c5a059] flex flex-col"
    >
      {/* Visual background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c5a059]/5 rounded-tr-full pointer-events-none" />

      {/* 📖 Header */}
      <div className="flex items-center justify-center py-4 bg-[#fbf9f2] border-b border-[#ebdcb9]/60 text-[#aa843d] relative">
        <span className="text-xl mr-2">🕌</span>
        <h2 className="font-sans font-bold tracking-widest text-xs uppercase">
          Random Ayah Picker
        </h2>
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
        </div>

        {/* ﴾ Arabic Text Here ﴿ */}
        <div className="my-4 py-6 flex flex-col items-center justify-center bg-[#faf8f4] rounded-2xl p-4 border border-[#ebdcb9]/40">
          <p 
            id="arabic-verse-text"
            dir="rtl" 
            className="font-arabic text-3xl md:text-4xl leading-loose font-medium text-[#7d5d21] text-center tracking-wide px-4 selection:bg-[#ebdcb9]/40"
          >
            {arabic.text}
          </p>
        </div>

        <div className="border-t border-[#ebdcb9]/40 my-2" />

        {/* English Translation Section */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8c7456]">
            English Translation:
          </h4>
          <p className="font-display text-lg md:text-xl text-[#3c3226] leading-relaxed italic font-normal selection:bg-[#ebdcb9]/40">
            "{primary.text}"
          </p>
          <p className="text-[11px] text-[#8c7456] text-right font-medium italic">
            — {primaryTranslator}
          </p>
        </div>

        {/* Additional Translation Section (Only if enabled) */}
        {secondary && secondaryLanguageId !== "none" && (
          <>
            <div className="border-t border-[#ebdcb9]/40 my-2" />
            <div className="space-y-1.5">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8c7456]">
                Translation ({SECONDARY_LANGUAGES.find(l => l.id === secondaryLanguageId)?.language}):
              </h4>
              <p className={`text-base text-[#3c3226] leading-relaxed selection:bg-[#ebdcb9]/40 ${secondaryLanguageId.startsWith("bn") ? "font-bangla font-medium text-lg text-[#26211a]" : "italic"}`}>
                "{secondary.text}"
              </p>
              <p className="text-[11px] text-[#8c7456] text-right font-medium italic">
                — {secondaryTranslator}
              </p>
            </div>
          </>
        )}

        <div className="border-t border-[#ebdcb9]/40 my-2" />

        {/* Continue Reading Action Button & Chapter Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-[#8c7456] space-y-1">
            <div>
              <span className="font-semibold text-[#5c4a37]">Surah:</span> {arabic.surah.englishName} ({arabic.surah.name}) • Chapter {arabic.surah.number}
            </div>
            <div>
              <span className="font-semibold text-[#5c4a37]">Verse Position:</span> {arabic.numberInSurah} of {arabic.surah.numberOfAyahs}
            </div>
          </div>

          {/* Inline Navigation Buttons */}
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

      {/* Button Controls Footer */}
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

        {/* Get Another Ayah (Next Random) */}
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

