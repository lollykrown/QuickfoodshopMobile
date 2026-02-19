import { Stack, useRouter, usePathname  } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import DrawerProvider from '@/contexts/DrawerProvider';
import { AuthProvider, useAuth } from "@/contexts/authContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartProvider } from '@/contexts/cartContext';
import { menuOptions } from "@/utils/misc";
import * as SplashScreen from "expo-splash-screen";
import LogoutScreen from "@/components/LogoutScreen";
import { View } from "react-native";

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
  const [appReady, setAppReady] = useState(false); // track when app is ready
  const splashHidden = useRef(false);
  const { logout,isLoggedIn,user, loading } = useAuth();

  const drawerItems = useMemo(() => menuOptions(pathname, router, user?.role, isLoggedIn),[isLoggedIn, pathname]);

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

  console.log(pathname)
      

  return (
    <View style={{ flex: 1 }}>
    <DrawerProvider drawerItems={drawerItems} user={user}logout={logout} isLoggedIn={isLoggedIn} side="left">
        <CartProvider>
          <SafeAreaProvider>
            <PaperProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
                {/* Hide dashboard routes from tab bar */}
                <Stack.Protected guard={isLoggedIn}>
                  <Stack.Screen
                    name="dashboard"
                    options={{ 
                      headerShown:false,
                    }}
                  />
                </Stack.Protected>
              </Stack>
              <StatusBar style="auto"  />
            </PaperProvider>
          </SafeAreaProvider>
        </CartProvider>
    </DrawerProvider>
    {loading && <LogoutScreen />}
    </View>
  );
}