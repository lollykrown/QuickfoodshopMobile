import EmptyState from '@/components/EmptyState';
import RipplePressable from '@/components/RipplePressable';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';

const transactions = [
  {
    date: 'Mar 4, 2025',
    data: [
      {
        vendor: 'Open Sea Restaurant',
        status: 'Completed',
        price: 250,
      },
      {
        vendor: 'Gillian Store',
        status: 'Pending',
        price: 250,
      },
      {
        vendor: "Lara's Kitchen Store",
        status: 'Completed',
        price: 250,
      },
      {
        vendor: 'Gillian Store',
        status: 'Failed',
        price: 250,
      },
    ],
  },
  {
    date: 'Mar 7, 2025',
    data: [
      {
        vendor: 'Open Sea Restaurant',
        status: 'Completed',
        price: 390,
      },
      {
        vendor: 'Gillian Store',
        status: 'Completed',
        price: 390,
      },
    ],
  },
  {
    date: 'Mar 14, 2025',
    data: [
      {
        vendor: 'Open Sea Restaurant',
        status: 'Completed',
        price: 390,
      },
      {
        vendor: 'Gillian Store',
        status: 'Completed',
        price: 390,
      },
    ],
  },
  {
    date: 'Mar 22, 2025',
    data: [
      {
        vendor: 'Gillian Store',
        status: 'Completed',
        price: 390,
      },
    ],
  },
];

const Transactions = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const { user, avatar } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Transactions"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      {transactions.length === 0 && (
        <EmptyState
          text="Transactions Empty"
          icon={
            <FontAwesome6
              name="hand-holding-dollar"
              size={120}
              color="#C4C4C4"
            />
          }
        />
      )}
      <SectionList
        sections={transactions}
        keyExtractor={(item, index) => 'i' + index}
        renderItem={({ item }) => (
          <RipplePressable
            style={{
              flexDirection: 'row',
              marginHorizontal: 12,
              gap: 10,
              marginTop: 12,
              borderWidth: 1,
              padding: 12,
              borderColor: Colors.border,
              borderRadius: 24,
              alignItems: 'center',
            }}
          >
            <ShimmerExpoImage
              width={48}
              height={48}
              styles={{ borderRadius: 24 }}
              uri={user?.image || avatar}
            />
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                style={{ fontSize: 16, fontWeight: '600' }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.vendor}
              </Text>
              <Text
                style={{ color: Colors.grey }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Jollof rice and chicken{' '}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={{ fontWeight: '600', fontSize: 16 }}>
                £{item.price}
              </Text>
              <Text
                style={[
                  {
                    color:
                      item.status === 'Failed'
                        ? 'red'
                        : item.status === 'Pending'
                          ? 'orange'
                          : Colors.green,
                    fontWeight: '600',
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </RipplePressable>
        )}
        renderSectionHeader={({ section: { date } }) => (
          <Text
            style={{
              fontWeight: 600,
              fontSize: 20,
              padding: 12,
              marginTop: 12,
              backgroundColor: '#F8F8F8',
            }}
          >
            {date}
          </Text>
        )}
      />
    </View>
  );
};

export default Transactions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
