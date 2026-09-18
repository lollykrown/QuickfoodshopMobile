import { fireEvent, render, screen } from '@testing-library/react-native';
import { __router } from 'expo-router';
import { ItemCard, StoreCard } from '@/components/ItemCard';

const dish = {
  _id: 'd1',
  itemName: 'Jollof Rice',
  price: 8.5,
  image: 'https://example.com/jollof.png',
  estimatedDeliveryTime: 25,
  vendorId: { businessName: "Mama's Kitchen" },
};

const store = {
  _id: 's1',
  businessName: 'Gillian Store',
  businessAddress: '1 High Street, Sunderland',
  image: 'https://example.com/store.png',
};

describe('ItemCard (dish)', () => {
  it('shows the dish name, vendor, price and delivery time', () => {
    render(<ItemCard data={dish} storeType="food" />);

    expect(screen.getByText('Jollof Rice')).toBeTruthy();
    expect(screen.getByText("Mama's Kitchen")).toBeTruthy();
    expect(screen.getByText('£8.50')).toBeTruthy();
    expect(screen.getByText('25 minutes')).toBeTruthy();
  });

  it('labels the image with the dish name', () => {
    render(<ItemCard data={dish} />);
    expect(screen.getByTestId('expo-image').props.accessibilityLabel).toBe('Jollof Rice');
  });

  it('prefers vendor.estimatedDeliveryTime when the dish has one nested under vendor', () => {
    render(
      <ItemCard
        data={{ ...dish, estimatedDeliveryTime: undefined, vendor: { estimatedDeliveryTime: 40 } }}
      />,
    );
    expect(screen.getByText('40 minutes')).toBeTruthy();
  });

  it('omits the delivery time when unknown', () => {
    render(<ItemCard data={{ ...dish, estimatedDeliveryTime: undefined }} />);
    expect(screen.queryByText(/minutes/)).toBeNull();
  });

  it('falls back to the vendor name as the title when the item has no name', () => {
    render(<ItemCard data={{ ...dish, itemName: undefined }} />);
    expect(screen.getAllByText("Mama's Kitchen")).toHaveLength(2);
  });

  it('links to /stores/<type>/<id> when a store type is given', () => {
    render(<ItemCard data={dish} storeType="food" />);
    fireEvent.press(screen.getByText('Jollof Rice'));
    expect(__router.push).toHaveBeenCalledWith('/stores/food/d1');
  });

  it('links to /stores/<id> without a store type', () => {
    render(<ItemCard data={dish} />);
    fireEvent.press(screen.getByText('Jollof Rice'));
    expect(__router.push).toHaveBeenCalledWith('/stores/d1');
  });
});

describe('ItemCard (store)', () => {
  it('shows the name, address and rating instead of a price', () => {
    render(<ItemCard data={store} storeType="restaurants" />);

    expect(screen.getByText('Gillian Store')).toBeTruthy();
    expect(screen.getByText('1 High Street, Sunderland')).toBeTruthy();
    expect(screen.getByText('⭐ 4.5 (97)')).toBeTruthy();
    expect(screen.queryByText(/From/)).toBeNull();
  });

  it('never shows a delivery time for stores', () => {
    render(<ItemCard data={{ ...store, estimatedDeliveryTime: 30 }} />);
    expect(screen.queryByText(/minutes/)).toBeNull();
  });
});

describe('StoreCard', () => {
  it('shows the store name, address, rating and delivery estimate', () => {
    render(<StoreCard data={store} />);

    expect(screen.getByText('Gillian Store')).toBeTruthy();
    expect(screen.getByText('1 High Street, Sunderland')).toBeTruthy();
    expect(screen.getByText('⭐ 4.5 (97)')).toBeTruthy();
    expect(screen.getByText('25min')).toBeTruthy();
  });

  it('links to the store, with or without a store type', () => {
    const { unmount } = render(<StoreCard data={store} storeType="grocery-stores" />);
    fireEvent.press(screen.getByText('Gillian Store'));
    expect(__router.push).toHaveBeenLastCalledWith('/stores/grocery-stores/s1');
    unmount();

    render(<StoreCard data={store} />);
    fireEvent.press(screen.getByText('Gillian Store'));
    expect(__router.push).toHaveBeenLastCalledWith('/stores/s1');
  });
});
