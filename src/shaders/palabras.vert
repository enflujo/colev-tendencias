#include <packing>
#include <common>
precision highp int;
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
varying vec3 vPos;

uniform sampler2D datosDeformacion;
uniform sampler2D datosDeformacion1;
uniform float tiempo;
uniform float selected; 

void main() {
  vec2 deformacion = texture2D(datosDeformacion,vec2(uv.x,0.0)).xy;
  vec2 deformacion1 = texture2D(datosDeformacion1,vec2(uv.x,0.0)).xy;

  vUv = uv;
  vPos = position;
  if(position.y<0.5){
      vPos.y -= deformacion.y*100.0; //*(1.0+sin(0.5*tiempo)*sin(0.5+0.5*tiempo));
      vPos.z += deformacion.y*50.0*sin(0.5*tiempo)+selected*50.0;
  }
  if(position.y>0.5){
      vPos.y -= deformacion1.y*100.0; //*(1.0+sin(0.5*tiempo)*sin(0.5+0.5*tiempo));
      vPos.z += deformacion.y*50.0*sin(0.5*tiempo)+selected*50.0;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos, 1.0 );
}