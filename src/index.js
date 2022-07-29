import './scss/estilos.scss';
import {
  calcularInCirculo,
  calcularSemanas,
  calcularTranformacionLineal,
  expandirTriangulo,
  normalizarTexto,
  pesosAPuntos,
  puntosACurvas,
} from './utilidades/ayudas';
import Punto from './utilidades/Punto';
import procesarDatos from './utilidades/procesarDatos';
import tendencias from './datos/tendenciasFiltradas.json';
import { crearTexturaDeLienzo, crearTexturaLineaTiempo } from './utilidades/threeRender';

const conteoMinimo = 14;
const escalaPantalla = window.devicePixelRatio;
let pesoMax2 = 0;

let fechaA = new Date('2023/01/01');
let fechaB = new Date('1970/01/01');

tendencias.sort((a, b) => b.fechas.length - a.fechas.length);

let tendenciasFiltradas = tendencias.filter((obj) => {
  if (obj.fechas.length < conteoMinimo) return false;

  obj.fechas.sort();

  // Cualquier tipo de URL
  const regUrls =
    /(http:\/\/|ftp:\/\/|https:\/\/|www\.)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/g;
  if (obj.palabra.match(regUrls)) return;

  if (obj.palabra === 'https://tco/0kIt5rPMHq') return;
  if (obj.palabra === '\\nhttps://tco/XUxIBqsu9S') return;

  // Omitir estas palabras
  const regex =
    /\b(que|los|por|del|con|para|las|una|mas|esta|the|como|pero|and|este|hay|sin|nos|tiene|porque|sus|that|les|desde|ese|muy|tan|not|esa|coronavirus|cada|this|mis|puede|would|you|are|han|for|dio|who|all|colombia|covid-related|eso|uno|vez|van|toda|asi|son|estoy|esto|with|pues|lesser|dont|itself|torment|behold|aware|experiencing|tal|imposes|its|many|statement|what|todos|todo|ano|anos|fue|ahi|from|hacen|era)\b/g;
  const normalizado = normalizarTexto(obj.palabra);
  if (normalizado.match(regex)) return;

  obj.fechas = obj.fechas.map((f, i) => {
    const fecha = new Date(f);
    fechaA = fecha < fechaA ? fecha : fechaA;
    fechaB = fecha > fechaB ? fecha : fechaB;
    return fecha;
  });

  return true;
});

function mezclarPalabras(palabraA, palabraB) {
  const a = tendenciasFiltradas.findIndex((t) => t.palabraDespuesDeLimpieza === palabraA);
  const b = tendenciasFiltradas.findIndex((t) => t.palabraDespuesDeLimpieza === palabraB);

  tendenciasFiltradas[a].fechas = [...a.fechas, ...b.fechas];
  tendenciasFiltradas.splice(b, 1);
  a.fechas.sort();
}
// mezclarPalabras()

function iniciarFecha(fecha) {
  const dia = fecha.getDate();
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();

  return new Date(año, mes, dia);
}

fechaA = iniciarFecha(fechaA);
fechaB = iniciarFecha(fechaB);

const numeroSemanas = calcularSemanas(fechaA, fechaB);
const referenciaSemanas = [];
let f = new Date(fechaA);

while (f < fechaB) {
  const diaDelMes = f.getDate();
  const diaSemana = f.getDay();

  if (diaSemana === 0) {
    referenciaSemanas.push(f);
  }
  f = f.setDate(diaDelMes + 1);
  f = new Date(f);
}

referenciaSemanas[referenciaSemanas.length - 1] = new Date(
  referenciaSemanas[referenciaSemanas.length - 1].setHours(23, 59, 59, 999)
);

// console.log(numeroSemanas, referenciaSemanas);

tendenciasFiltradas.forEach((objPalabra) => {
  const fechas = objPalabra.fechas;
  // Iniciar pesos en 0
  objPalabra.pesos = [...Array(numeroSemanas)].map(() => 0);

  fechas.forEach((fecha) => {
    const pesoI = referenciaSemanas.findIndex((ref) => ref >= fecha);
    // console.log(fecha, pesoI);
    // if (pesoI < 0) {
    //   console.log(fecha, pesoI);
    // }
    objPalabra.pesos[pesoI]++;
  });
});

tendenciasFiltradas = tendenciasFiltradas.filter((t) => {
  const semanasConDatos = t.pesos.filter((p) => p > 0);
  // console.log(semanasConDatos.length, semanasConDatos.length > 4);
  return semanasConDatos.length > 4;
});

