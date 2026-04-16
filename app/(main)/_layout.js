import { Stack } from 'expo-router';

import { COLORS } from '../../lib/constants';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Stack.Screen
        name="orders"
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen
        name="order/[id]"
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Stack>
  );
}
