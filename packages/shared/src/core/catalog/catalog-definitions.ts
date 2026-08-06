import { ObjectTypeKey } from "./object-type-key.js";
import { BehaviorExtensionKey } from "./behavior-extension-key.js";
import type { ObjectTypeMetadata } from "./object-type-metadata.interface.js";

/**
 * Built-in static catalog metadata definitions storing product-agnostic i18n and icon keys.
 */
export const BUILT_IN_CATALOG_DEFINITIONS: readonly ObjectTypeMetadata[] =
  Object.freeze([
    Object.freeze({
      typeKey: ObjectTypeKey.NOTE,
      displayNameKey: "object.type.note.name",
      descriptionKey: "object.type.note.description",
      iconKey: "note",
      supportedExtensions: Object.freeze([BehaviorExtensionKey.MEDIA]),
    }),
    Object.freeze({
      typeKey: ObjectTypeKey.TASK,
      displayNameKey: "object.type.task.name",
      descriptionKey: "object.type.task.description",
      iconKey: "task",
      supportedExtensions: Object.freeze([
        BehaviorExtensionKey.REMINDER,
        BehaviorExtensionKey.TIMELINE,
        BehaviorExtensionKey.MEDIA,
      ]),
    }),
    Object.freeze({
      typeKey: ObjectTypeKey.REMINDER,
      displayNameKey: "object.type.reminder.name",
      descriptionKey: "object.type.reminder.description",
      iconKey: "reminder",
      supportedExtensions: Object.freeze([BehaviorExtensionKey.REMINDER]),
    }),
    Object.freeze({
      typeKey: ObjectTypeKey.EVENT,
      displayNameKey: "object.type.event.name",
      descriptionKey: "object.type.event.description",
      iconKey: "event",
      supportedExtensions: Object.freeze([
        BehaviorExtensionKey.REMINDER,
        BehaviorExtensionKey.TIMELINE,
        BehaviorExtensionKey.MEDIA,
      ]),
    }),
    Object.freeze({
      typeKey: ObjectTypeKey.DOCUMENT,
      displayNameKey: "object.type.document.name",
      descriptionKey: "object.type.document.description",
      iconKey: "document",
      supportedExtensions: Object.freeze([BehaviorExtensionKey.MEDIA]),
    }),
    Object.freeze({
      typeKey: ObjectTypeKey.HABIT,
      displayNameKey: "object.type.habit.name",
      descriptionKey: "object.type.habit.description",
      iconKey: "habit",
      supportedExtensions: Object.freeze([
        BehaviorExtensionKey.REMINDER,
        BehaviorExtensionKey.TIMELINE,
      ]),
    }),
  ]);
