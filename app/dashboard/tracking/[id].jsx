import RouteMap from '@/components/MapScreen';
import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { Octicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import Svg, { Line } from 'react-native-svg';

const route = [
  { latitude: 54.9010769, longitude: -1.3947494 },
  { latitude: 54.9032838, longitude: -1.3779205 },
  { latitude: 37.78125, longitude: -122.4124 },
];

const TrackingId = () => {
  const router = useRouter();
  const drawer = useDrawer();

  const status = 'dispatched';
  const c =
    status === 'processing'
      ? { color: '#FFA84A' }
      : status === 'dispatched'
        ? { color: '#9747FF' }
        : { color: Colors.green };
  const b =
    status === 'processing'
      ? { backgroundColor: 'rgba(255, 168, 74,0.16)' }
      : status === 'dispatched'
        ? { backgroundColor: 'rgba(151, 71, 255,0.16)' }
        : { backgroundColor: 'rgba(26, 184, 84,0.16)' };
  const bc =
    status === 'processing'
      ? { borderColor: '#FFA84A' }
      : status === 'dispatched'
        ? { borderColor: '#9747FF' }
        : { borderColor: Colors.green };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Tracking Details"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ flex: 1, minHeight: 260 }}>
        <Text
          style={{ marginLeft: 12, padding: 10, fontSize: 18, fontWeight: '600' }}
        >
          Tracking ID: QFTN1234567
        </Text>
        <RouteMap
          // start={route[0]}
          end={route[1]}
          route={route}
          strokeColor="#FF6600"
          strokeWidth={4}
        />
      </View>
      <ScrollView style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <View
          onPress={() => router.push('/dashboard/tracking/trackingModal')}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 12,
            backgroundColor: '#f0fff0',
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text style={{ marginStart: 'auto', fontWeight: '600', fontSize: 16 }}>
            Your Delivery Code is <Text style={{ fontSize: 20 }}>1339</Text>
          </Text>
          <RipplePressable
            onPress={() => router.push('/dashboard/tracking/trackingModal')}
            style={{ flexDirection: 'row', marginStart: 'auto' }}
          >
            <FontAwesome5 name="info-circle" size={24} color={Colors.primary} />
          </RipplePressable>
        </View>
        <View
          style={{
            padding: 10,
            marginTop: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <View
            style={{
              padding: 12,
              marginTop: 4,
              borderRadius: 12,
              gap: 3,
              backgroundColor: '#f0fff0',
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', alignSelf: 'center' }}>
                Order: #5678
              </Text>
              <Text style={[styles.text, c, b, bc]}>{status}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                gap: 4,
                alignContent: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', alignSelf: 'center' }}>
                Your Rider:
              </Text>
              <Text>James Walter</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                gap: 4,
                alignContent: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', alignSelf: 'center' }}>
                Distance:
              </Text>
              <Text>12km &#8226;</Text>
              <Ionicons name="time" size={16} color={Colors.green} />
              <Text>12 mins</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
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
                  backgroundColor: 'white',
                }}
              >
                <Ionicons
                  name="cart-outline"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              {/* Dotted lines */}
              <Svg style={{ marginLeft: 20 }} width="2" height={34}>
                <Line
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
                  backgroundColor: 'white',
                }}
              >
                <Feather name="truck" size={24} color={Colors.primary} />
              </View>
              {/* Dotted lines */}
              <Svg style={{ marginLeft: 20 }} width="2" height={34}>
                <Line
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
                  backgroundColor: 'white',
                }}
              >
                <Ionicons name="location" size={24} color={Colors.primary} />
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
                style={{
                  flexDirection: 'column',
                  gap: 2,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: '600', maxWidth: 230 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Gillian Store, South London
                </Text>
                <Text style={{ color: Colors.grey }}>Pick up </Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  gap: 2,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: '600', maxWidth: 230 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  In Transit
                </Text>
                <Text style={{ color: Colors.grey }}>
                  Package is on its way
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  gap: 2,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: '600', maxWidth: 230 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  465 Peckham, London{' '}
                </Text>
                <Text style={{ color: Colors.grey }}>Drop Off</Text>
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
                <Octicons
                  name="check-circle-fill"
                  style={{ textAlign: 'right', marginEnd: 10, marginBottom: 6 }}
                  size={20}
                  color={Colors.green}
                />
              </View>
              <View style={{ flexDirection: 'column', gap: 2 }}>
                <Octicons
                  name="check-circle-fill"
                  style={{ textAlign: 'right', marginEnd: 10, marginBottom: 6 }}
                  size={20}
                  color={Colors.green}
                />
              </View>
              <View style={{ flexDirection: 'column', gap: 2 }}>
                <Octicons
                  name="check-circle-fill"
                  style={{ textAlign: 'right', marginEnd: 10, marginBottom: 6 }}
                  size={20}
                  color={Colors.green}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TrackingId;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textTransform: 'capitalize',
  },
});
