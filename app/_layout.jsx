import { Stack, useRouter, usePathname  } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import DrawerProvider from '@/contexts/DrawerProvider';
import { AuthProvider } from "@/contexts/authContext";
// import { CartProvider } from '@/contexts/cartContext';


export default function RootLayout() {
      const router = useRouter();
    const pathname = usePathname()
    
    console.log(pathname)

    const logoutBtn = { 
        label: 'Log Out', 
        icon: 'logout',
        active: pathname === '/log-ut',
        onPress: () => console.log('logout')
      }

    const drawerItems = [
      { 
        label: 'Home', 
        icon: 'home',
        active: pathname.includes('/home'),
        onPress: () => router.push('/home') 
      },
      { 
        label: 'Dashboard', 
        icon: 'view-dashboard',
        active: pathname.includes('/searcg'),
        onPress: () => router.push('/search') 
      },
      {
      label: 'Notifications',
      icon: 'bell',
      badge: 3,
      active: pathname.includes('/notifications'),
      onPress: () => router.push('/notifications'),
      },
      { label: 'Orders', 
        icon:'human-queue',
        onPress: () => router.push('/orders')  },
      { 
        label: 'Tracking', 
        icon: 'map-marker',
        active: pathname.includes('/tracking'),
        onPress: () => console.log('Go Support') },
      { label: 'Transactions', 
        icon:'compare-horizontal',
        onPress: () => console.log('Go Support') },
      { 
        label: 'My Invoice', 
        icon:'invoice-edit',
        onPress: () => console.log('Go Support') },
      { label: 'My favorites', 
        icon:'cards-heart',
        onPress: () => console.log('Go Support') },
      { label: 'Settings', icon:'cog',
        onPress: () => router.push('/settings')  },
    ];
  return (
    <DrawerProvider drawerItems={drawerItems} logout={logoutBtn} side="left">
      <AuthProvider>
        {/* <CartProvider> */}
          <SafeAreaProvider>
            <PaperProvider>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="stores" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
                <Stack.Screen name="index" 
                  options={{ 
                    headerShown: false,  
                    // animation:'slide_from_right',
                    //  animationDuration:'27000'
                    }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen name="modal2" options={{ 
                  presentation: 'formSheet', 
                  sheetAllowedDetents:[0.3,0.5,0.7],
                  title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </PaperProvider>
          </SafeAreaProvider>
        {/* </CartProvider> */}
      </AuthProvider>
    </DrawerProvider>
  );
}