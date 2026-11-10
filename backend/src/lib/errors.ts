export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(
  handler: T,
) => {
  return (...args: Parameters<T>) => {
    return Promise.resolve(handler(...args)).catch((error) => {
      const next = args[args.length - 1] as (error: unknown) => void;
      if (typeof next === "function") {
        next(error);
        return;
      }
      throw error;
    });
  };
};
