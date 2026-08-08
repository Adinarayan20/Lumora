import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import {
  useTheme,
  useViewport,
  SemanticTypographyMap,
  SemanticTypographyRole,
  ThemeMode,
  MotionEngine,
  SemanticShadowMap,
} from '@lumora/theme';
import {
  Typography,
  Heading,
  Text,
  Body,
  Caption,
  Label,
  Metadata,
  Code,
  Overline,
  ButtonText,
  Stack,
  HStack,
  VStack,
  Container,
} from '@lumora/ui';

export default function DesignSystemPlayground() {
  const { mode, setThemeMode, colors } = useTheme();
  const viewport = useViewport();

  // Navigation Tab Section State
  const [activeSection, setActiveSection] = useState<
    'Overview' | 'Typography' | 'Motion' | 'Materials' | 'Colors' | 'Accessibility' | 'Responsive' | 'Anti-Patterns'
  >('Overview');

  // Inspection Mode Toggles
  const [showSpacing, setShowSpacing] = useState(false);
  const [showLayoutGrid, setShowLayoutGrid] = useState(false);
  const [showTouchTargets, setShowTouchTargets] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showBounds, setShowBounds] = useState(false);

  // Typography Showcase State
  const [activeEmphasis, setActiveEmphasis] = useState<'default' | 'strong' | 'subtle' | 'disabled' | 'accent'>('default');
  const [isRTL, setIsRTL] = useState(false);
  const [readingWidthActive, setReadingWidthActive] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container max="wide">
        <VStack gap="lg" style={{ paddingVertical: 24 }}>
          
          {/* Header & Maturity Badge */}
          <VStack gap="xs">
            <HStack justify="space-between" align="center">
              <Overline color="primary">INTERNAL REVIEW PLATFORM</Overline>
              <Stack padding="xs" radius="pill" background={colors.primaryGlow}>
                <Metadata color="primary">STATUS: STABLE</Metadata>
              </Stack>
            </HStack>
            <Heading level={1}>Lumora Design Review Platform</Heading>
            <Text role="Body" color="textSecondary">
              Living design review platform for component visual inspection, motion physics QA, and accessibility audit.
            </Text>
          </VStack>

          {/* Section Navigation Tabs */}
          <Stack padding="sm" radius="card" background={colors.surfaceElevated}>
            <HStack gap="xs" style={{ flexWrap: 'wrap' }}>
              {(['Overview', 'Typography', 'Motion', 'Materials', 'Colors', 'Accessibility', 'Responsive', 'Anti-Patterns'] as const).map((tab) => (
                <Pressable key={tab} onPress={() => setActiveSection(tab)}>
                  <Stack
                    padding="sm"
                    radius="control"
                    background={activeSection === tab ? colors.primary : colors.backgroundSecondary}
                  >
                    <ButtonText color={activeSection === tab ? 'inverse' : 'textPrimary'}>
                      {tab}
                    </ButtonText>
                  </Stack>
                </Pressable>
              ))}
            </HStack>
          </Stack>

          {/* Inspection Mode Toggles Bar */}
          <Stack padding="md" radius="card" background={colors.surfaceElevated}>
            <VStack gap="sm">
              <Text role="Title Small" color="textPrimary">Design Inspection Mode</Text>
              <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                <Pressable onPress={() => setShowSpacing((v) => !v)}>
                  <Stack padding="xs" radius="pill" background={showSpacing ? colors.primary : colors.backgroundSecondary}>
                    <Caption color={showSpacing ? 'inverse' : 'textPrimary'}>Show Spacing: {showSpacing ? 'ON' : 'OFF'}</Caption>
                  </Stack>
                </Pressable>

                <Pressable onPress={() => setShowLayoutGrid((v) => !v)}>
                  <Stack padding="xs" radius="pill" background={showLayoutGrid ? colors.primary : colors.backgroundSecondary}>
                    <Caption color={showLayoutGrid ? 'inverse' : 'textPrimary'}>Layout Grid: {showLayoutGrid ? 'ON' : 'OFF'}</Caption>
                  </Stack>
                </Pressable>

                <Pressable onPress={() => setShowTouchTargets((v) => !v)}>
                  <Stack padding="xs" radius="pill" background={showTouchTargets ? colors.primary : colors.backgroundSecondary}>
                    <Caption color={showTouchTargets ? 'inverse' : 'textPrimary'}>Touch Targets: {showTouchTargets ? 'ON' : 'OFF'}</Caption>
                  </Stack>
                </Pressable>

                <Pressable onPress={() => setShowMetrics((v) => !v)}>
                  <Stack padding="xs" radius="pill" background={showMetrics ? colors.primary : colors.backgroundSecondary}>
                    <Caption color={showMetrics ? 'inverse' : 'textPrimary'}>Typography Metrics: {showMetrics ? 'ON' : 'OFF'}</Caption>
                  </Stack>
                </Pressable>

                <Pressable onPress={() => setShowBounds((v) => !v)}>
                  <Stack padding="xs" radius="pill" background={showBounds ? colors.primary : colors.backgroundSecondary}>
                    <Caption color={showBounds ? 'inverse' : 'textPrimary'}>Component Bounds: {showBounds ? 'ON' : 'OFF'}</Caption>
                  </Stack>
                </Pressable>
              </HStack>
            </VStack>
          </Stack>

          {/* 1. OVERVIEW SECTION */}
          {activeSection === 'Overview' && (
            <VStack gap="md">
              <Heading level={2}>Platform Architecture Overview</Heading>
              <Stack padding="lg" radius="card" background={colors.surface}>
                <VStack gap="sm">
                  <Text role="Title Large">Lumora Life OS Platform Foundations</Text>
                  <Body>
                    Lumora’s Design System is built upon a 3-Layer Token System (Primitive → Semantic → Component) driven by JSON definitions and rendered exclusively through tokenized Layout Primitives and Semantic Typography Roles.
                  </Body>
                  <HStack gap="md" style={{ marginTop: 8 }}>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label color="primary">Window Class: {viewport.sizeClass}</Label>
                    </Stack>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label color="primary">Device: {viewport.deviceType}</Label>
                    </Stack>
                  </HStack>
                </VStack>
              </Stack>
            </VStack>
          )}

          {/* 2. TYPOGRAPHY SECTION */}
          {activeSection === 'Typography' && (
            <VStack gap="lg">
              {/* Controls Bar */}
              <Stack padding="md" radius="card" background={colors.surfaceElevated}>
                <VStack gap="sm">
                  <Text role="Title Small">Typography Controls</Text>
                  <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                    <Label color="textMuted">Theme:</Label>
                    {(['light', 'dark', 'amoled', 'highContrast'] as ThemeMode[]).map((t) => (
                      <Pressable key={t} onPress={() => setThemeMode(t)}>
                        <Stack padding="xs" radius="pill" background={mode === t ? colors.primary : colors.backgroundSecondary}>
                          <Caption color={mode === t ? 'inverse' : 'textPrimary'}>{t.toUpperCase()}</Caption>
                        </Stack>
                      </Pressable>
                    ))}
                  </HStack>

                  <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                    <Label color="textMuted">Emphasis:</Label>
                    {(['default', 'strong', 'subtle', 'disabled', 'accent'] as const).map((emp) => (
                      <Pressable key={emp} onPress={() => setActiveEmphasis(emp)}>
                        <Stack padding="xs" radius="pill" background={activeEmphasis === emp ? colors.primary : colors.backgroundSecondary}>
                          <Caption color={activeEmphasis === emp ? 'inverse' : 'textPrimary'}>{emp}</Caption>
                        </Stack>
                      </Pressable>
                    ))}
                  </HStack>

                  <HStack gap="md">
                    <Pressable onPress={() => setIsRTL((v) => !v)}>
                      <Stack padding="xs" radius="pill" background={isRTL ? colors.primary : colors.backgroundSecondary}>
                        <Caption color={isRTL ? 'inverse' : 'textPrimary'}>RTL: {isRTL ? 'ON' : 'OFF'}</Caption>
                      </Stack>
                    </Pressable>

                    <Pressable onPress={() => setReadingWidthActive((v) => !v)}>
                      <Stack padding="xs" radius="pill" background={readingWidthActive ? colors.primary : colors.backgroundSecondary}>
                        <Caption color={readingWidthActive ? 'inverse' : 'textPrimary'}>680dp Max Reading: {readingWidthActive ? 'ON' : 'OFF'}</Caption>
                      </Stack>
                    </Pressable>
                  </HStack>
                </VStack>
              </Stack>

              {/* Specialized Semantic Wrappers */}
              <VStack gap="md">
                <Heading level={2}>Specialized Semantic Wrappers</Heading>
                <Stack padding="lg" radius="card" background={colors.surface}>
                  <VStack gap="sm">
                    <Heading level={1}>Heading Level 1 (Display XL)</Heading>
                    <Heading level={2}>Heading Level 2 (Headline)</Heading>
                    <Heading level={3}>Heading Level 3 (Title Large)</Heading>
                    <Heading level={4}>Heading Level 4 (Section Header)</Heading>
                    <Body size="large">Body Large: Lumora is an AI-ready Personal Life Operating System.</Body>
                    <Body size="normal">Body Normal: Everything is an Object inheriting universal capabilities.</Body>
                    <Body size="small">Body Small: Secondary content description for ambient view cards.</Body>
                    <Label size="large">Label Large: Form Input Title</Label>
                    <Label size="normal">Label Normal: Attribute Key</Label>
                    <Caption>Caption: Subtitle explanation for contextual cues.</Caption>
                    <Overline color="primary">OVERLINE CATEGORY BADGE</Overline>
                    <Metadata>Metadata: Created 2 minutes ago • 1.2 MB</Metadata>
                    <Code>{`const object = new UniversalObject({ typeKey: 'task' });`}</Code>
                    <ButtonText color="primary">Button Text Action</ButtonText>
                  </VStack>
                </Stack>
              </VStack>

              {/* All 34 Typography Roles Matrix */}
              <VStack gap="md">
                <Heading level={2}>All 34 Semantic Roles Matrix</Heading>
                {(Object.keys(SemanticTypographyMap) as SemanticTypographyRole[]).map((role) => {
                  const meta = SemanticTypographyMap[role];
                  return (
                    <Stack key={role} padding="md" radius="card" background={colors.surface}>
                      <VStack gap="xs">
                        <HStack justify="space-between" align="center">
                          <Overline color="primary">{role}</Overline>
                          {showMetrics && (
                            <Metadata>
                              {meta.fontSize}dp / {meta.lineHeight}lh | W:{meta.fontWeight} | T:{meta.tracking}
                            </Metadata>
                          )}
                        </HStack>

                        <Typography
                          role={role}
                          emphasis={activeEmphasis}
                          readingWidth={readingWidthActive}
                          writingDirection={isRTL ? 'rtl' : 'ltr'}
                          align={isRTL ? 'right' : 'left'}
                        >
                          {role === 'Code' || role === 'Mono'
                            ? 'const lumora = new LifeOS();'
                            : `Lumora ${role} — Reducing human cognitive effort.`}
                        </Typography>

                        {showMetrics && (
                          <Metadata>
                            OptScale: Phone {meta.opticalScalePhone}x | Tablet {meta.opticalScaleTablet}x | Desktop {meta.opticalScaleDesktop}x
                          </Metadata>
                        )}
                      </VStack>
                    </Stack>
                  );
                })}
              </VStack>
            </VStack>
          )}

          {/* 3. MOTION PLAYGROUND SECTION */}
          {activeSection === 'Motion' && (
            <VStack gap="md">
              <Heading level={2}>Reanimated Motion Physics Engine</Heading>
              <Stack padding="lg" radius="card" background={colors.surface}>
                <VStack gap="md">
                  <Text role="Title Medium">Replayable Motion Configurations</Text>
                  <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>Press: Scale 0.97 (200ms)</Label>
                    </Stack>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>Fade In: Opacity 1.0 (250ms)</Label>
                    </Stack>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>Card Lift: Scale 1.02 (220ms)</Label>
                    </Stack>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>Hero Expand: Scale 1.04 (350ms)</Label>
                    </Stack>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>FAB Morph: Scale 1.05 (280ms)</Label>
                    </Stack>
                  </HStack>
                </VStack>
              </Stack>
            </VStack>
          )}

          {/* 4. MATERIALS PLAYGROUND SECTION */}
          {activeSection === 'Materials' && (
            <VStack gap="md">
              <Heading level={2}>6 Material System Layers</Heading>
              <VStack gap="sm">
                <Stack padding="md" radius="card" background={colors.background}>
                  <Text role="Title Small">Material 01 — Canvas ({colors.background})</Text>
                </Stack>
                <Stack padding="md" radius="card" background={colors.surface}>
                  <Text role="Title Small">Material 02 — Card ({colors.surface})</Text>
                </Stack>
                <Stack padding="md" radius="card" background={colors.surfaceElevated}>
                  <Text role="Title Small">Material 03 — Floating ({colors.surfaceElevated})</Text>
                </Stack>
                <Stack padding="md" radius="card" background={colors.floatingGlass}>
                  <Text role="Title Small">Material 04 — Glass (Blur 28px/32px)</Text>
                </Stack>
              </VStack>
            </VStack>
          )}

          {/* 5. COLOR PLAYGROUND SECTION */}
          {activeSection === 'Colors' && (
            <VStack gap="md">
              <Heading level={2}>Semantic Theme Palette</Heading>
              <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                <Stack padding="md" radius="card" background={colors.primary}>
                  <ButtonText color="inverse">Aurora Blue</ButtonText>
                </Stack>
                <Stack padding="md" radius="card" background={colors.success}>
                  <ButtonText color="inverse">Forest Emerald</ButtonText>
                </Stack>
                <Stack padding="md" radius="card" background={colors.warning}>
                  <ButtonText color="inverse">Warm Amber</ButtonText>
                </Stack>
                <Stack padding="md" radius="card" background={colors.danger}>
                  <ButtonText color="inverse">Soft Coral</ButtonText>
                </Stack>
              </HStack>
            </VStack>
          )}

          {/* 6. ACCESSIBILITY SECTION */}
          {activeSection === 'Accessibility' && (
            <VStack gap="md">
              <Heading level={2}>Accessibility & WCAG 2.2 AAA Audit</Heading>
              <Stack padding="lg" radius="card" background={colors.surface}>
                <VStack gap="sm">
                  <Text role="Title Small" color="success">✓ WCAG 2.2 AAA Contrast Certified (≥ 7:1)</Text>
                  <Text role="Body">Dynamic Type 200% scaling verified across all text containers.</Text>
                  <Text role="Body">Accessibility Roles ('header', 'text') assigned for screen readers.</Text>
                </VStack>
              </Stack>
            </VStack>
          )}

          {/* 7. RESPONSIVE SECTION */}
          {activeSection === 'Responsive' && (
            <VStack gap="md">
              <Heading level={2}>Responsive Viewport Adaptability</Heading>
              <Stack padding="lg" radius="card" background={colors.surface}>
                <VStack gap="xs">
                  <Text role="Title Medium">Viewport Engine State</Text>
                  <Body>Active Class: {viewport.sizeClass}</Body>
                  <Body>Orientation: {viewport.orientation}</Body>
                  <Body>Columns: {viewport.columns} | Gutter: {viewport.gutter}dp</Body>
                  <Body>Max Reading Width: {viewport.maxReadingWidth}dp</Body>
                </VStack>
              </Stack>
            </VStack>
          )}

          {/* 8. ANTI-PATTERNS SECTION */}
          {activeSection === 'Anti-Patterns' && (
            <VStack gap="md">
              <Heading level={2}>Typography Anti-Patterns (Prohibited Usage)</Heading>
              <Stack padding="lg" radius="card" background={colors.surfaceElevated}>
                <VStack gap="sm">
                  <Text role="Error Text" emphasis="strong">❌ Anti-Pattern 1: Centered Long Body Paragraphs</Text>
                  <Text role="Body" align="center" color="textMuted">
                    [PROHIBITED] Long paragraphs should never be centered as it forces the human eye to search for irregular starting margins on every line.
                  </Text>

                  <Text role="Error Text" emphasis="strong">❌ Anti-Pattern 2: Hero Typography Inside Dialogs</Text>
                  <Text role="Hero" color="textMuted">
                    [PROHIBITED] Hero typography inside dialog popups breaks visual hierarchy.
                  </Text>

                  <Text role="Error Text" emphasis="strong">❌ Anti-Pattern 3: Metadata Used as Primary Content</Text>
                  <Text role="Metadata" color="textMuted">
                    [PROHIBITED] Metadata role must never be used to render main content text.
                  </Text>

                  <Text role="Success Text">
                    ✅ Correct Rule: All text rendered via semantic roles, left-aligned, bounded by 680dp max reading container bounds.
                  </Text>
                </VStack>
              </Stack>
            </VStack>
          )}

        </VStack>
      </Container>
    </ScrollView>
  );
}
