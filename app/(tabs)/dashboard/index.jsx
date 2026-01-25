import { View, Text, Pressable, StyleSheet, Switch } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/authContext";
import useFetch from '@/hooks/usefetch';


const Dashboard = () => {
  const router = useRouter();
  const drawer = useDrawer(); 
    const [emailEnabled, setEmailEnabled] = useState(true);
  const toggleEmailSwitch = () => setEmailEnabled(previousState => !previousState);
    const [smsEnabled, setSMSEnabled] = useState(false);
  const toggleSMSSwitch = () => setSMSEnabled(previousState => !previousState);
    const [pushEnabled, setPushEnabled] = useState(true);
  const togglePushSwitch = () => setPushEnabled(previousState => !previousState);

    const { logout } = useAuth();

    // const {data = [],loading,error,refetch,} = useFetch(() => getProfile(), false);
    // useEffect(() => {
    //     refetch();
    // }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{padding:20}}>
        <Text style={{fontWeight:600,fontSize:16, marginBottom:12}}>Notifications</Text>
        <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', marginVertical:12, paddingVertical:12, paddingHorizontal:18,borderRadius:24, borderColor:'#c6e3e5', borderWidth:1,}}>
            <Text style={{fontWeight:600,fontSize:18,color:'#748189'}}>Email Notification</Text>
            <Switch
            trackColor={{false: '#c4c4c4', true: Colors.green}}
            thumbColor={emailEnabled ? '#fff' : '#fff'}
            ios_backgroundColor="#c4c4c4"
            onValueChange={toggleEmailSwitch}
            value={emailEnabled}
            />
        </View>
      </View>

    </View>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
})
