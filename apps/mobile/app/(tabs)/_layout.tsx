import React from 'react';
import { Link, Tabs } from 'expo-router';
import { useTheme } from '@lumora/theme';
import { Icon } from '@lumora/ui';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.textPrimary,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="nav.home"
              size="md"
              color={focused ? 'icon.brand' : 'icon.muted'}
              isSelected={focused}
            />
          ),
          headerRight: () => (
            <React.Fragment>
              {__DEV__ && (
                <Link href="/design-system" asChild>
                  <Icon
                    name="settings.gear"
                    size="md"
                    color="icon.brand"
                    accessibilityLabel="Open Design System Playground"
                    style={{ marginRight: 16 }}
                  />
                </Link>
              )}
            </React.Fragment>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="nav.timeline"
              size="md"
              color={focused ? 'icon.brand' : 'icon.muted'}
              isSelected={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
