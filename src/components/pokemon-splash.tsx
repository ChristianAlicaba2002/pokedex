import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const INTRO_MS = 3200;

const POKEMON_IDS = [1, 4, 7, 25, 39, 94, 133, 143];

function spriteUri(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}

function AnimatedPokemon({ id, delay }: { id: number; delay: number }) {
  const bounce = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 280 }));
    bounce.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 380, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [bounce, delay, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View style={style}>
      <Image source={spriteUri(id)} autoplay contentFit="contain" style={styles.sprite} />
    </Animated.View>
  );
}

function Pokeball({ size = 96 }: { size?: number }) {
  const band = size * 0.1;
  const buttonOuter = size * 0.3;
  const buttonInner = size * 0.16;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#F7F7F7',
      }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: size / 2,
          backgroundColor: '#EE1515',
        }}
      />
      <View
        style={{
          ...StyleSheet.absoluteFill,
          borderRadius: size / 2,
          borderWidth: band * 0.55,
          borderColor: '#1A1A1A',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size / 2 - band / 2,
          left: 0,
          right: 0,
          height: band,
          backgroundColor: '#1A1A1A',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size / 2 - buttonOuter / 2,
          left: size / 2 - buttonOuter / 2,
          width: buttonOuter,
          height: buttonOuter,
          borderRadius: buttonOuter / 2,
          backgroundColor: '#1A1A1A',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: buttonInner,
            height: buttonInner,
            borderRadius: buttonInner / 2,
            backgroundColor: '#F7F7F7',
            borderWidth: 3,
            borderColor: '#D4D4D4',
          }}
        />
      </View>
    </View>
  );
}

export function PokemonSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);
  const shadowScale = useSharedValue(1);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    bounce.value = withRepeat(
      withSequence(
        withTiming(-24, { duration: 420, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 420, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        withTiming(18, { duration: 420, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    shadowScale.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 420, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 420, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );

    titleOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });

    const timer = setTimeout(() => setVisible(false), INTRO_MS);
    return () => clearTimeout(timer);
  }, [bounce, rotate, shadowScale, titleOpacity]);

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }, { rotate: `${rotate.value}deg` }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadowScale.value }, { scaleY: shadowScale.value }],
    opacity: 0.16 + (1 - shadowScale.value) * 0.35,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 14 }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#071B3D', '#0A4D8C', '#14B8C4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.splash}>
        <Animated.View style={ballStyle}>
          <Pokeball />
        </Animated.View>
        <Animated.View style={[styles.shadow, shadowStyle]} />
        <View style={styles.roster}>
          {POKEMON_IDS.map((id, index) => (
            <AnimatedPokemon key={id} id={id} delay={index * 90} />
          ))}
        </View>
        <Animated.View style={[styles.copy, titleStyle]}>
          <Text style={styles.title}>Pokédex</Text>
          <Text style={styles.subtitle}>Gotta catch ’em all</Text>
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    marginTop: 10,
    height: 10,
    width: 72,
    borderRadius: 999,
    backgroundColor: '#000000',
  },
  roster: {
    marginTop: 22,
    width: '88%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  sprite: {
    width: 72,
    height: 72,
  },
  copy: {
    alignItems: 'center',
  },
  title: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(207, 250, 254, 0.9)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
