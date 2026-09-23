import { ScreenTheme } from '@/constants/screen-theme';
import { View } from 'react-native';

export const SkeletonCard = ({ colors }: { colors: ScreenTheme }) => (
  <View className="mb-4 flex-1 mx-1.5">
    <View
      className="mt-8 min-h-[169px] overflow-hidden rounded-[28px] px-3.5 pb-3.5 pt-12"
      style={{ backgroundColor: colors.card }}>
      <View
        className="mb-2 h-4 w-20 animate-pulse rounded-md"
        style={{ backgroundColor: colors.skeleton }}
      />
      <View
        className="h-4 w-12 animate-pulse rounded-full"
        style={{ backgroundColor: colors.skeleton }}
      />
    </View>
    <View className="absolute left-0 right-0 top-0 items-center">
      <View
        className="h-32 w-32 animate-pulse rounded-full"
        style={{ backgroundColor: colors.skeleton }}
      />
    </View>
  </View>
);

export const FeaturedSkeleton = ({ colors }: { colors: ScreenTheme }) => (
  <View
    className="mb-5 mx-1.5 h-40 overflow-hidden rounded-[32px] px-5 py-5"
    style={{ backgroundColor: colors.card }}>
    <View
      className="h-5 w-20 animate-pulse rounded-full"
      style={{ backgroundColor: colors.skeleton }}
    />
    <View
      className="mt-4 h-8 w-36 animate-pulse rounded-lg"
      style={{ backgroundColor: colors.skeleton }}
    />
    <View
      className="mt-3 h-5 w-24 animate-pulse rounded-full"
      style={{ backgroundColor: colors.skeleton }}
    />
  </View>
);
