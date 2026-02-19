import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const RipplePressable = ({
  children,
  onPress,
  onLongPress,
  disabled = false,
  rippleColor = 'rgba(0, 102, 52,0.15)',
  style,
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const radius = Math.sqrt(
    Math.pow(layout.width, 2) + Math.pow(layout.height, 2)
  );

  const onPressIn = (e) => {
    if (disabled) return;

    const { locationX, locationY } = e.nativeEvent;

    x.value = locationX;
    y.value = locationY;
    opacity.value = 1;
    scale.value = 0;

    scale.value = withTiming(1, { duration: 400 });
  };

  const onPressOut = () => {
    opacity.value = withTiming(0, { duration: 300 });
  };

  const rippleStyle = useAnimatedStyle(() => ({
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    backgroundColor: rippleColor,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    left: x.value - radius,
    top: y.value - radius,
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      onLongPress={onLongPress}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <Animated.View style={[styles.ripple, rippleStyle]} />
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // 🔑 clips ripple
  },
  ripple: {
    position: 'absolute',
  },
  disabled: {
    opacity: 0.5,
  }
});

export default RipplePressable;


{/* <RipplePressable
  style={{
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
  }}
  onPress={() => console.log('Pressed')}
  onLongPress={() => console.log('Long pressed')}
>
  <Text style={{ fontWeight: '600' }}>Press me</Text>
</RipplePressable> */}