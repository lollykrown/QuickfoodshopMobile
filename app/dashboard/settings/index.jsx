import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';

const Settings = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const toggleEmailSwitch = () =>
    setEmailEnabled((previousState) => !previousState);
  const [smsEnabled, setSMSEnabled] = useState(false);
  const toggleSMSSwitch = () =>
    setSMSEnabled((previousState) => !previousState);
  const [pushEnabled, setPushEnabled] = useState(true);
  const togglePushSwitch = () =>
    setPushEnabled((previousState) => !previousState);

  const { logout, loading } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Settings"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ padding: 20 }}>
        <Text style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
          Notifications
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 12,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 24,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 18, color: Colors.grey }}>
            Email Notification
          </Text>
          <Switch
            trackColor={{ false: '#c4c4c4', true: Colors.green }}
            thumbColor={emailEnabled ? '#fff' : '#fff'}
            ios_backgroundColor="#c4c4c4"
            onValueChange={toggleEmailSwitch}
            value={emailEnabled}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 12,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 24,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 18, color: Colors.grey }}>
            SMS Notification
          </Text>
          <Switch
            trackColor={{ false: '#c4c4c4', true: Colors.green }}
            thumbColor={smsEnabled ? '#fff' : '#fff'}
            ios_backgroundColor="#c4c4c4"
            onValueChange={toggleSMSSwitch}
            value={smsEnabled}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 12,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 24,
            borderColor: Colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 18, color: Colors.grey }}>
            Push Notification
          </Text>
          <Switch
            trackColor={{ false: '#c4c4c4', true: Colors.green }}
            thumbColor={pushEnabled ? '#fff' : '#fff'}
            ios_backgroundColor="#c4c4c4"
            onValueChange={togglePushSwitch}
            value={pushEnabled}
          />
        </View>
      </View>

      <Pressable
        onPress={() => logout()}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        <Text
          style={{
            color: 'red',
            marginTop: 20,
            fontSize: 18,
            fontWeight: 600,
            padding: 24,
          }}
        >
          Log out
        </Text>
      </Pressable>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
});
