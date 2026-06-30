import type { GameMode, Problem } from "../types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getOnes(n: number): number {
  return n % 10;
}

function getTens(n: number): number {
  return Math.floor(n / 10) % 10;
}

function getHundreds(n: number): number {
  return Math.floor(n / 100);
}

function needsRegroup(a: number, b: number): boolean {
  const onesSum = getOnes(a) + getOnes(b);
  const tensSum = getTens(a) + getTens(b) + (onesSum >= 10 ? 1 : 0);
  return onesSum >= 10 || tensSum >= 10;
}

function generateNoRegroupPair(): [number, number] {
  for (let i = 0; i < 50; i++) {
    const a = randomInt(100, 499);
    const b = randomInt(100, 499 - (a % 100));
    const adjustedB =
      Math.floor(b / 100) * 100 +
      Math.min(getTens(b), 9 - getTens(a)) * 10 +
      Math.min(getOnes(b), 9 - getOnes(a));
    if (adjustedB >= 100 && !needsRegroup(a, adjustedB)) {
      return [a, adjustedB];
    }
  }
  return [234, 145];
}

function generateRegroupPair(): [number, number] {
  for (let i = 0; i < 50; i++) {
    const a = randomInt(100, 699);
    const b = randomInt(100, 999 - a);
    if (needsRegroup(a, b) && a + b <= 999) {
      return [a, b];
    }
  }
  return [387, 456];
}

function generateRandomPair(): [number, number] {
  const a = randomInt(100, 499);
  const b = randomInt(100, 999 - a);
  return [a, b];
}

const WORD_TEMPLATES = [
  (a: number, b: number) =>
    `Emma collected ${a} stickers. Her friend gave her ${b} more. How many stickers does Emma have now?`,
  (a: number, b: number) =>
    `There are ${a} books on the top shelf and ${b} books on the bottom shelf. How many books are there in all?`,
  (a: number, b: number) =>
    `The school cafeteria served ${a} lunches on Monday and ${b} on Tuesday. How many lunches were served in all?`,
  (a: number, b: number) =>
    `A farmer picked ${a} apples in the morning and ${b} in the afternoon. How many apples did the farmer pick?`,
  (a: number, b: number) =>
    `During a fundraiser, Class A raised $${a} and Class B raised $${b}. How much did they raise together?`,
  (a: number, b: number) =>
    `Jaden read ${a} pages of his book last week and ${b} pages this week. How many pages has he read in all?`,
];

function expandedHint(a: number, b: number): string {
  const aH = getHundreds(a) * 100;
  const aT = getTens(a) * 10;
  const aO = getOnes(a);
  const bH = getHundreds(b) * 100;
  const bT = getTens(b) * 10;
  const bO = getOnes(b);
  return `Try expanded form! (${aH} + ${aT} + ${aO}) + (${bH} + ${bT} + ${bO}). Add hundreds, then tens, then ones.`;
}

function regroupHint(a: number, b: number): string {
  const onesSum = getOnes(a) + getOnes(b);
  if (onesSum >= 10) {
    return `The ones add up to ${onesSum}! Regroup: carry 1 to the tens place. ${onesSum - 10} stays in the ones.`;
  }
  const tensSum = getTens(a) + getTens(b) + 1;
  return `The tens add up to ${tensSum}! Regroup: carry 1 to the hundreds place.`;
}

function createStandardProblem(
  a: number,
  b: number,
  type: Problem["type"] = "standard",
  wordProblem?: string,
): Problem {
  const regroup = needsRegroup(a, b);
  let hint = "Line up the numbers by place value — hundreds, tens, then ones!";
  if (regroup) {
    hint = regroupHint(a, b);
  } else {
    hint = "No regrouping needed! Add each column from right to left.";
  }

  return {
    id: `${a}-${b}-${Date.now()}-${Math.random()}`,
    type,
    a,
    b,
    answer: a + b,
    wordProblem,
    hint,
    needsRegroup: regroup,
  };
}

function createExpandedProblem(a: number, b: number): Problem {
  return {
    ...createStandardProblem(a, b, "expanded"),
    hint: expandedHint(a, b),
  };
}

function createMissingDigitProblem(a: number, b: number): Problem {
  const positions: Array<"a" | "b"> = ["a", "b"];
  const pos = positions[randomInt(0, 1)];
  return {
    ...createStandardProblem(a, b, "missing-digit"),
    missingPosition: pos,
    hint:
      pos === "a"
        ? `What number plus ${b} equals ${a + b}? Try working backwards!`
        : `${a} plus what number equals ${a + b}?`,
  };
}

export function generateProblems(mode: GameMode, count: number): Problem[] {
  const problems: Problem[] = [];

  for (let i = 0; i < count; i++) {
    switch (mode) {
      case "place-value": {
        const [a, b] = generateRandomPair();
        problems.push(createExpandedProblem(a, b));
        break;
      }
      case "no-regroup": {
        const [a, b] = generateNoRegroupPair();
        problems.push(createStandardProblem(a, b));
        break;
      }
      case "regroup": {
        const [a, b] = generateRegroupPair();
        problems.push(createStandardProblem(a, b));
        break;
      }
      case "word-problems": {
        const [a, b] = generateRandomPair();
        const template = WORD_TEMPLATES[randomInt(0, WORD_TEMPLATES.length - 1)];
        problems.push(createStandardProblem(a, b, "word", template(a, b)));
        break;
      }
      case "mixed": {
        const roll = randomInt(1, 5);
        if (roll === 1) {
          const [a, b] = generateNoRegroupPair();
          problems.push(createStandardProblem(a, b));
        } else if (roll === 2) {
          const [a, b] = generateRegroupPair();
          problems.push(createStandardProblem(a, b));
        } else if (roll === 3) {
          const [a, b] = generateRandomPair();
          const template = WORD_TEMPLATES[randomInt(0, WORD_TEMPLATES.length - 1)];
          problems.push(createStandardProblem(a, b, "word", template(a, b)));
        } else if (roll === 4) {
          const [a, b] = generateRandomPair();
          problems.push(createExpandedProblem(a, b));
        } else {
          const [a, b] = generateRandomPair();
          problems.push(createMissingDigitProblem(a, b));
        }
        break;
      }
    }
  }

  return problems;
}

export function getExpandedBreakdown(n: number) {
  return {
    hundreds: getHundreds(n) * 100,
    tens: getTens(n) * 10,
    ones: getOnes(n),
    hDigit: getHundreds(n),
    tDigit: getTens(n),
    oDigit: getOnes(n),
  };
}
