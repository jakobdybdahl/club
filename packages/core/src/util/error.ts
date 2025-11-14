export class VisibleError extends Error {
  constructor(
    public code: string,
    message: string,
    public detail?: unknown
  ) {
    super(message);
  }
}

export class ForbiddenError extends VisibleError {
  public constructor(message?: string) {
    super("forbidden", message ?? "Action not allowed");
  }
}

export class VersionMismatchError extends VisibleError {
  constructor(ctx: { requested: number; current: number }) {
    super(
      "version_mismatch",
      `The requested version '${ctx.requested}' does not match the current version '${ctx.current}'`
    );
  }
}
