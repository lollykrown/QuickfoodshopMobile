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
    const { isLoggedIn,isExisting } = useAuth();

  useEffect(() => {
    //testing purposes
    // AsyncStorage.removeItem('alreadyLaunched')
    const checkLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched');

        if (value === null) {
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking launch status:', error);
      }
    };

    checkLaunch()
  }, [])
  
  useEffect(() => {
    //testing purposes
     if(isLoggedIn){
       router.push('/home')
    }
  }, [isLoggedIn])
 

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  // // First launch
  // if (isFirstLaunch) {
  //   return <Onboarding />;
  // }

  // // Not logged in
  // if (!isLoggedIn) {
  //   return <OnbdOptions auth={'/signup'} />;
  // }
  // return null;
  return isFirstLaunch ? <Onboarding /> :<OnbdOptions auth={isExisting?'login':'signup'}/>
}





 