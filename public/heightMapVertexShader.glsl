varying vec2 vposition;
varying vec3 norm;

void main(){

	vposition = position.xy;
	norm = normal;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
