import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import RipplePressable from './RipplePressable';
import { Colors } from '@/constants/colors';

export default function CurrentLocationButton({ onSelect }) {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const [place] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const result = {
        address: [
          place.name,
          place.street,
          place.city,
          place.postalCode,
        ].filter(Boolean).join(', '),
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        postcode: place.postalCode || null,
        county: place.region || null,
      };

      onSelect?.(result);
    } catch (err) {
      console.error('Location error:', err);
      alert('Unable to get location');
    } finally {
      setLoading(false);
    }
  };

  return (
        <RipplePressable 
            style={[styles.button, loading && styles.disabled]}
            onPress={getCurrentLocation}
            disabled={loading}
          >
        {loading ? (
            <ActivityIndicator style={styles.view} color={Colors.primary}/>
        ) : (
            <View style={styles.view}>
            <MaterialIcons name="my-location" size={20} color={Colors.green}  />
            <Text style={styles.buttonText}>Use current location</Text>
            </View>
        )}
          </RipplePressable>
  );
}

const styles = StyleSheet.create({
    view: {
      flexDirection:'row', 
      alignItems:'center', 
      paddingVertical: 22,
      // marginHorizontal:20,
      gap:12
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        marginTop: 8,
        gap:12, 
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    disabled: {
        opacity: 0.6,
    },
});
