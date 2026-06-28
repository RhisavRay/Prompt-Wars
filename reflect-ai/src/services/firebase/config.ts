/**
 * Firebase Client SDK Configuration
 *
 * Reads values from public environment variables.
 * These keys are exposed to the client in Next.js.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that critical config values are present in development
if (process.env.NODE_ENV === 'development') {
  const missingKeys = Object.entries(firebaseConfig)
    .filter((entry) => !entry[1])
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn(
      `[Firebase Config WARNING]: The following keys are missing in your environment configuration: ${missingKeys.join(', ')}`
    );
  }
}
