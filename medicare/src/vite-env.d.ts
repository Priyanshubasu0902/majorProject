/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PHARMACY_APP_URL: string;
  readonly VITE_LAB_APP_URL: string;
  readonly VITE_DOCTOR_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
