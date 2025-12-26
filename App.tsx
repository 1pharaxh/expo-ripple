import { StatusBar } from 'expo-status-bar';

import './global.css';
import { SkiaRipple } from 'components/skia-ripple';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView>
      <StatusBar style="auto" />
      <SkiaRipple />
    </GestureHandlerRootView>
  );
}
