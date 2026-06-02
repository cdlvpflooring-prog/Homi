import {
  REPUTATION_RULES,
  reputationManager,
  canCreateHighPriorityAlerts,
  canModerateReports,
  hasWeightedConfirmations,
} from '@/utils/reputation';

// ─── REPUTATION_RULES constants ───────────────────────────────────────────

describe('REPUTATION_RULES', () => {
  it('positive actions give positive deltas', () => {
    expect(REPUTATION_RULES.ALERT_VALIDATED).toBeGreaterThan(0);
    expect(REPUTATION_RULES.HELPFUL_MESSAGE).toBeGreaterThan(0);
    expect(REPUTATION_RULES.COMMUNITY_THANKS).toBeGreaterThan(0);
    expect(REPUTATION_RULES.VERIFIED_SELLER).toBeGreaterThan(0);
  });

  it('negative actions give negative deltas', () => {
    expect(REPUTATION_RULES.ALERT_OVERRULED).toBeLessThan(0);
    expect(REPUTATION_RULES.SPAM_REPORTED).toBeLessThan(0);
    expect(REPUTATION_RULES.WEEKLY_DECAY).toBeLessThan(0);
  });
});

// ─── getReputationLevel ───────────────────────────────────────────────────

describe('ReputationManager.getReputationLevel', () => {
  it('score >= 20 → Trusted Guardian', () => {
    expect(reputationManager.getReputationLevel(20).level).toBe('Trusted Guardian');
    expect(reputationManager.getReputationLevel(50).level).toBe('Trusted Guardian');
  });

  it('score 10–19 → Community Helper', () => {
    expect(reputationManager.getReputationLevel(10).level).toBe('Community Helper');
    expect(reputationManager.getReputationLevel(19).level).toBe('Community Helper');
  });

  it('score 5–9 → Good Neighbor', () => {
    expect(reputationManager.getReputationLevel(5).level).toBe('Good Neighbor');
    expect(reputationManager.getReputationLevel(9).level).toBe('Good Neighbor');
  });

  it('score 0–4 → New Member', () => {
    expect(reputationManager.getReputationLevel(0).level).toBe('New Member');
    expect(reputationManager.getReputationLevel(4).level).toBe('New Member');
  });

  it('negative score → Restricted', () => {
    // score is never stored negative (clamped at 0), but the getter handles it defensively
    expect(reputationManager.getReputationLevel(-1).level).toBe('Restricted');
  });

  it('each level has a non-empty privileges array', () => {
    const scores = [0, 5, 10, 20];
    for (const s of scores) {
      expect(reputationManager.getReputationLevel(s).privileges.length).toBeGreaterThan(0);
    }
  });

  it('each level includes a color string', () => {
    const scores = [0, 5, 10, 20];
    for (const s of scores) {
      expect(reputationManager.getReputationLevel(s).color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  describe('boundary values', () => {
    it('score 4 is New Member, score 5 is Good Neighbor', () => {
      expect(reputationManager.getReputationLevel(4).level).toBe('New Member');
      expect(reputationManager.getReputationLevel(5).level).toBe('Good Neighbor');
    });

    it('score 9 is Good Neighbor, score 10 is Community Helper', () => {
      expect(reputationManager.getReputationLevel(9).level).toBe('Good Neighbor');
      expect(reputationManager.getReputationLevel(10).level).toBe('Community Helper');
    });

    it('score 19 is Community Helper, score 20 is Trusted Guardian', () => {
      expect(reputationManager.getReputationLevel(19).level).toBe('Community Helper');
      expect(reputationManager.getReputationLevel(20).level).toBe('Trusted Guardian');
    });
  });
});

// ─── getConfirmationWeight ────────────────────────────────────────────────

describe('ReputationManager.getConfirmationWeight', () => {
  it('returns 1 for reputation below 6', () => {
    expect(reputationManager.getConfirmationWeight(0)).toBe(1);
    expect(reputationManager.getConfirmationWeight(5)).toBe(1);
  });

  it('returns 2 for reputation >= 6', () => {
    expect(reputationManager.getConfirmationWeight(6)).toBe(2);
    expect(reputationManager.getConfirmationWeight(100)).toBe(2);
  });

  it('boundary: 5 → weight 1, 6 → weight 2', () => {
    expect(reputationManager.getConfirmationWeight(5)).toBe(1);
    expect(reputationManager.getConfirmationWeight(6)).toBe(2);
  });
});

// ─── helper predicates ────────────────────────────────────────────────────

describe('canCreateHighPriorityAlerts', () => {
  it('requires score >= 20', () => {
    expect(canCreateHighPriorityAlerts(19)).toBe(false);
    expect(canCreateHighPriorityAlerts(20)).toBe(true);
    expect(canCreateHighPriorityAlerts(0)).toBe(false);
  });
});

describe('canModerateReports', () => {
  it('requires score >= 20', () => {
    expect(canModerateReports(19)).toBe(false);
    expect(canModerateReports(20)).toBe(true);
  });
});

describe('hasWeightedConfirmations', () => {
  it('requires score >= 10', () => {
    expect(hasWeightedConfirmations(9)).toBe(false);
    expect(hasWeightedConfirmations(10)).toBe(true);
    expect(hasWeightedConfirmations(25)).toBe(true);
  });
});

// ─── ReputationManager.getUserReputation ─────────────────────────────────

describe('ReputationManager.getUserReputation', () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns default reputation when no stored data exists', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const rep = await reputationManager.getUserReputation('user-1');
    expect(rep.userId).toBe('user-1');
    expect(rep.score).toBe(0);
    expect(rep.actions).toEqual([]);
  });

  it('returns parsed stored reputation', async () => {
    const stored = {
      userId: 'user-2',
      score: 15,
      lastUpdated: Date.now(),
      actions: [],
      weeklyStats: { alertsCreated: 0, alertsConfirmed: 2, messagesHelpful: 1, thanksReceived: 0 },
    };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(stored));
    const rep = await reputationManager.getUserReputation('user-2');
    expect(rep.score).toBe(15);
  });

  it('returns default when stored data is corrupted', async () => {
    AsyncStorage.getItem.mockResolvedValue('undefined');
    const rep = await reputationManager.getUserReputation('user-3');
    expect(rep.score).toBe(0);
    expect(rep.userId).toBe('user-3');
  });
});

