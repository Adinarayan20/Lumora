import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '@lumora/theme';
import {
  Heading,
  Text,
  Overline,
  VStack,
  Container,
} from '@lumora/ui';

export default function TabTwoScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container max="wide">
        <VStack gap="lg" style={{ paddingVertical: 24 }}>
          <VStack gap="xs">
            <Overline color="primary">UNIVERSAL TIMELINE</Overline>
            <Heading level={1}>Timeline Activity</Heading>
            <Text role="Body" color="textSecondary">
              Every action, mutation, and life activity in Lumora is recorded into the deterministic domain timeline.
            </Text>
          </VStack>
        </VStack>
      </Container>
    </ScrollView>
  );
}
