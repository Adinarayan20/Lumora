import { ObjectTypeKey } from './object-type-key.js';
import { BehaviorExtensionKey } from './behavior-extension-key.js';
import type { ObjectTypeMetadata } from './object-type-metadata.interface.js';

/**
 * Built-in static catalog metadata definitions.
 */
export const BUILT_IN_CATALOG_DEFINITIONS: readonly ObjectTypeMetadata[] = Object.freeze([
  Object.freeze({
    typeKey: ObjectTypeKey.NOTE,
    displayName: 'Note',
    description: 'Free-form textual thought, document fragment, or knowledge entry.',
    icon: 'file-text',
    supportedExtensions: Object.freeze([BehaviorExtensionKey.MEDIA]),
  }),
  Object.freeze({
    typeKey: ObjectTypeKey.TASK,
    displayName: 'Task',
    description: 'Actionable item with optional status tracking and due dates.',
    icon: 'check-square',
    supportedExtensions: Object.freeze([
      BehaviorExtensionKey.REMINDER,
      BehaviorExtensionKey.TIMELINE,
      BehaviorExtensionKey.MEDIA,
    ]),
  }),
  Object.freeze({
    typeKey: ObjectTypeKey.REMINDER,
    displayName: 'Reminder',
    description: 'Time or trigger-bound notification item attached to an object or schedule.',
    icon: 'bell',
    supportedExtensions: Object.freeze([BehaviorExtensionKey.REMINDER]),
  }),
  Object.freeze({
    typeKey: ObjectTypeKey.EVENT,
    displayName: 'Event',
    description: 'Time-bound calendar entry with start and end temporal bounds.',
    icon: 'calendar',
    supportedExtensions: Object.freeze([
      BehaviorExtensionKey.REMINDER,
      BehaviorExtensionKey.TIMELINE,
      BehaviorExtensionKey.MEDIA,
    ]),
  }),
  Object.freeze({
    typeKey: ObjectTypeKey.DOCUMENT,
    displayName: 'Document',
    description: 'Structured long-form document with attachments.',
    icon: 'book-open',
    supportedExtensions: Object.freeze([BehaviorExtensionKey.MEDIA]),
  }),
  Object.freeze({
    typeKey: ObjectTypeKey.HABIT,
    displayName: 'Habit',
    description: 'Recurring behavioral tracking item with scheduled occurrences.',
    icon: 'repeat',
    supportedExtensions: Object.freeze([
      BehaviorExtensionKey.REMINDER,
      BehaviorExtensionKey.TIMELINE,
    ]),
  }),
]);
