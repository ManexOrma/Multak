/**
 * Lluvia corta de confeti con los colores del club y la tarjeta amarilla, para
 * celebrar (todo el equipo al día, alguien salda su deuda). Piezas de DOM animadas
 * con la Web Animations API; se borran solas. Nada con movimiento reducido.
 */
export function lanzarConfeti(documento: Document, origen?: Element | null, piezas = 34): void {
  const vista = documento.defaultView;
  if (!vista || vista.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const estilo = vista.getComputedStyle(documento.documentElement);
  const colores = [
    estilo.getPropertyValue('--klub').trim() || '#0b5cad',
    '#ffc72c',
    '#ffffff',
    '#ff9f1c',
  ];
  const caja = origen?.getBoundingClientRect();
  const x0 = caja ? caja.left + caja.width / 2 : vista.innerWidth / 2;
  const y0 = caja ? caja.top + caja.height / 3 : vista.innerHeight / 3;

  const capa = documento.createElement('div');
  capa.setAttribute('aria-hidden', 'true');
  capa.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1000;overflow:hidden';
  documento.body.append(capa);

  const animaciones: Animation[] = [];
  for (let i = 0; i < piezas; i++) {
    const pieza = documento.createElement('span');
    const ancho = 6 + Math.random() * 6;
    pieza.style.cssText =
      `position:absolute;left:${x0}px;top:${y0}px;width:${ancho}px;height:${ancho * 0.45}px;` +
      `border-radius:2px;background:${colores[i % colores.length]};` +
      'box-shadow:0 0 0 0.5px rgb(0 0 0 / 0.08)';
    capa.append(pieza);

    const angulo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const fuerza = 140 + Math.random() * 180;
    const dx = Math.cos(angulo) * fuerza;
    const dy = Math.sin(angulo) * fuerza;
    const giro = (Math.random() - 0.5) * 900;
    animaciones.push(
      pieza.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${dx}px, ${dy}px) rotate(${giro / 2}deg)`,
            opacity: 1,
            offset: 0.35,
          },
          {
            transform: `translate(${dx * 1.3}px, ${dy + 420}px) rotate(${giro}deg)`,
            opacity: 0,
          },
        ],
        { duration: 1300 + Math.random() * 700, easing: 'cubic-bezier(0.2, 0.6, 0.35, 1)' },
      ),
    );
  }
  void Promise.allSettled(animaciones.map((a) => a.finished)).then(() => capa.remove());
}
