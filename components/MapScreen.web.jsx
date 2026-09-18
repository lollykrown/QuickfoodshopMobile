import { View, Text, StyleSheet } from 'react-native';

// react-native-maps is native-only and cannot be bundled for web, so the web build
// gets a placeholder with the same props as components/MapScreen.jsx.
const RouteMap = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Maps are only available in the iOS and Android apps.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
  },
  text: { color: '#748189', textAlign: 'center', padding: 16 },
});

export default RouteMap;
