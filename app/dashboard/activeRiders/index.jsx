import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import React from 'react'
import { Appbar, Divider } from 'react-native-paper'
import { AntDesign } from '@expo/vector-icons'
import { useAuth } from '@/contexts/authContext'
import { useDrawer } from '@/contexts/DrawerProvider'
import { useRouter } from 'expo-router'
import ShimmerExpoImage from '@/components/ShimmerImg'
import { Colors } from '@/constants/colors'
import HorizontalLine from '@/components/Horizontal Lines'
import RipplePressable from '@/components/RipplePressable'

const ActiveRiders = () => {
    const router = useRouter();
    const drawer = useDrawer();
    const { avatar, user } = useAuth();

  return (
    <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
            <Appbar.BackAction color="black" onPress={() => router.back()} />
            <Appbar.Content
            title="Active Riders"
            variant="titleMedium"
            titleStyle={{ fontWeight: '700', color: 'black' }}
            />
            <Pressable onPress={drawer.toggle}>
            <AntDesign name="menu" size={24} color="black" />
            </Pressable>
        </Appbar.Header>

        <ScrollView style={{paddingHorizontal:18, marginTop:8}}>
            {[1,2,3,4,5].map(a => (
                <RipplePressable style={{marginBottom:12, borderRadius:20, borderColor:Colors.border, borderWidth:1}} key={a} >
                <View style={{flexDirection:'row', justifyContent:'space-between',marginTop:12, paddingHorizontal:12}}>
                <Text style={{ fontWeight: '600' }}>
                    Order: <Text style={{ fontWeight: '300' }}>5678</Text>{' '}
                </Text>
                <Text style={{ fontWeight: '600', }}>
                    Dispatched:{' '}
                    <Text style={{  color: Colors.grey }}>9 mins ago</Text>
                </Text>
                </View>        
                <Divider bold style={{ marginVertical: 12,color:'red',backgroundColor:Colors.border}} />
                <View style={{marginTop:8}}>
                {/* TOP ROW (Images + Lines only) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal:32 }}>
                    
                    {/* Left Avatar */}
                    <ShimmerExpoImage
                    width={48}
                    height={48}
                    styles={{ borderRadius: 50 }}
                    uri={user?.image || avatar}
                    />

                    {/* Left Line */}
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <HorizontalLine />
                    </View>

                    {/* Center Logo */}
                    <ShimmerExpoImage
                    width={48}
                    height={48}
                    styles={{ borderRadius: 24, backgroundColor: 'white' }}
                    uri={require('../../../assets/images/logo-d.png')}
                    />

                    {/* Right Line */}
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <HorizontalLine />
                    </View>

                    {/* Right Avatar */}
                    <ShimmerExpoImage
                    width={48}
                    height={48}
                    styles={{ borderRadius: 50 }}
                    uri={user?.image || avatar}
                    />

                </View>
                {/* BOTTOM ROW (Text only) */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom:12, paddingTop:4 }}>
                    <View style={{ alignItems: 'center', width: 120 }}>
                    <Text>Jonathan Mike</Text>
                    <Text style={{ color: Colors.grey }}>Dispatch rider</Text>
                    </View>
                    <View style={{ width: 48 }} />
                    <View style={{ alignItems: 'center', width: 120 }}>
                    <Text>Tobi Makinde</Text>
                    <Text style={{ color: Colors.grey }}>Customer</Text>
                    </View>
                </View>
                </View>
                </RipplePressable>
         ))}
        </ScrollView>
    </View>
  )
}

export default ActiveRiders

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    paddingBottom:40
  },
})