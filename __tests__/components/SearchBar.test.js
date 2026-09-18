import { fireEvent, render, screen } from '@testing-library/react-native';
import SearchBar from '@/components/SearchBar';

describe('SearchBar', () => {
  it('shows the placeholder and current value', () => {
    render(<SearchBar placeholder="Search food" value="rice" onChangeText={() => {}} />);

    const input = screen.getByPlaceholderText('Search food');
    expect(input.props.value).toBe('rice');
  });

  it('reports typing through onChangeText', () => {
    const onChangeText = jest.fn();
    render(<SearchBar placeholder="Search" value="" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByPlaceholderText('Search'), 'jollof');

    expect(onChangeText).toHaveBeenCalledWith('jollof');
  });

  it('forwards presses on the field', () => {
    const onPress = jest.fn();
    render(<SearchBar placeholder="Search" value="" onChangeText={() => {}} onPress={onPress} />);

    fireEvent(screen.getByPlaceholderText('Search'), 'press');

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
