import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/colors';
import { GOOGLE_API_KEY } from '@/constants/config';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRef, useEffect } from 'react';

export default function MapAddressPicker({ onSelect, contStyle, inputStyle, address }) {
  const ref = useRef();

  useEffect(() => {
    ref.current?.setAddressText(address);
  }, [address]);

  const handleSelect = (data, details) => {
    const getComponent = (types) =>
      details.address_components.find((c) =>
        types.every((t) => c.types.includes(t)),
      )?.long_name;
    const place = {
      address: data.description,
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      postcode: getComponent(['postal_code']) || null,
      county:
        getComponent(['administrative_area_level_2']) ||
        getComponent(['administrative_area_level_1']) ||
        null,
    };
    // console.log('Selected place:', place);
    onSelect?.(place);
  };

  return (
      <View style={[styles.cont, contStyle]}>
       {/* Autocomplete */}
      <GooglePlacesAutocomplete
        placeholder="Enter New Address"
        fetchDetails
        onPress={handleSelect}
        ref={ref}
        clear={() => console.log('Cleared'  )}
        // currentLocation={true}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
          components: 'country:gb',
        }}
        enablePoweredByContainer={false}
        renderLeftButton={() => (
          <View style={styles.leftIcon}>
            <MaterialIcons name="search" size={22} color="#555" />
          </View>
        )}
        styles={{
          container: styles.autocompleteContainer,
          listView: styles.listView,
          textInput: [styles.input, inputStyle],       
    }}
        debounce={300}
      />
    </View>

  );
}
const styles = StyleSheet.create({
  autocompleteContainer: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 68,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    
  },
  input: {
    backgroundColor: '#fff',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  leftIcon: { justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});

// const styles = StyleSheet.create({
//   cont: {
//     flex: 0,
//     height: 40,
//     borderRadius: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   input: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 12,
//     fontSize: 16,
//     height: 38,
//     alignSelf: 'flex-end',
//   },
//   listView: { backgroundColor: '#fff', borderRadius: 18 },
// });