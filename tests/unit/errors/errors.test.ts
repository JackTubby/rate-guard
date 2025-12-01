import { RateGuardError } from "../../../src/errors/errors";

function errorFunc(name?: any, details?: any) {
  throw new RateGuardError(name, details);
}

describe("custom error functionality", () => {
  test("should throw RGEC-0005 error when none is set", () => {
    try {
      errorFunc();
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0005");
      expect((error as RateGuardError).name).toBe("Unknown error occurred");
      expect((error as RateGuardError).message).toBe(
        "An unknown error occurred: "
      );
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });

  test("should throw RGEC-0001 error", () => {
    try {
      errorFunc("RGEC-0001", "test");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0001");
      expect((error as RateGuardError).name).toBe("Missing option");
      expect((error as RateGuardError).message).toBe(
        "Missing critical options: test"
      );
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });

  test("should throw RGEC-0002 error", () => {
    try {
      errorFunc("RGEC-0002", "test");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0002");
      expect((error as RateGuardError).name).toBe("Invalid store type");
      expect((error as RateGuardError).message).toBe(
        "Invalid store type: test. Must be one of: memory, redis"
      );
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });

  test("should throw RGEC-0003 error", () => {
    try {
      errorFunc("RGEC-0003", "test");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0003");
      expect((error as RateGuardError).name).toBe("Failed to connect to Redis");
      expect((error as RateGuardError).message).toBe(
        "Failed to connect to Redis: test"
      );
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });

  test("should throw RGEC-0004 error", () => {
    try {
      errorFunc("RGEC-0004", "test");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0004");
      expect((error as RateGuardError).name).toBe("Rate limit exceeded");
      expect((error as RateGuardError).message).toBe(
        "Rate limit exceeded for key: test"
      );
      expect((error as RateGuardError).position).toBe("External");
    }
  });

  test("should throw RGEC-0005 error", () => {
    try {
      errorFunc("RGEC-0005", "test");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0005");
      expect((error as RateGuardError).name).toBe("Unknown error occurred");
      expect((error as RateGuardError).message).toBe(
        "An unknown error occurred: test"
      );
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });

  test("should throw RGEC-0006 error", () => {
    try {
      errorFunc("RGEC-0006", "test");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0006");
      expect((error as RateGuardError).name).toBe("Missing key");
      expect((error as RateGuardError).message).toBe(
        "Missing required key: test"
      );
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });

  test("should throw RGEC-0007 error", () => {
    try {
      errorFunc("RGEC-0007", "test");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-0007");
      expect((error as RateGuardError).name).toBe("Invalid algorithm");
      expect((error as RateGuardError).message).toBe(
        "Invalid algorithm type: test."
      );
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });

  test("should throw RGEC-TEST error", () => {
    try {
      errorFunc("RGEC-TEST");
    } catch (error) {
      expect(error).toBeInstanceOf(RateGuardError);
      expect((error as RateGuardError).code).toBe("RGEC-TEST");
      expect((error as RateGuardError).name).toBe("Test error");
      expect((error as RateGuardError).message).toBe("Test Error");
      expect((error as RateGuardError).position).toBe("Internal");
    }
  });
});
