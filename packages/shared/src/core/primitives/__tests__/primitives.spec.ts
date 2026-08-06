import { describe, it, expect } from "vitest";
import { Result, ResultAccessException } from "../result.js";
import { ValueObject } from "../value-object.js";
import { UniqueEntityId } from "../unique-entity-id.js";
import { IdGenerator } from "../id-generator.js";
import { DomainValidationException } from "../../errors/domain-exceptions.js";
import { ErrorCode } from "../../errors/error-code.js";

class SampleValueObject extends ValueObject<{ name: string; age: number }> {}
class AnotherValueObject extends ValueObject<{ name: string; age: number }> {}

describe("Core Domain Primitives", () => {
  describe("Result Monad", () => {
    it("should create a successful Result instance", () => {
      const result = Result.ok<string>("Success Payload");

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe("Success Payload");
    });

    it("should throw ResultAccessException with SYSTEM_ERROR code when calling getError on ok Result", () => {
      const result = Result.ok<string>("Success Payload");

      try {
        result.getError();
        expect.fail("Expected ResultAccessException to be thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ResultAccessException);
        expect((err as ResultAccessException).code).toBe(
          ErrorCode.SYSTEM_ERROR,
        );
      }
    });

    it("should create a failure Result instance", () => {
      const error = new Error("Failure Reason");
      const result = Result.fail<string, Error>(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it("should throw ResultAccessException with SYSTEM_ERROR code when calling getValue on fail Result", () => {
      const result = Result.fail<string, string>("Error Message");

      try {
        result.getValue();
        expect.fail("Expected ResultAccessException to be thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ResultAccessException);
        expect((err as ResultAccessException).code).toBe(
          ErrorCode.SYSTEM_ERROR,
        );
      }
    });
  });

  describe("ValueObject Base Class", () => {
    it("should enforce structural equality for matching properties of same class", () => {
      const vo1 = new SampleValueObject({ name: "Alice", age: 30 });
      const vo2 = new SampleValueObject({ name: "Alice", age: 30 });

      expect(vo1.equals(vo2)).toBe(true);
    });

    it("should return false when comparing instances of different ValueObject classes even with identical props", () => {
      const vo1 = new SampleValueObject({ name: "Alice", age: 30 });
      const vo2 = new AnotherValueObject({ name: "Alice", age: 30 });

      expect(vo1.equals(vo2 as any)).toBe(false);
    });

    it("should return false when comparing non-matching properties", () => {
      const vo1 = new SampleValueObject({ name: "Alice", age: 30 });
      const vo2 = new SampleValueObject({ name: "Alice", age: 31 });

      expect(vo1.equals(vo2)).toBe(false);
    });

    it("should enforce shallow immutability via Object.freeze", () => {
      const vo = new SampleValueObject({ name: "Bob", age: 25 });

      expect(Object.isFrozen(vo.props)).toBe(true);
      expect(() => {
        // @ts-expect-error mutating frozen prop
        vo.props.age = 26;
      }).toThrow();
    });
  });

  describe("IdGenerator & UniqueEntityId", () => {
    it("should generate valid RFC 4122 v4 UUID using IdGenerator", () => {
      const generatedId = IdGenerator.generate();
      expect(IdGenerator.isValid(generatedId)).toBe(true);
    });

    it("should generate a valid RFC 4122 v4 UUID when no argument is provided", () => {
      const id = new UniqueEntityId();

      expect(UniqueEntityId.isValid(id.toValue())).toBe(true);
      expect(id.toString()).toBe(id.toValue());
    });

    it("should accept a valid custom UUID v4 string", () => {
      const validUuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
      const id = new UniqueEntityId(validUuid);

      expect(id.toValue()).toBe(validUuid);
    });

    it("should throw DomainValidationException when provided an invalid UUID string", () => {
      expect(() => new UniqueEntityId("invalid-uuid-string")).toThrow(
        DomainValidationException,
      );
    });

    it("should evaluate equality correctly against another UniqueEntityId", () => {
      const validUuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
      const id1 = new UniqueEntityId(validUuid);
      const id2 = new UniqueEntityId(validUuid);
      const id3 = new UniqueEntityId();

      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });
});
