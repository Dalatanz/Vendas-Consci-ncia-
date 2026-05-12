export type LevelKey = "iniciante" | "evolucao" | "performer" | "especialista" | "elite";

export function levelFromTotalPoints(totalPoints: number): {
  key: LevelKey;
  label: string;
  min: number;
  max: number | null;
} {
  if (totalPoints <= 5) {
    return { key: "iniciante", label: "Iniciante", min: 0, max: 5 };
  }
  if (totalPoints <= 15) {
    return { key: "evolucao", label: "Em evolução", min: 6, max: 15 };
  }
  if (totalPoints <= 30) {
    return { key: "performer", label: "Performer", min: 16, max: 30 };
  }
  if (totalPoints <= 50) {
    return { key: "especialista", label: "Especialista", min: 31, max: 50 };
  }
  return { key: "elite", label: "Elite comercial", min: 51, max: null };
}

export function xpProgressInLevel(totalPoints: number) {
  const lvl = levelFromTotalPoints(totalPoints);
  const nextMin =
    lvl.key === "iniciante"
      ? 6
      : lvl.key === "evolucao"
        ? 16
        : lvl.key === "performer"
          ? 31
          : lvl.key === "especialista"
            ? 51
            : null;
  if (nextMin === null) {
    return { pct: 100, nextLevelAt: null as number | null };
  }
  const span = nextMin - lvl.min;
  const cur = totalPoints - lvl.min;
  const pct = Math.min(100, Math.max(0, (cur / span) * 100));
  return { pct, nextLevelAt: nextMin };
}

export function rankingScore(input: {
  totalPoints: number;
  lessonsDone: number;
  activitiesPassed: number;
  trailPct: number;
}) {
  return (
    input.totalPoints * 4 +
    input.lessonsDone * 2 +
    input.activitiesPassed * 3 +
    input.trailPct * 0.8
  );
}
