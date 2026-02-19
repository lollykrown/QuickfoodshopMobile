import AddressPicker from '@/components/AddressInput';
import CurrentLocationButton from '@/components/CurrentLocation';
import RouteMap from '@/components/MapScreen';
import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useCart } from '@/contexts/cartContext';
import { Fontisto, Octicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';

const Delivery = () => {
  const [addr, setAddr] = useState(null);
  const [cord, setCord] = useState({});
  const [routeInfo, setRouteInfo] = useState(null);
  const { cartItems, setAddress, deliveryAddress } = useCart();

  const router = useRouter();
  const drawer = useDrawer();

  const handleSelect = (place) => {
    setAddr(place?.address);
    // console.log('routeInfo',routeInfo)
    setAddress({...deliveryAddress, ...place});

    setCord({ latitude: place.lat, longitude: place.lng });
  };

  const handleNext = () => {
    if (addr) {
      router.push('/myCart');
    } else {
      alert('Please select a delivery address before proceeding to payment.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Delivery Address"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            padding: 4,
            gap: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Octicons name="check-circle-fill" size={20} color="black" />
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Delivery</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            padding: 4,
            gap: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Octicons name="check-circle-fill" size={20} color="#C4C4C4" />
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#C4C4C4' }}>
            Payment
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            padding: 4,
            gap: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Octicons name="check-circle-fill" size={20} color="#C4C4C4" />
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#C4C4C4' }}>
            Summary
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 0 }}>
        <AddressPicker onSelect={handleSelect} address={addr} />
        <Pressable onPress={() => Keyboard.dismiss()}>
          <View
            style={{
              backgroundColor: Colors.primary,
              alignSelf: 'center',
              padding: 11,
              borderRadius: 12,
              position: 'absolute',
              top: 22,
              right: 12,
            }}
          >
            <Fontisto
              style={{ transform: 'rotate(90deg)' }}
              name="equalizer"
              size={20}
              color="white"
            />
          </View>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 60 }}>
        <CurrentLocationButton onSelect={handleSelect} />

        <View style={{ height: 1, backgroundColor: Colors.border, marginBottom: 22 }}  />
        <Text style={{ fontWeight: 700, fontSize: 16 }}>Selected location</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 8,
          }}
        >
          <Ionicons name="map-outline" size={24} color={Colors.green} />
          {addr ? (
            <Text
              numberOfLines={2}
              style={{ flex: 1, fontSize: 16, color: Colors.grey }}
            >
              {addr}
            </Text>
          ) : (
            <Text
              numberOfLines={2}
              style={{ flex: 1, fontSize: 16, color: Colors.grey }}
            >
              No location selected, type your address in the box above, or tap
              on the use current location below
            </Text>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 8,
          }}
        >
          <MaterialCommunityIcons
            name="clock-time-three"
            size={24}
            color={Colors.green}
          />
          <Text style={{ fontSize: 16, color: Colors.grey }}>25 min</Text>
        </View>
        {routeInfo&&<View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 8,
          }}
        >
          <MaterialCommunityIcons name="truck" size={24} color={Colors.green} />
          <Text style={{ fontSize: 16, color: Colors.grey }}>
            {routeInfo?.eta || '25 min'}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.grey }}> - </Text>
          <Text style={{ fontSize: 16, color: Colors.grey }}>
            {routeInfo?.distance || '2.4 km'}
          </Text>
        </View>}
        <View
          style={{ height: 1, backgroundColor: Colors.border, marginTop: 20 }}
        ></View>
      </View>

      <View style={{ flex: 1, maxHeight: 320 }}>
        <RouteMap
          start={cartItems[0]?.location}
          end={cord}
          strokeColor="#FF6600"
          onRouteInfo={(info) => setRouteInfo(info)}
          strokeWidth={4}
        />
      </View>
      <RipplePressable
        style={styles.button}
        onPress={handleNext}
        rippleColor="rgba(255,255,255,0.6)"
      >
        <Text style={styles.buttonText}>Save and Continue</Text>
      </RipplePressable>
    </View>
  );
};

export default Delivery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
