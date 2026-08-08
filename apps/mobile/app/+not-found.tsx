import React from 'react';
import { Link, Stack } from 'expo-router';
import { useTheme } from '@lumora/theme';
import { Heading, Text, VStack, Container, Stack as LumoraStack } from '@lumora/ui';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <LumoraStack padding="lg" radius="none" background={colors.background} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Container max="content">
          <VStack gap="md" style={{ alignItems: 'center' }}>
            <Heading level={2}>This screen doesn't exist.</Heading>
            <Link href="/">
              <Text role="Body" color="primary">Go to home screen!</Text>
            </Link>
          </VStack>
        </Container>
      </LumoraStack>
    </>
  );
}
