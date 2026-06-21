import { getDailyCapSettings } from "./provider-config";

type Bucket = {
  count: number;
};

const buckets = new Map<string, Bucket>();

export type DailyCapDecision = {
  dayKey: string;
  scope: string;
  enabled: boolean;
  requestLimit: number;
  requestCount: number;
  wouldBlock: boolean;
  blocked: boolean;
};

function getDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getBucket(scope: string, dayKey: string): Bucket {
  const key = `${scope}:${dayKey}`;
  const existing = buckets.get(key);
  if (existing) return existing;
  const created = { count: 0 };
  buckets.set(key, created);
  return created;
}

export function consumeDailyCap(scope: string, increment = 1): DailyCapDecision {
  const { enabled, requestLimit } = getDailyCapSettings();
  const dayKey = getDayKey();
  const bucket = getBucket(scope, dayKey);
  bucket.count += Math.max(0, increment);

  const limitConfigured = requestLimit > 0;
  const wouldBlock = limitConfigured && bucket.count > requestLimit;
  const blocked = enabled && wouldBlock;

  return {
    dayKey,
    scope,
    enabled,
    requestLimit,
    requestCount: bucket.count,
    wouldBlock,
    blocked,
  };
}

export function __resetDailyCapForTests(): void {
  buckets.clear();
}