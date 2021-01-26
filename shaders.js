const vertexShader = `
varying vec2 vUv;
varying vec3 vPos;

void main() {
	vUv = uv;
	vPos = position;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPos;

uniform sampler2D uTexture;
uniform float uTime;

void main() {
  float time = uTime * 0.5;
  vec2 repeat = -vec2(12., 3.);
  vec2 uv = fract(vUv * repeat - vec2(time, 0.));

  vec3 texture = texture2D(uTexture, uv).rgb;

  float shadow = clamp(vPos.z / 5., 0., 1.);

  gl_FragColor = vec4(texture * shadow, 1.);
}

`;

module.exports = {
	vert: vertexShader,
	frag: fragmentShader
};