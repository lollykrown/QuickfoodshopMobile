import { View, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { Appbar } from 'react-native-paper'
import { AntDesign } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useDrawer } from '@/contexts/DrawerProvider'
import DottedLines from '@/components/DottedLines'
import RouteMap from '@/components/MapScreen'
import { Colors, Fonts } from '@/constants/colors'
import ShimmerExpoImage from '@/components/ShimmerImg'
import { useAuth } from '@/contexts/authContext'
import RipplePressable from '@/components/RipplePressable'

const route = [
  { latitude: 54.9010769, longitude: -1.3947494 },
  { latitude: 54.9032838, longitude: -1.3779205 },
  { latitude: 37.78125, longitude: -122.4124 },
];

const FindRider = () => {  
    const router = useRouter();
    const drawer = useDrawer();
    const { avatar, user } = useAuth();


  return (
    <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
            <Appbar.BackAction color="black" onPress={() => router.back()} />
            <Appbar.Content
            title="Find Rider"
            variant="titleMedium"
            titleStyle={{ fontWeight: '700', color: 'black' }}
            />
            <Pressable onPress={drawer.toggle}>
            <AntDesign name="menu" size={24} color="black" />
            </Pressable>
        </Appbar.Header>
        <Text style={{ fontWeight: '600', fontSize:16, paddingHorizontal:18, marginTop:12 }}> Order #5678</Text>
        <DottedLines styles={{ padding: 16 }} right={false}/>
        <View style={{ flex: 1, maxHeight: 260, minHeight:230 }}>
            <RouteMap
            // start={route[0]}
            end={route[1]}
            route={route}
            strokeColor="#FF6600"
            strokeWidth={4}
            />
        </View>
        <Text style={{ fontWeight: '600', fontSize:16, paddingHorizontal:18, marginVertical:18 }}>Riders in London</Text>
        <ScrollView style={{paddingHorizontal:18}}>
            {[1,2,3,4,5].map(a => (
            <RipplePressable key={a} style={{borderColor:Colors.border,borderWidth:1,gap:8,flexDirection:'row', padding:16, marginVertical:8, borderRadius:18}}>
                <ShimmerExpoImage
                    width={48}
                    height={48}
                    styles={{ borderRadius: 24 }}
                    uri={user?.image || avatar}
                    />
                <View style={{paddingVertical:8,justifyContent:'space-between'}}>
                    <Text style={{ fontWeight: '600', fontSize:14, }}>Riders Name</Text>
                    <Text style={{color:Colors.grey,fontSize:12 }}>5 mins away{" "} &bull; Yellow Taxi</Text>
                </View>
                <TouchableOpacity onPress={()=>router.push('/dashboard/orders/riderModal')}  style={{marginLeft:'auto',alignSelf:'center',}}>
                    <Text style={{color:Colors.primary, fontWeight: '600', }}>Assign</Text>
                </TouchableOpacity>
            </RipplePressable>))}
        </ScrollView>
    </View>
  )
}

export default FindRider

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    paddingBottom:40
  },
})