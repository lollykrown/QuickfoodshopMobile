import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';

export default function TabLayout() {
  const { isLoggedIn } = useAuth();

  return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          headerShown: false,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <Ionicons name="home" size={24} color={color} />
              ) : (
                <Ionicons name="home-outline" size={24} color={color} />
              ),
              headerLeft: () => null,
              gestureEnabled: false,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <AntDesign name="search" size={24} color={color} />
              ) : (
                <Feather name="search" size={24} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="myCart"
          options={{
            title: 'My Cart',
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <Ionicons name="cart" size={24} color={color} />
              ) : (
                <Ionicons name="cart-outline" size={24} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: 'Support',
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <MaterialIcons name="person" size={24} color={color} />
              ) : (
                <MaterialIcons name="person-outline" size={24} color={color} />
              ),
          }}
        />
        {/* Hide dashboard routes from tab bar */}
        <Tabs.Protected guard={isLoggedIn}>
          <Tabs.Screen
            name="dashboard"
            options={{ href: null }}
          />
        </Tabs.Protected>

      </Tabs>
  );
}
