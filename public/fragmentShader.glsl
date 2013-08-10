
varying vec2 vUv;
varying vec4 color;
uniform vec3 icolor;
uniform sampler2D texture;
uniform vec4 rotation; 

void main() {
 
		gl_FragColor = vec4( color.rgb, 1.0 );
	//	gl_FragColor = vec4( icolor, 1.0 );

}
