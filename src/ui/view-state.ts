/**
 * Algumas telas guardam estado só de visualização (aba aberta, hipótese em
 * teste) em variáveis de módulo, fora do save. Ao trocar de caso, esse estado
 * precisa ser zerado, senão um id do caso anterior vaza para o próximo.
 */
const resets = new Set<() => void>();

export function onCaseChange(reset: () => void): void {
  resets.add(reset);
}

export function caseChanged(): void {
  resets.forEach((r) => r());
}

const seen = new Set<string>();

/**
 * true só na primeira vez que a chave aparece. A tela é redesenhada a cada
 * clique; sem isso, as animações de entrada se repetiriam o tempo todo.
 */
export function firstTime(key: string): boolean {
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}
