import { describe, expect, it } from "vitest"
import { formatRelativeTime } from "@/lib/relative-time"

describe("formatRelativeTime", () => {
  const now = new Date("2026-05-24T08:00:00Z").getTime()

  it("formats relative labels from raw timestamps at render time", () => {
    expect(formatRelativeTime("2026-05-24T07:59:30Z", now)).toBe("1M AGO")
    expect(formatRelativeTime("2026-05-24T06:00:00Z", now)).toBe("2H AGO")
    expect(formatRelativeTime("2026-05-21T08:00:00Z", now)).toBe("3D AGO")
    expect(formatRelativeTime("2026-03-24T08:00:00Z", now)).toBe("2MO AGO")
    expect(formatRelativeTime("2025-05-24T08:00:00Z", now)).toBe("1Y AGO")
  })

  it("handles invalid timestamps without throwing", () => {
    expect(formatRelativeTime("not-a-date", now)).toBe("UNKNOWN")
  })
})
