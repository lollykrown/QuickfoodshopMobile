import RipplePressable from '@/components/RipplePressable';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';

const Dashboard = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const scrollRef = useRef(null);

  const { logout, user, avatar } = useAuth();
  // const {data = [],loading,error,refetch,} = useFetch(() => getProfile(), false);
  // useEffect(() => {
  //     refetch();
  // }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title="Dashboard"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column', gap: 6 }}>
            <Text style={{ fontSize: 14 }}>Welcome Back!</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >{`${user?.firstName} ${user?.lastName}`}</Text>
          </View>
          <Link
            href="/dashboard/notifications?prev=dash"
            style={{ alignSelf: 'center' }}
          >
            <View style={{ position: 'relative' }}>
              <Ionicons
                name="notifications-outline"
                size={38}
                color={Colors.green}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: 1.5,
                  backgroundColor: 'white',
                  borderRadius: 12,
                }}
              >
                <View
                  name="circle"
                  style={{
                    width: 18,
                    overflow: 'hidden',
                    flexDirection: 'col',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12,
                    height: 18,
                    backgroundColor: Colors.red,
                  }}
                >
                  <Text
                    style={{ color: 'white', fontSize: 12, fontWeight: 600 }}
                  >
                    3
                  </Text>
                </View>
              </View>
            </View>
          </Link>
        </View>
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 20 }}>
          <RipplePressable
            onPress={() => {
              router.push(`/dashboard/orders`);
            }}
            style={{
              flexDirection: 'row',
              flex: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              borderWidth: 1,
              padding: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'column', gap: 8 }}>
              <Text style={{ color: Colors.grey, fontSize: 12 }}>
                My Orders
              </Text>
              <Text style={{ fontSize: 20, fontWeight: 600 }}>12,000</Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                padding: 8,
                alignSelf: 'center',
                backgroundColor: 'rgba(26, 184, 84,0.15)',
                borderColor: Colors.border,
                borderRadius: 8,
                alignContent: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="receipt-text-edit"
                size={18}
                color={Colors.green}
              />
            </View>
          </RipplePressable>
          <RipplePressable
            onPress={() => {
              router.push(`/dashboard/transactions`);
            }}
            style={{
              flexDirection: 'row',
              flex: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              borderWidth: 1,
              padding: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'column', gap: 8 }}>
              <Text style={{ color: Colors.grey, fontSize: 12 }}>
                Transactions
              </Text>
              <Text style={{ fontSize: 20, fontWeight: 600 }}>850</Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                padding: 8,
                alignSelf: 'center',
                backgroundColor: 'rgba(26, 184, 84,0.15)',
                borderColor: Colors.border,
                borderRadius: 8,
                alignContent: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="compare-horizontal"
                size={18}
                color={Colors.green}
              />
            </View>
          </RipplePressable>
        </View>
        <Text
          style={{
            fontWeight: 600,
            fontSize: 16,
            marginTop: 38,
            marginBottom: 8,
          }}
        >
          Recent Orders
        </Text>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((a) => (

              <RipplePressable
              key={a}
              onPress={() => router.push(`/dashboard/orders/${a}`)}
                style={{
                  flexDirection: 'row',
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
                    style={{ fontSize: 16, fontWeight: 600 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Open Sea restaurant
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
                  <Text style={{ fontWeight: 600, fontSize: 16 }}>$302</Text>
                  <Text style={{ color: Colors.green, fontWeight: 600 }}>
                    Successful
                  </Text>
                </View>
              </RipplePressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
});
