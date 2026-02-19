import RipplePressable from '@/components/RipplePressable';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { Appbar, Divider } from 'react-native-paper';

const Account = () => {
  const router = useRouter();
  const drawer = useDrawer();

  const { logout, user, avatar, loading } = useAuth();

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };
  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="My Account"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ padding: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 24,
            paddingHorizontal: 8,
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ShimmerExpoImage
            width={48}
            height={48}
            styles={{ borderRadius: 24 }}
            uri={user?.image || avatar}
            accessibilityLabel={user?.firstName}
          />
          <View style={{ flexDirection: 'column', gap: 6 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >{`${user?.firstName} ${user?.lastName}`}</Text>
            <Text style={{ fontSize: 12, color: Colors.grey, textTransform: 'capitalize' }}>
              {user?.role} Account
            </Text>
          </View>
        </View>
        <Divider bold={true} />

        <RipplePressable
          onPress={() => router.push('/dashboard/account/edit-profile')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 24,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 14 }}>Edit Profile</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="black" />
        </RipplePressable>
        <RipplePressable
          onPress={() => router.push('/dashboard/account/change-password')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 20,
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 24,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 14 }}>Change Pasword </Text>
          <MaterialCommunityIcons name="lock-reset" size={24} color="black" />
        </RipplePressable>
      </View>

      <RipplePressable
        onPress={confirmLogout}
        disabled={loading}
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 18,
          paddingVertical: 10,
          alignItems: 'center',
          opacity: loading ? 0.5 : 1, // UX feedback
        }}
      >
        <MaterialCommunityIcons name="logout" size={24} color="red" />
        <Text style={{ color: 'red', fontSize: 16, fontWeight: 600 }}>
          {loading ? 'Logging out...' : 'Log out'}
        </Text>
        {loading && (<ActivityIndicator size={18} color="red" /> )}
      </RipplePressable>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
});
