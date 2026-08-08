import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@lumora/theme';
import {
  Heading,
  Text,
  Body,
  Overline,
  Stack,
  VStack,
  Container,
  Button,
} from '@lumora/ui';

export default function TabOneScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container max="wide">
        <VStack gap="lg" style={{ paddingVertical: 24 }}>
          <VStack gap="xs">
            <Overline color="primary">PERSONAL LIFE OPERATING SYSTEM</Overline>
            <Heading level={1}>Lumora Home</Heading>
            <Text role="Body" color="textSecondary">
              Welcome to Lumora. Everything is a Universal Object inheriting unified capabilities.
            </Text>
          </VStack>

          {__DEV__ && (
            <Stack padding="md" radius="card" background={colors.surfaceElevated}>
              <VStack gap="sm">
                <Text role="Title Small">Internal Development Review</Text>
                <Body color="textSecondary">
                  Launch the internal Design System Review Platform to test all 34 typography roles, materials, themes, and motion physics.
                </Body>
                <Button
                  label="Open Design System Playground (/design-system)"
                  variant="primary"
                  leftIcon="system.playground"
                  onPress={() => router.push('/design-system')}
                />
              </VStack>
            </Stack>
          )}
        </VStack>
      </Container>
    </ScrollView>
  );
}
