const { writeFileSync } = require('fs');
/**
 * Convierte texto: sin mayúsculas, tildes o espacios alrededor;
 *
 * @param texto Texto a convertir
 * @returns Texto sin mayúsculas, tildes o espacios alrededor.
 */
const normalizarTexto = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
/**
 * Guardar datos localmente en archivo .json
 * @param {Object} json Datos que se quieren guardar en formato JSON.
 * @param {String} nombre Nombre del archivo, resulta en ${nombre}.json
 */
const guardarJSON = (json, nombre) => {
  writeFileSync(`./src/datos/${nombre}.json`, JSON.stringify(json));
};

const tendencias = require('./src/datos/tendencias.json');
let fechaA = new Date('2023/01/01');
let fechaB = new Date('1970/01/01');

const tendenciasFiltradas = tendencias.filter((obj) => {
  const puntosCommas = /[.,\s]/g;
  obj.palabra = obj.palabra.replace(puntosCommas, '');

  // obj.palabra = obj.palabra.replace(/\\n/g, '');

  // Conectores
  if (obj.palabra.length < 3 || obj.palabrasDespuesLimpieza.length < 3) return;

  // Cualquier tipo de URL
  const regUrls =
    /(http:\/\/|ftp:\/\/|https:\/\/|www\.)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/g;
  if (obj.palabra.match(regUrls)) return;

  // Hashtags o Menciones con @
  if (obj.palabra.match(/([#@]+[a-zA-Z0-9(_)]{1,})/g)) return;

  // Omitir estas palabras
  const regex =
    /\b(que|los|por|del|con|para|las|una|mas|esta|the|como|pero|and|este|hay|sin|nos|tiene|porque|sus|that|les|desde|ese|muy|tan|not|esa|coronavirus|cada|this|mis|puede|would|you|are|han|for|dio|who|all|colombia|covid-related|eso|uno|vez|van|toda|asi|son|estoy|esto|with|pues|lesser)\b/g;
  const normalizado = normalizarTexto(obj.palabra);
  if (normalizado.match(regex)) return;

  if (obj.palabra === '+\n-') return;

  obj.fechas = obj.fechas.map((f) => {
    const fecha = new Date(f);
    fechaA = fecha < fechaA ? fecha : fechaA;
    fechaB = fecha > fechaB ? fecha : fechaB;
    return fecha;
  });
  return true;
});
console.log(fechaA, fechaB);
guardarJSON(tendenciasFiltradas, 'tendenciasFiltradas');
