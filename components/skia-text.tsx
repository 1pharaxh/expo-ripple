import { View, Text, Platform } from 'react-native';
import React from 'react';
import { matchFont, Path, Skia } from '@shopify/react-native-skia';
interface SkiaTextProps {
  width: number;
  height: number;
}

const fontFamily = Platform.select({ ios: 'Palatino', default: 'serif' });
const font = matchFont({
  fontFamily,
  fontSize: 52,
  fontStyle: 'italic',
  fontWeight: '100',
});
const SkiaText = ({ width, height }: SkiaTextProps) => {
  if (!font) {
    return null;
  }
  const textPath = Skia.Path.MakeFromText('Tap to ripple', 0, 0, font)!;
  const bounds = textPath.getBounds();
  const dx = width / 2 - (bounds.x + bounds.width / 2);
  const dy = height / 2 - (bounds.y + bounds.height / 2);
  textPath.offset(dx, dy);

  return <Path path={textPath} color="white" style="fill" strokeWidth={5} />;
};

export { SkiaText };
