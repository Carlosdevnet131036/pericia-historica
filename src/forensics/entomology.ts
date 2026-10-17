/**
 * Entomologia forense: datar a exposição de um corpo pela idade das larvas.
 *
 * Insetos de sangue frio crescem conforme a temperatura. Abaixo de uma
 * temperatura-base a espécie praticamente não se desenvolve; acima dela,
 * cada grau conta. A soma diária de (temperatura média − base) é a
 * quantidade de graus-dia acumulados (GDA). Cada estágio da larva exige um
 * total conhecido de graus-dia, então, olhando para trás a partir do dia em
 * que as larvas foram coletadas, acha-se o dia em que os ovos foram postos.
 *
 * O resultado é um intervalo mínimo desde a exposição do corpo às moscas,
 * não a hora exata da morte.
 */

export interface DayTemp {
  /** Dia do mês (o caso inteiro acontece num mesmo mês). */
  day: number;
  /** Temperatura média do dia, em °C. */
  temp: number;
}

/** Graus-dia de um único dia: nunca negativos. */
export function dayDegrees(temp: number, base: number): number {
  return Math.max(0, temp - base);
}

/** Soma de graus-dia do dia `from` até o dia `until`, inclusive. */
export function accumulated(temps: DayTemp[], base: number, from: number, until: number): number {
  return temps.filter((d) => d.day >= from && d.day <= until).reduce((sum, d) => sum + dayDegrees(d.temp, base), 0);
}

/**
 * Dia de postura mais provável: o dia cuja soma até a coleta fica mais perto
 * do total exigido pelo estágio observado.
 */
export function estimateOviposition(temps: DayTemp[], base: number, required: number, until: number): number {
  let best = { day: until, diff: Infinity };
  for (const d of temps) {
    if (d.day > until) continue;
    const diff = Math.abs(accumulated(temps, base, d.day, until) - required);
    if (diff < best.diff) best = { day: d.day, diff };
  }
  return best.day;
}
