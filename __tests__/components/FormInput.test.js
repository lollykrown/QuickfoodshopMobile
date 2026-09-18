import { StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { fireEvent, render, screen } from '@testing-library/react-native';
import FormInput from '@/components/FormInput';

// Real react-hook-form wiring; `value` echoes the form state so tests can assert on it.
function Harness({ name = 'email', defaultValue = '', ...props }) {
  const { control, watch } = useForm({ defaultValues: { [name]: defaultValue } });
  return (
    <>
      <FormInput control={control} name={name} {...props} />
      <Text testID="form-value">{watch(name)}</Text>
    </>
  );
}

// Style of the bordered wrapper around the text input (walks up from the input).
const wrapperStyle = (placeholder) => {
  let node = screen.getByPlaceholderText(placeholder).parent;
  while (node) {
    const style = StyleSheet.flatten(node.props?.style);
    if (style?.borderWidth === 1) return style;
    node = node.parent;
  }
  throw new Error('bordered input wrapper not found');
};

describe('FormInput', () => {
  it('renders the label and placeholder', () => {
    render(<Harness label="Email" placeholder="you@example.com" />);

    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('shows the initial form value', () => {
    render(<Harness placeholder="Email" defaultValue="ada@example.com" />);
    expect(screen.getByPlaceholderText('Email').props.value).toBe('ada@example.com');
  });

  it('writes typing back to the form', () => {
    render(<Harness placeholder="Email" />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'ada@example.com');

    expect(screen.getByTestId('form-value').props.children).toBe('ada@example.com');
    expect(screen.getByPlaceholderText('Email').props.value).toBe('ada@example.com');
  });

  it('disables autocapitalisation and autocorrect by default', () => {
    render(<Harness placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
  });

  describe('errors', () => {
    it('shows the error message and highlights the field', () => {
      render(<Harness placeholder="Email" error="Invalid email address" />);

      expect(screen.getByText('Invalid email address')).toBeTruthy();
      expect(wrapperStyle('Email').borderColor).toBe('#ef4444');
    });

    it('shows no error UI when there is none', () => {
      render(<Harness placeholder="Email" />);

      expect(screen.queryByText('Invalid email address')).toBeNull();
      expect(wrapperStyle('Email').borderColor).toBe('#ddd');
    });
  });

  describe('password fields', () => {
    it.each(['password', 'confirmPassword', 'newPassword', 'currentPassword'])(
      'masks a field named %s and offers a visibility toggle',
      (name) => {
        render(<Harness name={name} placeholder="Secret" />);

        expect(screen.getByPlaceholderText('Secret').props.secureTextEntry).toBe(true);
        expect(screen.getByTestId('icon-visibility-off')).toBeTruthy();
      },
    );

    it('masks any field when secureTextEntry is requested', () => {
      render(<Harness name="pin" secureTextEntry placeholder="PIN" />);
      expect(screen.getByPlaceholderText('PIN').props.secureTextEntry).toBe(true);
    });

    it('toggles visibility when the eye icon is pressed', () => {
      render(<Harness name="password" placeholder="Secret" />);

      fireEvent.press(screen.getByTestId('icon-visibility-off'));
      expect(screen.getByPlaceholderText('Secret').props.secureTextEntry).toBe(false);
      expect(screen.getByTestId('icon-visibility')).toBeTruthy();

      fireEvent.press(screen.getByTestId('icon-visibility'));
      expect(screen.getByPlaceholderText('Secret').props.secureTextEntry).toBe(true);
    });

    it('does not mask or show a toggle on ordinary fields', () => {
      render(<Harness placeholder="Email" />);

      expect(screen.getByPlaceholderText('Email').props.secureTextEntry).toBe(false);
      expect(screen.queryByTestId('icon-visibility-off')).toBeNull();
    });
  });

  it('renders the left icon when provided', () => {
    render(<Harness placeholder="Email" leftIcon="mail-outline" />);
    expect(screen.getByTestId('icon-mail-outline')).toBeTruthy();
  });

  it('is read-only when disabled', () => {
    render(<Harness placeholder="Email" disabled />);
    expect(screen.getByPlaceholderText('Email').props.editable).toBe(false);
  });

  it('is editable by default', () => {
    render(<Harness placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email').props.editable).toBe(true);
  });

  it('passes extra props such as keyboardType to the input', () => {
    render(<Harness placeholder="Phone" keyboardType="phone-pad" />);
    expect(screen.getByPlaceholderText('Phone').props.keyboardType).toBe('phone-pad');
  });
});
