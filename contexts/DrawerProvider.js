import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  Easing,
  Text,
} from 'react-native';
import { Drawer, Divider } from 'react-native-paper';

const DrawerContext = createContext(null);
export const useDrawer = () => useContext(DrawerContext);

const DRAWER_WIDTH = 260;

export default function DrawerProvider({
  children,
  drawerItems = [],
  logout,
  side = 'left',
}) {
  const [open, setOpen] = useState(false);

  // Drawer position
  const translateX = useRef(
    new Animated.Value(side === 'left' ? -DRAWER_WIDTH : DRAWER_WIDTH)
  ).current;

  // Overlay fades based on drawer position
  const overlayOpacity = translateX.interpolate({
    inputRange:
      side === 'left'
        ? [-DRAWER_WIDTH, 0]
        : [0, DRAWER_WIDTH],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  /* ---------------- ANIMATION ---------------- */

  const animateTo = value => {
    Animated.timing(translateX, {
      toValue: value,
      duration: 320, // 👈 slower, smoother
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    animateTo(
      open
        ? 0
        : side === 'left'
        ? -DRAWER_WIDTH
        : DRAWER_WIDTH
    );
  }, [open, side]);

  /* ---------------- GESTURES ---------------- */

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,

      onPanResponderMove: (_, g) => {
        if (side === 'left') {
          translateX.setValue(
            Math.min(0, Math.max(-DRAWER_WIDTH, g.dx))
          );
        } else {
          translateX.setValue(
            Math.max(0, Math.min(DRAWER_WIDTH, g.dx))
          );
        }
      },

      onPanResponderRelease: (_, g) => {
        const shouldOpen =
          side === 'left'
            ? g.dx > DRAWER_WIDTH * 0.35 || g.vx > 0.8
            : g.dx < -DRAWER_WIDTH * 0.35 || g.vx < -0.8;

        setOpen(shouldOpen);
      },
    })
  ).current;

  /* ---------------- CONTEXT API ---------------- */

  const api = {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(v => !v),
  };

  return (
    <DrawerContext.Provider value={api}>
      {children}

      {/* MODAL LAYER */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        {/* TAP-TO-CLOSE OVERLAY */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.overlay,
              { opacity: overlayOpacity },
            ]}
          />
        </Pressable>

        {/* DRAWER */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.drawer,
            side === 'left' ? { left: 0 } : { right: 0 },
            { transform: [{ translateX }] },
          ]}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Drawer.Section title="Menu" showDivider={false}>
              <Image
                source={require('../assets/images/logo_transparent.png')}
                style={{ width: 200, height: 150, marginHorizontal:'auto', contentFit: 'contain' }}
              />              
              {drawerItems.map((item, i) => (
                <Drawer.Item
                  key={i}
                  label={item.label}
                  active={item.active}
                  icon={({ color, size }) => (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={size}
                      color={item.active ? '#22c55e' : '#64748b'} // active/inactive color
                    />
                  )}
                  style={[
                    styles.drawerItem,
                    item.active && styles.drawerItemActive,
                  ]}
                  labelStyle={[
                    styles.drawerLabel,
                    item.active && styles.drawerLabelActive,
                  ]}
                  right={
                    item.badge
                      ? props => (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                          </View>
                        )
                      : undefined
                  }
                  onPress={() => {
                    item.onPress?.();
                    setOpen(false);
                  }}
                />
              ))}
              <Divider bold={true}/>
              <Drawer.Item
                label={logout.label}
                active={logout.active}
                icon={({ color, size }) => (
                    <MaterialCommunityIcons
                      name={logout.icon}
                      size={size}
                      color={logout.active ? '#22c55e' : '#64748b'} // active/inactive color
                    />
                  )}
                style={[
                    styles.drawerItem,
                    logout.active && styles.drawerItemActive,
                  ]}
                  labelStyle={[
                    styles.drawerLabel,
                    logout.active && styles.drawerLabelActive,
                  ]}
                  onPress={() => {
                    logout.onPress?.();
                    setOpen(false);
                  }}
              />
            </Drawer.Section>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    elevation: 20,
  },
    drawerItem: {
    borderRadius: 12,
    marginHorizontal: 8,
  },

  drawerItemActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)', // soft green highlight
  },

  drawerLabel: {
    fontSize: 15,
    color: '#64748b', // inactive color
  },

  drawerLabelActive: {
    fontWeight: '600',
    color: '#22c55e', // active color
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
    badge: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
