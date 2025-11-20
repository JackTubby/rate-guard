

type ErrorInfo = {
  code: "RGEC-0001";
  name: "Missing option";
  position: "Internal" | "External"
} | {
  code: "RGEC-0002";
  name: "Invalid store type";
  position: "Internal" | "External"
} | {
  code: "RGEC-0003";
  name: "Failed to connect to Redis";
  position: "Internal" | "External"
} | {
  code: "RGEC-0004";
  name: "Rate limit exceeded";
  position: "Internal" | "External"
} | {
  code: "RGEC-0005";
  name: "Unknown error occurred";
  position: "Internal" | "External"
};

type ErrorCodes = ErrorInfo["code"];
type ErrorNames = ErrorInfo["name"];

export class RateGuardError extends Error {
  code: ErrorCodes;
  name: ErrorNames;
  message: string;
  cause: any;

  constructor(
    code: ErrorCodes = "RGEC-0005",
    name: ErrorNames = "Unknown error occurred",
    message: string = "...",
    cause?: any
  ) {
    super(name);
    this.code = code;
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}

