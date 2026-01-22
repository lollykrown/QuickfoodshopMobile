import { Text, Image, View, TouchableOpacity, Dimensions, StyleSheet, Animated } from 'react-native'
import { useRef, useState } from 'react'
import * as Haptics from 'expo-haptics'
import StackedBackground from '@/components/StackedBG'
import OnbdOptions from './OnbdOptions'
import { Colors } from '@/constants/colors'

const { width } = Dimensions.get('window')

export default function GetStartedScreen() {
const [showOptions, setShowOptions] = useState(false)
  const buttonScale = useRef(new Animated.Value(1)).current

  const animateButton = () => {
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }),
    ]).start()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
    if (showOptions) return <OnbdOptions/>
  return (
    <StackedBackground style={styles.container}>
      <Image
        source={require('../assets/images/logo_transparent.png')}
        style={{ width: width * 0.95, zIndex:50, height: 200, contentFit: 'contain', marginVertical:50 }}
      />

      <View style={styles.greenCont}>
        <Text style={styles.title}>Ready to start shopping?</Text>
        <Text style={styles.text}>Sign in or continue to explore the app.</Text>
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }], width: '80%' }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            animateButton()
            setTimeout(() => {
              setShowOptions(true)
            }, 200)         
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </StackedBackground>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex:1, 
    justifyContent:'center', 
    alignItems:'center', 
    backgroundColor:'#fff', 
    padding: 40,
  },
  greenCont:{
    backgroundColor:Colors.primary,
    borderRadius:30,
    padding:40,
    marginHorizontal:30
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 10, 
    textAlign:'center', 
    color: Colors.yellow
  },
  text: { 
    fontSize:16, 
    color:'#fff', 
    textAlign:'center', 
    marginVertical:30, 
    fontWeight:500
  },
  button: { 
    backgroundColor:Colors.primary, 
    padding:16, 
    borderRadius:12, 
    alignItems:'center', 
    marginVertical:20,
    marginHorizontal:'auto',
    width:'100%'

  },
  buttonText: { color:'#fff', fontWeight:'700', fontSize:16 }
})
