import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';

export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const initNativeAndroid = (
  isDark: boolean,
  onBackButton?: () => boolean // return true if handled, false to let default exit
) => {
  if (!Capacitor.isNativePlatform()) return;

  // Initialize status bar
  try {
    StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
    StatusBar.setBackgroundColor({
      color: isDark ? '#09090b' : '#064e3b',
    });
  } catch (err) {
    console.warn('[NativeService] StatusBar init note:', err);
  }

  // Handle hardware Android back button
  if (onBackButton) {
    try {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        const handled = onBackButton();
        if (!handled) {
          if (canGoBack) {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        }
      });
    } catch (err) {
      console.warn('[NativeService] BackButton listener note:', err);
    }
  }
};
