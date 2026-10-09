import React, { useState, useEffect } from "react";
import { SURAH_LIST } from "./surahData";
import { FALLBACK_VERSES } from "./fallbackData";
import { PRIMARY_TRANSLATIONS } from "./translationOptions";
import { AyahApiResponse, GeminiReflection, BookmarkedAyah, HistoryItem, UserPreferences } from "./types";
import { AyahCard } from "./components/AyahCard";
import { ReflectionsPanel } from "./components/ReflectionsPanel";
import { PreferencePanel } from "./components/PreferencePanel";
import { HistoryAndBookmarks } from "./components/HistoryAndBookmarks";
import { MoodPortal } from "./components/MoodPortal";
import { 
  Settings, 
  Search, 
  Info, 
  Compass, 
  X, 
  ArrowRight, 
  AlertTriangle,
  Heart,
  Palette
} from "lucide-react";

export default function App() {
  // 1. Core State
  const [activeTab, setActiveTab] = useState<"explore" | "mood">("explore");
  const [preferences, setPreferences] = useState<UserPreferences>({
    primaryTranslation: "en.sahih",
    secondaryLanguage: "bn.bengali",
    audioEnabled: false,
    reciter: "ar.alafasy",
    theme: "emerald",
    arabicFontSize: "small",
    showEnglishTranslation: true,
    showSecondaryTranslation: true,
  });

  const [currentAyah, setCurrentAyah] = useState<AyahApiResponse | null>(null);
  const [currentReflection, setCurrentReflection] = useState<GeminiReflection | null>(null);
  
  // Loading states
  const [isAyahLoading, setIsAyahLoading] = useState(false);
  const [isReflectionLoading, setIsReflectionLoading] = useState(false);
  
  // Error states
  const [ayahError, setAyahError] = useState<string | null>(null);
  const [reflectionError, setReflectionError] = useState<string | null>(null);

  // Lists & Storage
  const [bookmarks, setBookmarks] = useState<BookmarkedAyah[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Preferences, search, and selector UIs
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Quick selector
  const [quickSurah, setQuickSurah] = useState<number>(1);
  const [quickAyah, setQuickAyah] = useState<number>(1);

  // Rate Limiting (10 calls per minute)
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);

  // 2. Initial Mount Loader & Synchronize Theme to HTML root
  useEffect(() => {
    const savedPrefs = localStorage.getItem("quran_companion_prefs");
    let initialTheme: "emerald" | "midnight" | "sandalwood" = "emerald";
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(prev => ({
          ...prev,
          ...parsed,
          arabicFontSize: parsed.arabicFontSize || "small",
        }));
        if (parsed.theme) initialTheme = parsed.theme;
      } catch (e) {
        console.error("Failed to parse preferences from localStorage", e);
      }
    }

    document.documentElement.setAttribute("data-theme", initialTheme);

    const savedBookmarks = localStorage.getItem("quran_companion_bookmarks");
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) {}
    }
    const savedHistory = localStorage.getItem("quran_companion_history");
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }

    // Load Ayat al-Kursi as inaugural default verse
    const defaultFallback = FALLBACK_VERSES[0];
    setCurrentAyah(defaultFallback.response);
    setCurrentReflection(defaultFallback.reflection);
  }, []);

  // Sync theme changes to data-theme attribute
  useEffect(() => {
    if (preferences.theme) {
      document.documentElement.setAttribute("data-theme", preferences.theme);
    }
  }, [preferences.theme]);

  // 3. Sync Preferences to LocalStorage
  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem("quran_companion_prefs", JSON.stringify(updated));

    if (currentAyah && (newPrefs.primaryTranslation || newPrefs.secondaryLanguage)) {
      fetchSpecificAyah(
        currentAyah.arabic.surah.number, 
        currentAyah.arabic.numberInSurah,
        updated.primaryTranslation,
        updated.secondaryLanguage
      );
    }
  };

  // Cycle Theme Quick Action
  const cycleTheme = () => {
    const themeOrder: ("emerald" | "midnight" | "sandalwood")[] = ["emerald", "midnight", "sandalwood"];
    const currentIndex = themeOrder.indexOf(preferences.theme || "emerald");
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    handleUpdatePreferences({ theme: nextTheme });
  };

  // Cycle Arabic Font Size Quick Action with Small, Medium, Large, Extra Large
  const cycleArabicFontSize = () => {
    const sizes: ("small" | "medium" | "large" | "xlarge")[] = ["small", "medium", "large", "xlarge"];
    const currentIndex = sizes.indexOf(preferences.arabicFontSize || "large");
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    handleUpdatePreferences({ arabicFontSize: nextSize });
  };

  // 4. Rate-Limiting Check (10 calls per 60 seconds)
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = requestTimestamps.filter(t => t > oneMinuteAgo);
    
    if (recentRequests.length >= 10) {
      setRateLimitWarning(true);
      setTimeout(() => setRateLimitWarning(false), 8000);
      return false;
    }

    setRequestTimestamps([...recentRequests, now]);
    return true;
  };

  // 5. Fetch a Random Ayah
  const fetchRandomAyah = async () => {
    if (!checkRateLimit()) return;

    setIsAyahLoading(true);
    setAyahError(null);
    setReflectionError(null);

    try {
      const randomSurahIdx = Math.floor(Math.random() * SURAH_LIST.length);
      const selectedSurah = SURAH_LIST[randomSurahIdx];
      const randomAyahNum = Math.floor(Math.random() * selectedSurah.numberOfAyahs) + 1;

      await fetchSpecificAyah(
        selectedSurah.number, 
        randomAyahNum, 
        preferences.primaryTranslation, 
        preferences.secondaryLanguage
      );
    } catch (err: any) {
      console.error("Failed to generate random Ayah:", err);
      loadFallbackVerse();
    }
  };

  // 6. Fetch a Specific Ayah
  const fetchSpecificAyah = async (
    surahNum: number, 
    ayahNum: number,
    primaryTranslationId = preferences.primaryTranslation,
    secondaryLanguageId = preferences.secondaryLanguage
  ) => {
    setIsAyahLoading(true);
    setAyahError(null);

    try {
      const editions = ["quran-uthmani", primaryTranslationId];
      if (secondaryLanguageId !== "none") {
        editions.push(secondaryLanguageId);
      }

      const editionsString = editions.join(",");
      const apiUrl = `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/editions/${editionsString}`;

      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`Failed to load verse data (HTTP ${res.status})`);
      }

      const responseJson = await res.json();
      if (responseJson.code !== 200 || !responseJson.data || responseJson.data.length === 0) {
        throw new Error("Invalid response received from Alquran API");
      }

      const arabicData = responseJson.data.find((e: any) => e.edition.identifier === "quran-uthmani");
      const primaryData = responseJson.data.find((e: any) => e.edition.identifier === primaryTranslationId);
      const secondaryData = secondaryLanguageId !== "none" 
        ? responseJson.data.find((e: any) => e.edition.identifier === secondaryLanguageId)
        : null;

      if (!arabicData || !primaryData) {
        throw new Error("Required translation editions are missing from the response");
      }

      const structuredAyah: AyahApiResponse = {
        arabic: arabicData,
        primary: primaryData,
        secondary: secondaryData
      };

      setCurrentAyah(structuredAyah);
      setIsAyahLoading(false);

      addToHistory(surahNum, ayahNum, arabicData.surah.englishName);
      generateLiveReflection(structuredAyah, primaryTranslationId);

    } catch (err: any) {
      console.error(`Failed to fetch specific Ayah ${surahNum}:${ayahNum}:`, err);
      setAyahError(err.message || "An error occurred while communicating with the Quran database.");
      setIsAyahLoading(false);
      
      if (!currentAyah) {
        loadFallbackVerse();
      }
    }
  };

  // 7. Call local Express server to trigger Gemini reflection
  const generateLiveReflection = async (ayahData: AyahApiResponse, primaryTranslationId: string) => {
    setIsReflectionLoading(true);
    setReflectionError(null);

    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahName: ayahData.arabic.surah.englishName,
          surahNumber: ayahData.arabic.surah.number,
          ayahNumber: ayahData.arabic.numberInSurah,
          arabicText: ayahData.arabic.text,
          englishTranslation: ayahData.primary.text,
          translationEdition: PRIMARY_TRANSLATIONS.find(t => t.id === primaryTranslationId)?.name || "Sahih International"
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status} returned from reflection server`);
      }

      const reflectionData: GeminiReflection = await res.json();
      setCurrentReflection(reflectionData);
      setIsReflectionLoading(false);

    } catch (err: any) {
      console.error("Gemini reflection failed:", err);
      setReflectionError(err.message || "Failed to generate live Tafsir reflection from Gemini.");
      setIsReflectionLoading(false);
      
      const matchingFallback = FALLBACK_VERSES.find(
        f => f.response.arabic.surah.number === ayahData.arabic.surah.number && 
             f.response.arabic.numberInSurah === ayahData.arabic.numberInSurah
      );

      if (matchingFallback) {
        setCurrentReflection(matchingFallback.reflection);
      } else {
        setCurrentReflection({
          context: `This verse belongs to Surah ${ayahData.arabic.surah.englishName}.`,
          explanation: "Tafsir explanations reveal the sublime wisdom, linguistic precision, and spiritual imperatives of the Quran.",
          reflection: "Recite this verse with presence of mind. Allow its reassurance to illuminate your actions, speech, and inner tranquility today.",
          keywords: ["Guidance", "Faith", "Contemplation"]
        });
      }
    }
  };

  // 8. Add a successful fetch to Recent History (limit to 5)
  const addToHistory = (surahNumber: number, ayahNumber: number, surahEnglishName: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(
        item => !(item.surahNumber === surahNumber && item.ayahNumber === ayahNumber)
      );

      const newItem: HistoryItem = {
        surahNumber,
        ayahNumber,
        surahEnglishName,
        timestamp: Date.now()
      };

      const updated = [newItem, ...filtered].slice(0, 5);
      localStorage.setItem("quran_companion_history", JSON.stringify(updated));
      return updated;
    });
  };

  // 9. Load Fallback Verse in case of offline/network issues
  const loadFallbackVerse = () => {
    const idx = Math.floor(Math.random() * FALLBACK_VERSES.length);
    const fallbackItem = FALLBACK_VERSES[idx];
    setCurrentAyah(fallbackItem.response);
    setCurrentReflection(fallbackItem.reflection);
    setAyahError("Connecting with offline cached verse due to a temporary network issue.");
  };

  // 10. Bookmark Toggle Mechanism
  const handleToggleBookmark = () => {
    if (!currentAyah) return;

    const surahNum = currentAyah.arabic.surah.number;
    const ayahNum = currentAyah.arabic.numberInSurah;
    const exists = bookmarks.some(b => b.surahNumber === surahNum && b.ayahNumber === ayahNum);

    let updated: BookmarkedAyah[];
    if (exists) {
      updated = bookmarks.filter(b => !(b.surahNumber === surahNum && b.ayahNumber === ayahNum));
    } else {
      const newBookmark: BookmarkedAyah = {
        surahNumber: surahNum,
        ayahNumber: ayahNum,
        surahName: currentAyah.arabic.surah.name,
        surahEnglishName: currentAyah.arabic.surah.englishName,
        arabicText: currentAyah.arabic.text,
        translationText: currentAyah.primary.text,
        timestamp: Date.now()
      };
      updated = [newBookmark, ...bookmarks];
    }

    setBookmarks(updated);
    localStorage.setItem("quran_companion_bookmarks", JSON.stringify(updated));
  };

  const handleRemoveBookmark = (surahNum: number, ayahNum: number) => {
    const updated = bookmarks.filter(b => !(b.surahNumber === surahNum && b.ayahNumber === ayahNum));
    setBookmarks(updated);
    localStorage.setItem("quran_companion_bookmarks", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("quran_companion_history");
  };

  // 11. Keyword Search Trigger
  const handleKeywordSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const apiUrl = `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/${preferences.primaryTranslation}`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error("Failed to search keyword. Please try again.");
      }

      const responseJson = await res.json();
      if (responseJson.code !== 200 || !responseJson.data) {
        throw new Error("No results found matching your query.");
      }

      const matches = responseJson.data.matches || [];
      setSearchResults(matches.slice(0, 15));
      if (matches.length === 0) {
        setSearchError("No verses contain this keyword. Try words like 'Patience', 'Mercy', 'Light', 'Peace', or 'Forgiveness'.");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setSearchError(err.message || "An error occurred during search.");
    } finally {
      setIsSearchLoading(false);
    }
  };

  // 12. Quick Jump to Surah:Ayah
  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const surahMeta = SURAH_LIST.find(s => s.number === Number(quickSurah));
    if (!surahMeta) return;

    let targetAyah = Number(quickAyah);
    if (targetAyah < 1) targetAyah = 1;
    if (targetAyah > surahMeta.numberOfAyahs) {
      targetAyah = surahMeta.numberOfAyahs;
      setQuickAyah(targetAyah);
    }

    fetchSpecificAyah(quickSurah, targetAyah);
    setIsSearchOpen(false);
  };

  const activeSelectorSurahMeta = SURAH_LIST.find(s => s.number === Number(quickSurah));

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-main)] flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. ULTRA-RESPONSIVE TOP BAR: Compact on mobile so Settings button is NEVER hidden */}
      <header className="sticky top-0 z-40 bg-[var(--color-canvas)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-2.5 sm:px-4 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Zone 1: Wordmark / Brand Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <span className="text-base sm:text-lg">🕌</span>
          <a href="#" className="font-display font-bold text-xs sm:text-sm md:text-base tracking-wider text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors whitespace-nowrap">
            AYAH PICKER
          </a>
        </div>

        {/* Zone 2: Navigation Modes (Sized down on mobile for perfect fit) */}
        <nav className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl shrink-0" aria-label="Main Modes">
          <button
            id="tab-explore-btn"
            onClick={() => {
              setActiveTab("explore");
              setIsSearchOpen(false);
            }}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "explore"
                ? "bg-[var(--color-surface)] text-[var(--color-accent)] shadow-2xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            }`}
          >
            Explore
          </button>
          <button
            id="tab-mood-btn"
            onClick={() => {
              setActiveTab("mood");
              setIsSearchOpen(false);
            }}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              activeTab === "mood"
                ? "bg-[var(--color-surface)] text-[var(--color-accent)] shadow-2xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            }`}
          >
            <Heart className="w-3 h-3 fill-current opacity-70" />
            <span>Remedies</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Search, Palette, and Settings - ALWAYS visible on mobile!) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Search Toggle */}
          <button
            id="toggle-search-panel-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              isSearchOpen 
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" 
                : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-main)] border-[var(--color-border)]"
            }`}
            title="Search Quran"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search</span>
          </button>

          {/* Quick Theme Cycle Button */}
          <button
            id="cycle-theme-btn"
            onClick={cycleTheme}
            className="p-1.5 sm:p-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] rounded-xl transition-colors cursor-pointer"
            title={`Current Theme: ${preferences.theme}. Click to switch.`}
            aria-label="Switch aesthetic theme"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Settings Modal Toggle - ALWAYS visible on mobile */}
          <button
            id="open-preferences-btn"
            onClick={() => setIsPreferencesOpen(true)}
            className="p-1.5 sm:p-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            title="Preferences & Translations"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-xs font-bold">Settings</span>
          </button>
        </div>
      </header>

      {/* 2. RATE LIMIT & NOTIFICATION BANNERS */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-4 space-y-2">
        {rateLimitWarning && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Rate Limit Notice:</strong> Please pause and reflect on this verse for a moment before retrieving another (maximum 10 requests per minute).
            </span>
          </div>
        )}

        {ayahError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{ayahError}</span>
            </div>
            <button 
              onClick={() => fetchSpecificAyah(currentAyah?.arabic.surah.number || 2, currentAyah?.arabic.numberInSurah || 255)}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 rounded-lg border border-rose-300 font-medium cursor-pointer text-[11px]"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 3. COLLAPSIBLE SEARCH & JUMP DRAWER */}
      {isSearchOpen && (
        <section 
          id="search-portal-drawer"
          className="max-w-4xl mx-auto w-full px-4 md:px-8 mt-4 animate-fade-in text-left"
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-lg cursor-pointer transition-colors"
              aria-label="Close search drawer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Direct Surah & Verse Jump */}
              <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-[var(--color-border)] pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <Compass className="w-4 h-4" />
                  <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-[var(--color-text-main)]">
                    Specific Verse Jump
                  </h3>
                </div>

                <form onSubmit={handleQuickJump} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--color-text-muted)] font-medium">Surah (Chapter)</label>
                    <select
                      id="search-surah-dropdown"
                      value={quickSurah}
                      onChange={(e) => {
                        setQuickSurah(Number(e.target.value));
                        setQuickAyah(1);
                      }}
                      className="w-full px-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] focus:border-[var(--color-accent)] rounded-xl text-xs text-[var(--color-text-main)] outline-none cursor-pointer"
                    >
                      {SURAH_LIST.map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {s.englishName} ({s.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[var(--color-text-muted)]">
                      <span>Verse Number</span>
                      {activeSelectorSurahMeta && (
                        <span>Range: 1 – {activeSelectorSurahMeta.numberOfAyahs}</span>
                      )}
                    </div>
                    <input
                      id="search-ayah-input"
                      type="number"
                      min={1}
                      max={activeSelectorSurahMeta?.numberOfAyahs || 286}
                      value={quickAyah}
                      onChange={(e) => setQuickAyah(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] focus:border-[var(--color-accent)] rounded-xl text-xs text-[var(--color-text-main)] outline-none"
                    />
                  </div>

                  <button
                    id="submit-verse-jump-btn"
                    type="submit"
                    className="w-full py-2.5 bg-[var(--color-surface-subtle)] hover:bg-[var(--color-accent)] text-[var(--color-text-main)] hover:text-white border border-[var(--color-border)] hover:border-transparent font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Read Verse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Right Column: Keyword Semantic Search */}
              <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--color-accent)]">
                    <Search className="w-4 h-4" />
                    <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-[var(--color-text-main)]">
                      Search by Keyword
                    </h3>
                  </div>

                  <form onSubmit={handleKeywordSearch} className="flex gap-2">
                    <input
                      id="search-keyword-input"
                      type="text"
                      placeholder="e.g. Patience, Mercy, Light, Peace..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow px-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] focus:border-[var(--color-accent)] rounded-xl text-xs text-[var(--color-text-main)] outline-none"
                    />
                    <button
                      id="submit-keyword-search-btn"
                      type="submit"
                      disabled={isSearchLoading}
                      className="px-4 py-2.5 bg-[#c5a059] text-white hover:bg-[#aa843d] font-semibold text-xs rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isSearchLoading ? "Searching..." : "Search"}
                    </button>
                  </form>

                  {searchError && (
                    <p className="text-xs text-rose-600 font-medium">{searchError}</p>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Matches in Translation:
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {searchResults.map((match, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              fetchSpecificAyah(match.surah.number, match.numberInSurah);
                              setIsSearchOpen(false);
                            }}
                            className="w-full text-left p-3 bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl text-xs text-[var(--color-text-main)] transition-colors cursor-pointer truncate"
                          >
                            <span className="font-semibold text-[var(--color-accent)] font-sans">
                              {match.surah.englishName} [{match.surah.number}:{match.numberInSurah}]
                            </span>
                            <span className="text-[var(--color-text-muted)] font-serif italic ml-2">
                              — "{match.text}"
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)] font-serif italic">
                  Tip: Searches match occurrences across the selected translation. Clicking any verse instantly loads the Arabic text and Gemini reflection.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-8 flex-grow flex flex-col items-center space-y-8">
        
        {activeTab === "explore" ? (
          <>
            {/* Side-by-Side Asymmetric Layout */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT: Ayah Card (Col Span 7) */}
              <section className="lg:col-span-7 flex justify-center">
                {currentAyah ? (
                  <AyahCard
                    ayah={currentAyah}
                    primaryTranslationId={preferences.primaryTranslation}
                    secondaryLanguageId={preferences.secondaryLanguage}
                    isBookmarked={bookmarks.some(
                      b => b.surahNumber === currentAyah.arabic.surah.number && 
                           b.ayahNumber === currentAyah.arabic.numberInSurah
                    )}
                    onToggleBookmark={handleToggleBookmark}
                    onFetchRandom={fetchRandomAyah}
                    onFetchSpecific={fetchSpecificAyah}
                    isLoading={isAyahLoading}
                    autoPlayAudio={preferences.audioEnabled}
                    arabicFontSize={preferences.arabicFontSize || "small"}
                    onCycleFontSize={cycleArabicFontSize}
                    showEnglishTranslation={preferences.showEnglishTranslation !== false}
                    showSecondaryTranslation={preferences.showSecondaryTranslation !== false}
                    onToggleEnglishTranslation={() => handleUpdatePreferences({ 
                      showEnglishTranslation: preferences.showEnglishTranslation === false ? true : false 
                    })}
                    onToggleSecondaryTranslation={() => handleUpdatePreferences({ 
                      showSecondaryTranslation: preferences.showSecondaryTranslation === false ? true : false 
                    })}
                  />
                ) : (
                  <div className="w-full max-w-2xl aspect-[4/3] bg-white border border-[#ebdcb9] rounded-3xl flex flex-col items-center justify-center space-y-3 mushaf-glow">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#aa843d] animate-spin"></div>
                    <p className="text-xs text-[#8c7456] font-serif italic">Opening sacred verses...</p>
                  </div>
                )}
              </section>

              {/* RIGHT: Live Tafsir & Reflections (Col Span 5) */}
              <section className="lg:col-span-5 flex justify-center h-full">
                <ReflectionsPanel
                  reflection={currentReflection}
                  isLoading={isReflectionLoading}
                  onRetry={() => currentAyah && generateLiveReflection(currentAyah, preferences.primaryTranslation)}
                  error={reflectionError}
                />
              </section>

            </div>

            {/* Bookmarks & Reading History Container */}
            <section className="w-full flex justify-center pt-4">
              <HistoryAndBookmarks
                bookmarks={bookmarks}
                history={history}
                onSelectAyah={(sNum, aNum) => fetchSpecificAyah(sNum, aNum)}
                onRemoveBookmark={handleRemoveBookmark}
                onClearHistory={handleClearHistory}
              />
            </section>
          </>
        ) : (
          <MoodPortal
            onSelectAyah={(sNum, aNum) => fetchSpecificAyah(sNum, aNum)}
            currentAyah={currentAyah}
            currentReflection={currentReflection}
            isLoading={isAyahLoading}
            isReflectionLoading={isReflectionLoading}
            preferences={preferences}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={!!currentAyah && bookmarks.some(
              b => b.surahNumber === currentAyah.arabic.surah.number && 
                   b.ayahNumber === currentAyah.arabic.numberInSurah
            )}
            reflectionError={reflectionError}
          />
        )}

      </main>

      {/* 5. PREFERENCES MODAL */}
      <PreferencePanel
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      {/* 6. REVERENT EDITORIAL FOOTER */}
      <footer className="mt-20 border-t border-[var(--color-border)] py-10 max-w-5xl mx-auto w-full px-6 text-center space-y-3 text-[var(--color-text-muted)]">
        <p className="font-serif italic text-xs md:text-sm text-[var(--color-text-main)] max-w-2xl mx-auto leading-relaxed">
          "Indeed, this Quran guides to that which is most suitable and gives good tidings to the believers who do righteous deeds that they will have a great reward."
        </p>
        <div className="flex items-center justify-center gap-2 text-xs">
          <span>Surah Al-Isra [17:9]</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span className="font-display tracking-widest text-[10px] text-[var(--color-accent)] font-semibold uppercase">
            Ayah Picker & Contemplation
          </span>
        </div>
      </footer>
    </div>
  );
}
