import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Onboarding from '@/components/Onboarding'
import { View, ActivityIndicator } from 'react-native'
import OnbdOptions from '@/components/OnbdOptions'
import { useRouter } from 'expo-router'
import { useAuth } from "@/contexts/authContext";

export default function Index() {  
  const [isFirstLaunch, setIsFirstLaunch] = useState(null)
  const router = useRouter()
    const { isLoggedIn } = useAuth();

  useEffect(() => {
    //testing purposes
    // AsyncStorage.removeItem('alreadyLaunched')
    
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        AsyncStorage.setItem('alreadyLaunched', 'true')
        setIsFirstLaunch(true)
      } else {
        setIsFirstLaunch(false)
      }
    })
  }, [])
  
  useEffect(() => {
    //testing purposes
     if(isLoggedIn){
       router.push('/home')
    }
  }, [])


  if (isFirstLaunch === null) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return isFirstLaunch ? <Onboarding /> :<OnbdOptions />
}





 