import { Platform } from 'react-native';

const tintColorLight = '#006634';
const tintColorDark = '#fff';

export const Colors = {
    primary:'#006634',
    red: '#EB001B',
    light: {
        text: '#11181C',
        background: '#fff',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        HeaderBackground:'rgb(242,242,247)',
    },
    dark: {
        text: '#ECEDEE',
        background: '#151718',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
        HeaderBackground:'rgb(1,1,1)',
    },
    green: {
        green900: '#23C55E',
        green800: '#39CA6E',
        green700: '#4FD07E',
        green600: '#65D68E',
        green500: '#7BDB9E',
        green400: '#91E0AE',
        green300: '#A7E6BE',
        green200: '#BDECCF',
        green100: '#D3F1DF',
        green50: '#E9F7EF', 
    },
    orange:{
        orange900: '#F96600',
        orange800: '#FF7519',
        orange700: '#FF8433',
        orange600: '#FF934C',
        orange500: '#FFA366',
        orange400: '#FFB27F',
        orange300: '#FFC199',
        orange200: '#FFD1B2',
        orange100: '#FFE0CC',
        orange50: '#FFEFE5',
    },
    black: {
        black900: '#2F2F2F',
        black800: '#434343',
        black700: '#585858',
        black600: '#6D6D6D',
        black500: '#828282',
        black400: '#979797',
        black300: '#ABABAB',
        black200: '#C0C0C0',
        black100: '#D5D5D5',
        black50: '#EAEAEA',
    }
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

