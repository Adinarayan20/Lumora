import { PublisherTrustLevel } from "./publisher-trust-level.js";
import { TemplateCategory } from "./template-category.js";
import type { TemplatePackage } from "./template-content.js";
import { SeedObjectType } from "./template-content.js";
import { FieldType } from "../catalog/field-type.js";
import { SystemTrait } from "../catalog/system-trait.js";

export const STARTER_LIBRARY_CATALOG: readonly TemplatePackage[] =
  Object.freeze([
    {
      manifest: {
        id: "tpl-daily-journal-v1",
        packageUuid: "b8e9a6c4-1111-4000-8000-000000000001",
        publisherUuid: "00000000-0000-4000-8000-000000000000",
        packageHash: "sha256-starter-daily-journal-v1-hash",
        key: "daily_journal",
        name: "Daily Reflective Journal",
        description:
          "Capture daily reflections, gratefulness notes, mood tracking, and audio memos.",
        category: TemplateCategory.LIFE_OS,
        version: "1.0.0",
        minPlatformVersion: "1.0.0",
        author: {
          name: "Lumora Core Team",
          publisherId: "lumora-official",
          publisherUuid: "00000000-0000-4000-8000-000000000000",
          trustLevel: PublisherTrustLevel.OFFICIAL,
        },
        license: "MIT",
        dependencies: [],
        capabilities: [
          { key: "timeline", versionConstraint: ">=1.0.0" },
          { key: "reminders", versionConstraint: ">=1.0.0" },
        ],
        permissions: {
          requiredPermissions: ["timeline.write", "reminders.write"],
        },
        icon: "journal-book",
        color: "#6366f1",
        tags: ["journal", "reflection", "mood", "mindfulness"],
      },
      content: {
        objectDefinitions: [
          {
            typeKey: "journal_entry",
            name: "Journal Entry",
            pluralName: "Journal Entries",
            description: "A reflective entry recorded for a specific day.",
            icon: "book-open",
            color: "#6366f1",
            allowedCapabilities: ["timeline", "reminders"],
            traits: [SystemTrait.SEARCHABLE, SystemTrait.ARCHIVABLE],
            schemaVersion: 1,
          },
        ],
        schemaDefinitions: [
          {
            typeKey: "journal_entry",
            schemaVersion: 1,
            fields: [
              {
                key: "entryDate",
                label: "Entry Date",
                type: FieldType.DATE,
              },
              {
                key: "moodRating",
                label: "Mood Rating (1-5)",
                type: FieldType.NUMBER,
              },
              {
                key: "gratefulFor",
                label: "Grateful For",
                type: FieldType.STRING,
              },
              {
                key: "content",
                label: "Reflection",
                type: FieldType.STRING,
              },
            ],
          },
        ],
        seedObjects: [
          {
            type: SeedObjectType.SAMPLE,
            objectTypeKey: "journal_entry",
            title: "Welcome to Lumora Journal",
            description: "My first reflection in Lumora Personal Life OS.",
            attributes: {
              entryDate: new Date().toISOString(),
              moodRating: 5,
              gratefulFor: "Starting a clear, organized life operating system.",
              content:
                "# First Entry\n\nToday marks the beginning of tracking my reflections cleanly.",
            },
          },
        ],
      },
    },
    {
      manifest: {
        id: "tpl-project-goal-os-v1",
        packageUuid: "b8e9a6c4-2222-4000-8000-000000000002",
        publisherUuid: "00000000-0000-4000-8000-000000000000",
        packageHash: "sha256-starter-project-goal-os-v1-hash",
        key: "project_goal_os",
        name: "Project & Goal OS",
        description:
          "Manage high-level objectives, project milestones, and action items.",
        category: TemplateCategory.PRODUCTIVITY,
        version: "1.0.0",
        minPlatformVersion: "1.0.0",
        author: {
          name: "Lumora Core Team",
          publisherId: "lumora-official",
          trustLevel: PublisherTrustLevel.OFFICIAL,
        },
        license: "MIT",
        dependencies: [],
        capabilities: [
          { key: "timeline", versionConstraint: ">=1.0.0" },
          { key: "relationships", versionConstraint: ">=1.0.0" },
          { key: "reminders", versionConstraint: ">=1.0.0" },
        ],
        permissions: {
          requiredPermissions: ["timeline.write", "relationships.write"],
        },
        icon: "target-flag",
        color: "#10b981",
        tags: ["projects", "goals", "okr", "tasks"],
      },
      content: {
        objectDefinitions: [
          {
            typeKey: "project_goal",
            name: "Goal / Project",
            pluralName: "Goals & Projects",
            description: "High-level objective or structured project.",
            icon: "flag",
            color: "#10b981",
            allowedCapabilities: ["timeline", "relationships", "reminders"],
            traits: [SystemTrait.SEARCHABLE, SystemTrait.ARCHIVABLE],
            schemaVersion: 1,
          },
        ],
        schemaDefinitions: [
          {
            typeKey: "project_goal",
            schemaVersion: 1,
            fields: [
              {
                key: "targetDate",
                label: "Target Date",
                type: FieldType.DATE,
              },
              {
                key: "status",
                label: "Status",
                type: FieldType.ENUM,
              },
              {
                key: "progressPercent",
                label: "Progress (%)",
                type: FieldType.NUMBER,
              },
            ],
          },
        ],
      },
    },
    {
      manifest: {
        id: "tpl-habit-tracker-v1",
        packageUuid: "b8e9a6c4-3333-4000-8000-000000000003",
        publisherUuid: "00000000-0000-4000-8000-000000000003",
        packageHash: "sha256-starter-habit-tracker-v1-hash",
        key: "habit_tracker",
        name: "Habit Tracker",
        description: "Build positive routines and track daily streaks.",
        category: TemplateCategory.HABITS,
        version: "1.0.0",
        minPlatformVersion: "1.0.0",
        author: {
          name: "Lumora Core Team",
          publisherId: "lumora-official",
          trustLevel: PublisherTrustLevel.OFFICIAL,
        },
        license: "MIT",
        dependencies: [],
        capabilities: [
          { key: "reminders", versionConstraint: ">=1.0.0" },
          { key: "timeline", versionConstraint: ">=1.0.0" },
        ],
        permissions: {
          requiredPermissions: ["reminders.write"],
        },
        icon: "repeat",
        color: "#f59e0b",
        tags: ["habits", "routines", "streaks", "tracking"],
      },
      content: {
        objectDefinitions: [
          {
            typeKey: "habit",
            name: "Habit",
            pluralName: "Habits",
            description: "A daily or weekly habit trackable object.",
            icon: "check-circle",
            color: "#f59e0b",
            allowedCapabilities: ["reminders", "timeline"],
            traits: [SystemTrait.SEARCHABLE, SystemTrait.ARCHIVABLE],
            schemaVersion: 1,
          },
        ],
        schemaDefinitions: [
          {
            typeKey: "habit",
            schemaVersion: 1,
            fields: [
              {
                key: "frequency",
                label: "Frequency",
                type: FieldType.ENUM,
              },
              {
                key: "streakCount",
                label: "Current Streak",
                type: FieldType.NUMBER,
              },
            ],
          },
        ],
      },
    },
    {
      manifest: {
        id: "tpl-knowledge-base-v1",
        packageUuid: "b8e9a6c4-4444-4000-8000-000000000004",
        publisherUuid: "00000000-0000-4000-8000-000000000000",
        packageHash: "sha256-starter-knowledge-base-v1-hash",
        key: "knowledge_base",
        name: "Knowledge Base & Book Notes",
        description:
          "Store reading notes, book summaries, and interconnected knowledge concepts.",
        category: TemplateCategory.KNOWLEDGE,
        version: "1.0.0",
        minPlatformVersion: "1.0.0",
        author: {
          name: "Lumora Core Team",
          publisherId: "lumora-official",
          trustLevel: PublisherTrustLevel.OFFICIAL,
        },
        license: "MIT",
        dependencies: [],
        capabilities: [
          { key: "relationships", versionConstraint: ">=1.0.0" },
          { key: "timeline", versionConstraint: ">=1.0.0" },
        ],
        permissions: {
          requiredPermissions: ["relationships.write"],
        },
        icon: "library",
        color: "#8b5cf6",
        tags: ["books", "notes", "knowledge", "zettelkasten"],
      },
      content: {
        objectDefinitions: [
          {
            typeKey: "book_note",
            name: "Book Note",
            pluralName: "Book Notes",
            description: "A summary note for a book, article, or paper.",
            icon: "book",
            color: "#8b5cf6",
            allowedCapabilities: ["relationships", "timeline"],
            traits: [SystemTrait.SEARCHABLE, SystemTrait.ARCHIVABLE],
            schemaVersion: 1,
          },
        ],
        schemaDefinitions: [
          {
            typeKey: "book_note",
            schemaVersion: 1,
            fields: [
              {
                key: "authorName",
                label: "Author",
                type: FieldType.STRING,
              },
              {
                key: "rating",
                label: "Rating (1-5)",
                type: FieldType.NUMBER,
              },
              {
                key: "summary",
                label: "Key Takeaways",
                type: FieldType.STRING,
              },
            ],
          },
        ],
      },
    },
    {
      manifest: {
        id: "tpl-financial-ledger-v1",
        packageUuid: "b8e9a6c4-5555-4000-8000-000000000005",
        publisherUuid: "00000000-0000-4000-8000-000000000000",
        packageHash: "sha256-starter-financial-ledger-v1-hash",
        key: "financial_ledger",
        name: "Financial Ledger & Subscriptions",
        description:
          "Track income, recurring expenses, and subscription renewal dates.",
        category: TemplateCategory.FINANCE,
        version: "1.0.0",
        minPlatformVersion: "1.0.0",
        author: {
          name: "Lumora Core Team",
          publisherId: "lumora-official",
          trustLevel: PublisherTrustLevel.OFFICIAL,
        },
        license: "MIT",
        dependencies: [],
        capabilities: [
          { key: "timeline", versionConstraint: ">=1.0.0" },
          { key: "reminders", versionConstraint: ">=1.0.0" },
        ],
        permissions: {
          requiredPermissions: ["timeline.write", "reminders.write"],
        },
        icon: "credit-card",
        color: "#ec4899",
        tags: ["finance", "expenses", "budget", "subscriptions"],
      },
      content: {
        objectDefinitions: [
          {
            typeKey: "financial_transaction",
            name: "Transaction",
            pluralName: "Transactions",
            description: "A financial income or expense entry.",
            icon: "dollar-sign",
            color: "#ec4899",
            allowedCapabilities: ["timeline", "reminders"],
            traits: [SystemTrait.SEARCHABLE, SystemTrait.ARCHIVABLE],
            schemaVersion: 1,
          },
        ],
        schemaDefinitions: [
          {
            typeKey: "financial_transaction",
            schemaVersion: 1,
            fields: [
              {
                key: "amount",
                label: "Amount",
                type: FieldType.NUMBER,
              },
              {
                key: "category",
                label: "Category",
                type: FieldType.ENUM,
              },
              {
                key: "transactionDate",
                label: "Date",
                type: FieldType.DATE,
              },
            ],
          },
        ],
      },
    },
  ]);
