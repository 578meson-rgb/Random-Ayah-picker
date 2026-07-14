import React, { useState } from "react";
import { BookmarkedAyah, HistoryItem } from "../types";
import { Bookmark, Clock, Trash2, ArrowUpRight, Heart, ChevronDown, ChevronUp } from "lucide-react";

interface HistoryAndBookmarksProps {
  bookmarks: BookmarkedAyah[];
  history: HistoryItem[];
  onSelectAyah: (surahNumber: number, ayahNumber: number) => void;
  onRemoveBookmark: (surahNumber: number, ayahNumber: number) => void;
  onClearHistory: () => void;
}

export const HistoryAndBookmarks: React.FC<HistoryAndBookmarksProps> = ({
  bookmarks,
  history,
  onSelectAyah,
  onRemoveBookmark,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<"bookmarks" | "history">("bookmarks");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div 
      id="saved-verses-accordion"
      className="w-full max-w-2xl bg-white border border-[#ebdcb9] rounded-3xl shadow-lg overflow-hidden gold-glow"
    >
      {/* Header / Toggle Button */}
      <button
        id="toggle-saved-verses-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-[#fbf9f2] text-[#2c251d] hover:text-black transition-colors cursor-pointer border-b border-[#ebdcb9]/60"
      >
        <div className="flex items-center space-x-2 text-[#aa843d]">
          <Bookmark className="w-5 h-5 fill-[#aa843d]/10 text-[#aa843d]" />
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider">
            Saved Verses & History ({bookmarks.length} Bookmarks)
          </h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-[#8c7456]" /> : <ChevronDown className="w-5 h-5 text-[#8c7456]" />}
      </button>

      {/* Expanded Container */}
      {isOpen && (
        <div className="p-6">
          {/* Sub Tabs */}
          <div className="flex border-b border-[#ebdcb9]/60 mb-5">
            <button
              id="bookmarks-tab-btn"
              onClick={() => setActiveTab("bookmarks")}
              className={`flex items-center space-x-2 px-4 py-2.5 -mb-px text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "bookmarks"
                  ? "border-b-2 border-[#aa843d] text-[#aa843d]"
                  : "text-[#8c7456] hover:text-[#524430]"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === "bookmarks" ? "fill-[#aa843d]/10" : ""}`} />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>
            <button
              id="history-tab-btn"
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-2 px-4 py-2.5 -mb-px text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "history"
                  ? "border-b-2 border-[#aa843d] text-[#aa843d]"
                  : "text-[#8c7456] hover:text-[#524430]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent History ({history.length})</span>
            </button>
          </div>

          {/* Bookmarks Tab Content */}
          {activeTab === "bookmarks" && (
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="text-center py-8 text-[#8c7456] text-xs">
                  No bookmarked ayahs yet. Press "Bookmark" on any verse to save it.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {bookmarks.map((b) => (
                    <div 
                      key={`${b.surahNumber}:${b.ayahNumber}`}
                      className="p-3 bg-[#faf8f4] hover:bg-white border border-[#ebdcb9]/40 hover:border-[#c5a059] rounded-2xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex-grow min-w-0 pr-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold font-sans text-[#aa843d]">
                            {b.surahEnglishName} [{b.surahNumber}:{b.ayahNumber}]
                          </span>
                          <span className="text-[10px] text-[#8c7456] font-sans">
                            {new Date(b.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#524430] italic truncate mt-1">
                          "{b.translationText}"
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectAyah(b.surahNumber, b.ayahNumber)}
                          className="p-1.5 bg-white hover:bg-[#faf6ed] text-[#aa843d] border border-[#ebdcb9] rounded-xl transition-colors cursor-pointer"
                          title="View Verse"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveBookmark(b.surahNumber, b.ayahNumber)}
                          className="p-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl transition-colors cursor-pointer"
                          title="Remove Bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab Content */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-[#8c7456] text-xs">
                  No view history recorded. Start exploring random ayahs!
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                    {history.map((h, i) => (
                      <div 
                        key={i}
                        className="p-3 bg-[#faf8f4] hover:bg-white border border-[#ebdcb9]/40 hover:border-[#c5a059] rounded-2xl flex items-center justify-between group transition-all"
                      >
                        <div>
                          <span className="text-xs font-bold font-sans text-[#524430]">
                            {h.surahEnglishName} • Verse {h.ayahNumber}
                          </span>
                          <span className="text-[10px] text-[#8c7456] font-sans block mt-0.5">
                            Viewed: {new Date(h.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <button
                          onClick={() => onSelectAyah(h.surahNumber, h.ayahNumber)}
                          className="p-1.5 bg-white hover:bg-[#faf6ed] text-[#aa843d] border border-[#ebdcb9] rounded-xl opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Recall Verse"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      id="clear-history-btn"
                      onClick={onClearHistory}
                      className="text-[11px] font-semibold uppercase tracking-wider text-[#8c7456] hover:text-red-700 flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear View History</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
