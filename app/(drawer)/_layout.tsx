/**
 * AI Matrx Mobile - Drawer Layout
 * Native drawer navigation for chat interface
 */

import { DrawerContent } from '@/components/navigation/DrawerContent';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Drawer } from 'expo-router/drawer';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props: any) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colors.background,
            width: Platform.OS === 'ios' ? '85%' : '80%',
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          swipeEdgeWidth: 50,
          swipeEnabled: true,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Home',
            title: 'Chat',
          }}
        />
        <Drawer.Screen
          name="chat/[id]"
          options={{
            drawerLabel: () => null,
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
