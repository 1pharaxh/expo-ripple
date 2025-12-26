import { Platform, useWindowDimensions, View } from 'react-native';
import React from 'react';
import {
  Canvas,
  Image,
  matchFont,
  Path,
  Skia,
  useImageAsTexture,
} from '@shopify/react-native-skia';
import { cssInterop } from 'nativewind';
import { ShaderMask } from './shader-mask';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { SkiaText } from './skia-text';
const StyledCanvas = cssInterop(Canvas, { className: 'style' });

const SkiaRipple = () => {
  const texture = useImageAsTexture(require('../assets/wallpaper.jpg'));
  const { height, width } = useWindowDimensions();
  const pointer = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Tap().onStart((e) => {
    pointer.set(e);
  });

  return (
    <View className="flex-1 bg-white">
      <GestureDetector gesture={gesture}>
        <StyledCanvas className="flex-1" style={{ height, width }}>
          <ShaderMask height={height} width={width} pointer={pointer}>
            <Image image={texture} height={height} width={width} fit="cover" />
            <SkiaText width={width} height={height} />
          </ShaderMask>
        </StyledCanvas>
      </GestureDetector>
    </View>
  );
};

export { SkiaRipple };
