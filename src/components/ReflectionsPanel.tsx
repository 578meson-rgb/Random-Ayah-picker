import React, { useState, useEffect } from "react";
import { GeminiReflection } from "../types";
import { Sparkles, BookOpen, Lightbulb, Compass, AlertCircle, RefreshCw, KeyRound, Check } from "lucide-react";

interface ReflectionsPanelProps {
  reflection: GeminiReflection | null;
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
}

const MEDITATIVE_MESSAGES = [
  "Contemplating the depths of this sacred revelation...",
  "Synthesizing classical commentaries and linguistic nuances...",
  "Formulating heart-centered reflections for today's contemplation...",
  "Unlocking theological context and spiritual remedies...",
  "Preparing Tadabbur insights..."
];

export const ReflectionsPanel: React.FC<ReflectionsPanelProps> = ({
  reflection,
  isLoading,
  onRetry,
  error,
}) => {
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % MEDITATIVE_MESSAGES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const copyKeyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (isLoading) {
    return (
      <aside 
        aria-label="Tafsir & Reflections Loading"
        className="w-full max-w-2xl p-6 md:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl mushaf-glow flex flex-col space-y-5 animate-pulse"
      >
        <div className="flex items-center space-x-2 text-[var(--color-accent)]">
          <Sparkles className="w-4 h-4 animate-spin" />
          <h3 className="font-sans font-semibold text-xs tracking-wider uppercase">
            Composing Divine Tafsir & Reflection...
          </h3>
        </div>
        <div className="space-y-3.5 pt-2">
          <div className="h-4 bg-[var(--color-surface-subtle)] rounded-md w-4/5"></div>
          <div className="h-4 bg-[var(--color-surface-subtle)] rounded-md w-full"></div>
          <div className="h-4 bg-[var(--color-surface-subtle)] rounded-md w-3/4"></div>
          <div className="h-4 bg-[var(--color-surface-subtle)] rounded-md w-5/6"></div>
        </div>
        <div className="mt-4 pt-3 text-center text-xs italic text-[var(--color-text-muted)] font-serif">
          "{MEDITATIVE_MESSAGES[loadingMessageIndex]}"
        </div>
      </aside>
    );
  }

  if (error || !reflection) {
    const isApiKeyError = error?.includes("GEMINI_API_KEY") || error?.includes("api_key") || error?.includes("API key");

    return (
      <aside 
        aria-label="Tafsir & Reflections Error Notice"
        className="w-full max-w-2xl p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] mushaf-glow flex flex-col space-y-4 text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-accent)]">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-[var(--color-text-main)]">
              {isApiKeyError ? "Gemini API Key Configuration" : "Reflection Service Notice"}
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {isApiKeyError ? "Environment setup required on Vercel" : "Connecting to Tafsir service"}
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--color-text-main)] leading-relaxed">
          {error || "An unexpected error occurred while communicating with the AI reflection service."}
        </p>

        {isApiKeyError && (
          <div className="bg-[var(--color-surface-subtle)] rounded-xl p-4 border border-[var(--color-border)] space-y-3 text-xs text-[var(--color-text-main)]">
            <h4 className="font-sans font-semibold text-[var(--color-accent)] flex items-center gap-1.5 text-xs">
              <span>💡</span> Setup Guide for Vercel Deployment:
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              <li>
                Open your <strong>Vercel Dashboard</strong> &rarr; Select your Project &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.
              </li>
              <li>
                Add variable name:
                <div className="flex items-center gap-2 mt-1">
                  <code className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)]">
                    GEMINI_API_KEY
                  </code>
                  <button
                    onClick={() => copyKeyText("GEMINI_API_KEY")}
                    className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3 h-3" /> : "Copy Name"}
                  </button>
                </div>
              </li>
              <li>
                Paste your actual Gemini API key from <strong>Google AI Studio</strong> (e.g. starting with <code className="font-mono text-[10px]">AIza...</code>).
              </li>
              <li>
                <strong className="text-[var(--color-text-main)]">Crucial Step:</strong> After saving, go to the <strong>Deployments</strong> tab, click the three dots on your current deployment, and select <strong>Redeploy</strong> (Vercel requires a new build to inject updated keys into serverless functions).
              </li>
            </ol>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Generating</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      id="reflections-panel"
      className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl mushaf-glow flex flex-col overflow-hidden"
    >
      {/* Editorial Header */}
      <div className="px-6 py-4 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[var(--color-accent)]">
          <Sparkles className="w-4 h-4" />
          <h3 className="font-display font-semibold text-xs tracking-wider uppercase">
            Tafsir & Contemplation
          </h3>
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
          TADABBUR NOTES
        </span>
      </div>

      {/* Sections Grid */}
      <div className="p-6 md:p-8 space-y-6 text-left">
        
        {/* I. Revelation Context */}
        <section className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[var(--color-accent)]">
            <Compass className="w-4 h-4" />
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-[var(--color-text-main)]">
              Context of Revelation
            </h4>
          </div>
          <p className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed pl-6">
            {reflection.context}
          </p>
        </section>

        {/* II. Classical Commentary */}
        <section className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[var(--color-accent)]">
            <BookOpen className="w-4 h-4" />
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-[var(--color-text-main)]">
              Tafsir (Scholarly Meaning)
            </h4>
          </div>
          <p className="text-xs md:text-sm text-[var(--color-text-main)] leading-relaxed pl-6 border-l-2 border-[var(--color-border)]">
            {reflection.explanation}
          </p>
        </section>

        {/* III. Heart Contemplation */}
        <section className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[var(--color-accent)]">
            <Lightbulb className="w-4 h-4" />
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-[var(--color-text-main)]">
              Daily Heart Reflection
            </h4>
          </div>
          <div className="pl-6">
            <blockquote className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] font-serif text-sm md:text-base italic text-[var(--color-text-main)] leading-relaxed">
              "{reflection.reflection}"
            </blockquote>
          </div>
        </section>

        {/* IV. Thematic Keywords */}
        {reflection.keywords && reflection.keywords.length > 0 && (
          <footer className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] tracking-wider mr-1">
              Themes:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              {reflection.keywords.map((word, i) => (
                <span key={i} className="inline-flex items-center">
                  <span className="font-medium text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors">
                    #{word}
                  </span>
                  {i < reflection.keywords.length - 1 && (
                    <span aria-hidden="true" className="mx-1.5 opacity-40">·</span>
                  )}
                </span>
              ))}
            </div>
          </footer>
        )}
      </div>
    </aside>
  );
};
