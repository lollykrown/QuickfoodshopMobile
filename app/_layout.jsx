import { Stack, useRouter, usePathname, SplashScreen  } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import DrawerProvider from '@/contexts/DrawerProvider';
import { AuthProvider, useAuth } from "@/contexts/authContext";
import { useEffect, useMemo, useRef, useState } from "react";
// import { CartProvider } from '@/contexts/cartContext';

SplashScreen.preventAutoHideAsync()





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

  console.log(pathname)

      const drawerItems = useMemo(() => {
        if (!isLoggedIn) {
          return [{
      label: 'Login to account',
      icon: 'login',
      active: pathname === '/login',
      href: '/customer/login',
    }];
  }
        return [
        {
          label: 'Dashboard',
          icon: 'view-dashboard',
          active: pathname === '/dashboard',
          onPress: () => router.push('/dashboard/overview'),
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
          active: pathname.includes('/orders'),
          href:'/dashboard/orders',
          onPress: () => router.push('/dashboard/orders'),
        },
        {
          label: 'Tracking',
          icon: 'map-marker',
          active: pathname.includes('/tracking'),
                    href:'/dashboard/tracking',

          onPress: () => router.push('/dashboard/tracking'),
        },
        {
          label: 'Transactions',
          icon: 'compare-horizontal',
          active: pathname.includes('/transactions'),
                    href:'/dashboard/transactions',

          onPress: () => router.push('/dashboard/transactions'),
        },
        {
          label: 'My Invoice',
          icon: 'invoice-edit',
          active: pathname.includes('/invoice'),
          onPress: () => router.push('/dashboard/invoice'),
        },
        {
          label: 'My favorites',
          icon: 'cards-heart',
          active: pathname.includes('/favorites'),
          onPress: () => router.push('/dashboard/favorites'),
        },
        {
          label: 'Settings',
          icon: 'cog',
          active: pathname.includes('/settings'),
          onPress: () => router.push('/dashboard/settings'),
        },
      ]},[isLoggedIn, pathname]);
      
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