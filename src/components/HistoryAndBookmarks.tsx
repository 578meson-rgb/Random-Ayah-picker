import React, { useState } from "react";
import { BookmarkedAyah, HistoryItem } from "../types";
import { Bookmark, Clock, Trash2, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      id="saved-verses-accordion"
      className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl mushaf-glow overflow-hidden text-left"
    >
      {/* Header Accordion Toggle */}
      <button
        id="toggle-saved-verses-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-[var(--color-surface-subtle)] text-[var(--color-text-main)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer border-b border-[var(--color-border)]"
      >
        <div className="flex items-center space-x-2 text-[var(--color-accent)]">
          <Bookmark className="w-4 h-4 fill-current opacity-70" />
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[var(--color-text-main)]">
            Saved Verses & Reading History ({bookmarks.length} Bookmarks)
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
        )}
      </button>

      {/* Expanded Container */}
      {isOpen && (
        <div className="p-6 space-y-4 animate-fade-in">
          {/* Sub Tabs */}
          <div className="flex border-b border-[var(--color-border)]">
            <button
              id="bookmarks-tab-btn"
              onClick={() => setActiveTab("bookmarks")}
              className={`flex items-center space-x-2 px-4 py-2.5 -mb-px text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "bookmarks"
                  ? "border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              <span>Bookmarks ({bookmarks.length})</span>
            </button>
            <button
              id="history-tab-btn"
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-2 px-4 py-2.5 -mb-px text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "history"
                  ? "border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
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
                <div className="text-center py-8 text-[var(--color-text-muted)] text-xs font-serif italic">
                  No bookmarked verses yet. Click the "Bookmark" icon on any verse to preserve it here.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                  {bookmarks.map((b) => (
                    <div 
                      key={`${b.surahNumber}:${b.ayahNumber}`}
                      className="p-3.5 bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div 
                        className="flex-grow min-w-0 pr-4 cursor-pointer"
                        onClick={() => onSelectAyah(b.surahNumber, b.ayahNumber)}
                      >
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-semibold text-[var(--color-accent)] font-sans">
                            {b.surahEnglishName} [{b.surahNumber}:{b.ayahNumber}]
                          </span>
                          <span aria-hidden="true" className="opacity-30">·</span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {new Date(b.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-main)] italic truncate mt-1 font-serif">
                          "{b.translationText}"
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => onSelectAyah(b.surahNumber, b.ayahNumber)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] rounded-lg transition-colors cursor-pointer"
                          title="Open Verse"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveBookmark(b.surahNumber, b.ayahNumber)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove bookmark"
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
                <div className="text-center py-8 text-[var(--color-text-muted)] text-xs font-serif italic">
                  Your reading trail will appear here as you explore verses.
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={onClearHistory}
                      className="text-[11px] text-[var(--color-text-muted)] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Trail</span>
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {history.map((h, i) => (
                      <button
                        key={`${h.surahNumber}:${h.ayahNumber}-${i}`}
                        onClick={() => onSelectAyah(h.surahNumber, h.ayahNumber)}
                        className="w-full text-left p-3 bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[var(--color-text-main)]">
                            Surah {h.surahEnglishName}
                          </span>
                          <span className="text-[var(--color-accent)] font-medium">
                            [{h.surahNumber}:{h.ayahNumber}]
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
