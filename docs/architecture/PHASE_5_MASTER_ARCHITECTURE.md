# Lumora Phase 5 Master Architecture Blueprint: Universal Life Operating System Platform

> **Core Mandate**: *"Lumora is a platform, not a collection of features. Every architectural decision must increase the platform's ability to support future object types without requiring rewrites."*

---

## 1. Executive Architectural Blueprint

Phase 5 transforms Lumora from a foundational set of domain services into a fully metadata-driven **Universal Life Operating System Platform**.

In Lumora, **Everything is an Object** (Note, Task, Event, Reminder, Habit, Document, Goal, Recipe, Transaction, Book, Contact, Project, Asset, etc.). Rather than writing custom business logic, database tables, or UI components for every new object type, the platform introduces a triadic registry architecture:

1. **Metadata Registry**: Controls field schemas, data types, validation rules, display formatters, and custom attribute definitions.
2. **Object Definition Registry**: Defines object types (e.g. `note`, `task`, `reminder`, `habit`, `journal_entry`), layout templates, allowed capabilities, icon/color themes, and system traits.
3. **Capability Registry**: Registers universal capabilities (`TimelineCapability`, `ReminderCapability`, `RelationshipCapability`, `MediaAttachmentCapability`, `SearchCapability`, `OrganizationCapability`, `NotificationCapability`).

```mermaid
graph TD
    subgraph "Metadata & Registry Layer"
        MR[Metadata Registry]
        ODR[Object Definition Registry]
        CR[Capability Registry]
    end

    subgraph "Universal Engine Layer"
        UCE[Universal Capability Engine]
        TE[Template Engine & Starter Library]
        RE[Universal Relationship Engine]
        UT[Universal Timeline Engine]
        US[Global Search Engine]
        SC[Smart Collections Engine]
    end

    subgraph "Dynamic Presentation Layer"
        DFR[Dynamic Form Renderer]
        DDR[Dynamic Object Detail Renderer]
        ME[Device-Aware Motion Engine]
    end

    ODR --> UCE
    MR --> ODR
    CR --> UCE
    UCE --> TE
    UCE --> RE
    UCE --> UT
    UCE --> US
    TE --> DFR
    TE --> DDR
    DFR --> ME
    DDR --> ME
```

---

## 2. Platform Component Architecture & Layering

### 2.1 Folder & Package Structure (`@lumora/shared` & `apps/backend`)

```text
packages/shared/src/
├── core/
│   ├── catalog/                # Object Definition Schemas & Metadata Primitives
│   │   ├── metadata-definition.ts
│   │   ├── object-definition.ts
│   │   └── capability-definition.ts
│   ├── capabilities/           # Capability Contracts & Interfaces
│   │   ├── base-capability.ts
│   │   ├── timeline-capability.ts
│   │   ├── reminder-capability.ts
│   │   └── relationship-capability.ts
│   └── templates/              # Template Schema Definitions & Starter Declarations
│       ├── template-definition.ts
│       └── starter-library.catalog.ts

apps/backend/src/
├── domain/
│   ├── catalog/                # Pure Domain Registries & Aggregates
│   │   ├── metadata-registry.aggregate.ts
│   │   ├── object-definition-registry.aggregate.ts
│   │   └── capability-registry.aggregate.ts
│   ├── templates/              # Domain Template Engine Aggregates
│   │   └── template.aggregate.ts
│   └── relationships/          # Domain Relationship Engine
│       └── object-relationship.aggregate.ts
├── application/
│   ├── catalog/                # Application Use Cases & Queries
│   ├── templates/              # Template Installation Use Cases
│   └── relationships/          # Relationship Management Use Cases
└── infrastructure/
    └── catalog/                # Persistence & Metadata Caching
        ├── prisma-metadata.repository.ts
        └── redis-metadata.cache.ts
```

---

## 3. Core Component Architectures

### 3.1 Metadata & Object Definition Registry Architecture
- **Data Flow**:
  1. System initializes with default catalog schemas stored in `@lumora/shared`.
  2. Workspace-specific metadata attributes and custom object definitions are loaded from `MetadataRegistry` and cached in Redis with a 24-hour TTL (`lumora:meta:workspace:<id>`).
  3. Every `CreateObjectCommand` or `UpdateObjectCommand` validates incoming JSON `attributes` against the schema defined in `MetadataRegistry`.
  4. Adding a new object type (e.g. `HabitTracker` or `BookReview`) requires **zero code changes**—only registering an `ObjectDefinition` JSON.

