import { fireEvent, render, screen } from '@testing-library/react-native';
import Accordion from '@/components/Accordion';
import DottedLines from '@/components/DottedLines';

const order = {
  name: 'order-1',
  orderNumber: 'ORD-1001',
  deliveryCode: '4821',
  date: '12 Jan 2026',
  vendor: 'Mama Kitchen',
  status: 'pending',
  items: [
    { name: 'Jollof Rice', quantity: 2 },
    { name: 'Chicken', quantity: 1 },
  ],
  extras: [{ name: 'Plantain', quantity: 3 }],
};

describe('Accordion', () => {
  it('always shows the order number and delivery code', () => {
    render(<Accordion item={order} isExpanded={false} onToggle={() => {}} onPress={() => {}} />);

    expect(screen.getByText('ORD-1001')).toBeTruthy();
    expect(screen.getByText('4821')).toBeTruthy();
  });

  it('hides the details while collapsed', () => {
    render(<Accordion item={order} isExpanded={false} onToggle={() => {}} onPress={() => {}} />);

    expect(screen.queryByText('Mama Kitchen')).toBeNull();
    expect(screen.queryByText('12 Jan 2026')).toBeNull();
    expect(screen.queryByText(/Jollof Rice/)).toBeNull();
  });

  it('shows date, vendor, status, items and extras when expanded', () => {
    render(<Accordion item={order} isExpanded onToggle={() => {}} onPress={() => {}} />);

    expect(screen.getByText('12 Jan 2026')).toBeTruthy();
    expect(screen.getByText('Mama Kitchen')).toBeTruthy();
    expect(screen.getByText('pending')).toBeTruthy();
    expect(screen.getByText('⦿ Jollof Rice')).toBeTruthy();
    expect(screen.getByText('⦿ Chicken')).toBeTruthy();
    expect(screen.getByText('⦿ Plantain')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('calls onToggle from the arrow without triggering the card press', () => {
    const onToggle = jest.fn();
    const onPress = jest.fn();
    render(<Accordion item={order} isExpanded={false} onToggle={onToggle} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('icon-keyboard-arrow-down'));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('calls onPress when the card itself is pressed', () => {
    const onPress = jest.fn();
    render(<Accordion item={order} isExpanded={false} onToggle={() => {}} onPress={onPress} />);

    fireEvent.press(screen.getByText('ORD-1001'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('handles an order with no extras', () => {
    render(
      <Accordion item={{ ...order, extras: [] }} isExpanded onToggle={() => {}} onPress={() => {}} />,
    );
    expect(screen.getByText('Extras')).toBeTruthy();
    expect(screen.queryByText('⦿ Plantain')).toBeNull();
  });
});

describe('DottedLines', () => {
  describe('before pickup (no status)', () => {
    it('shows the pickup point, destination, payment and distance', () => {
      render(<DottedLines />);

      expect(screen.getByText('Gillian Store')).toBeTruthy();
      expect(screen.getByText(/Pickup point/)).toBeTruthy();
      expect(screen.getByText('465 Peckham, London')).toBeTruthy();
      expect(screen.getByText('Destination')).toBeTruthy();
      expect(screen.getByText(/Payment/)).toBeTruthy();
      expect(screen.getByText(/£310/)).toBeTruthy();
      expect(screen.getByText('12km')).toBeTruthy();
    });

    it('hides the right-hand summary when right={false}', () => {
      render(<DottedLines right={false} />);

      expect(screen.queryByText(/£310/)).toBeNull();
      expect(screen.queryByText('12km')).toBeNull();
    });
  });

  describe('with a status', () => {
    it('in transit: says the order has left the store, and shows a check but no payment', () => {
      render(<DottedLines status="in transit" />);

      expect(screen.getByText('Order has left the store')).toBeTruthy();
      expect(screen.queryByText(/£310/)).toBeNull();
      expect(screen.queryByText('12km')).toBeNull();
      expect(screen.getAllByTestId('icon-check-circle-fill')).toHaveLength(1);
    });

    it('delivered: shows both completed checks', () => {
      render(<DottedLines status="delivered" />);

      expect(screen.getByText('Order has left the store')).toBeTruthy();
      expect(screen.getAllByTestId('icon-check-circle-fill')).toHaveLength(2);
    });
  });

  it('applies extra container styles', () => {
    render(<DottedLines styles={{ marginTop: 20 }} />);
    expect(screen.toJSON().props.style).toMatchObject({ marginTop: 20 });
  });
});
