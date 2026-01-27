import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';

const Support = () => {
  const router = useRouter();
  const drawer = useDrawer();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title="Support"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ padding: 20 }}>
        <Text style={{ fontWeight: 600, fontSize: 16 }}>Call us!</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 20,
            padding: 14,
            borderRadius: 18,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: 600, fontSize: 16 }}>
              +234 903 3484 3947
            </Text>
            <Text style={{ color: Colors.grey, fontSize: 16 }}>
              Customer Care Line
            </Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 30,
              padding: 8,
              borderColor: Colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="headset"
              size={24}
              color={Colors.green}
            />
          </View>
        </View>
      </View>
      <View style={{ padding: 20 }}>
        <Text style={{ fontWeight: 600, fontSize: 16 }}>
          Chat with us on social media!
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 24,
            marginVertical: 20,
            padding: 14,
            borderRadius: 18,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        >
          <FontAwesome5 name="facebook" size={34} color="black" />
          <View
            style={{ borderRadius: 20, backgroundColor: 'black', padding: 4 }}
          >
            <AntDesign name="x" size={24} color="white" />
          </View>
          <Entypo name="instagram-with-circle" size={34} color="black" />
        </View>
      </View>
    </View>
  );
};

export default Support;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
});
