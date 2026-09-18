import { StyleSheet, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import RipplePressable from '@/components/RipplePressable';

describe('RipplePressable', () => {
  it('renders its children', () => {
    render(
      <RipplePressable>
        <Text>Tap me</Text>
      </RipplePressable>,
    );
    expect(screen.getByText('Tap me')).toBeTruthy();
  });

  it('calls onPress and onLongPress', () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    render(
      <RipplePressable onPress={onPress} onLongPress={onLongPress}>
        <Text>Tap me</Text>
      </RipplePressable>,
    );

    fireEvent.press(screen.getByText('Tap me'));
    fireEvent(screen.getByText('Tap me'), 'longPress');

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled, and dims itself', () => {
    const onPress = jest.fn();
    render(
      <RipplePressable onPress={onPress} disabled>
        <Text>Tap me</Text>
      </RipplePressable>,
    );

    fireEvent.press(screen.getByText('Tap me'));

    expect(onPress).not.toHaveBeenCalled();
    const root = screen.toJSON();
    expect(StyleSheet.flatten(root.props.style).opacity).toBe(0.5);
  });

  it('merges a custom style with the clipping container style', () => {
    render(
      <RipplePressable style={{ padding: 16 }}>
        <Text>Tap me</Text>
      </RipplePressable>,
    );
    expect(StyleSheet.flatten(screen.toJSON().props.style)).toMatchObject({
      overflow: 'hidden',
      padding: 16,
    });
  });

  it('handles the press-in / press-out ripple lifecycle without throwing', () => {
    render(
      <RipplePressable>
        <Text>Tap me</Text>
      </RipplePressable>,
    );
    const target = screen.getByText('Tap me');

    expect(() => {
      fireEvent(target, 'layout', { nativeEvent: { layout: { width: 100, height: 40 } } });
      fireEvent(target, 'pressIn', { nativeEvent: { locationX: 10, locationY: 5 } });
      fireEvent(target, 'pressOut');
    }).not.toThrow();
  });

  it('ignores press-in while disabled', () => {
    render(
      <RipplePressable disabled>
        <Text>Tap me</Text>
      </RipplePressable>,
    );
    expect(() =>
      fireEvent(screen.getByText('Tap me'), 'pressIn', { nativeEvent: { locationX: 1, locationY: 1 } }),
    ).not.toThrow();
  });
});
