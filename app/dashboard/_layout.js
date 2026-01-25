// app/user/_layout.js
import { Stack } from 'expo-router';

export default function StoresLayout({ children}) {
  return <Stack screenOptions={{ headerShown: false }} />

}
