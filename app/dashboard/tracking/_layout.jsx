import { Stack } from 'expo-router';


export default function TrackingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="index" options={{ title: 'tracking' }} />
      <Stack.Screen name="[id]" options={{ title: 'tracking details' }} />
      <Stack.Screen
        name="trackingModal"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.4,0.6, 0.9],
          headerShown: false,
          sheetGrabberVisible: true,
          sheetCornerRadius: 48,
          headerStyle: {
            backgroundColor: '#fff', // optional
          },
        }}
      />
    </Stack>
  );
}



// app/
//  └─ (tabs)/
//  └─----- _layout.jsx
//  └─----- home.jsx
//  └─----- search.jsx
//  └─----- cart.jsx
//  └─----  dashboard/
//                 ├─ _layout.jsx
//                 ├─ index.jsx          
//                 ├─ orders/
//                 │  └─ index.jsx
//                 ├─ invoice/
//                 │  └─ index.jsx
//                 ├─ tracking/
//                 │  └─ index.jsx
//                 └─ overview/
//                   └─ index.jsx 