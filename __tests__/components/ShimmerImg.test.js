import { fireEvent, render, screen } from '@testing-library/react-native';
import ShimmerExpoImage from '@/components/ShimmerImg';

describe('ShimmerExpoImage', () => {
  it('passes the image source, size and accessibility label through', () => {
    render(
      <ShimmerExpoImage
        uri="https://example.com/jollof.png"
        width={120}
        height={80}
        accessibilityLabel="Jollof Rice"
      />,
    );

    const image = screen.getByTestId('expo-image');
    expect(image.props.source).toBe('https://example.com/jollof.png');
    expect(image.props.accessibilityLabel).toBe('Jollof Rice');
    expect(image.props.style).toEqual({ width: 120, height: 80 });
  });

  it('sizes its container, and merges extra styles', () => {
    render(<ShimmerExpoImage uri="x" width={120} height={80} styles={{ borderRadius: 12 }} />);

    expect(screen.toJSON().props.style).toMatchObject({
      width: 120,
      height: 80,
      borderRadius: 12,
      overflow: 'hidden',
    });
  });

  it('defaults to 200x200', () => {
    render(<ShimmerExpoImage uri="x" />);
    expect(screen.toJSON().props.style).toMatchObject({ width: 200, height: 200 });
  });

  it('shows the shimmer overlay until the image has loaded', () => {
    render(<ShimmerExpoImage uri="x" />);
    // image + shimmer overlay
    expect(screen.toJSON().children).toHaveLength(2);

    fireEvent(screen.getByTestId('expo-image'), 'loadEnd');

    // overlay removed once loaded
    expect(screen.toJSON().children).toHaveLength(1);
  });
});
