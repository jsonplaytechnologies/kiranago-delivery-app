import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