tendenciasFiltradas.forEach((t) => {
  t.pesos.forEach((p) => {
    if (pesoMax2 < p) {
      pesoMax2 = p;
    }
  });
});

// console.log(tendenciasFiltradas, fechaA, fechaB, numeroSemanas, pesoMax2);

const datos2 = {};

// console.log(tendenciasFiltradas);
const fechaInicial = new Date('2020/03/25');
const fechaFinal = new Date('2022/05/15');
const semanasTotal = calcularSemanas(fechaInicial, fechaFinal);
const anchoSemana = 50;
const partesSemana = 50; // 3
const anchoSeccion = anchoSemana / partesSemana;
const ancho = semanasTotal * anchoSemana;
const pesoMax = 75;
const alto = pesoMax;
const lineaTiempo = document.getElementById('lineaTiempo');

// for (let n = 0; n < 200; n++) {
//   const obj = tendenciasFiltradas[n];
//   datos2[obj.palabra] = { onda: [], pesos: obj.pesos, puntos: [] };
//   datos2[obj.palabra].puntos = pesosAPuntos(obj.pesos, anchoSemana);
//   datos2[obj.palabra].onda = puntosACurvas(datos2[obj.palabra].puntos, 0.5, partesSemana);
// console.log(tendenciasFiltradas[n].palabra, tendenciasFiltradas[n].fechas.length, tendenciasFiltradas[n]);
// }
// console.log(datos2);

const datos = procesarDatos(semanasTotal, alto, anchoSemana, partesSemana);
// console.log(datos);
const bebas = new FontFace('bebas', 'url(https://fonts.gstatic.com/s/bebasneue/v9/JTUSjIg69CK48gW7PXoo9Wlhyw.woff2)');

function crearLineaPalabra(palabra, contenedor, onda, idx, ondas) {
  const lienzo = document.createElement('canvas');
  const ctx = lienzo.getContext('2d', { alpha: false });
  ctx.imageSmoothingQuality = 'high';
  lienzo.className = 'lienzoOriginal';
  escalarLienzo(lienzo, ctx);

  // Poner 2 espacios al final para mejorar legibilidad
  const texto = `${palabra}  `;
  ctx.font = `${pesoMax}pt bebas`;
  ctx.textBaseline = 'top';

  const dimsPalabra = ctx.measureText(texto);
  // console.log(dimsPalabra)
  const iteracionesPalabra = (ancho / dimsPalabra.width) | 0;
  let grd = ctx.createLinearGradient(0, 0, ancho, 0);
  let yAvg;
  const hue = aleatorioInteger(360);
  for (let i = 0; i < onda.length - 1; i++) {
    const puntoA = onda[i];
    const puntoB = onda[i + 1];
    yAvg = (puntoA.y + puntoB.y) / 2;
    yAvg = Math.max(20, Math.min(yAvg, 100));
    grd.addColorStop(i / onda.length, generateHslaColors(94, yAvg, 1, hue));
  }
  ctx.fillStyle = grd;
  ctx.fillText(texto.repeat(iteracionesPalabra), 0, 0);

  // pintar palabras sin modificar
  // contenedor.appendChild(lienzo);

  crearTexturaDeLienzo(lienzo, ancho, alto, idx, ondas);

  return lienzo;
}

function aleatorioInteger(max) {
  return Math.floor(Math.random() * (max + 1));
}

function aleatorioRgbColor() {
  let r = aleatorioInteger(255);
  let g = aleatorioInteger(255);
  let b = aleatorioInteger(255);
  return [r, g, b];
}

function aleatorioHexColor() {
  let [r, g, b] = aleatorioRgbColor();

  let hr = r.toString(16).padStart(2, '0');
  let hg = g.toString(16).padStart(2, '0');
  let hb = b.toString(16).padStart(2, '0');

  return '#' + hr + hg + hb;
}

function generateHslaColors(saturation, lightness, alpha, hue) {
  const color = `hsla(${hue},${saturation}%,${lightness}%,${alpha})`;
  return color;
}

// Cargar fuente y esperar a que esté lista antes de iniciar.
bebas.load().then((fuente) => {
  document.fonts.add(fuente);
  let i = 0;
  let ondas = [];
  for (let palabra in datos) {
    const contenedor = document.createElement('div');
    const { onda } = datos[palabra];
    ondas[i] = onda;
    const lienzoOriginal = crearLineaPalabra(palabra, contenedor, onda, i, ondas);

    contenedor.className = 'contenedorPalabra';
    lineaTiempo.appendChild(contenedor);

    // dibujar palabras modificadas
    // crearFila(ondas, i, lienzoOriginal, contenedor);

    // dibujar curva
    // dibujarOnda(onda, contenedor);
    i++;
  }
  crearTexturaLineaTiempo(ancho, alto, fechaInicial, fechaFinal, semanasTotal);
  // console.log(ondas)
});

