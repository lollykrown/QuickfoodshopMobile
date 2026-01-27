import React, { useState, useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  interpolate,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Line } from 'react-native-svg';

const AnimatedLine = Animated.createAnimatedComponent(Line);

const DottedLines = ({styles}) => {
  const dashOffset = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    dashOffset.value = withRepeat(
      withTiming(8, { duration: 500, easing: Easing.linear }),
      -1
    );

    pulse.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: -dashOffset.value,
    strokeWidth: interpolate(pulse.value, [0, 1], [2, 5]),
    strokeOpacity: interpolate(pulse.value, [0, 1], [0.6, 1]),
  }));

  return (
    <View style={{ flexDirection: 'row', gap: 8, ...styles }}>
      {/* Left section */}
      <View style={{ flexDirection: 'column' }}>
        <View
          style={{
            borderRadius: 28,
            width: 42,
            height: 42,
            borderWidth: 1,
            borderColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(26, 184, 84,0.15)',
          }}
        >
          <Ionicons name="cart-outline" size={24} color="#0f7a4a" />
        </View>
        {/* Dotted lines */}
        <Svg style={{ marginLeft: 20 }} width="2" height={48}>
          <AnimatedLine
            animatedProps={animatedProps}
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke={Colors.primary}
            strokeWidth="4"
            strokeDasharray="4 4"
          />
        </Svg>
        <View
          style={{
            borderRadius: 28,
            width: 42,
            height: 42,
            borderWidth: 1,
            borderColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(26, 184, 84,0.15)',
          }}
        >
          <Ionicons name="location" size={24} color="#0f7a4a" />
        </View>
      </View>
      {/* Middle section */}
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingVertical: 4,
        }}
      >
        <View
          style={{ flexDirection: 'column', gap: 2, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Gillian Store</Text>
          <Text style={{ color: Colors.grey }}>Pickup point </Text>
        </View>
        <View
          style={{ flexDirection: 'column', gap: 2, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: 600 }}>
            465 Peckham, London
          </Text>
          <Text style={{ color: Colors.grey }}>Destination</Text>
        </View>
      </View>
      {/* Right section */}
      <View
        style={{
          flexDirection: 'column',
          marginLeft: 'auto',
          justifyContent: 'space-between',
          paddingVertical: 4,
        }}
      >
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <Text style={{ fontSize: 16, color: Colors.grey }}>Payment </Text>
          <Text
            style={{
              color: Colors.green,
              fontSize: 16,
              backgroundColor: 'rgba(26, 184, 84,0.075)',
              fontWeight: 500,
              textAlign: 'center',
              borderRadius: 8,
              padding: 2,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            $310{' '}
          </Text>
        </View>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <Text style={{ fontSize: 16, color: Colors.grey }}>Distance</Text>
          <Text style={{ fontWeight: 600, textAlign: 'center' }}>12km</Text>
        </View>
      </View>
    </View>
  );
};

export default DottedLines;
