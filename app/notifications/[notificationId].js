import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native'
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';

export default function NotificationDetail() {
  const { notificationId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#FFFFFF', paddingEnd: 16 }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title="Notifications"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700' }}
        />
        <Pressable onPress={() => {}}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>

      <View style={styles.notificationsList}>
        <View style={{ flexDirection: 'column', gap: 12,}}>
          <Text style={{ fontWeight: '600', textAlign: 'center' }}>New restaurant added !</Text>
          <View style={{flexDirection:'column', }}>
            <Image
                style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 8 }}
                source={{ uri: 'https://picsum.photos/500' }}
            />
        </View>
        <Text style={{ fontWeight: '600', marginTop: 8, fontSize: 18}}>Open Sea Restaurant</Text>
          <Text style={{ marginTop: 4, color: '#687076', lineHeight: 24,}}>
            Hi there! A new restaurant has been added to our platform, you might
            want to check it out.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  notificationsList:{
    width:'100%',  
    flexDirection:'row', 
    overflow: 'hidden', 
    marginVertical:4, 
    paddingVertical:20, 
    paddingHorizontal:16,
    borderRadius:12
  }
})
