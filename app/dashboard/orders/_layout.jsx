import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="index" options={{ title: 'index' }} />
      <Stack.Screen name="findRider" options={{ title: 'findRider' }} />
      <Stack.Screen name="[id]" options={{ title: 'order details' }} />
      <Stack.Screen name="riderModal" 
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.375, 0.45],
          headerShown:false,
          sheetGrabberVisible: true,
          sheetCornerRadius: 48,
          title: 'Assign Rider',
          // gestureEnabled: false,
          headerStyle: {
            backgroundColor: '#fff', // optional
          },   
        }}/>
    </Stack>
  );
}
