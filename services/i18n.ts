
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: { home: "Home", identify: "Identify", chat: "Chat", logbook: "Logbook", tools: "Tools" },
      hero: {
        title: "Your AI Dive Buddy",
        subtitle: "Identify marine life, correct underwater photos, chat about your dives, plan trips, and explore the ocean like never before.",
        cta: "Let's Dive In!"
      },
      header: {
        briefings: "Briefings",
        switch_theme: "Switch Theme",
        language: "Language"
      }
    }
  },
  es: {
    translation: {
      nav: { home: "Inicio", identify: "Identificar", chat: "Chat", logbook: "Bitácora", tools: "Herramientas" },
      hero: {
        title: "Tu compañero de buceo IA",
        subtitle: "Identifica vida marina, corrige fotos submarinas, chatea sobre tus inmersiones y planifica viajes.",
        cta: "¡Vamos a bucear!"
      },
      header: {
        briefings: "Informes",
        switch_theme: "Cambiar tema",
        language: "Idioma"
      }
    }
  },
  fr: {
    translation: {
      nav: { home: "Accueil", identify: "Identifier", chat: "Discuter", logbook: "Carnet", tools: "Outils" },
      hero: {
        title: "Votre binôme de plongée IA",
        subtitle: "Identifiez la vie marine, corrigez vos photos sous-marines, discutez de vos plongées et planifiez des voyages.",
        cta: "Plongeons !"
      },
      header: {
        briefings: "Briefings",
        switch_theme: "Changer de thème",
        language: "Langue"
      }
    }
  },
  de: {
    translation: {
      nav: { home: "Start", identify: "Bestimmen", chat: "Chat", logbook: "Logbuch", tools: "Tools" },
      hero: {
        title: "Dein KI-Tauchpartner",
        subtitle: "Identifiziere Meereslebewesen, korrigiere Unterwasserfotos, chatte über deine Tauchgänge und plane Reisen.",
        cta: "Lass uns tauchen!"
      },
      header: {
        briefings: "Briefings",
        switch_theme: "Design wechseln",
        language: "Sprache"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Important: This ensures 'en-US' or 'en-GB' resolves to 'en'
    load: 'languageOnly',
    // Allow 'en-US' to match 'en'
    nonExplicitSupportedLngs: true,
    // Fallback language if detection fails
    fallbackLng: 'en',
    // Explicitly force 'en' if not detected to avoid empty keys
    lng: undefined, // Let detector handle it, but default to 'en' if missing via fallbackLng
    supportedLngs: ['en', 'es', 'fr', 'de'],
    debug: false,
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false 
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;