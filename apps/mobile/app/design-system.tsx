import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import {
  useTheme,
  useViewport,
  SemanticTypographyMap,
  SemanticTypographyRole,
  ThemeMode,
  IconSizes,
  IconTouchTargets,
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
  Icon,
  SemanticIconName,
  SemanticIconSize,
  IconStrokeWeight,
  SemanticIconColor,
} from '@lumora/ui';

const ALL_FOUNDATIONAL_ICONS: { domain: string; icons: SemanticIconName[] }[] = [
  {
    domain: 'Navigation',
    icons: ['nav.home', 'nav.timeline', 'nav.settings', 'nav.back', 'nav.forward', 'nav.close', 'nav.menu', 'nav.more'],
  },
  {
    domain: 'Actions',
    icons: ['action.add', 'action.edit', 'action.delete', 'action.search', 'action.filter', 'action.share'],
  },
  {
    domain: 'Universal Objects',
    icons: ['object.task', 'object.note', 'object.reminder', 'object.event', 'object.collection'],
  },
  {
    domain: 'Status Indicators',
    icons: ['status.success', 'status.warning', 'status.error', 'status.info'],
  },
  {
    domain: 'Settings & Security',
    icons: ['settings.gear', 'settings.theme', 'security.user', 'security.lock'],
  },
  {
    domain: 'System Infrastructure',
    icons: ['system.playground'],
  },
];

