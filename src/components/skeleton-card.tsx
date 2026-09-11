import { View } from "react-native";

export  const SkeletonCard = () => (
    <View className="mb-4 flex-1 mx-1.5 overflow-hidden rounded-3xl bg-white shadow-md shadow-slate-200/50">
      <View className="p-4">
        <View className="mb-3 h-3 w-12 animate-pulse rounded-full bg-slate-200" />
        <View className="mx-auto mb-3 h-24 w-24 animate-pulse rounded-full bg-slate-200" />
        <View className="mx-auto mb-2 h-5 w-24 animate-pulse rounded-lg bg-slate-200" />
        <View className="mx-auto h-4 w-16 animate-pulse rounded-full bg-slate-200" />
      </View>
    </View>
  );