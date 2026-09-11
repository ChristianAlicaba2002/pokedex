import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <>
      {/* PokedexScreen */}
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        labelStyle={{ selected: { color: colors.text } }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name='home' />}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        {/* PokedexScreen */}
        <NativeTabs.Trigger name="pokemon">
          <NativeTabs.Trigger.Label>Pokedex</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name="pokeball" />}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        {/* FavoritesScreen */}
        <NativeTabs.Trigger name="favorites">
          <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name="heart" />}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        {/* MoreScreen */}
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name="dots-vertical" />}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
