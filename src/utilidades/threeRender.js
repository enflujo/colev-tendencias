import {
  AdditiveBlending,
  CanvasTexture,
  ClampToEdgeWrapping,
  Clock,
  Color,
  DataTexture,
  DoubleSide,
  FloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  UVMapping,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import fragmento from '../shaders/palabras.frag?raw';
import vertices from '../shaders/palabras.vert?raw';

const escena = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.z = 1000;
camera.zoom = 0.5;

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = sRGBEncoding;
renderer.antialias = true;
renderer.logarithmicDepthBuffer = true;
document.getElementById('renderizador').appendChild(renderer.domElement);

var lookAt = new Vector3();
const clock = new Clock();
window.addEventListener('resize', onWindowResize);
var mouseX = 0,
  mouseY = 0;
var elapsedTime = clock.getElapsedTime();
var materials = [];
var planos = [];
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const raycaster = new Raycaster();
const pointer = new Vector2();

const bloomParams = {
  exposure: 0.1,
  bloomStrength: 0.5,
  bloomThreshold: 0.35,
  bloomRadius: 0.5,
};

const renderScene = new RenderPass(escena, camera);
const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = bloomParams.bloomThreshold;
bloomPass.strength = bloomParams.bloomStrength;
bloomPass.radius = bloomParams.bloomRadius;
let composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

document.getElementById('renderizador').onmousemove = function (evento) {
  mouseX = evento.clientX - window.innerWidth / 2; // Gets Mouse X.
  mouseY = evento.clientY - window.innerHeight / 2; // Gets Mouse Y.
  pointer.x = (evento.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(evento.clientY / window.innerHeight) * 2 + 1;
};

addEventListener('wheel', (evento) => {
  camera.position.z = clamp(camera.position.z + evento.deltaY, 1, 5000);
  camera.updateProjectionMatrix();
});

document.addEventListener('pointerdown', () => {
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);
  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(escena.children);
  for (let i = 0; i < intersects.length; i++) {
    let val = intersects[i].object.material.uniforms.selected.value;

    if (val != 1.0) {
      intersects[i].object.material.uniforms.selected.value = 1.0;
    }
    if (val != 0.0) {
      intersects[i].object.material.uniforms.selected.value = 0.0;
    }
    intersects[i].object.material.uniformsNeedUpdate = true;
  }
});

export function crearTexturaDeLienzo(lienzo, ancho, alto, idx, ondas) {
  const textura = new CanvasTexture(
    lienzo,
    UVMapping,
    ClampToEdgeWrapping,
    ClampToEdgeWrapping,
    LinearFilter,
    LinearMipmapLinearFilter,
    RGBAFormat,
    FloatType,
    renderer.capabilities.getMaxAnisotropy()
  );
  textura.needsUpdate = true;

  const size = ancho * 1;
  // https://threejs.org/docs/#api/en/textures/DataTexture
  const datosDeformacion = new Uint8Array(4 * size);
  let datosDeformacion1 = new Uint8Array(4 * size);

  let min = 0;
  let max = 100;
  const onda = ondas[idx];
  let onda1;
  for (let i = 0; i < onda.length - 1; i++) {
    const s = i * 4;
    // puntoA
    datosDeformacion[s] = Math.floor(onda[i].x);
    datosDeformacion[s + 1] = clamp(Math.floor(onda[i].y), min, max);
    // // puntoB
    // if(idx>0){
    //     datosDeformacion[s + 2] = Math.floor(onda1[i].x)
    //     datosDeformacion[s + 3] = clamp(Math.floor(onda1[i].y),min,max)
    // }
  }
  if (idx > 0) {
    onda1 = ondas[idx - 1];
    for (let i = 0; i < onda.length - 1; i++) {
      const s = i * 4;
      datosDeformacion1[s] = Math.floor(onda1[i].x);
      datosDeformacion1[s + 1] = clamp(Math.floor(onda1[i].y), min, max);
    }
  } else {
    datosDeformacion1 = datosDeformacion;
  }

  const texturaDeformacion = new DataTexture(datosDeformacion, ancho, 1);
  const texturaDeformacion1 = new DataTexture(datosDeformacion1, ancho, 1);
  texturaDeformacion.needsUpdate = true;
  texturaDeformacion1.needsUpdate = true;
  crearGeometria(textura, texturaDeformacion, texturaDeformacion1, ancho, alto, idx);
  return textura, texturaDeformacion;
}

function crearGeometria(textura, texturaDeformacion, texturaDeformacion1, ancho, alto, idx) {
  const geometria = new PlaneGeometry(ancho, alto, ancho, 2);
  // const material = new THREE.MeshBasicMaterial({color: 0xffffff})//( { map: textura, side: THREE.DoubleSide } );
  let uniforms = {
    textura: { type: 't', value: textura },
    datosDeformacion: { type: 't', value: texturaDeformacion },
    datosDeformacion1: { type: 't', value: texturaDeformacion1 },
    ancho: { value: window.innerWidth.toFixed(2) },
    alto: { value: window.innerHeight.toFixed(2) },
    tiempo: { type: 'f', value: elapsedTime },
    selected: { type: 'f', value: 0.0 },
  };

  materials[idx] = new ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmento,
    vertexShader: vertices,
    precision: 'highp',
    side: DoubleSide,
    transparent: true,
    blending: AdditiveBlending,
    depthTest: false,
    dithering: true,
  });

  planos[idx] = new Mesh(geometria, materials[idx]);
  planos[idx].material.uniformsNeedUpdate = true;

  planos[idx].translateY(-alto * idx);
  escena.add(planos[idx]);
  camera.position.set(0, -(alto * idx) / 2, 1000);
  lookAt = new Vector3(0, -(alto * idx) / 2, 0);
  camera.lookAt(lookAt);

  camera.updateProjectionMatrix();
  renderer.render(escena, camera);
}

