import { Redirect, Slot } from 'expo-router';
import { useAuth } from "@/contexts/authContext";

export default function AuthLayout() {
    const { isLoggedIn } = useAuth();
    if(isLoggedIn) {
    return <Redirect href='/home'/>
  }
  
  return (<Slot/>);
}
