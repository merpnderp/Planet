precision highp float;

varying vec2 vUv
varying vec3 pos

void main( void ) {

	pos = position;
	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
