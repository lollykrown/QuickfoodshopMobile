import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ShimmerExpoImage({ uri, width = 200, height = 200,accessibilityLabel, styles }) {
  const [loaded, setLoaded] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  // Start shimmer animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: '#eee', ...styles }}>
      {/* Expo Image with blurhash placeholder */}
      <Image
        source={ uri }
        placeholder={blurhash}   // blurhash placeholder
        contentFit="cover"
        transition={300}         // smooth fade
        style={{ width, height }}
        onLoadEnd={() => setLoaded(true)}
        accessibilityLabel={accessibilityLabel}
      />

      {/* Shimmer overlay */}
      {!loaded && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height,
            backgroundColor: 'rgba(255,255,255,0.2)',
            transform: [{ translateX }],
          }}
        />
      )}
    </View>
  );
}
