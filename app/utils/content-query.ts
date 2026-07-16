const contentDatabaseRetryDelays = [50, 100, 200, 300, 400, 500];

const getErrorMessage = (error: unknown) => {
  const messages: string[] = [];
  let current = error;

  for (let depth = 0; current && depth < 3; depth += 1) {
    if (typeof current === "string") {
      messages.push(current);
      break;
    }

    if (typeof current !== "object") break;

    const record = current as Record<string, unknown>;
    for (const key of ["message", "statusMessage"]) {
      if (typeof record[key] === "string") messages.push(record[key]);
    }

    if (record.data && typeof record.data === "object") {
      const data = record.data as Record<string, unknown>;
      for (const key of ["message", "statusMessage"]) {
        if (typeof data[key] === "string") messages.push(data[key]);
      }
    }

    current = record.cause;
  }

  return messages.join(" ");
};

const isContentDatabaseRebuilding = (error: unknown) =>
  /no such table:\s*_content_[a-z0-9_]+/i.test(getErrorMessage(error));

export const withContentQueryRetry = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const delay = contentDatabaseRetryDelays[attempt];
      if (!isContentDatabaseRebuilding(error) || delay === undefined) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
