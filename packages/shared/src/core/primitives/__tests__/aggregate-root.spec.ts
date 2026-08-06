import { describe, it, expect } from "vitest";
import { AggregateRoot } from "../aggregate-root.js";
import { UniqueEntityId } from "../unique-entity-id.js";
import { InstantString } from "../../events/instant-string.js";
import type { DomainEvent } from "../../events/domain-event.interface.js";
import type { DomainEventName } from "../../events/event-names.js";

class TestEvent implements DomainEvent<DomainEventName> {
  public readonly eventId = new UniqueEntityId();
  public readonly eventName: DomainEventName = "object.created";
  public readonly aggregateId: UniqueEntityId;
  public readonly occurredAt = new Date().toISOString() as InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: Record<string, unknown>;

  constructor(aggregateId: UniqueEntityId) {
    this.aggregateId = aggregateId;
    this.payload = { test: true };
  }
}

class TestAggregate extends AggregateRoot {
  public static create(id?: UniqueEntityId): TestAggregate {
    const aggregate = new TestAggregate(id);
    aggregate.addDomainEvent(new TestEvent(aggregate.id));
    return aggregate;
  }
}

describe("AggregateRoot Primitive", () => {
  it("should initialize with unique entity identifier", () => {
    const aggregate = TestAggregate.create();
    expect(aggregate.id).toBeDefined();
    expect(UniqueEntityId.isValid(aggregate.id.toValue())).toBe(true);
  });

  it("should track uncommitted events status accurately", () => {
    const aggregate = TestAggregate.create();
    expect(aggregate.hasUncommittedEvents()).toBe(true);

    aggregate.clearEvents();
    expect(aggregate.hasUncommittedEvents()).toBe(false);
  });

  it("should record and pull domain events cleanly", () => {
    const aggregate = TestAggregate.create();
    expect(aggregate.domainEvents).toHaveLength(1);

    const pulledEvents = aggregate.pullDomainEvents();
    expect(pulledEvents).toHaveLength(1);
    expect(pulledEvents[0].eventName).toBe("object.created");

    // Pulling clears events and updates uncommitted state
    expect(aggregate.domainEvents).toHaveLength(0);
    expect(aggregate.hasUncommittedEvents()).toBe(false);
  });

  it("should clear events when requested", () => {
    const aggregate = TestAggregate.create();
    expect(aggregate.domainEvents).toHaveLength(1);

    aggregate.clearEvents();
    expect(aggregate.domainEvents).toHaveLength(0);
    expect(aggregate.hasUncommittedEvents()).toBe(false);
  });

  it("should evaluate structural identity equality correctly", () => {
    const id = new UniqueEntityId();
    const agg1 = TestAggregate.create(id);
    const agg2 = TestAggregate.create(id);
    const agg3 = TestAggregate.create();

    expect(agg1.equals(agg2)).toBe(true);
    expect(agg1.equals(agg3)).toBe(false);
    expect(agg1.equals(undefined)).toBe(false);
  });
});
