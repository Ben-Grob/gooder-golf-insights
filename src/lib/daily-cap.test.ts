import { afterEach, describe, expect, it } from "vitest";
import { __resetDailyCapForTests, consumeDailyCap } from "./daily-cap";

describe("daily cap", () => {
  afterEach(() => {
    delete process.env.DAILY_CAP_ENABLED;
    delete process.env.DAILY_CAP_REQUEST_LIMIT;
    __resetDailyCapForTests();
  });

  it("does not block when cap logic is disabled", () => {
    process.env.DAILY_CAP_ENABLED = "false";
    process.env.DAILY_CAP_REQUEST_LIMIT = "1";

    const first = consumeDailyCap("plan_requests", 1);
    const second = consumeDailyCap("plan_requests", 1);

    expect(first.blocked).toBe(false);
    expect(second.wouldBlock).toBe(true);
    expect(second.blocked).toBe(false);
  });

  it("blocks when cap is enabled and limit exceeded", () => {
    process.env.DAILY_CAP_ENABLED = "true";
    process.env.DAILY_CAP_REQUEST_LIMIT = "1";

    const first = consumeDailyCap("plan_requests", 1);
    const second = consumeDailyCap("plan_requests", 1);

    expect(first.blocked).toBe(false);
    expect(second.wouldBlock).toBe(true);
    expect(second.blocked).toBe(true);
  });
});