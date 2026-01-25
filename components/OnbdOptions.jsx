import { Text, Image, View, TouchableOpacity, Dimensions, StyleSheet, Animated, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import Octicons from '@expo/vector-icons/Octicons';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width } = Dimensions.get('window')
const options = ['browse store', 'customer', 'vendor']

export default function OnbdOptions() {
  const router = useRouter()
  const buttonScale = useRef(new Animated.Value(1)).current
  const [selected, setSelected] = useState(null)
  const [visible, setVisible] = useState(false);
  const [authRoute, setAuthRoute] = useState('/signup')


    useEffect(() => {
    //testing purposes
    // AsyncStorage.removeItem('isRegUser')
    // AsyncStorage.setItem('isRegUser', 'true')

    AsyncStorage.getItem('isRegUser').then(value => {
      if (value === null) {
        setAuthRoute('/signup')
      } else {
        setAuthRoute('/login')
      }
    })
  }, [])


  const onDismissSnackBar = () => setVisible(false);

  const animateButton = () => {
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }),
    ]).start()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
  const handleClick = (option)=>{
    setSelected(option)
    return option === 'browse store' ? router.replace({pathname:'/home'}):
    router.push(`/${option}/${authRoute}`)
  }

  const message = 'Please select an option above to continue'
  const continueHandler=() => {
    animateButton()
    if (selected === null) {
      setVisible(true)
      return
    }
    return selected === 'browse store' ? router.replace('/home'):
    router.push(`/${selected}/${authRoute}`)  }

  return (
    <>
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo_transparent.png')}
        style={{ width: width * 0.9, zIndex:50, height: 170, res: 'contain', marginVertical:40 }}
      />

      <Text style={{fontSize:18, marginBottom:40}}>How do you want to sign up?</Text>
      <View style={styles.buttonGroup}>
        {options.map((option, i) => {
          const isActive = selected === option
          return(
            <Pressable 
              onPress={()=> handleClick(option)}
              key={i}
              style={[styles.btn, isActive && styles.activeBtn]}>
            <Text style={[styles.btnText, isActive && styles.activeBtnText]}>{option}</Text>
            <Octicons style={{alignSelf:'center', marginEnd:6}} 
            name="check-circle-fill" size={24} color={isActive?Colors.green:'#C4C4C4'} />
          </Pressable>
        )})}

      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
        <TouchableOpacity
          style={styles.animButton}
          onPress={() => continueHandler()}
          activeOpacity={0.8}
        >
          <Text style={styles.animButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
    <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={4000}
        action={{
          label: 'Undo',
          onPress: () => {
            // Do something
          },
        }}>
        {message}
    </Snackbar>
    </>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex:1, 
    alignItems:'center', 
    backgroundColor:'#fff', 
    padding: 40,
  },
  buttonGroup:{
    
  },
  btn: {
    borderColor:'#748189', 
    borderWidth:1, 
    flexDirection:'row',
    marginHorizontal:'auto',
    marginVertical:8,
    width:'100%',
    borderRadius:20,
  },
  activeBtn: {
    borderColor: Colors.green, 
  },
  btnText:{
    paddingHorizontal:20,
    paddingVertical:16,
    width:'100%',
    textAlign: 'center',
    fontWeight:600,
    color:'#748189',
    textTransform:'capitalize'
  },
  activeBtnText: {
    color: Colors.green, 
  },
  animButton: { 
    backgroundColor:Colors.primary, 
    borderRadius:12, 
    marginVertical:20,
    marginHorizontal:'auto',
    width:'100%'
  },
  animButtonText: { 
    color:'#fff', 
    fontWeight:'700', 
    fontSize:16 ,
    textAlign:'center',
    padding:16, 
  }

})


