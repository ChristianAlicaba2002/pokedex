import { TPokemonData } from '@/@types/type';
import { getAttackMultiplier } from '@/utils/type-effectiveness';

// A rough 1-on-1 estimate: both Pokémon at level 50 with perfect IVs, no EVs, items or
// abilities, each spamming its best 80-power same-type move (physical or special).
const LEVEL = 50;
const IV = 31;
const MOVE_POWER = 80;
const STAB = 1.5;

function baseStat(pokemon: TPokemonData, name: string) {
  return pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}

function hpAtLevel(base: number) {
  return Math.floor(((2 * base + IV) * LEVEL) / 100) + LEVEL + 10;
}

function statAtLevel(base: number) {
  return Math.floor(((2 * base + IV) * LEVEL) / 100) + 5;
}

function damage(attack: number, defense: number, multiplier: number) {
  const base = Math.floor(
    Math.floor((Math.floor((2 * LEVEL) / 5 + 2) * MOVE_POWER * attack) / defense) / 50
  ) + 2;
  return Math.floor(base * STAB * multiplier);
}

export type AttackPlan = {
  type: string;
  category: 'physical' | 'special';
  multiplier: number;
  damage: number;
  hitsToKo: number;
};

// Best attack the attacker can use against the defender, by damage per hit.
export function getBestAttack(attacker: TPokemonData, defender: TPokemonData): AttackPlan {
  const defenderTypes = defender.types.map((t) => t.type.name);
  const defenderHp = hpAtLevel(baseStat(defender, 'hp'));
  let best: AttackPlan | null = null;

  for (const { type } of attacker.types) {
    const multiplier = getAttackMultiplier(type.name, defenderTypes);
    for (const category of ['physical', 'special'] as const) {
      const attack = statAtLevel(baseStat(attacker, category === 'physical' ? 'attack' : 'special-attack'));
      const defense = statAtLevel(baseStat(defender, category === 'physical' ? 'defense' : 'special-defense'));
      const dealt = multiplier === 0 ? 0 : Math.max(1, damage(attack, defense, multiplier));
      if (!best || dealt > best.damage) {
        best = {
          type: type.name,
          category,
          multiplier,
          damage: dealt,
          hitsToKo: dealt === 0 ? Infinity : Math.ceil(defenderHp / dealt),
        };
      }
    }
  }

  return best!;
}

export type BattlePrediction = {
  winner: 'a' | 'b' | 'tie';
  planA: AttackPlan;
  planB: AttackPlan;
  aMovesFirst: boolean | null;
  confidence: 'Close fight' | 'Likely' | 'Strong favorite';
};

export function predictBattle(a: TPokemonData, b: TPokemonData): BattlePrediction {
  const planA = getBestAttack(a, b);
  const planB = getBestAttack(b, a);
  const speedA = baseStat(a, 'speed');
  const speedB = baseStat(b, 'speed');
  const aMovesFirst = speedA === speedB ? null : speedA > speedB;

  let winner: BattlePrediction['winner'];
  if (!Number.isFinite(planA.hitsToKo) && !Number.isFinite(planB.hitsToKo)) {
    winner = 'tie';
  } else if (planA.hitsToKo === planB.hitsToKo) {
    // Same number of hits: whoever attacks first lands the last one.
    winner = aMovesFirst == null ? 'tie' : aMovesFirst ? 'a' : 'b';
  } else {
    winner = planA.hitsToKo < planB.hitsToKo ? 'a' : 'b';
  }

  const gap = Math.abs(
    (Number.isFinite(planA.hitsToKo) ? planA.hitsToKo : 99) -
      (Number.isFinite(planB.hitsToKo) ? planB.hitsToKo : 99)
  );
  const confidence = winner === 'tie' || gap === 0 ? 'Close fight' : gap === 1 ? 'Likely' : 'Strong favorite';

  return { winner, planA, planB, aMovesFirst, confidence };
}
