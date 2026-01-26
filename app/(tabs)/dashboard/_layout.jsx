import { Stack } from 'expo-router';


// export const unstable_settings = {
//   initialRouteName: 'overview',
//   // anchor:'home'
// };

export default function DashboardLayout() {
  return ( 
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* <Stack.Screen name="index" options={{title:'dashboard'}}/> */}
      <Stack.Screen name="account/index" options={{title:'account'}}/>
      <Stack.Screen name="favorites/index" options={{title:'favorites'}}/>
      <Stack.Screen name="invoice/index" options={{title:'invoice'}}/>
      <Stack.Screen name="notifications/index" options={{title:'notifications'}}/>
      <Stack.Screen name="orders/index" options={{title:'orders'}}/>
      <Stack.Screen name="settings" options={{title:'settings'}}/>
      <Stack.Screen name="tracking/index" options={{title:'tracking'}}/>
      <Stack.Screen name="transactions/index" options={{title:'transactions'}}/>
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