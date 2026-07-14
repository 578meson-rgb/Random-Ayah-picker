import React, { useState, useEffect } from "react";
import { SURAH_LIST } from "./surahData";
import { FALLBACK_VERSES } from "./fallbackData";
import { PRIMARY_TRANSLATIONS } from "./translationOptions";
import { AyahApiResponse, GeminiReflection, BookmarkedAyah, HistoryItem, UserPreferences } from "./types";
import { AyahCard } from "./components/AyahCard";
import { ReflectionsPanel } from "./components/ReflectionsPanel";
import { PreferencePanel } from "./components/PreferencePanel";
import { HistoryAndBookmarks } from "./components/HistoryAndBookmarks";
import { 
  Settings, 
  Search, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Info, 
  Compass, 
  X, 
  ArrowRight, 
  AlertTriangle,
  RotateCcw,
  BookMarked
} from "lucide-react";

export default function App() {
  // 1. Core State
  const [preferences, setPreferences] = useState<UserPreferences>({
    primaryTranslation: "en.sahih",
    secondaryLanguage: "bn.bengali",
    audioEnabled: true,
    reciter: "ar.alafasy"
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

  // Rate Limiting (Technical notes: max 10 calls per minute)
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);

  // 2. Initial Mount Loader
  useEffect(() => {
    // A. Load Preferences from LocalStorage
    const savedPrefs = localStorage.getItem("quran_companion_prefs");
    let currentPrefs = preferences;
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(parsed);
        currentPrefs = parsed;
      } catch (e) {
        console.error("Failed to parse preferences from localStorage", e);
      }
    }

    // B. Load Bookmarks & History from LocalStorage
    const savedBookmarks = localStorage.getItem("quran_companion_bookmarks");
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) {}
    }
    const savedHistory = localStorage.getItem("quran_companion_history");
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }

    // C. Load First Default Verse (Ayat al-Kursi) as a beautiful greeting
    const defaultFallback = FALLBACK_VERSES[0];
    setCurrentAyah(defaultFallback.response);
    setCurrentReflection(defaultFallback.reflection);
  }, []);

  // 3. Sync Preferences to LocalStorage
  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem("quran_companion_prefs", JSON.stringify(updated));

    // If translation changed, immediately re-fetch current verse to apply translation change
    if (currentAyah && (newPrefs.primaryTranslation || newPrefs.secondaryLanguage)) {
      fetchSpecificAyah(
        currentAyah.arabic.surah.number, 
        currentAyah.arabic.numberInSurah,
        updated.primaryTranslation,
        updated.secondaryLanguage
      );
    }
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
      // Pick random Surah (1-114)
      const randomSurahIdx = Math.floor(Math.random() * SURAH_LIST.length);
      const selectedSurah = SURAH_LIST[randomSurahIdx];
      
      // Pick random Ayah within this Surah's valid range
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
      // Formulate editions requested: Arabic + Primary translation + Optional secondary translation
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

      // Map response array back to structured data
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

      // Save to History (Remember last 5 viewed ayahs)
      addToHistory(surahNum, ayahNum, arabicData.surah.englishName);

      // Trigger Gemini-powered Live reflections in parallel
      generateLiveReflection(structuredAyah, primaryTranslationId);

    } catch (err: any) {
      console.error(`Failed to fetch specific Ayah ${surahNum}:${ayahNum}:`, err);
      setAyahError(err.message || "An error occurred while communicating with the Quran database.");
      setIsAyahLoading(false);
      
      // If we don't have a current ayah, load fallback
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
      
      // Look up if we have a matching static reflection in our fallback verses to save the day
      const matchingFallback = FALLBACK_VERSES.find(
        f => f.response.arabic.surah.number === ayahData.arabic.surah.number && 
             f.response.arabic.numberInSurah === ayahData.arabic.numberInSurah
      );

      if (matchingFallback) {
        setCurrentReflection(matchingFallback.reflection);
      } else {
        // Simple default simulated reflection
        setCurrentReflection({
          context: `This verse belongs to Surah ${ayahData.arabic.surah.englishName}.`,
          explanation: "Tafsir explanations help us understand the profound linguistics and moral requirements of God's message.",
          reflection: "Read this verse slowly and allow its message to sit with your heart. Let it guide your behavior and conversations with others today.",
          keywords: ["Faith", "Reflections", "Patience"]
        });
      }
    }
  };

  // 8. Add a successful fetch to Recent History (FIFO of 5 items)
  const addToHistory = (surahNumber: number, ayahNumber: number, surahEnglishName: string) => {
    setHistory((prevHistory) => {
      // Remove duplicates if the same verse was recently viewed
      const filtered = prevHistory.filter(
        item => !(item.surahNumber === surahNumber && item.ayahNumber === ayahNumber)
      );

      const newItem: HistoryItem = {
        surahNumber,
        ayahNumber,
        surahEnglishName,
        timestamp: Date.now()
      };

      const updated = [newItem, ...filtered].slice(0, 5); // Limit to last 5
      localStorage.setItem("quran_companion_history", JSON.stringify(updated));
      return updated;
    });
  };

  // 9. Load Fallback Verse in case of errors
  const loadFallbackVerse = () => {
    // Choose a random item from our fallback verses
    const idx = Math.floor(Math.random() * FALLBACK_VERSES.length);
    const fallbackItem = FALLBACK_VERSES[idx];
    setCurrentAyah(fallbackItem.response);
    setCurrentReflection(fallbackItem.reflection);
    setAyahError("We encountered a network issue loading the live database. Displaying a pre-cached offline fallback verse.");
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
        throw new Error("No results found matching your keyword.");
      }

      const matches = responseJson.data.matches || [];
      // Limit to top 15 matches for speed and spacing elegance
      setSearchResults(matches.slice(0, 15));
      if (matches.length === 0) {
        setSearchError("No verses contain this keyword. Try basic words like 'Patience', 'Mercy', 'Light', or 'Peace'.");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setSearchError(err.message || "An error occurred during search.");
    } finally {
      setIsSearchLoading(false);
    }
  };

  // 12. Quick selector Jump
  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const surahMeta = SURAH_LIST.find(s => s.number === Number(quickSurah));
    if (!surahMeta) return;

    let targetAyah = Number(quickAyah);
    // Boundary check
    if (targetAyah < 1) targetAyah = 1;
    if (targetAyah > surahMeta.numberOfAyahs) {
      targetAyah = surahMeta.numberOfAyahs;
      setQuickAyah(targetAyah); // reset input to maximum allowed
    }

    fetchSpecificAyah(quickSurah, targetAyah);
    setIsSearchOpen(false); // close panel after jumping
  };

  // Get current selected Surah details
  const activeSelectorSurahMeta = SURAH_LIST.find(s => s.number === Number(quickSurah));

  return (
    <div className="min-h-screen bg-[#faf6ed] text-[#2c251d] flex flex-col font-sans selection:bg-[#aa843d]/15 selection:text-[#aa843d] pb-12">
      
      {/* 1. STICKY BRAND HEADER */}
      <header className="sticky top-0 z-40 bg-[#faf6ed]/95 backdrop-blur-md border-b border-[#ebdcb9] px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white border border-[#ebdcb9] rounded-2xl flex items-center justify-center text-xl text-[#aa843d] shadow-sm">
            🕌
          </div>
          <div>
            <h1 className="font-serif font-bold text-base md:text-lg tracking-wider text-[#aa843d] flex items-center">
              Random Ayah Picker
            </h1>
            <p className="text-[10px] md:text-xs text-[#8c7456] font-semibold">
              Interactive Spiritual Guidance & Insights
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Toggle Search */}
          <button
            id="toggle-search-panel-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold uppercase tracking-wider ${
              isSearchOpen 
                ? "bg-[#c5a059] text-white border-transparent shadow-sm" 
                : "bg-white hover:bg-[#faf8f4] text-[#aa843d] border-[#ebdcb9]"
            }`}
            title="Search Quran"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search & Jump</span>
          </button>

          {/* Preferences Settings */}
          <button
            id="open-preferences-btn"
            onClick={() => setIsPreferencesOpen(true)}
            className="p-2.5 bg-white hover:bg-[#faf8f4] border border-[#ebdcb9] hover:border-[#aa843d] text-[#aa843d] rounded-xl transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold uppercase tracking-wider shadow-sm"
            title="Adjust Preferences"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* 2. ALERT & WARNING NOTIFICATIONS */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-4 space-y-2">
        {rateLimitWarning && (
          <div className="p-3 bg-amber-950/40 border border-amber-600/40 text-amber-300 rounded-xl text-xs flex items-center space-x-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Rate Limit Warning:</strong> You've requested several verses quickly. Please reflect on this Ayah for a moment before fetching another (max 10 requests/minute).
            </span>
          </div>
        )}

        {ayahError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 shrink-0 text-red-700" />
              <span>{ayahError}</span>
            </div>
            <button 
              onClick={() => fetchSpecificAyah(currentAyah?.arabic.surah.number || 2, currentAyah?.arabic.numberInSurah || 255)}
              className="px-3 py-1 bg-white hover:bg-red-50 rounded-xl border border-red-300 font-bold cursor-pointer text-[10px] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* 3. COLLAPSIBLE SEARCH & QUICK JUMP PORTAL */}
      {isSearchOpen && (
        <section 
          id="search-portal-drawer"
          className="max-w-3xl mx-auto w-full px-4 md:px-8 mt-4 animate-fade-in"
        >
          <div className="bg-white border border-[#ebdcb9] rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#faf6ed] text-[#8c7456] hover:text-[#524430] rounded-xl cursor-pointer transition-colors border border-[#ebdcb9]/40"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Specific Surah & Ayah Quick Selector */}
              <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-[#ebdcb9]/60 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center space-x-2 text-[#aa843d]">
                  <Compass className="w-4 h-4" />
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider">Specific Verse Jump</h3>
                </div>

                <form onSubmit={handleQuickJump} className="space-y-3">
                  {/* Select Surah */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8c7456]">Choose Surah</label>
                    <select
                      id="search-surah-dropdown"
                      value={quickSurah}
                      onChange={(e) => {
                        setQuickSurah(Number(e.target.value));
                        setQuickAyah(1); // Reset Ayah input on Surah change
                      }}
                      className="w-full px-4 py-2.5 bg-[#faf8f4] border border-[#ebdcb9] focus:border-[#aa843d] rounded-xl text-xs text-[#2c251d] outline-none appearance-none cursor-pointer"
                    >
                      {SURAH_LIST.map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {s.englishName} ({s.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Ayah */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8c7456] flex justify-between">
                      <span>Enter Ayah Number</span>
                      {activeSelectorSurahMeta && (
                        <span className="text-[#aa843d] text-[9.5px]">Range: 1-{activeSelectorSurahMeta.numberOfAyahs}</span>
                      )}
                    </label>
                    <input
                      id="search-ayah-input"
                      type="number"
                      min={1}
                      max={activeSelectorSurahMeta?.numberOfAyahs || 286}
                      value={quickAyah}
                      onChange={(e) => setQuickAyah(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-[#faf8f4] border border-[#ebdcb9] focus:border-[#aa843d] rounded-xl text-xs text-[#2c251d] outline-none"
                    />
                  </div>

                  <button
                    id="submit-verse-jump-btn"
                    type="submit"
                    className="w-full py-2.5 bg-[#fbf9f2] hover:bg-[#c5a059] text-[#aa843d] hover:text-white border border-[#ebdcb9] hover:border-transparent font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <span>Read Verse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Right Column: Keyword Text Search */}
              <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[#aa843d]">
                    <Search className="w-4 h-4" />
                    <h3 className="font-sans font-bold text-xs uppercase tracking-wider">Semantic Keyword Search</h3>
                  </div>

                  <form onSubmit={handleKeywordSearch} className="flex gap-2">
                    <input
                      id="search-keyword-input"
                      type="text"
                      placeholder="e.g. Patience, Mercy, Heaven, Heart..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow px-4 py-2.5 bg-[#faf8f4] border border-[#ebdcb9] focus:border-[#aa843d] rounded-xl text-xs text-[#2c251d] outline-none"
                    />
                    <button
                      id="submit-keyword-search-btn"
                      type="submit"
                      disabled={isSearchLoading}
                      className="px-5 py-2.5 bg-[#c5a059] hover:bg-[#aa843d] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSearchLoading ? "Searching..." : "Find"}
                    </button>
                  </form>

                  {/* Search Error & Results list */}
                  {searchError && (
                    <p className="text-[11px] text-amber-600 font-medium mt-1">{searchError}</p>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-[10px] uppercase font-bold text-[#8c7456]">Matches Found (First 15):</p>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {searchResults.map((match, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              fetchSpecificAyah(match.surah.number, match.numberInSurah);
                              setIsSearchOpen(false); // Close panel
                            }}
                            className="w-full text-left p-3 bg-[#faf8f4] hover:bg-white border border-[#ebdcb9]/40 hover:border-[#aa843d] rounded-xl text-xs text-[#3c3226] transition-all cursor-pointer truncate shadow-sm"
                          >
                            <strong className="text-[#aa843d]">{match.surah.englishName} [{match.surah.number}:{match.numberInSurah}]</strong> — {match.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[#8c7456] leading-normal pt-2 border-t border-[#ebdcb9]/60">
                  Tip: Searching matches keywords in the entire selected English translation (e.g. Sahih International). Clicking a result loads the full Arabic text and triggers Gemini.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. MAIN REFLECTION WORKSPACE (GRID) */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-8 flex-grow flex flex-col items-center space-y-8">
        
        {/* Workspace Layout: Flexes side-by-side on desktop, stacked on mobile */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Ayah Display Card (Col Span 7) */}
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
                isLoading={isAyahLoading}
                autoPlayAudio={preferences.audioEnabled}
              />
            ) : (
              <div className="w-full max-w-2xl aspect-[4/3] bg-white border border-[#ebdcb9] rounded-3xl flex flex-col items-center justify-center space-y-4 shadow-lg">
                <div className="w-12 h-12 bg-[#faf8f4] rounded-full flex items-center justify-center animate-bounce border border-[#ebdcb9]/60">
                  <BookMarked className="w-6 h-6 text-[#aa843d]" />
                </div>
                <p className="text-[#8c7456] font-sans font-semibold text-sm tracking-wide">Initialising Random Ayah Picker...</p>
              </div>
            )}
          </section>

          {/* RIGHT PANEL: Live Tafsir & Insights (Col Span 5) */}
          <section className="lg:col-span-5 flex justify-center h-full">
            <ReflectionsPanel
              reflection={currentReflection}
              isLoading={isReflectionLoading}
              onRetry={() => currentAyah && generateLiveReflection(currentAyah, preferences.primaryTranslation)}
              error={reflectionError}
            />
          </section>

        </div>

        {/* 5. HISTORY & BOOKMARKS CONTAINER */}
        <section className="w-full flex justify-center pt-4">
          <HistoryAndBookmarks
            bookmarks={bookmarks}
            history={history}
            onSelectAyah={(sNum, aNum) => fetchSpecificAyah(sNum, aNum)}
            onRemoveBookmark={handleRemoveBookmark}
            onClearHistory={handleClearHistory}
          />
        </section>

      </main>

      {/* 6. SYSTEM OVERLAYS & PREFERENCE MODALS */}
      <PreferencePanel
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      {/* 7. REVERENT FOOTER */}
      <footer className="mt-16 text-center space-y-2 border-t border-[#ebdcb9]/60 pt-8 max-w-4xl mx-auto px-4 text-[#8c7456]">
        <p className="text-xs font-light">
          "Indeed, this Quran guides to that which is most suitable and gives good tidings to the believers who do righteous deeds that they will have a great reward." — Al-Isra [17:9]
        </p>
        <p className="text-[10px] font-mono tracking-wider uppercase text-[#aa843d]">
          Random Ayah Picker
        </p>
      </footer>
    </div>
  );
}
