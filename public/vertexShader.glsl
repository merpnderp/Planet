#define pi 3.141592653589793238462643383279
varying vec2 vUv;
uniform vec4 rotation;
uniform float radius;
uniform float scale;
uniform int last;

vec3 rotateVector( vec4 quat, vec3 vec ){
	return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

vec4 createQuaternionFromAxisAngle( vec3 axis, float angle ) {
	
	vec4 quat;

	float halfAngle = angle / 2.0;
	float s = sin( halfAngle );
	
	quat.x = axis.x * s;
	quat.y = axis.y * s;
	quat.z = axis.z * s;
	quat.w = cos( halfAngle );
	
	return quat;

}

void main() {
 
	vUv = uv;
	vec3 newPosition = position;

	float scal = 1.0 / pow( 2.0, scale );

//	float	rot = ( length(position) / radius ) * (pi/2.0 * scal) + (pi/2.0 * scal);
	float rot;
	if(last == 1){
		rot = ( length(position) / radius ) * (pi/2.0 * scal);
	}else{
		rot = ( length(position) / radius ) * (pi/2.0 * scal) + (pi/2.0 * scal);
	}

	vec4 quat = createQuaternionFromAxisAngle( normalize( cross( vec3(0,0,1), position ) ), rot);
	newPosition = rotateVector( quat, vec3(0,0,radius));
	
	newPosition = rotateVector( rotation, newPosition);


	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
