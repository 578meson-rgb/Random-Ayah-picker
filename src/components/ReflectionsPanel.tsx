import React, { useState, useEffect } from "react";
import { GeminiReflection } from "../types";
import { Sparkles, HelpCircle, Lightbulb, BookOpen, KeyRound } from "lucide-react";

interface ReflectionsPanelProps {
  reflection: GeminiReflection | null;
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
}

const COMFORTING_MESSAGES = [
  "Contemplating the depths of this sacred Ayah...",
  "Consulting classical scholarly understandings...",
  "Formulating a respectful, modern reflection for your day...",
  "Unlocking theological secrets and contexts...",
  "Weaving spiritual insights to calm the modern heart..."
];

export const ReflectionsPanel: React.FC<ReflectionsPanelProps> = ({
  reflection,
  isLoading,
  onRetry,
  error,
}) => {
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle comforting loading messages while Gemini is thinking
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % COMFORTING_MESSAGES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl p-6 bg-white border border-[#ebdcb9] rounded-3xl shadow-lg flex flex-col space-y-4 animate-pulse">
        <div className="flex items-center space-x-2 text-[#aa843d]">
          <Sparkles className="w-5 h-5 animate-spin text-[#c5a059]" />
          <span className="font-sans font-bold text-xs tracking-wider uppercase">Generating Tafsir & Insights...</span>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-[#f5eedc] rounded-md w-3/4"></div>
          <div className="h-4 bg-[#f5eedc] rounded-md w-5/6"></div>
          <div className="h-4 bg-[#f5eedc] rounded-md w-2/3"></div>
        </div>
        <div className="mt-4 pt-2 text-center text-xs italic text-[#8c7456] font-light">
          "{COMFORTING_MESSAGES[loadingMessageIndex]}"
        </div>
      </div>
    );
  }

  if (error || !reflection) {
    return (
      <div className="w-full max-w-2xl p-6 bg-red-50/50 border border-red-200 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center space-y-3">
        <div className="text-red-800 text-base font-sans font-bold">
          Could not generate live reflection
        </div>
        <p className="text-xs text-red-700/80 max-w-md">
          {error || "An unexpected error occurred while communicating with the AI reflection server."}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white hover:bg-red-50 text-red-800 border border-red-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
        >
          Retry Generating Reflection
        </button>
      </div>
    );
  }

  return (
    <div 
      id="reflections-panel"
      className="w-full max-w-2xl bg-white border border-[#ebdcb9] rounded-3xl shadow-lg overflow-hidden gold-glow"
    >
      {/* Header */}
      <div className="flex items-center space-x-2 px-6 py-4 bg-[#fbf9f2] border-b border-[#ebdcb9]/60 text-[#aa843d]">
        <Sparkles className="w-5 h-5" />
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider">
          Gemini Tafsir & Reflection
        </h3>
      </div>

      {/* Grid of Sections */}
      <div className="p-6 space-y-6">
        {/* Historical Context / Background */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[#5c4a37]">
            <BookOpen className="w-4 h-4 text-[#c5a059]" />
            <h4 className="font-sans font-bold text-xs text-[#5c4a37] uppercase tracking-wider">Revelation Context</h4>
          </div>
          <p className="text-sm text-[#3c3226] leading-relaxed pl-6">
            {reflection.context}
          </p>
        </div>

        {/* Scholarly Tafsir / Explanation */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[#5c4a37]">
            <HelpCircle className="w-4 h-4 text-[#c5a059]" />
            <h4 className="font-sans font-bold text-xs text-[#5c4a37] uppercase tracking-wider">Tafsir (Explanation)</h4>
          </div>
          <p className="text-sm text-[#3c3226] leading-relaxed pl-6 border-l-2 border-[#ebdcb9]">
            {reflection.explanation}
          </p>
        </div>

        {/* Practical Daily Reflection */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[#5c4a37]">
            <Lightbulb className="w-4 h-4 text-[#c5a059]" />
            <h4 className="font-sans font-bold text-xs text-[#5c4a37] uppercase tracking-wider">Daily Lesson</h4>
          </div>
          <p className="text-sm text-[#7d5d21] leading-relaxed pl-6 italic">
            "{reflection.reflection}"
          </p>
        </div>

        {/* Keywords Tags */}
        <div className="pt-4 border-t border-[#ebdcb9]/60 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] uppercase tracking-wider text-[#8c7456] font-bold mr-1 flex items-center">
            <KeyRound className="w-3 h-3 mr-1 text-[#c5a059]" /> Core Themes:
          </span>
          {reflection.keywords.map((word, i) => (
            <span 
              key={i} 
              className="px-2.5 py-1 text-[11px] font-medium bg-[#faf8f4] text-[#aa843d] border border-[#ebdcb9] rounded-full hover:border-[#aa843d] transition-colors cursor-default"
            >
              #{word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
