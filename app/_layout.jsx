import { Stack, useRouter, usePathname, SplashScreen  } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import DrawerProvider from '@/contexts/DrawerProvider';
import { AuthProvider, useAuth } from "@/contexts/authContext";
import { useEffect, useRef } from "react";
import { Protected } from "@/components/Guard";
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
  const { logout,isLoggedIn, loading } = useAuth();
  const splashHidden = useRef(false);

  // console.log(pathname)

      useEffect(() => {
        if (!loading && !splashHidden.current) {
          splashHidden.current = true;
          SplashScreen.hideAsync().catch(() => {});
        }
      }, [loading]);

      if (loading) return null;

      const logoutBtn = {
        label: 'Log Out',
        icon: 'logout',
        active: pathname === '/logout',
        onPress: () => logout(),
      };
      const drawerItems = isLoggedIn? [
        {
          label: 'Home',
          icon: 'home',
          active: pathname.includes('/home'),
          onPress: () => router.push('/home'),
        },
        {
          label: 'Dashboard',
          icon: 'view-dashboard',
          active: pathname.includes('/searcg'),
          onPress: () => router.push('/search'),
        },
        {
          label: 'Notifications',
          icon: 'bell',
          badge: 3,
          active: pathname.includes('/notifications'),
          onPress: () => router.push('/notifications'),
        },
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
        label: 'Log In',
        icon: 'login',
        active: pathname === '/login',
        onPress: () => logout(),
      }];
  return (
    <DrawerProvider drawerItems={drawerItems} logout={logoutBtn} isLoggedIn={isLoggedIn} side="left">
        {/* <CartProvider> */}
          <SafeAreaProvider>
            <PaperProvider>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="stores" options={{ headerShown: false }} />
                <Stack.Protected guard={isLoggedIn}>
                  <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                </Stack.Protected>
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
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