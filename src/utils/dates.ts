import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

/**
 * Returns a human-readable string that represents the time elapsed since the provided timestamp.
 *
 * @param time - A ISO 8601 timestamp.
 * @returns A string that represents the time elapsed since the provided timestamp, e.g. "2 years ago".
 */
export const humanizeTimeElapsed = (
  time: string | null | undefined
): string => {
  if (!time) {
    return "Invalid date";
  }

  if (!dayjs(time).isValid()) {
    throw Error("Invalid date");
  }

  dayjs.extend(relativeTime);

  return dayjs().to(time);
};
