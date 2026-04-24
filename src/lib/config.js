// PresaWatch Web — configuration
// All values come from environment variables (Vite prefix: VITE_)
// Never commit real values — use .env.local for local dev

export const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const GOOGLE_SIGNIN_CLIENT_ID = import.meta.env.VITE_GOOGLE_SIGNIN_CLIENT_ID;
export const GOOGLE_MAPS_API_KEY     = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const API_URL                 = import.meta.env.VITE_API_URL;
export const API_BASE                = String(import.meta.env.VITE_API_URL ?? "").replace(/\/reports\/?$/, "");

export const DONATE_PAYPAL = "rammsdoct";
export const DONATE_PHONE  = "#4491931535";
