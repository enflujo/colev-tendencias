export default class Punto {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  distanciaA(punto) {
    const distanciaX = punto.x - this.x;
    const distanciaY = punto.y - this.y;
    return Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
  }

  anguloA(punto) {
    return Math.atan2(punto.y - this.y, punto.x - this.x);
  }

  centroCon(punto) {
    const angulo = this.anguloA(punto);
    const x = this.x + ((punto.x - this.x) / 2) * Math.cos(angulo);
    const y = this.y + (Math.max(punto.y, this.y) / 2) * Math.sin(angulo);
    return new Punto(x, y);
  }
}
