import type { CoachMessage, DumpItem, TimeTrackerSession, VaultDeliveryLog } from "../types";

const now = new Date();
const daysAgo = (days: number): string => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const atTime = (daysBack: number, hour: number, minute: number): string => {
  const date = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const dumpItems: DumpItem[] = [
  {
    id: "d1",
    content: "Look into shadcn/ui architecture for LifeOS component library",
    createdAt: daysAgo(3),
    processed: false,
  },
  {
    id: "d2",
    content: "Maybe add a gratitude section to the notebook",
    createdAt: daysAgo(1),
    processed: false,
  },
  {
    id: "d3",
    content: "Goggins book - Can't Hurt Me - need to finish this",
    createdAt: daysAgo(5),
    processed: true,
    processingResult: {
      suggestedType: "course",
      areaId: "mind",
      reasoning: "Book to finish - add as a course/reading project",
      accepted: true,
    },
  },
];

export const vaultDeliveryLog: VaultDeliveryLog[] = [
  {
    id: "vl1",
    vaultItemId: "v3",
    triggeredBy: "auto-score",
    triggerDetail: "Relationships dropped below 40",
    response: "helped",
    deliveredAt: daysAgo(3),
  },
  {
    id: "vl2",
    vaultItemId: "v1",
    triggeredBy: "auto-rating",
    triggerDetail: "Day rated 1 out of 5",
    response: "skipped",
    deliveredAt: daysAgo(11),
  },
];

export const coachMessages: CoachMessage[] = [];

export const timeTrackerSessions: TimeTrackerSession[] = [
  {
    id: "ts1",
    linkedHabitId: "h2",
    areaId: "career",
    label: "LifeOS build session",
    startedAt: atTime(1, 9, 0),
    endedAt: atTime(1, 10, 42),
    durationSec: 6120,
  },
  {
    id: "ts2",
    linkedTaskId: "t1",
    areaId: "career",
    label: "LeetCode practice",
    startedAt: atTime(0, 11, 0),
    endedAt: atTime(0, 11, 50),
    durationSec: 3000,
  },
];
