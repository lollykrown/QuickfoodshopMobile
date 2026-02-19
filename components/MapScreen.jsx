import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { FontAwesome6 } from '@expo/vector-icons';
import polyline from '@mapbox/polyline'; // decode Google polyline
import { useCart } from '@/contexts/cartContext';

const DEFAULT_START = { latitude: 54.9010769, longitude: -1.3947494};
const DEFAULT_END = { latitude: 54.9032838, longitude: -1.3779205 };
const GOOGLE_API_KEY = 'AIzaSyBT6a6iiaA_MJf65TzhkcHIm3ttCf0N-Hs'; 

const RouteMap = ({
  start = DEFAULT_START,
  end = DEFAULT_END,
  strokeColor = '#FF6600',
  strokeWidth = 4,
  onRouteInfo
}) => {
  const { deliveryAddress, setAddress } =
    useCart();
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulsating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  // Fetch route
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const resp = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${GOOGLE_API_KEY}`
        );
        const data = await resp.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];

          // console.log('Distance:', leg.distance, 'ETA:', leg.duration.text);
          onRouteInfo?.({ distance:leg.distance.text, eta: leg.duration.text });
          setAddress({ ...deliveryAddress, distance: leg.distance.value, eta: leg.duration.text });
          const points = polyline.decode(data.routes[0].overview_polyline.points);
          const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
          setRouteCoords(coords);

          // Fit map to markers + route
          if (mapRef.current && coords.length > 0) {
            mapRef.current.fitToCoordinates([start, end, ...coords], {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching route:', err);
      }
    };

    fetchRoute();
  }, [start, end]);

    // Snap to start point
  const snapToStart = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...end,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };
  return (
    <MapView ref={mapRef} style={styles.map}>
      {/* Start marker with pulse */}
      <Marker coordinate={start}>
        <FontAwesome6 name="location-dot" size={24} color="red" />
      </Marker>

      {/* End marker */}
      <Marker coordinate={end}>
        <View style={styles.pulseWrapper}>
          <Animated.View style={[styles.pulse, { transform: [{ scale }], opacity }]} />
          <View style={styles.startDot} />
        </View>
      </Marker>

      {/* Polyline */}
      {routeCoords.length > 0 && (
        <Polyline coordinates={routeCoords} strokeColor={strokeColor} strokeWidth={strokeWidth} />
      )}

      {/* Snap to start button */}
      <TouchableOpacity style={styles.button} onPress={snapToStart}>
          <View style={styles.startDot} />
      </TouchableOpacity>
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1, paddingHorizontal:20, borderRadius:16 },
  pulseWrapper: { alignItems: 'center', justifyContent: 'center' },
  pulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'red',
  },
  startDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: '#fff',
  },
  button: {
    position: 'absolute',
    bottom: 20,
    right: 50,
    // transform: [{ translateX: -75 }],
    backgroundColor: 'rgba(0, 102, 52,0.75)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default RouteMap;
