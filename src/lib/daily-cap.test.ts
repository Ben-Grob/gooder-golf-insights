import { afterEach, describe, expect, it } from "vitest";
import { __resetDailyCapForTests, consumeDailyCap } from "./daily-cap";

describe("daily cap", () => {
  afterEach(() => {
    __resetDailyCapForTests();
  });

  it("never blocks requests", () => {
    const first = consumeDailyCap("plan_requests", 1);
    const second = consumeDailyCap("plan_requests", 1);

    expect(first.enabled).toBe(false);
    expect(first.requestLimit).toBe(0);
    expect(first.blocked).toBe(false);
    expect(first.wouldBlock).toBe(false);

    expect(second.enabled).toBe(false);
    expect(second.requestLimit).toBe(0);
    expect(second.wouldBlock).toBe(false);
    expect(second.blocked).toBe(false);
  });
});