function dibujarOnda(onda, contenedor) {
  const lienzo = document.createElement('canvas');
  const ctx = lienzo.getContext('2d');

  escalarLienzo(lienzo, ctx);
  lienzo.className = 'onda';
  ctx.strokeStyle = '#32a852';
  ctx.lineWidth = '2';
  ctx.setTransform(1, 0, 0, 1, 0, alto + 2);
  ctx.beginPath();
  ctx.moveTo(onda[0].x, onda[0].y);

  onda.forEach((punto, i) => {
    if (i === 0) {
      ctx.moveTo(punto.x, punto.y);
    } else {
      ctx.lineTo(punto.x, punto.y);
    }
  });

  ctx.stroke();

  contenedor.appendChild(lienzo);
}

// Basado en https://codepen.io/Sphinxxxx/pen/QmdGPW
function crearFila(ondas, idx, lienzoOriginal, contenedor) {
  const lienzo = document.createElement('canvas');

  const ctx = lienzo.getContext('2d');
  lienzo.className = 'lineaLetras';
  const onda = ondas[idx];
  let onda0 = null;

  if (idx > 0) {
    onda0 = ondas[idx - 1];
  }

  escalarLienzo(lienzo, ctx);
  for (let i = 0; i < onda.length - 2; i++) {
    // for (let i = 0; i < 8; i++) {
    const puntoA = onda[i];
    const puntoB = onda[i + 1];
    let puntoA0, puntoB0, yMax0;
    let yMax = Math.max(puntoA.y, puntoB.y);
    // ctx.fillStyle = generateHslaColors(100, yMax, 1, aleatorioInteger(360))

    if (idx > 0) {
      puntoA0 = onda0[i];
      puntoB0 = onda0[i + 1];
      yMax0 = Math.max(puntoA0.y, puntoB0.y);
    }

    const desplazarX = i * anchoSeccion;
    const centroSeccion = anchoSeccion / 2;

    const centro = new Punto(desplazarX + centroSeccion, alto / 2);
    // const centro = puntoA.centroCon(puntoB);
    // console.log(centro, puntoA.centroCon(puntoB));

    // const esquinas = [
    //   new Punto(puntoA.x, 0), // superior izquierda
    //   new Punto(puntoB.x, 0), // superior derecha
    //   new Punto(puntoA.x + (puntoB.x - puntoA.x) / 2, yMax / 2), //centro
    //   puntoA, // inferior izquierda
    //   puntoB, // inferior derecha
    // ];

    let esquinas = [];
    if (idx > 0) {
      const centroY = (puntoA0.y - alto + puntoB0.y - alto + puntoA.y + puntoB.y) / 4; //(yMax+yMax0)/2-alto/2
      // aplique la curva inferior desde la línea de arriba hasta la parte superior de esta línea
      esquinas = [
        new Punto(puntoA.x, puntoA0.y - alto), // superior izquierda top left
        new Punto(puntoB.x, puntoB0.y - alto), // superior derecha top right
        new Punto(puntoA.x + (puntoB.x - puntoA.x) / 2, centroY), //centro puntoA.x + (puntoB.x - puntoA.x)
        new Punto(puntoA.x, puntoA.y), // inferior izquierda bottom left
        new Punto(puntoB.x, puntoB.y), // inferior derecha bottom right
      ];
    } else {
      esquinas = [
        new Punto(puntoA.x, 0), // superior izquierda top left
        new Punto(puntoB.x, 0), // superior derecha top right
        new Punto(puntoA.x + (puntoB.x - puntoA.x) / 2, yMax / 2), //centro
        new Punto(puntoA.x, puntoA.y), // inferior izquierda bottom left
        new Punto(puntoB.x, puntoB.y), // inferior derecha bottom right
      ];
    }

    // Sin distorsión para revisar que pinte normal

    // const esquinas = [
    //   new Punto(desplazarX, 0),
    //   new Punto(desplazarX + anchoSeccion, 0),
    //   new Punto(desplazarX + centroSeccion, alto / 2),
    //   new Punto(desplazarX, alto),
    //   new Punto(desplazarX + anchoSeccion, alto),
    // ];
    pintar(esquinas, centro, desplazarX);
  }

  contenedor.appendChild(lienzo);

  function pintar(esquinas, centro, desplazarX) {
    function pintarTriangulo(f1, f2, f3, d1, d2, d3, desplazarX) {
      const [f1x, f2x, f3x] = expandirTriangulo(f1, f2, f3, 0.3);
      const [d1x, d2x, d3x] = expandirTriangulo(d1, d2, d3, 0.3);

      pintarSeccion(ctx, f1x, f2x, f3x, d1x, d2x, d3x, desplazarX);
    }

    /**
     * Triangulo izquierda
     * >
     */

    pintarTriangulo(
      new Punto(desplazarX, 0),
      centro,
      new Punto(desplazarX, alto),
      esquinas[0],
      esquinas[2],
      esquinas[3],
      desplazarX
    );

    /**
     * Triangulo superior
     * \/
     */
    pintarTriangulo(
      new Punto(desplazarX, 0),
      centro,
      new Punto(anchoSeccion + desplazarX, 0),
      esquinas[0],
      esquinas[2],
      esquinas[1],
      desplazarX
    );

    /**
     * Triangulo derecha
     * <
     */
    pintarTriangulo(
      new Punto(anchoSeccion + desplazarX, 0),
      centro,
      new Punto(anchoSeccion + desplazarX, alto),
      esquinas[1],
      esquinas[2],
      esquinas[4],
      desplazarX
    );

    /**
     * Triangulo inferior
     *  /\
     */
    pintarTriangulo(
      new Punto(desplazarX, alto),
      centro,
      new Punto(anchoSeccion + desplazarX, alto),
      esquinas[3],
      esquinas[2],
      esquinas[4],
      desplazarX
    );
  }

  /**
   * Pinta el triangulo a partir de 3 puntos de fuente y 3 puntos de destino
   *
   * @param {Object} ctx Contexto del lienzo
   * @param {Punto} f1 Punto 1 del triangulo (fuente)
   * @param {Punto} f2 Punto 2 del triangulo (fuente)
   * @param {Punto} f3 Punto 3 del triangulo (fuente)
   * @param {Punto} d1 Punto 1 del triangulo (destino)
   * @param {Punto} d2 Punto 2 del triangulo (destino)
   * @param {Punto} d3 Punto 3 del triangulo (destino)
   * @param {number} desplazarX Punto X donde empieza a pintar
   * @returns null
   */
  function pintarSeccion(ctx, f1, f2, f3, d1, d2, d3, desplazarX) {
    const [a, c, e] = calcularTranformacionLineal(f1, d1.x, f2, d2.x, f3, d3.x);
    const [b, d, f] = calcularTranformacionLineal(f1, d1.y, f2, d2.y, f3, d3.y);
    const x1 = desplazarX;
    const x2 = anchoSeccion + desplazarX;
    // console.log(x1,x2)
    ctx.imageSmoothingQuality = 'high';
    // ctx.shadowColor = 'white';
    // ctx.shadowBlur = 5;
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = 'white';
    // ctx.filter = 'drop-shadow(1px 1px 1px white)'
    // ctx.filter = `blur(${1}px)`;

    ctx.save();
    ctx.setTransform(a, b, c, d, e, f + alto - 4);
    ctx.beginPath();
    ctx.moveTo(f1.x, f1.y);
    ctx.lineTo(f2.x, f2.y);
    ctx.lineTo(f3.x, f3.y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(lienzoOriginal, x1, 0, x2, alto, x1, 0, x2, alto);
    ctx.restore();

    // dibujar rojo triángulos y circulos
    // if (contador < 4) {
    //   contador++;
    //   return;
    // } else {
    //   const { radio, centro } = calcularInCirculo(d1, d2, d3);
    //   ctx.setTransform(1, 0, 0, 1, 0, alto);

    //   ctx.beginPath();
    //   ctx.arc(centro.x, centro.y, radio, 0, 2 * Math.PI, false);
    //   ctx.moveTo(d1.x, d1.y);
    //   ctx.lineTo(d2.x, d2.y);
    //   ctx.lineTo(d3.x, d3.y);
    //   ctx.closePath();
    //   ctx.lineWidth = 1;
    //   ctx.strokeStyle = 'rgba(255,0,0, .1)';
    //   ctx.stroke();
    // }
  }
}
let contador = 0;

function escalarLienzo(lienzo, ctx) {
  lienzo.width = ancho;
  lienzo.height = alto;

  // Object.assign(lienzo.style, {
  //   width: `${ancho}px`,
  //   height: `${alto}px`,
  // });
  // lienzo.width = ancho * escalaPantalla;
  // lienzo.height = alto * escalaPantalla;

  // ctx.scale(escalaPantalla, escalaPantalla);
}
