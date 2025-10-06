import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

export const initializeCapacitor = async () => {
  // Configurar Status Bar
  await StatusBar.setStyle({ style: Style.Light });
  await StatusBar.setBackgroundColor({ color: '#10b981' });

  // Configurar teclado
  Keyboard.addListener('keyboardWillShow', () => {
    document.body.classList.add('keyboard-open');
  });

  Keyboard.addListener('keyboardWillHide', () => {
    document.body.classList.remove('keyboard-open');
  });

  // Esconder Splash Screen após a inicialização
  await SplashScreen.hide();
};

// Verificar se está rodando no dispositivo
export const isNativeApp = () => {
  return window.location.protocol === 'capacitor:';
};

// Configurações específicas para iOS
export const iosConfig = {
  // Configurações de scroll suave para iOS
  configureScrolling: () => {
    if (isNativeApp()) {
      (document.body.style as any).webkitOverflowScrolling = 'touch';
    }
  },

  // Safe area para iPhone X+
  configureSafeArea: () => {
    if (isNativeApp()) {
      const root = document.documentElement;
      root.style.paddingTop = 'env(safe-area-inset-top)';
      root.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }
  }
};