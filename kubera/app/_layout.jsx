import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* headerShown: false removes that 'index' title from the top */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}