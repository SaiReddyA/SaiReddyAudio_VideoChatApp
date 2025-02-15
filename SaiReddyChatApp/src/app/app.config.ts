import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideAuth(() => getAuth()), provideAnimationsAsync()
    ]
};

export const firebaseConfig = {
  apiKey: "AIzaSyBgUmwPnwi8aen2_p9cKBvRkpJCgk3nRgc",
  authDomain: "saireddya8978-4cc66.firebaseapp.com",
  projectId: "saireddya8978-4cc66",
  storageBucket: "saireddya8978-4cc66.firebasestorage.app",
  messagingSenderId: "151346652561",
  appId: "1:151346652561:web:84e6bd25d20b488c446630",
  measurementId: "G-BWFHHPE0KN"
}; 