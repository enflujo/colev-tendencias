#include <packing>
#include <common>

precision highp int;
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
// uniform float ancho;
// uniform float alto;
uniform sampler2D textura;
// uniform float tiempo;
// uniform float selected;



void main() {
  // vec2 screenCoord = gl_FragCoord.xy/vec2(ancho, alto);
  vec3 col = texture2D(textura,vec2(vUv)).rgb;
  float a = 1.0;
  if((col.r < 0.01) && (col.g < 0.01) && (col.b < 0.01)){
    a = 0.0;
  }
  gl_FragColor = vec4(col*0.75,a);
}