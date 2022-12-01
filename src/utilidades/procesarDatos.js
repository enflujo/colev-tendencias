import { aleatorio, pesosAPuntos, puntosACurvas } from './ayudas';

const palabras = [
  'Moverse ',
  'Agua',
  // 'Carechimba',
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

export default (semanasTotal, alto, anchoSeccion, partesSeccion) => {
  const datos = {};

  palabras.forEach((palabra) => {
    datos[palabra] = { pesos: [], puntos: [], onda: [] };

    for (let i = 0; i < semanasTotal; i++) {
      datos[palabra].pesos.push(aleatorio(2, alto));
    }
  });

  // Se necesitan todos los pesos primero antes de crear puntos y la onda
  for (let palabra in datos) {
    const datosPalabra = datos[palabra];
    datosPalabra.puntos = pesosAPuntos(datosPalabra.pesos, anchoSeccion);
    datosPalabra.onda = puntosACurvas(datosPalabra.puntos, 0.5, partesSeccion);
  }
  console.log(datos);
  return datos;
};