export default function DesignSystemPlayground() {
  const { mode, setThemeMode, colors } = useTheme();
  const viewport = useViewport();

  // Navigation Tab Section State
  const [activeSection, setActiveSection] = useState<
    'Overview' | 'Typography' | 'Icons' | 'Motion' | 'Materials' | 'Colors' | 'Accessibility' | 'Responsive' | 'Anti-Patterns'
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

  // Icon Inspection State
  const [inspectedIcon, setInspectedIcon] = useState<SemanticIconName>('action.search');
  const [inspectedSize, setInspectedSize] = useState<SemanticIconSize>('md');
  const [inspectedStroke, setInspectedStroke] = useState<IconStrokeWeight>('auto');
  const [inspectedColor, setInspectedColor] = useState<SemanticIconColor>('icon.primary');
  const [iconLoadingState, setIconLoadingState] = useState(false);
  const [iconSelectedState, setIconSelectedState] = useState(false);
  const [iconDisabledState, setIconDisabledState] = useState(false);

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
              {(['Overview', 'Typography', 'Icons', 'Motion', 'Materials', 'Colors', 'Accessibility', 'Responsive', 'Anti-Patterns'] as const).map((tab) => (
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

          {/* Global Theme Controls & Inspection Mode Toggles */}
          <Stack padding="md" radius="card" background={colors.surfaceElevated}>
            <VStack gap="sm">
              <Text role="Title Small" color="textPrimary">Global Theme & Inspection Controls</Text>
              <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                <Label color="textMuted">Theme Mode:</Label>
                {(['light', 'dark', 'amoled', 'highContrast'] as ThemeMode[]).map((t) => (
                  <Pressable key={t} onPress={() => setThemeMode(t)}>
                    <Stack padding="xs" radius="pill" background={mode === t ? colors.primary : colors.backgroundSecondary}>
                      <Caption color={mode === t ? 'inverse' : 'textPrimary'}>{t.toUpperCase()}</Caption>
                    </Stack>
                  </Pressable>
                ))}
              </HStack>

              <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                <Pressable onPress={() => setShowTouchTargets((v) => !v)}>
                  <Stack padding="xs" radius="pill" background={showTouchTargets ? colors.primary : colors.backgroundSecondary}>
                    <Caption color={showTouchTargets ? 'inverse' : 'textPrimary'}>Touch Targets Debugger: {showTouchTargets ? 'ON' : 'OFF'}</Caption>
                  </Stack>
                </Pressable>

                <Pressable onPress={() => setIsRTL((v) => !v)}>
                  <Stack padding="xs" radius="pill" background={isRTL ? colors.primary : colors.backgroundSecondary}>
                    <Caption color={isRTL ? 'inverse' : 'textPrimary'}>RTL Directional Mode: {isRTL ? 'ON' : 'OFF'}</Caption>
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
                    Lumora’s Design System is built upon a 3-Layer Token System (Primitive → Semantic → Component) driven by JSON definitions and rendered exclusively through tokenized Layout Primitives, Semantic Typography Roles, and Semantic Icon Platform primitives.
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
              <Stack padding="md" radius="card" background={colors.surfaceElevated}>
                <VStack gap="sm">
                  <Text role="Title Small">Typography Emphasis Controls</Text>
                  <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                    {(['default', 'strong', 'subtle', 'disabled', 'accent'] as const).map((emp) => (
                      <Pressable key={emp} onPress={() => setActiveEmphasis(emp)}>
                        <Stack padding="xs" radius="pill" background={activeEmphasis === emp ? colors.primary : colors.backgroundSecondary}>
                          <Caption color={activeEmphasis === emp ? 'inverse' : 'textPrimary'}>{emp}</Caption>
                        </Stack>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>
              </Stack>

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
            </VStack>
          )}

          {/* 3. ICONS SECTION (COMPONENT #2) */}
          {activeSection === 'Icons' && (
            <VStack gap="lg">
              <Heading level={2}>Component #2 — Icon Platform Inspection</Heading>
              
              {/* ICON INSPECTION PANEL */}
              <Stack padding="lg" radius="card" background={colors.surface}>
                <VStack gap="md">
                  <HStack justify="space-between" align="center">
                    <Overline color="primary">ICON INSPECTION PANEL</Overline>
                    <Stack padding="xs" radius="pill" background={colors.primaryGlow}>
                      <Metadata color="primary">REGISTRY: ACTIVE</Metadata>
                    </Stack>
                  </HStack>

                  {/* Inspection Grid Details */}
                  <Stack padding="md" radius="control" background={colors.backgroundSecondary}>
                    <VStack gap="xs">
                      <HStack justify="space-between">
                        <Label color="textMuted">name: <Code>{inspectedIcon}</Code></Label>
                        <Label color="textMuted">resolved size: <Code>{IconSizes[inspectedSize]}px</Code></Label>
                      </HStack>
                      <HStack justify="space-between">
                        <Label color="textMuted">stroke: <Code>{inspectedStroke}</Code></Label>
                        <Label color="textMuted">color token: <Code>{inspectedColor}</Code></Label>
                      </HStack>
                      <HStack justify="space-between">
                        <Label color="textMuted">theme mode: <Code>{mode}</Code></Label>
                        <Label color="textMuted">viewport: <Code>{viewport.sizeClass}</Code></Label>
                      </HStack>
                      <HStack justify="space-between">
                        <Label color="textMuted">touch target: <Code>{IconTouchTargets.minimum}×{IconTouchTargets.minimum} dp</Code></Label>
                        <Label color="textMuted">state: <Code>{iconLoadingState ? 'LOADING' : iconDisabledState ? 'DISABLED' : iconSelectedState ? 'SELECTED' : 'DEFAULT'}</Code></Label>
                      </HStack>
                    </VStack>
                  </Stack>

                  {/* VISUAL RENDERED ICON DISPLAY BOX */}
                  <Stack
                    padding="xl"
                    radius="card"
                    background={colors.surfaceElevated}
                    style={{
                      alignItems: 'center',
                      justify: 'center',
                      borderWidth: showTouchTargets ? 1 : 0,
                      borderColor: colors.primary,
                      borderStyle: 'dashed',
                    }}
                  >
                    <VStack gap="sm" style={{ alignItems: 'center' }}>
                      <Icon
                        name={inspectedIcon}
                        size={inspectedSize}
                        strokeWeight={inspectedStroke}
                        color={iconDisabledState ? 'icon.disabled' : inspectedColor}
                        isLoading={iconLoadingState}
                        isSelected={iconSelectedState}
                        isRTLMirrorable={isRTL}
                        onPress={() => console.log('Inspected Icon Pressed')}
                        accessibilityLabel={`Inspected icon ${inspectedIcon}`}
                      />
                      <Caption color="textMuted">Interactive Touch Target Boundary ({IconTouchTargets.minimum}dp)</Caption>
                    </VStack>
                  </Stack>

                  {/* Interactive State Triggers */}
                  <VStack gap="xs">
                    <Label color="textPrimary">Interactive State Triggers:</Label>
                    <HStack gap="xs" style={{ flexWrap: 'wrap' }}>
                      <Pressable onPress={() => setIconSelectedState((v) => !v)}>
                        <Stack padding="xs" radius="pill" background={iconSelectedState ? colors.primary : colors.backgroundSecondary}>
                          <Caption color={iconSelectedState ? 'inverse' : 'textPrimary'}>SELECTED: {iconSelectedState ? 'ON' : 'OFF'}</Caption>
                        </Stack>
                      </Pressable>

                      <Pressable onPress={() => setIconDisabledState((v) => !v)}>
                        <Stack padding="xs" radius="pill" background={iconDisabledState ? colors.primary : colors.backgroundSecondary}>
                          <Caption color={iconDisabledState ? 'inverse' : 'textPrimary'}>DISABLED: {iconDisabledState ? 'ON' : 'OFF'}</Caption>
                        </Stack>
                      </Pressable>

                      <Pressable onPress={() => setIconLoadingState((v) => !v)}>
                        <Stack padding="xs" radius="pill" background={iconLoadingState ? colors.primary : colors.backgroundSecondary}>
                          <Caption color={iconLoadingState ? 'inverse' : 'textPrimary'}>LOADING LOOP: {iconLoadingState ? 'ON' : 'OFF'}</Caption>
                        </Stack>
                      </Pressable>
                    </HStack>
                  </VStack>

                  {/* Size & Color Controls */}
                  <VStack gap="xs">
                    <Label color="textPrimary">Select Size Token:</Label>
                    <HStack gap="xs" style={{ flexWrap: 'wrap' }}>
                      {(['xs', 'sm', 'md', 'lg', 'xl', 'display'] as SemanticIconSize[]).map((sz) => (
                        <Pressable key={sz} onPress={() => setInspectedSize(sz)}>
                          <Stack padding="xs" radius="pill" background={inspectedSize === sz ? colors.primary : colors.backgroundSecondary}>
                            <Caption color={inspectedSize === sz ? 'inverse' : 'textPrimary'}>{sz.toUpperCase()} ({IconSizes[sz]}px)</Caption>
                          </Stack>
                        </Pressable>
                      ))}
                    </HStack>
                  </VStack>

                  <VStack gap="xs">
                    <Label color="textPrimary">Select Color Token:</Label>
                    <HStack gap="xs" style={{ flexWrap: 'wrap' }}>
                      {(['icon.primary', 'icon.secondary', 'icon.muted', 'icon.brand', 'icon.accent', 'icon.success', 'icon.warning', 'icon.danger', 'icon.disabled'] as SemanticIconColor[]).map((c) => (
                        <Pressable key={c} onPress={() => setInspectedColor(c)}>
                          <Stack padding="xs" radius="pill" background={inspectedColor === c ? colors.primary : colors.backgroundSecondary}>
                            <Caption color={inspectedColor === c ? 'inverse' : 'textPrimary'}>{c}</Caption>
                          </Stack>
                        </Pressable>
                      ))}
                    </HStack>
                  </VStack>
                </VStack>
              </Stack>

              {/* FOUNDATIONAL 26 ICONS GALLERY */}
              <VStack gap="md">
                <Heading level={2}>Core Foundation Icons (26) & System Registry</Heading>
                <Text role="Body" color="textSecondary">
                  Tap any icon below to set it as the active target in the Inspection Panel above.
                </Text>

                {ALL_FOUNDATIONAL_ICONS.map((group) => (
                  <Stack key={group.domain} padding="md" radius="card" background={colors.surface}>
                    <VStack gap="sm">
                      <Overline color="primary">{group.domain.toUpperCase()}</Overline>
                      <HStack gap="md" style={{ flexWrap: 'wrap' }}>
                        {group.icons.map((iconName) => (
                          <Pressable key={iconName} onPress={() => setInspectedIcon(iconName)}>
                            <Stack
                              padding="sm"
                              radius="control"
                              background={inspectedIcon === iconName ? colors.primaryGlow : colors.backgroundSecondary}
                              style={{
                                alignItems: 'center',
                                borderWidth: inspectedIcon === iconName ? 1 : 0,
                                borderColor: colors.primary,
                              }}
                            >
                              <VStack gap="xs" style={{ alignItems: 'center' }}>
                                <Icon name={iconName} size="md" color={inspectedIcon === iconName ? 'icon.brand' : 'icon.primary'} />
                                <Metadata color={inspectedIcon === iconName ? 'primary' : 'textSecondary'}>{iconName}</Metadata>
                              </VStack>
                            </Stack>
                          </Pressable>
                        ))}
                      </HStack>
                    </VStack>
                  </Stack>
                ))}
              </VStack>

              {/* TYPOGRAPHY + ICON OPTICAL ALIGNMENT MATRIX */}
              <VStack gap="md">
                <Heading level={2}>Icon + Typography Optical Alignment Matrix</Heading>
                <Stack padding="lg" radius="card" background={colors.surface}>
                  <VStack gap="md">
                    <HStack gap="sm" align="center">
                      <Icon name="action.search" size="display" color="icon.brand" />
                      <Heading level={1}>Display XL Header Title</Heading>
                    </HStack>

                    <HStack gap="sm" align="center">
                      <Icon name="object.task" size="xl" color="icon.brand" />
                      <Heading level={2}>Headline Section Category</Heading>
                    </HStack>

                    <HStack gap="sm" align="center">
                      <Icon name="object.note" size="lg" color="icon.primary" />
                      <Heading level={3}>Title Large Object Name</Heading>
                    </HStack>

                    <HStack gap="sm" align="center">
                      <Icon name="nav.timeline" size="md" color="icon.primary" />
                      <Heading level={4}>Section Header Baseline</Heading>
                    </HStack>

                    <HStack gap="xs" align="center">
                      <Icon name="status.success" size="sm" color="icon.success" />
                      <Body>Body Normal: Task completed cleanly with zero optical displacement.</Body>
                    </HStack>

                    <HStack gap="xs" align="center">
                      <Icon name="security.lock" size="xs" color="icon.muted" />
                      <Metadata>Metadata: Encrypted with E2EE private key • Verified</Metadata>
                    </HStack>
                  </VStack>
                </Stack>
              </VStack>
            </VStack>
          )}

          {/* 4. MOTION PLAYGROUND SECTION */}
          {activeSection === 'Motion' && (
            <VStack gap="md">
              <Heading level={2}>Reanimated Motion Physics Engine</Heading>
              <Stack padding="lg" radius="card" background={colors.surface}>
                <VStack gap="md">
                  <Text role="Title Medium">Replayable Motion Configurations</Text>
                  <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>Press: Scale 0.95 (200ms)</Label>
                    </Stack>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>Fade In: Opacity 1.0 (250ms)</Label>
                    </Stack>
                    <Stack padding="sm" radius="control" background={colors.backgroundSecondary}>
                      <Label>Icon Spin: Linear Loop (1000ms)</Label>
                    </Stack>
                  </HStack>
                </VStack>
              </Stack>
            </VStack>
          )}

          {/* 5. MATERIALS PLAYGROUND SECTION */}
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
              </VStack>
            </VStack>
          )}

          {/* 6. COLOR PLAYGROUND SECTION */}
          {activeSection === 'Colors' && (
            <VStack gap="md">
              <Heading level={2}>Semantic Theme Palette</Heading>
              <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                <Stack padding="md" radius="card" background={colors.primary}>
                  <ButtonText color="inverse">Aurora Blue</ButtonText>
                </Stack>
                <Stack padding="md" radius="card" background={colors.accent}>
                  <ButtonText color="inverse">Aurora Violet</ButtonText>
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

          {/* 7. ACCESSIBILITY SECTION */}
          {activeSection === 'Accessibility' && (
            <VStack gap="md">
              <Heading level={2}>Accessibility & WCAG Audit</Heading>
              <Stack padding="lg" radius="card" background={colors.surface}>
                <VStack gap="sm">
                  <Text role="Title Small" color="success">✓ Role-based WCAG Non-Text Contrast Compliance</Text>
                  <Text role="Body">Interactive icons enforce mandatory accessibilityLabel and accessibilityRole="button".</Text>
                  <Text role="Body">Decorative icons automatically set accessibilityElementsHidden={true}.</Text>
                  <Text role="Body">Reduced motion disables continuous rotation loops and press scaling.</Text>
                </VStack>
              </Stack>
            </VStack>
          )}

          {/* 8. RESPONSIVE SECTION */}
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

          {/* 9. ANTI-PATTERNS SECTION */}
          {activeSection === 'Anti-Patterns' && (
            <VStack gap="md">
              <Heading level={2}>Icon & Typography Anti-Patterns</Heading>
              <Stack padding="lg" radius="card" background={colors.surfaceElevated}>
                <VStack gap="sm">
                  <Text role="Error Text" emphasis="strong">❌ Anti-Pattern: Direct Vendor Icon Imports</Text>
                  <Text role="Body" color="textMuted">
                    [PROHIBITED] Direct imports of @expo/vector-icons/FontAwesome or Lucide inside application screens bypass the semantic registry.
                  </Text>

                  <Text role="Error Text" emphasis="strong">❌ Anti-Pattern: Raw Hex Color Props on Icons</Text>
                  <Text role="Body" color="textMuted">
                    [PROHIBITED] Icons must consume semantic tokens (icon.primary, icon.brand), not hardcoded #111827 or #5B7FFF strings.
                  </Text>

                  <Text role="Success Text">
                    ✅ Correct Rule: All icons consumed via &lt;Icon name="..." /&gt; with tokenized colors, stroke weights, and sizes.
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
