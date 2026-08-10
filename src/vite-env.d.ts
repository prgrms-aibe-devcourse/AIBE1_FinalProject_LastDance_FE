/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_VAPID_PUBLIC_KEY: string
  readonly VITE_LOGO_URL: string
  readonly VITE_MAIN_PAGE_IMAGE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
