import { Colors } from '@/constants/colors';
import { useState } from 'react';
import { Snackbar } from 'react-native-paper';

export const useToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [color, setColor] = useState('green');

  const show = (msg,mode) => {
    setMessage(msg);
    setColor(mode==='error'?'red':'green')
    setVisible(true);
  };

  const Toast = () => (
    <Snackbar
      visible={visible}
      onDismiss={() => setVisible(false)}
      duration={2000}
      style={{ backgroundColor: color}} 
        action={{
          label: 'Close',
          onPress: () => console.log('Undo pressed'),
          textColor: 'yellow', // ✅ change action text color
        }}
    >
      {message}
    </Snackbar>
  );

  return { show, Toast };
};
