import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="toko" />
      <Stack.Screen name="barang" />
      <Stack.Screen name="penitipan" />
      <Stack.Screen name="map-tracking" />
      <Stack.Screen name="pemasok-management" />
      <Stack.Screen name="pelanggan-management" />
    </Stack>
  );
}