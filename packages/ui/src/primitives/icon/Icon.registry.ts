import type { SemanticIconName } from './Icon.types';

export interface IconRegistryEntry {
  readonly family: 'Feather' | 'Ionicons' | 'FontAwesome' | 'MaterialCommunityIcons';
  readonly glyph: string;
  readonly autoMirror?: boolean;
}

/**
 * Closed, strongly typed Core Semantic Registry.
 * Guarantees every legal SemanticIconName maps to an entry at compile-time.
 */
const CORE_REGISTRY: Record<SemanticIconName, IconRegistryEntry> = {
  // Navigation
  'nav.home': { family: 'Feather', glyph: 'home' },
  'nav.timeline': { family: 'Feather', glyph: 'clock' },
  'nav.settings': { family: 'Feather', glyph: 'settings' },
  'nav.back': { family: 'Feather', glyph: 'arrow-left', autoMirror: true },
  'nav.forward': { family: 'Feather', glyph: 'arrow-right', autoMirror: true },
  'nav.close': { family: 'Feather', glyph: 'x' },
  'nav.menu': { family: 'Feather', glyph: 'menu' },
  'nav.more': { family: 'Feather', glyph: 'more-horizontal' },

  // Actions
  'action.add': { family: 'Feather', glyph: 'plus' },
  'action.edit': { family: 'Feather', glyph: 'edit-2' },
  'action.delete': { family: 'Feather', glyph: 'trash-2' },
  'action.search': { family: 'Feather', glyph: 'search' },
  'action.filter': { family: 'Feather', glyph: 'filter' },
  'action.share': { family: 'Feather', glyph: 'share-2', autoMirror: true },

  // Universal Objects
  'object.task': { family: 'Feather', glyph: 'check-square' },
  'object.note': { family: 'Feather', glyph: 'file-text' },
  'object.reminder': { family: 'Feather', glyph: 'bell' },
  'object.event': { family: 'Feather', glyph: 'calendar' },
  'object.collection': { family: 'Feather', glyph: 'folder' },

  // Status
  'status.success': { family: 'Feather', glyph: 'check-circle' },
  'status.warning': { family: 'Feather', glyph: 'alert-triangle' },
  'status.error': { family: 'Feather', glyph: 'alert-circle' },
  'status.info': { family: 'Feather', glyph: 'info' },

  // Settings & Security & System
  'settings.gear': { family: 'Feather', glyph: 'settings' },
  'settings.theme': { family: 'Feather', glyph: 'moon' },
  'security.user': { family: 'Feather', glyph: 'user' },
  'security.lock': { family: 'Feather', glyph: 'lock' },
  'system.playground': { family: 'Feather', glyph: 'flask' },
};

/**
 * Extensible Domain Registry for dynamic domain objects.
 */
const EXTENSION_REGISTRY: Record<string, IconRegistryEntry> = {};

/**
 * Multi-layer lookup: Core Semantic Registry -> Extension Registry.
 * Fails loudly if an un-configured icon is requested.
 */
export function getRegisteredIcon(name: SemanticIconName | string): IconRegistryEntry {
  const coreEntry = CORE_REGISTRY[name as SemanticIconName];
  if (coreEntry) {
    return coreEntry;
  }

  const extensionEntry = EXTENSION_REGISTRY[name];
  if (extensionEntry) {
    return extensionEntry;
  }

  throw new Error(
    `[Lumora Icon Registry]: Icon '${name}' is not registered in the core semantic registry or extension registry.`,
  );
}

/**
 * Extension hook to register domain-specific icons at runtime.
 */
export function registerDomainIcon(name: string, entry: IconRegistryEntry): void {
  EXTENSION_REGISTRY[name] = entry;
}