// ─── ReputationManager.updateReputation ──────────────────────────────────

describe('ReputationManager.updateReputation', () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
  });

  it('adds points for ALERT_VALIDATED', async () => {
    const result = await reputationManager.updateReputation('u1', 'ALERT_VALIDATED', 'test');
    expect(result.score).toBe(REPUTATION_RULES.ALERT_VALIDATED);
  });

  it('subtracts points for ALERT_OVERRULED', async () => {
    // Start at 10 so we don't hit the 0 floor immediately
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
      userId: 'u2', score: 10, lastUpdated: Date.now(), actions: [],
      weeklyStats: { alertsCreated: 0, alertsConfirmed: 0, messagesHelpful: 0, thanksReceived: 0 },
    }));
    const result = await reputationManager.updateReputation('u2', 'ALERT_OVERRULED', 'test');
    expect(result.score).toBe(10 + REPUTATION_RULES.ALERT_OVERRULED);
  });

  it('score is clamped at 0 (never negative)', async () => {
    // Start at 0 and apply a negative action
    const result = await reputationManager.updateReputation('u3', 'ALERT_OVERRULED', 'test');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('appends the action to the actions array', async () => {
    const result = await reputationManager.updateReputation('u4', 'HELPFUL_MESSAGE', 'helped');
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].type).toBe('HELPFUL_MESSAGE');
    expect(result.actions[0].reason).toBe('helped');
  });

  it('keeps at most 50 actions (trims oldest)', async () => {
    const manyActions = Array.from({ length: 50 }, (_, i) => ({
      type: 'HELPFUL_MESSAGE' as const,
      reason: `action-${i}`,
      timestamp: Date.now() - i * 1000,
    }));
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
      userId: 'u5', score: 5, lastUpdated: Date.now(), actions: manyActions,
      weeklyStats: { alertsCreated: 0, alertsConfirmed: 0, messagesHelpful: 0, thanksReceived: 0 },
    }));
    const result = await reputationManager.updateReputation('u5', 'ALERT_VALIDATED', 'new');
    expect(result.actions.length).toBeLessThanOrEqual(50);
  });

  it('persists the updated reputation to AsyncStorage', async () => {
    await reputationManager.updateReputation('u6', 'ALERT_VALIDATED', 'test');
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [, serialized] = AsyncStorage.setItem.mock.calls[0];
    const parsed = JSON.parse(serialized);
    expect(parsed.score).toBe(REPUTATION_RULES.ALERT_VALIDATED);
  });
});
