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
