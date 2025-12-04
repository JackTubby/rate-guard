const ERROR_MAP = {
  "RGEC-0001": {
    name: "Missing option" as const,
    position: "Internal" as const,
    message: "Missing critical options: {details}",
  },
  "RGEC-0002": {
    name: "Invalid store type" as const,
    position: "Internal" as const,
    message: "Invalid store type: {details}. Must be one of: memory, redis",
  },
  "RGEC-0003": {
    name: "Failed to connect to Redis" as const,
    position: "Internal" as const,
    message: "Failed to connect to Redis: {details}",
  },
  "RGEC-0004": {
    name: "Rate limit exceeded" as const,
    position: "External" as const,
    message: "Rate limit exceeded for key: {details}",
  },
  "RGEC-0005": {
    name: "Unknown error occurred" as const,
    position: "Internal" as const,
    message: "An unknown error occurred: {details}",
  },
  "RGEC-0006": {
    name: "Missing key" as const,
    position: "Internal" as const,
    message: "Missing required key: {details}",
  },
  "RGEC-0007": {
    name: "Invalid algorithm" as const,
    position: "Internal" as const,
    message: "Invalid algorithm type: {details}.",
  },
  "RGEC-0008": {
    name: "Invalid store" as const,
    position: "Internal" as const,
    message: "Unknown store type: {details}.",
  },
  "RGEC-TEST": {
    name: "Test error" as const,
    position: "Internal" as const,
    message: "Test Error",
  },
} as const;

type ErrorCodes = keyof typeof ERROR_MAP;
type ErrorNames = (typeof ERROR_MAP)[ErrorCodes]["name"];

export class RateGuardError extends Error {
  code: ErrorCodes;
  name: ErrorNames;
  position: "Internal" | "External";
  message: string;
  cause: any;

  constructor(
    code: ErrorCodes = "RGEC-0005",
    details: string = "",
    cause?: any
  ) {
    const errorInfo = ERROR_MAP[code];
    const message = errorInfo.message.replace("{details}", details);

    super(errorInfo.name);
    this.code = code;
    this.name = errorInfo.name;
    this.position = errorInfo.position;
    this.message = message;
    this.cause = cause;
  }
}
