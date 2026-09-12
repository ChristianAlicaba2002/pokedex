import { View } from 'react-native';

type PokeBallMarkProps = {
  color?: string;
  size?: number;
  className?: string;
};

export function PokeBallMark({ color = '#FFFFFF', size = 140, className }: PokeBallMarkProps) {
  const stroke = size * 0.08;
  const button = size * 0.28;

  return (
    <View
      pointerEvents="none"
      className={className}
      style={{ width: size, height: size, opacity: 0.16 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size / 2 - stroke / 2,
          left: 0,
          right: 0,
          height: stroke,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size / 2 - button / 2,
          left: size / 2 - button / 2,
          width: button,
          height: button,
          borderRadius: button / 2,
          borderWidth: stroke * 0.85,
          borderColor: color,
        }}
      />
    </View>
  );
}
