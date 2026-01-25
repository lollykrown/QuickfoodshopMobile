import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native'
import { Link, useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDrawer } from '@/contexts/DrawerProvider';

const Notifications = () => {
  const router = useRouter();
  const drawer = useDrawer(); 

  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#FFFFFF', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Notifications" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>

      <Text style={{alignSelf:'flex-end', paddingHorizontal:16, marginTop:16, color:Colors.primary, fontWeight:'700'}}>Mark All Read</Text>
      <FlatList
        data={[1,2,3,4]}
        renderItem={({ item }) => (
          <Link href={`/dashboard/notifications/${item}`} >
            <View style={styles.notificationsList}> 
            <View style={{flexDirection:'column', gap:12,width:'95%'}}>
              <Text style={{fontWeight:'600'}}>New restaurant added !</Text>
              <Text style={{marginTop:4, color:'#687076', lineHeight:24}}>Hi there! A new restaurant has been added to our platform, you might want to check it out.</Text>
            </View>
            <MaterialIcons style={{alignSelf:'center'}} name="keyboard-arrow-right" size={20} color="black" />
            </View>
          </Link>
        )}
        keyExtractor={(item) => item.toString()}
      />
    </View>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  notificationsList:{
    width:'100%',  
    flexDirection:'row', 
    justifyContent:'space-between', 
    overflow: 'hidden', 
    backgroundColor:'#fbfbfb', 
    marginVertical:4, 
    paddingVertical:20, 
    paddingHorizontal:18,
    marginHorizontal:16, 
    borderRadius:12
  }
})
