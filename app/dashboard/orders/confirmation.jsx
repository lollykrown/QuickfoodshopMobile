import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import RipplePressable from '@/components/RipplePressable'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'

const Confirmation = () => {
    const router = useRouter();
    
  return (
    <SafeAreaView style={{flex:1,paddingHorizontal:24, alignItems:'center',marginTop:60}} edges={['top', 'bottom']}>
      <MaterialCommunityIcons name="check-circle" style={{marginTop:40}} size={90} color={Colors.primary} />
      <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Rider Assigned!</Text>
      <Text style={{ color:'#666666', marginBottom:24, marginHorizontal:20, textAlign:'center'}} >Rider has been assigned successfully!</Text>      
      <RipplePressable
        style={styles.button}
        onPress={() => router.push('/dashboard')}
        rippleColor="rgba(255,255,255,0.6)"
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </RipplePressable>
    </SafeAreaView>
  )
}

export default Confirmation

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
})