### 3.2 Universal Capability Engine Architecture
Every domain object inherits universal capabilities automatically. Capabilities are decoupled micro-behaviors that attach to object definitions:
- **TimelineCapability**: Automatically records `ObjectCreated`, `ObjectUpdated`, `ObjectArchived` to the global audit stream.
- **ReminderCapability**: Manages time-based or location-based triggers.
- **RelationshipCapability**: Enables bi-directional linking (e.g. `Task` *blocks* `Task`, `Note` *references* `Book`, `Project` *contains* `Task`).
- **MediaAttachmentCapability**: Links file assets seamlessly.

### 3.3 Template Engine & Starter Library Architecture
- **Template Schema**:
  ```json
  {
    "id": "tpl-daily-journal-v1",
    "name": "Daily Reflective Journal",
    "version": "1.0.0",
    "objectDefinitions": [...],
    "capabilities": ["timeline", "media", "organization"],
    "formLayout": { "sections": [...] },
    "detailLayout": { "blocks": [...] }
  }
  ```
- **Starter Library**: Pre-ships built-in starter templates (Daily Planner, Project Tracker, Habit Log, Knowledge Base).
- **Template Lifecycle**: `Installed` → `Active` → `Updated` → `Exported` → `Archived`.

### 3.4 Dynamic Form & Detail Screen Renderers
- **Metadata-Driven Layouts**: Form screens and detail screens render dynamically based on JSON layout blueprints (`formLayout` and `detailLayout`).
- **Components**: Field controls (Text, RichText, Select, MultiSelect, Date, Toggle, Number, RelationshipPicker, FileUploader) are rendered dynamically without custom screen implementations.

### 3.5 Universal Relationship Engine
- **Graph Primitives**:
  - `sourceObjectId` (UUID)
  - `targetObjectId` (UUID)
  - `relationType` (Enum / String: `DEPENDS_ON`, `PARENTS`, `REFERENCES`, `BLOCKS`, `ATTACHED_TO`)
  - `metadata` (JSON)
- Indexing guarantees $O(1)$ directional graph lookup via `@@index([sourceObjectId, relationType])` and `@@index([targetObjectId, relationType])`.

### 3.6 Universal Search & Global Timeline Architecture
- **Global Timeline**: Consumes domain events (`ObjectCreated`, `ReminderCompleted`, `TimelineRecorded`, etc.) via the Outbox Worker and updates `TimelineRecord` entries asynchronously.
- **Universal Search**: Automatically indexes object title, description, and custom attributes into PostgreSQL full-text search / `SearchIndex` aggregate whenever domain events are published.

---

## 4. Sequence Diagrams & Lifecycle Flows

### 4.1 Universal Object Creation & Capability Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant UI as Dynamic Form UI
    participant Application as CreateObjectUseCase
    participant Registry as Metadata & Definition Registry
    participant Engine as Universal Capability Engine
    participant Repo as ObjectRepository
    participant Outbox as Transactional Outbox

    UI->>Application: execute(CreateObjectCommand)
    Application->>Registry: getObjectDefinition(typeKey)
    Registry-->>Application: ObjectDefinition + Attribute Schema
    Application->>Engine: validateAttributes(attributes, schema)
    Engine-->>Application: Validated Payload
    Application->>Repo: save(ObjectAggregate)
    Application->>Outbox: append(ObjectCreatedEvent)
    Outbox-->>Engine: Domain Event Triggered
    Engine->>Engine: Execute Capabilities (Timeline, SearchIndex, Reminders)
    Application-->>UI: Object Created DTO
```

---

## 5. Performance, Security & Future Extension Points

### 5.1 Performance SLA & Budget
- **Metadata Resolution**: Cached in Redis with multi-tenant workspace keys; $O(1)$ resolution ($< 2\text{ ms}$).
- **Dynamic Render Speed**: React component layout generation memoized with zero layout shifts; target $< 16\text{ ms}$ (60 fps).
- **Graph Traversal**: Max depth 3 for relationship queries; mandatory keyset pagination.

### 5.2 Security & Multi-Tenancy Boundary
- Workspace isolation enforced on all metadata definitions and capability executions (`@@index([workspaceId])`).
- Schema validation enforces strict type boundaries and prevents arbitrary attribute injection.

### 5.3 Future Extension Points
- **Community Template Hub**: Community members can publish/install versioned templates.
- **AI Agent Capabilities**: AI consumers attach as passive subscribers to domain events without polluting core domain models.
