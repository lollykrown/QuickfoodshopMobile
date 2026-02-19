import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'

const LogoutScreen = () => {
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size="large" color={'white'}/>
      <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '600', color: '#fff' }}>
        Logging out...
      </Text>
    </View>
  )
}

export default LogoutScreen

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999, // Android
  },
});