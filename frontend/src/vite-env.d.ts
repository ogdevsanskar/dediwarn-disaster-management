/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WEBSOCKET_URL?: string;
  readonly VITE_MAPS_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_DEBUG?: string;
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
