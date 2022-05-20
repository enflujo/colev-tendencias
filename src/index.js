import './scss/estilos.scss';
const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const palabras = [
  'Moverse ',
  'Agua',
  'Colocar',
  'Monumento',
  'Recubrimiento',
  'Anticongelante',
  'Soga',
  'Sensación',
  'Sensación',
  'Clavar',
  'Hogar',
  'Orbitar',
  'Ponerse',
  'Palmera',
  'Pimpollo',
  'Perforar',
  'Almohada',
  'Feo',
  'Himalaya',
  'Tos',
  'Capilla',
  'Sartén',
  'Comerciante',
  'Demente',
  'Quemadura',
  'Pelear',
  'Alfalfa',
  'Colina',
  'Tomar',
  'Enfermo',
];
const datos = {};
const fechaInicial = new Date(2020, 2, 25);
const fechaFinal = new Date(2022, 4, 15);
const distanciaTiempoMs = fechaFinal - fechaInicial;
const semanasTotal = Math.ceil(distanciaTiempoMs / (1000 * 60 * 60 * 24 * 7));
const lineaTiempo = document.getElementById('lineaTiempo');

console.log(fechaInicial, fechaFinal, semanasTotal);

palabras.forEach((palabra) => {
  datos[palabra] = [];

  for (let i = 0; i < semanasTotal; i++) {
    datos[palabra].push(aleatorio(0, 30));
  }
});

for (let palabra in datos) {
  const semanas = datos[palabra];
  const letras = palabra.split('');
  let i = 0;
  const contenedor = document.createElement('div');
  contenedor.className = 'lineaPalabra';

  semanas.forEach((peso, j) => {
    for (let n = 0; n < 4; n++) {
      const span = document.createElement('span');
      span.innerText = letras[i].toUpperCase();
      Object.assign(span.style, {
        transform: `scaleY(${peso / 20})`,
        height: `${peso}px`,
      });

      i = (i + 1) % letras.length;
      contenedor.appendChild(span);
    }
  });

  lineaTiempo.appendChild(contenedor);
  console.log(letras);
}
console.log(datos);
