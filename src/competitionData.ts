import { ProblemSpec, RoundId, PowerCardState } from './types';

export const ROUND_SPECS: Record<RoundId, ProblemSpec> = {
  round1_a: {
    id: 'round1_a',
    roundTitle: 'ROUND 1',
    activityTitle: 'Activity A: Dumb Charades + Code',
    durationMinutes: 15,
    maxPoints: 50,
    description: `Interpret and decode the team's charades gesture sequence into an automated C validator.
The input consists of an integer N followed by N gesture tokens (single uppercase letters).
Your program must:
1. Count the frequency of each distinct gesture.
2. If any gesture appears 3 or more times consecutively, print "FLAGGED: <GESTURE>".
3. Otherwise, print the total number of unique gestures followed by the decoded signature (the unique gestures in alphabetical order).

Output format:
If consecutive streak >= 3 exists:
FLAGGED: <GESTURE>

If no consecutive streak >= 3:
Unique: <COUNT>
Signature: <ALPHABETICAL_UNIQUE_CHARS>`,
    constraints: [
      '1 <= N <= 100',
      'Tokens are uppercase ASCII letters A-Z',
      'Output matches exact case and formatting',
      'Time Limit: 2.5 seconds per test case'
    ],
    sampleInput: `7
A B B B C D E`,
    sampleOutput: `FLAGGED: B`,
    explanation: 'Gesture B appears 3 times consecutively, triggering the FLAGGED alert.',
    starterCode: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    
    char gestures[105];
    char token[10];
    for (int i = 0; i < n; i++) {
        scanf("%s", token);
        gestures[i] = token[0];
    }
    
    // Check for 3 consecutive identical gestures
    for (int i = 0; i <= n - 3; i++) {
        if (gestures[i] == gestures[i+1] && gestures[i+1] == gestures[i+2]) {
            printf("FLAGGED: %c\\n", gestures[i]);
            return 0;
        }
    }
    
    // Track unique letters
    int seen[26] = {0};
    int uniqueCount = 0;
    for (int i = 0; i < n; i++) {
        int idx = gestures[i] - 'A';
        if (idx >= 0 && idx < 26) {
            if (seen[idx] == 0) {
                seen[idx] = 1;
                uniqueCount++;
            }
        }
    }
    
    printf("Unique: %d\\n", uniqueCount);
    printf("Signature: ");
    for (int i = 0; i < 26; i++) {
        if (seen[i]) {
            printf("%c", 'A' + i);
        }
    }
    printf("\\n");
    
    return 0;
}
`,
    testCases: [
      {
        input: `7\nA B B B C D E`,
        expectedOutput: `FLAGGED: B\n`,
        description: 'Sample 1: Flagged consecutive'
      },
      {
        input: `5\nA B C D E`,
        expectedOutput: `Unique: 5\nSignature: ABCDE\n`,
        description: 'Sample 2: All distinct'
      },
      {
        input: `6\nZ A Z A Z A`,
        expectedOutput: `Unique: 2\nSignature: AZ\n`,
        description: 'Sample 3: Alternating values'
      }
    ]
  },

  round1_b: {
    id: 'round1_b',
    roundTitle: 'ROUND 1',
    activityTitle: 'Activity B: Run-Length Encoding',
    durationMinutes: 15,
    maxPoints: 50,
    description: `Implement Run-Length Encoding (RLE) in C.
Run-length encoding is a form of lossless data compression in which consecutive data values (runs) are stored as a single count followed by the character.

Input: A single non-empty string consisting of alphanumeric characters.
Output: The compressed string where each consecutive sequence of identical characters is represented by its count followed by the character.

Example:
Input: AAABBBCCDAA
Output: 3A3B2C1D2A`,
    constraints: [
      '1 <= Length of string <= 1000',
      'Characters are uppercase letters A-Z, lowercase a-z, or digits 0-9',
      'Case sensitive: "a" and "A" are distinct characters',
      'Time Limit: 2.5 seconds per test case'
    ],
    sampleInput: `AAABBBCCDAA`,
    sampleOutput: `3A3B2C1D2A`,
    explanation: '3 As, followed by 3 Bs, 2 Cs, 1 D, and 2 As.',
    starterCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[105];
    if (scanf("%s", str) != 1) return 0;
    
    int len = strlen(str);
    if (len == 0) return 0;
    
    int count = 1;
    for (int i = 1; i <= len; i++) {
        if (i < len && str[i] == str[i-1]) {
            count++;
        } else {
            printf("%d%c", count, str[i-1]);
            count = 1;
        }
    }
    printf("\\n");
    return 0;
}
`,
    testCases: [
      {
        input: `AAABBBCCDAA`,
        expectedOutput: `3A3B2C1D2A\n`,
        description: 'Sample 1: Standard uppercase sequence'
      },
      {
        input: `WWWWWWWBWWWWBBBWWWWWWWBWWWWW`,
        expectedOutput: `7W1B4W3B7W1B5W\n`,
        description: 'Test 2: Multiple runs'
      },
      {
        input: `XYZ`,
        expectedOutput: `1X1Y1Z\n`,
        description: 'Test 3: Single occurrence characters'
      },
      {
        input: `aabbbcccc`,
        expectedOutput: `2a3b4c\n`,
        description: 'Test 4: Lowercase characters'
      }
    ]
  },

  round2: {
    id: 'round2',
    roundTitle: 'ROUND 2',
    activityTitle: 'Debugging Challenge (Find & Fix 10 Bugs)',
    durationMinutes: 20,
    maxPoints: 100,
    description: `The following C program is designed to analyze student test scores:
1. Read N (number of scores).
2. Read N integer scores.
3. Compute the minimum score, maximum score, and integer average.
4. Count how many scores are strictly above the average.
5. Print in format:
Min: <MIN>
Max: <MAX>
Avg: <AVG>
Above: <COUNT>

CRITICAL: The given starter code contains EXACTLY 10 BUGS ranging from missing syntax, invalid pointers, off-by-one errors, uninitialized sums, wrong format specifiers, and bad comparisons.
Locate and fix all 10 bugs, then run and submit the working code! Score incorporates completion speed.`,
    constraints: [
      '1 <= N <= 100',
      '0 <= Score <= 100',
      'All outputs on new lines matching exact template',
      'Time Limit: 2.5 seconds per test case'
    ],
    sampleInput: `5
70 85 90 60 75`,
    sampleOutput: `Min: 60
Max: 90
Avg: 76
Above: 2`,
    explanation: 'Scores 70,85,90,60,75 have Min=60, Max=90, Sum=380, Avg=380/5=76. Scores strictly above 76 are 85 and 90 (Count: 2).',
    starterCode: `// ROUND 2: DEBUGGING CHALLENGE
// THIS CODE CONTAINS 10 BUGS. FIND AND FIX ALL OF THEM!

#include <stdio.h>

int main() {
    int n
    // BUG 1: Missing semicolon above

    if (scanf("%d", n) != 1) { // BUG 2: Missing address-of (&n)
        return 0;
    }

    int scores[100];
    int sum; // BUG 3: Uninitialized sum variable!

    // BUG 4: Off-by-one loop bound (<= n instead of < n)
    for (int i = 0; i <= n; i++) {
        int v;
        scanf("%d", v); // BUG 5: Missing address-of (&v)
        scores[i] = v;
        sum += scores[i];
    }

    int min_val = 1000;
    int max_val = -1;

    for (int i = 0; i < n; i++) {
        if (scores[i] < min_val) {
            min_val = scores[i];
        }
        if (scores[i] < max_val) { // BUG 6: Logic error (should be > max_val)
            max_val = scores[i];
        }
    }

    int avg = sum / (n - 1); // BUG 7: Wrong denominator (should be n, not n - 1)

    int above_count = 0;
    for (int i = 0; i < n; i++) {
        if (scores[i] >= avg) { // BUG 8: Says strictly above in spec (> avg, not >=)
            above_count++;
        }
    }

    // BUG 9 & 10: Wrong format specifiers in print outputs
    printf("Min: %s\\n", min_val); // BUG 9: %s instead of %d
    printf("Max: %d\\n", max_val);
    printf("Avg: %d\\n", avg);
    printf("Above: %f\\n", above_count); // BUG 10: %f instead of %d

    return 0;
}
`,
    testCases: [
      {
        input: `5\n70 85 90 60 75`,
        expectedOutput: `Min: 60\nMax: 90\nAvg: 76\nAbove: 2\n`,
        description: 'Sample 1: Standard dataset'
      },
      {
        input: `4\n10 20 30 40`,
        expectedOutput: `Min: 10\nMax: 40\nAvg: 25\nAbove: 2\n`,
        description: 'Test 2: Monotonic sequence'
      },
      {
        input: `1\n88`,
        expectedOutput: `Min: 88\nMax: 88\nAvg: 88\nAbove: 0\n`,
        description: 'Test 3: Single element'
      }
    ]
  },

  round3: {
    id: 'round3',
    roundTitle: 'ROUND 3',
    activityTitle: 'Final Coding Race (Grid Vault Escape)',
    durationMinutes: 30,
    maxPoints: 150,
    description: `FINAL CODING RACE: The Vault Grid Escape.
You are trapped at the top-left corner (0, 0) of an R x C grid vault. Each cell has an energy cost.
You can only move RIGHT or DOWN towards the exit at (R - 1, C - 1).

Find the MINIMUM total energy path cost to reach (R - 1, C - 1) from (0, 0), inclusive of start and finish cells.
Output a single integer representing the minimum energy path cost.

POWER CARDS:
Active power cards can be deployed during this round! Keep your code clean, efficient, and resilient!`,
    constraints: [
      '1 <= R, C <= 10',
      '0 <= energy cost <= 1000',
      'Allowed moves: only RIGHT or DOWN',
      'Time Limit: 2.5 seconds per test case'
    ],
    sampleInput: `3 3
1 3 1
1 5 1
4 2 1`,
    sampleOutput: `7`,
    explanation: 'The path 1 -> 3 -> 1 -> 1 -> 1 has total energy cost 1 + 3 + 1 + 1 + 1 = 7, which is the minimum.',
    starterCode: `#include <stdio.h>

#define MAX 105

int min(int a, int b) {
    return (a < b) ? a : b;
}

int main() {
    int R, C;
    if (scanf("%d %d", &R, &C) != 2) return 0;
    
    int grid[MAX];
    int dp[MAX];
    
    for (int i = 0; i < R * C; i++) {
        int v;
        scanf("%d", &v);
        grid[i] = v;
    }
    
    dp[0] = grid[0];
    
    for (int j = 1; j < C; j++) {
        dp[j] = dp[j-1] + grid[j];
    }
    
    for (int i = 1; i < R; i++) {
        dp[i * C] = dp[(i-1) * C] + grid[i * C];
        for (int j = 1; j < C; j++) {
            int from_up = dp[(i-1) * C + j];
            int from_left = dp[i * C + (j-1)];
            dp[i * C + j] = grid[i * C + j] + min(from_up, from_left);
        }
    }
    
    printf("%d\\n", dp[R * C - 1]);
    return 0;
}
`,
    testCases: [
      {
        input: `3 3\n1 3 1\n1 5 1\n4 2 1`,
        expectedOutput: `7\n`,
        description: 'Sample 1: 3x3 grid'
      },
      {
        input: `2 3\n1 2 3\n4 5 6`,
        expectedOutput: `12\n`,
        description: 'Test 2: 2x3 grid (1->2->3->6 = 12)'
      },
      {
        input: `1 1\n42`,
        expectedOutput: `42\n`,
        description: 'Test 3: 1x1 grid'
      },
      {
        input: `4 4\n2 1 3 4\n5 1 1 2\n9 8 1 3\n4 2 1 1`,
        expectedOutput: `12\n`,
        description: 'Test 4: 4x4 maze'
      }
    ]
  }
};

