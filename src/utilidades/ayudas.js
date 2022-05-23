import Punto from './Punto';

export const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const calcularSemanas = (fechaInicial, fechaFinal) => {
  const distanciaTiempoMs = fechaFinal - fechaInicial;
  return Math.ceil(distanciaTiempoMs / (1000 * 60 * 60 * 24 * 7));
};

// Basado en https://stackoverflow.com/a/15528789/3661186
export function puntosACurvas(puntos, tension, partes) {
  const onda = [];
  const _puntos = puntos.slice();
  _puntos.unshift(puntos[0]);
  _puntos.push(puntos[puntos.length - 1]);

  for (let i = 1; i < _puntos.length - 2; i++) {
    for (let t = 0; t < partes; t++) {
      // Vectores
      const { x: x0, y: y0 } = _puntos[i - 1];
      const { x, y } = _puntos[i];
      const { x: x2, y: y2 } = _puntos[i + 1];
      const { x: x3, y: y3 } = _puntos[i + 2];

      // Tensión de los vectores
      const t1x = (x2 - x0) * tension;
      const t2x = (x3 - x) * tension;
      const t1y = (y2 - y0) * tension;
      const t2y = (y3 - y) * tension;

      // Calcular pasos
      const paso = t / partes;
      const paso2 = Math.pow(paso, 2);
      const paso3 = Math.pow(paso, 3);

      // Los puntos de control
      const c1 = 2 * paso3 - 3 * paso2 + 1;
      const c2 = -(2 * paso3) + 3 * paso2;
      const c3 = paso3 - 2 * paso2 + paso;
      const c4 = paso3 - paso2;

      // Nuevos punto X y Y a partir de los puntos de control
      const _x = c1 * x + c2 * x2 + c3 * t1x + c4 * t2x;
      const _y = c1 * y + c2 * y2 + c3 * t1y + c4 * t2y;

      onda.push(new Punto(_x, _y));
    }
  }

  return onda;
}

export const pesosAPuntos = (pesos, cantidadSeccion) => {
  const puntos = [];

  pesos.forEach((peso, j) => {
    puntos.push(new Punto(j * cantidadSeccion, peso));
  });

  return puntos;
};

/**
 * https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle
 * https://math.stackexchange.com/questions/1413372/find-cartesian-coordinates-of-the-incenter
 * https://www.mathopenref.com/coordincenter.html
 */
export const calcularInCirculo = (a, b, c) => {
  const ladoA = b.distanciaA(c);
  const ladoB = c.distanciaA(a);
  const ladoC = a.distanciaA(b);
  const perimetro = ladoA + ladoB + ladoC;
  const s = perimetro / 2;

  const area = Math.sqrt(s * (s - ladoA) * (s - ladoB) * (s - ladoC));

  const radio = area / s;
  const cx = (ladoA * a.x + ladoB * b.x + ladoC * c.x) / perimetro;
  const cy = (ladoA * a.y + ladoB * b.y + ladoC * c.y) / perimetro;

  return { radio, centro: new Punto(cx, cy) };
};

export const calcularTranformacionLineal = (f1, t1, f2, t2, f3, t3) => {
  const fa = f1.y - f2.y;
  const fb = f2.y - f3.y;
  const ta = t1 - t2;
  const tb = t2 - t3;
  const ra = f1.x - f2.x;
  const rb = f2.x - f3.x;
  const coeficienteA = (tb * fa - ta * fb) / (rb * fa - ra * fb);
  const coeficienteB = (tb * ra - ta * rb) / (fb * ra - fa * rb);
  const coeficienteC = t1 - f1.x * coeficienteA - f1.y * coeficienteB;

  return [coeficienteA, coeficienteB, coeficienteC];
};

/*
 * https://math.stackexchange.com/questions/17561/how-to-shrink-a-triangle
 */
export const expandirTriangulo = (a, b, c, cantidad) => {
  const { radio, centro } = calcularInCirculo(a, b, c);
  const factor = (radio + cantidad) / radio;

  function ampliarPunto(p) {
    const x = p.x - centro.x;
    const y = p.y - centro.y;
    return new Punto(x * factor + centro.x, y * factor + centro.y);
  }

  return [ampliarPunto(a), ampliarPunto(b), ampliarPunto(c)];
};

/**
 * Convierte texto: sin mayúsculas, tildes o espacios alrededor;
 *
 * @param texto Texto a convertir
 * @returns Texto sin mayúsculas, tildes o espacios alrededor.
 */
export const normalizarTexto = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

// Otras fuentes de información para futuros problemas similares
// https://vincentwochnik.com/blog/2016/03/01/curved-lines-using-svg-and-javascript.html
