import { Stack, useRouter, usePathname, SplashScreen  } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import DrawerProvider from '@/contexts/DrawerProvider';
import { AuthProvider, useAuth } from "@/contexts/authContext";
import { useEffect, useRef, useState } from "react";
// import { CartProvider } from '@/contexts/cartContext';

SplashScreen.preventAutoHideAsync()

// export const unstable_settings = {
//   anchor: 'index', // Anchor to the index route
// };

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout,isLoggedIn,user, loading } = useAuth();
    const [appReady, setAppReady] = useState(false); // track when app is ready

  const splashHidden = useRef(false);

  // console.log(pathname)

    useEffect(() => {
    async function prepare() {
      if (!loading) {
        // Optional: any async setup like fonts, data fetch
        setAppReady(true);
      }
    }
    prepare();
  }, [loading]);


  useEffect(() => {
    if (appReady && !splashHidden.current) {
          splashHidden.current = true;
          SplashScreen.hideAsync().catch(() => {});
        }
  }, [appReady]);

  if (!appReady) {
    // Keep splash screen visible until appReady is true
    return null;
  }

      const drawerItems = isLoggedIn? [
        {
          label: 'Dashboard',
          icon: 'view-dashboard',
          active: pathname === '/dashboard',
          onPress: () => router.push('/dashboard'),
        },
        // {
        //   label: 'Notifications',
        //   icon: 'bell',
        //   badge: 3,
        //   active: pathname.includes('/notifications'),
        //   onPress: () => router.push('/dashboard/notifications'),
        // },
        {
          label: 'Orders',
          icon: 'human-queue',
          onPress: () => router.push('/orders'),
        },
        {
          label: 'Tracking',
          icon: 'map-marker',
          active: pathname.includes('/tracking'),
          onPress: () => router.push('tracking'),
        },
        {
          label: 'Transactions',
          icon: 'compare-horizontal',
          onPress: () => router.push('transactions'),
        },
        {
          label: 'My Invoice',
          icon: 'invoice-edit',
          onPress: () => router.push('invoice'),
        },
        {
          label: 'My favorites',
          icon: 'cards-heart',
          onPress: () => router.push('/favorites'),
        },
        {
          label: 'Settings',
          icon: 'cog',
          onPress: () => router.push('/dashboard/settings'),
        },
      ]: [{
        label: 'Login to account',
        icon: 'login',
        active: pathname === '/login',
        onPress: () => router.push('/customer/login'),
      }];
  return (
    <DrawerProvider drawerItems={drawerItems} user={user}logout={logout} isLoggedIn={isLoggedIn} side="left">
        {/* <CartProvider> */}
          <SafeAreaProvider>
            <PaperProvider>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="stores" options={{ headerShown: false }} />
                <Stack.Screen name="index" 
                  options={{ 
                    headerShown: false,  
                    // animation:'slide_from_right',
                    //  animationDuration:'27000'
                    }} />
                <Stack.Screen name="modal" 
                    options={{
                      
                      presentation: 'formSheet',
                      sheetAllowedDetents: [0.6, 0.8],
                      headerShown:false,
                      sheetGrabberVisible: true,
                      sheetCornerRadius: 48,
                      title: 'Login',
                      gestureEnabled: false,
                      headerStyle: {
                        backgroundColor: '#fff', // optional
                      },   
                   }}
                />
                <Stack.Screen name="modal2" 
                    options={{
                      presentation: 'formSheet',
                      sheetAllowedDetents: [0.3, 0.5, 0.7],
                      // headerShown:false,
                      sheetGrabberVisible: true,
                      sheetCornerRadius: 48,
                      title: 'Login',
                      gestureEnabled: false,
                    }}
                />
              </Stack>
              <StatusBar style="auto" />
            </PaperProvider>
          </SafeAreaProvider>
        {/* </CartProvider> */}
    </DrawerProvider>
  );
}