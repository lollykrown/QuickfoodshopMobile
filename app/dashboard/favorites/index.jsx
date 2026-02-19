import RipplePressable from '@/components/RipplePressable';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';

const Favorites = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const { logout, loading, user, avatar } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Favorites"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <ScrollView style={{ padding: 20 }}>
        {[1, 2, 3].map((o) => (
          <RipplePressable
            key={o}
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
              width={52}
              height={52}
              styles={{ borderRadius: 24 }}
              uri={user?.image || avatar}
            />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ marginBottom: 12, gap: 4 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: 600 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Rice and Jollof with vegetables salad
                </Text>
                <Text
                  style={{ color: Colors.grey }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Open Sea Restaurant
                </Text>
              </View>
              <Text style={{ color: Colors.green, fontWeight: 500 }}>
                £150.00
              </Text>
            </View>
            <FontAwesome name="trash" size={24} color="red" />
          </RipplePressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
});
