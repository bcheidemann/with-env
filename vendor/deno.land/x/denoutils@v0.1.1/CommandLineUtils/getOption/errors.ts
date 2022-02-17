export class InvalidOptionTypeError extends Error {
  constructor(type: string) {
    super(`Invalid option type: ${type}`);
    this.name = "InvalidOptionTypeError";
  }
}
