import {
  TeamId,
  RoundId,
  CompetitionState,
  SubmissionRecord,
  RoundTimerState,
  ActivePowerCardEffects
} from './types';
import { ROUND_SPECS } from './competitionData';

const STORAGE_KEY = 'fcf_competition_state_v1';

export function getInitialTimerState(roundId: RoundId): RoundTimerState {
  return {
    roundId,
    started: false,
    startDatetime: null,
    endDatetime: null,
    submitted: false,
    submissionDatetime: null,
    timeOver: false,
    elapsedSeconds: 0
  };
}

export function getInitialState(): CompetitionState {
  const defaultTimers: Record<RoundId, RoundTimerState> = {
    round1_a: getInitialTimerState('round1_a'),
    round1_b: getInitialTimerState('round1_b'),
    round2: getInitialTimerState('round2'),
    round3: getInitialTimerState('round3')
  };

  const defaultEditorCode: Record<RoundId, string> = {
    round1_a: ROUND_SPECS.round1_a.starterCode,
    round1_b: ROUND_SPECS.round1_b.starterCode,
    round2: ROUND_SPECS.round2.starterCode,
    round3: ROUND_SPECS.round3.starterCode
  };

  const defaultStandardInput: Record<RoundId, string> = {
    round1_a: ROUND_SPECS.round1_a.sampleInput,
    round1_b: ROUND_SPECS.round1_b.sampleInput,
    round2: ROUND_SPECS.round2.sampleInput,
    round3: ROUND_SPECS.round3.sampleInput
  };

  const defaultAttempts: Record<RoundId, number> = {
    round1_a: 0,
    round1_b: 0,
    round2: 0,
    round3: 0
  };

  return {
    selectedTeam: null,
    activeRoundId: 'round1_a',
    timers: defaultTimers,
    editorCode: defaultEditorCode,
    standardInput: defaultStandardInput,
    attempts: defaultAttempts,
    submissions: [],
    powerCardEffects: {
      shieldActive: false,
      freezeUntil: null,
      flashbangConstraint: null,
      timeAdjustSeconds: 0,
      history: []
    }
  };
}

export function loadCompetitionState(): CompetitionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    const initial = getInitialState();

    return {
      selectedTeam: parsed.selectedTeam || null,
      activeRoundId: parsed.activeRoundId || 'round1_a',
      timers: { ...initial.timers, ...(parsed.timers || {}) },
      editorCode: { ...initial.editorCode, ...(parsed.editorCode || {}) },
      standardInput: { ...initial.standardInput, ...(parsed.standardInput || {}) },
      attempts: { ...initial.attempts, ...(parsed.attempts || {}) },
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      powerCardEffects: { ...initial.powerCardEffects, ...(parsed.powerCardEffects || {}) }
    };
  } catch (err) {
    console.error('Failed to parse saved competition state from localStorage:', err);
    return getInitialState();
  }
}

export function saveCompetitionState(state: CompetitionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist competition state to localStorage:', err);
  }
}

export function exportResultsAsJSON(submissions: SubmissionRecord[], team: TeamId | null): void {
  const payload = {
    team: team || 'Unassigned',
    exportedAt: new Date().toISOString(),
    totalSubmissions: submissions.length,
    submissions
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FCF_${(team || 'Team').replace(/\s+/g, '_')}_Results_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportResultsAsCSV(submissions: SubmissionRecord[], team: TeamId | null): void {
  const headers = [
    'Team',
    'Round',
    'Activity',
    'Status',
    'Score',
    'Duration(s)',
    'Attempts',
    'Start Datetime',
    'Submission Datetime',
    'Summary'
  ];

  const rows = submissions.map((s) => [
    `"${s.team || team || ''}"`,
    `"${s.roundTitle}"`,
    `"${s.activityTitle}"`,
    `"${s.status}"`,
    s.score,
    s.durationSeconds,
    s.attempts,
    `"${s.startDatetime}"`,
    `"${s.submissionDatetime}"`,
    `"${(s.testResultsSummary || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FCF_${(team || 'Team').replace(/\s+/g, '_')}_Results_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
