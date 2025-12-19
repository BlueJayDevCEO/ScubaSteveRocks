import React from 'react';

interface ViewShellProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  subtitle?: string; // optional, doesn’t break existing usage
  actions?: React.ReactNode; // optional right-side actions (future-proof)
}

export const ViewShell: React.FC<ViewShellProps> = ({
  title,
  subtitle,
  actions,
  onBack,
  children,
}) => {
  return (
    <main className="w-full animate-fade-in">
      <section
        className="
          relative overflow-hidden
          rounded-3xl
          border border-black/5 dark:border-white/10
          bg-white/70 dark:bg-black/40
          backdrop-blur-xl
          shadow-[0_18px_60px_rgba(0,0,0,0.12)]
          dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)]
          p-5 sm:p-8
        "
        aria-label={title}
      >
        {/* subtle top sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 to-transparent dark:from-white/10" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Header row */}
        <header className="relative flex items-start gap-4 mb-6">
          <button
            onClick={onBack}
            className="
              flex-shrink-0
              p-2.5
              rounded-2xl
              border border-black/5 dark:border-white/10
              bg-black/5 dark:bg-white/10
              hover:bg-black/10 dark:hover:bg-white/15
              transition-colors
            "
            aria-label="Back"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-light-text dark:text-dark-text tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm sm:text-base text-light-text/70 dark:text-dark-text/70">
                {subtitle}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="hidden sm:flex items-center gap-2">{actions}</div>
          ) : null}
        </header>

        {/* Content */}
        <div className="relative">{children}</div>
      </section>
    </main>
  );
};
