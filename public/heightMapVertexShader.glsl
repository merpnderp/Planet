precision highp float;

varying vec3 pos

void main( void ) {

	pos = position;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
