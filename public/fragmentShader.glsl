
//Rotate a vector by a quaternion
vec3 rotateVector( vec4 quat, vec3 vec ){
    return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}


varying vec2 vUv;
//varying float noise;
//varying float displacement;
//varying vec3 norm;
uniform vec3 icolor;
uniform sampler2D tHeightmap;
uniform vec4 rotation; 


float random( vec3 scale, float seed ){
        return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
//		return fract( sin(abs(displacement) * scale) * 43758.5453 + seed ) ;
//		return 1;
//		return fract( sin( dot( rotateVector(reverseRotation,gl_FragCoord.xyz) + seed, scale ) ) * 43758.5453 + seed ) ;
}
 
void main() {
 
        // get a random offset
        //float r = .01 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );
        // lookup vertically in the texture, using noise and offset
        // to get the right RGB colour
        //vec2 tPos = vec2( 0, 1.0 - 2.3 * noise + r );
//        vec2 tPos = vec2( 0, 1.0 - 2.3 * noise + displacement * .3 );
        //vec2 tPos = vec2( 0, (displacement+2.5)*2.02);
//        vec2 tPos = vec2( 0, (displacement+5.0)*.1);
        
       // vec4 color = texture2D( tHeightmap, tPos );
//        vec4 color = texture2D( tHeightmap, vec2(5,5) );
 
        //gl_FragColor = vec4( color.rgb, 1.0 );
        gl_FragColor = vec4( icolor, 1.0 );

 
}
