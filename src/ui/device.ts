/**
 * O modo 3D precisa de teclado e mouse e ainda não tem controles de toque.
 *
 * "Só toque" = o principal meio de entrada não tem hover e é impreciso
 * (celular, tablet). Um notebook com tela de toque tem mouse ou touchpad como
 * entrada principal, então continua com acesso ao 3D.
 */
export function isTouchOnly(): boolean {
  try {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  } catch {
    return false;
  }
}
