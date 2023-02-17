import './scss/estilos.scss';
import { calcularSemanas, normalizarTexto } from './utilidades/ayudas';
import procesarDatos from './utilidades/procesarDatos';
import tendencias from './datos/tendenciasFiltradas.json';
import { crearTexturaDeLienzo, crearTexturaLineaTiempo } from './utilidades/threeRender';

const conteoMinimo = 14;
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

tendenciasFiltradas.forEach((objPalabra) => {
  const fechas = objPalabra.fechas;
  // Iniciar pesos en 0
  objPalabra.pesos = [...Array(numeroSemanas)].map(() => 0);

  fechas.forEach((fecha) => {
    const pesoI = referenciaSemanas.findIndex((ref) => ref >= fecha);
    objPalabra.pesos[pesoI]++;
  });
});

tendenciasFiltradas = tendenciasFiltradas.filter((t) => {
  const semanasConDatos = t.pesos.filter((p) => p > 0);
  return semanasConDatos.length > 4;
});

tendenciasFiltradas.forEach((t) => {
  t.pesos.forEach((p) => {
    if (pesoMax2 < p) {
      pesoMax2 = p;
    }
  });
});

const fechaInicial = new Date('2020/03/25');
const fechaFinal = new Date('2022/05/15');
const semanasTotal = calcularSemanas(fechaInicial, fechaFinal);
const anchoSemana = 50;
const partesSemana = 50; // 3
const ancho = semanasTotal * anchoSemana;
const pesoMax = 75;
const alto = pesoMax;
const lineaTiempo = document.getElementById('lineaTiempo');

const datos = procesarDatos(semanasTotal, alto, anchoSemana, partesSemana);
const bebas = new FontFace('bebas', 'url(https://fonts.gstatic.com/s/bebasneue/v9/JTUSjIg69CK48gW7PXoo9Wlhyw.woff2)');

function crearLineaPalabra(palabra, onda, idx, ondas) {
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
  const iteracionesPalabra = (ancho / dimsPalabra.width) | 0;
  const grd = ctx.createLinearGradient(0, 0, ancho, 0);
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
  crearTexturaDeLienzo(lienzo, ancho, alto, idx, ondas);

  return lienzo;
}

function aleatorioInteger(max) {
  return Math.floor(Math.random() * (max + 1));
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
    crearLineaPalabra(palabra, onda, i, ondas);

    contenedor.className = 'contenedorPalabra';
    lineaTiempo.appendChild(contenedor);
    i++;
  }
  crearTexturaLineaTiempo(ancho, alto, fechaInicial, fechaFinal, semanasTotal);
});

function escalarLienzo(lienzo) {
  lienzo.width = ancho;
  lienzo.height = alto;
}
