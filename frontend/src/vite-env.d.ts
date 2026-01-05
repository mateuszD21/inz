/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_API_URL: string
  // Dodaj tutaj inne zmienne środowiskowe jeśli będą potrzebne
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}