export function crearTexturaLineaTiempo(ancho, alto, fechaInicial, fechaFinal, semanasTotal) {
  // crear datos textura para fechas
  const size = ancho * 1;
  const dato = new Uint8Array(4 * size);
  const colA = new Color('rgb(10, 10, 10)');
  let colB = new Color('rgb(100, 52, 255)');
  let diff = ancho / semanasTotal;
  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    if (i % diff < 45) {
      dato[stride] = colA.r * 255;
      dato[stride + 1] = colA.g * 255;
      dato[stride + 2] = colA.b * 255;
      dato[stride + 3] = 255;
    } else {
      dato[stride] = colB.r * 255;
      dato[stride + 1] = colB.g * 255;
      dato[stride + 2] = colB.b * 255;
      dato[stride + 3] = 255;
    }
  }

  const textura = new DataTexture(dato, ancho, 1);
  textura.needsUpdate = true;

  const geometria = new PlaneGeometry(ancho, 215, ancho, 2);
  const material = new MeshBasicMaterial({
    map: textura,
    side: DoubleSide,
    blending: AdditiveBlending,
    precision: 'highp',
  });
  let plano = new Mesh(geometria, material);
  plano.material.uniformsNeedUpdate = true;
  plano.translateY(-alto * (planos.length + 2));
  escena.add(plano);
  renderer.render(escena, camera);

  for (let i = 0; i < semanasTotal; i += 2) {
    const fechaCanvas = document.createElement('canvas');
    const ctx = fechaCanvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    fechaCanvas.className = 'etiqueta';
    fechaCanvas.width = 250;
    fechaCanvas.height = 40;
    ctx.font = `${40}pt bebas`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    // ctx.strokeStyle = 'black'
    // ctx.lineWidth = 2
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 15;
    ctx.shadowOffsetY = 15;
    ctx.shadowBlur = 15;
    const fecha = new Date(fechaInicial);
    fecha.setDate(fecha.getDate() + 7 * i);
    const texto = `${fecha.toDateString().split(' ').slice(1).join(' ')}  `;
    ctx.fillText(texto, 0, 0, 210);
    // ctx.strokeText(texto, 0, 0, 210)

    const texturaFecha = new CanvasTexture(
      fechaCanvas,
      UVMapping,
      ClampToEdgeWrapping,
      ClampToEdgeWrapping,
      LinearFilter,
      LinearMipmapLinearFilter,
      RGBAFormat,
      FloatType,
      renderer.capabilities.getMaxAnisotropy()
    );
    texturaFecha.needsUpdate = true;
    const geometriaFecha = new PlaneGeometry(250, 40, 250, 2);
    const materialFecha = new MeshBasicMaterial({
      map: texturaFecha,
      side: DoubleSide,
      blending: AdditiveBlending,
      precision: 'highp',
    });
    let planoFecha = new Mesh(geometriaFecha, materialFecha);
    planoFecha.translateX(-ancho / 2 + i * diff + 22);
    planoFecha.translateY(-alto * (planos.length + 2) + 30);
    planoFecha.rotateZ(Math.PI / 2);
    escena.add(planoFecha);
    renderer.render(escena, camera);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  camera.position.x = clamp(camera.position.x + mouseX * 0.009, -2500, 2500);
  camera.position.y = clamp(camera.position.y + -mouseY * 0.009, -2500, 700);

  camera.far = camera.position.z + 100;
  camera.near = camera.position.z / 2;
  camera.updateProjectionMatrix();

  for (let i = 0; i < materials.length; i++) {
    planos[i].material.uniforms.tiempo.value = clock.getElapsedTime();
    planos[i].material.uniformsNeedUpdate = true;
  }
  // renderer.render(escena, camera);
  composer.render();
}

animate();
