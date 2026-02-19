import DottedLines from '@/components/DottedLines';
import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';

const { height } = Dimensions.get('window');
const Tracking = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const { logout, loading } = useAuth();
  const id = 2;
  const status = 'processing';
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
          title="Tracking"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <Text
        style={{ marginLeft: 12, padding: 12, fontSize: 18, fontWeight: 600 }}
      >
        Current Tracking
      </Text>
      <ScrollView style={{ height: height * 0.9, marginBottom: 18 }}>
        <RipplePressable
          style={styles.card}
          onPress={() => {
            router.push(`/dashboard/tracking/${id}`);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={{ fontWeight: 600 }}>
              Order: <Text style={{ fontWeight: 300 }}>#5678</Text>{' '}
            </Text>
            <Text style={{ color: Colors.grey }}>Oct 2, 2025</Text>
            <Text style={[styles.text, c, b, bc]}>{status}</Text>
          </View>
          <DottedLines styles={{ paddingHorizontal: 12 }} status={status} />
        </RipplePressable>
        <RipplePressable
          style={styles.card}
          onPress={() => {
            router.push(`/dashboard/tracking/${id}`);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={{ fontWeight: 600 }}>
              Order: <Text style={{ fontWeight: 300 }}>#5678</Text>{' '}
            </Text>
            <Text style={{ color: Colors.grey }}>Oct 2, 2025</Text>
            <Text style={[styles.text, c, b, bc]}>{status}</Text>
          </View>
          <DottedLines styles={{ paddingHorizontal: 12 }} status={status} />
        </RipplePressable>
      </ScrollView>
      <Text
        style={{ marginLeft: 12, padding: 12, fontSize: 18, fontWeight: 600 }}
      >
        Delivered
      </Text>
      <ScrollView>
        <RipplePressable
          style={styles.card}
          onPress={() => {
            router.push(`/dashboard/tracking/${id}`);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={{ fontWeight: 600 }}>
              Order: <Text style={{ fontWeight: 300 }}>#5678</Text>{' '}
            </Text>
            <Text style={{ color: Colors.grey }}>Oct 2, 2025</Text>
            <Text style={[styles.text, c, b, bc]}>{status}</Text>
          </View>
          <DottedLines styles={{ paddingHorizontal: 12 }} status={status} />
        </RipplePressable>
        <RipplePressable
          style={styles.card}
          onPress={() => {
            router.push(`/dashboard/tracking/${id}`);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={{ fontWeight: 600 }}>
              Order: <Text style={{ fontWeight: 300 }}>#5678</Text>{' '}
            </Text>
            <Text style={{ color: Colors.grey }}>Oct 2, 2025</Text>
            <Text style={[styles.text, c, b, bc]}>{status}</Text>
          </View>
          <DottedLines styles={{ paddingHorizontal: 12 }} status={status} />
        </RipplePressable>
        <RipplePressable
          style={styles.card}
          onPress={() => {
            router.push(`/dashboard/tracking/${id}`);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={{ fontWeight: 600 }}>
              Order: <Text style={{ fontWeight: 300 }}>#5678</Text>{' '}
            </Text>
            <Text style={{ color: Colors.grey }}>Oct 2, 2025</Text>
            <Text style={[styles.text, c, b, bc]}>{status}</Text>
          </View>
          <DottedLines styles={{ paddingHorizontal: 12 }} status={status} />
        </RipplePressable>
      </ScrollView>
    </View>
  );
};

export default Tracking;

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
