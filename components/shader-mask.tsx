// shader from https://www.shadertoy.com/view/WtlXDX
import { Group, Skia, RuntimeShader, Paint, vec, useClock } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import React from 'react';
import { PixelRatio } from 'react-native';
import { SharedValue, useDerivedValue, useSharedValue } from 'react-native-reanimated';

const pd = PixelRatio.get();
const sksl = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float2 resolution;
uniform vec3 r0, r1, r2, r3, r4, r5;

half4 main(float2 fragCoord) {
    float2 uv = fragCoord / resolution;
    
    float aspect = resolution.x / resolution.y;
    
    vec2 totalOffset = vec2(0.0);
    
    vec3 ripples[6]; 
    ripples[0]=r0; ripples[1]=r1; ripples[2]=r2; 
    ripples[3]=r3; ripples[4]=r4; ripples[5]=r5;

    for (int i = 0; i < 6; i++) {
        float age = ripples[i].z;
        if (age < 0.0 || age > 4.0) continue;

        vec2 center = ripples[i].xy / resolution;

        vec2 dv = center - uv;
        vec2 dvAspect = dv;
        dvAspect.x *= aspect; 
        float dis = length(dvAspect);

        //use this to control ripple offset
        float rippleOffset = age * 0.3; 
        float sinFactor = 0.04 * sin(dis * 40.0 + age * -12.0);
        float discardFactor = clamp(0.2 - abs(rippleOffset - dis), 0.0, 1.0) / 0.2;
        
        totalOffset += normalize(dv) * sinFactor * discardFactor;
    }

    vec2 finalUV = uv + totalOffset;
    finalUV = clamp(finalUV, vec2(0.001), vec2(0.999));
    return image.eval(finalUV * resolution);
}
`)!;
interface ShaderMaskProps {
  children: ReactNode | ReactNode[];
  width: number;
  height: number;
  pointer: SharedValue<{
    x: number;
    y: number;
  }>;
}
const ShaderMask = ({ children, width, height, pointer }: ShaderMaskProps) => {
  const time = useClock();
  // from https://x.com/heyiamdk/status/2003586331172020381
  // inactive ripples
  const rippleData = useSharedValue([
    [-1000, -1000, -1],
    [-1000, -1000, -1],
    [-1000, -1000, -1],
    [-1000, -1000, -1],
    [-1000, -1000, -1],
    [-1000, -1000, -1],
  ]);
  const lastIndex = useSharedValue(0);
  const lastProcessedPointer = useSharedValue({ x: 0, y: 0 });

  //overwrite the oldest ripple with the new coordinates and the current time
  useDerivedValue(() => {
    if (pointer.value.x !== lastProcessedPointer.value.x && pointer.value.x !== 0) {
      const nextIdx = (lastIndex.value + 1) % rippleData.get().length;
      const updated = [...rippleData.value];
      updated[nextIdx] = [pointer.value.x * pd, pointer.value.y * pd, time.value / 1000];

      rippleData.value = updated;
      lastIndex.value = nextIdx;
      lastProcessedPointer.value = { x: pointer.value.x, y: pointer.value.y };
    }
  }, [pointer, lastProcessedPointer, lastIndex]);
  const uniforms = useDerivedValue(() => {
    const t = time.value / 1000;

    const getR = (i: number) => {
      const r = rippleData.value[i];
      return [r[0], r[1], r[2] === -1 ? -1 : t - r[2]];
    };

    console.log({
      r0: getR(0),
      r1: getR(1),
      r2: getR(2),
      r3: getR(3),
      r4: getR(4),
      r5: getR(5),
    });

    return {
      resolution: vec(width * pd, height * pd),
      r0: getR(0),
      r1: getR(1),
      r2: getR(2),
      r3: getR(3),
      r4: getR(4),
      r5: getR(5),
    };
  });

  return (
    <Group transform={[{ scale: 1 / pd }]}>
      <Group
        layer={
          <Paint>
            <RuntimeShader source={sksl} uniforms={uniforms} />
          </Paint>
        }
        transform={[{ scale: pd }]}>
        {children}
      </Group>
    </Group>
  );
};

export { ShaderMask };