export const AVAILABLE_POWER_CARDS: PowerCardState[] = [
  {
    cardId: 'flashbang',
    name: 'Flashbang',
    description: 'Imposes an active modified constraint on the team editor for testing adaptability.',
    icon: 'EyeOff',
    isPositive: false,
    costPoints: 20
  },
  {
    cardId: 'freeze',
    name: 'Keyboard Freeze',
    description: 'Locks the C code editor for exactly 2 minutes (120 seconds). Timer continues running!',
    icon: 'Snowflake',
    isPositive: false,
    costPoints: 40
  },
  {
    cardId: 'shield',
    name: 'Shield',
    description: 'Protects the team by deflecting and nullifying the next negative Power Card.',
    icon: 'Shield',
    isPositive: true,
    costPoints: 30
  },
  {
    cardId: 'timewarp',
    name: 'Time Warp (-5m)',
    description: 'Penalizes team by subtracting 5 minutes (300 seconds) from the remaining countdown.',
    icon: 'ClockBackward',
    isPositive: false,
    costPoints: 35
  },
  {
    cardId: 'turboboost',
    name: 'Turbo Boost (+5m)',
    description: 'Grants 5 bonus minutes (300 seconds) to the remaining Round 3 countdown timer.',
    icon: 'Zap',
    isPositive: true,
    costPoints: 25
  }
];

export const TEAMS_LIST = Array.from({ length: 21 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `Team ${num}`;
});
