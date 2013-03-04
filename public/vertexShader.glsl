varying vec2 vUv;
uniform float scale;
uniform vec4 rotation;


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

	float startScale = acos ( dot( vec3(0,0,1), position) / length(position));

//	float adjustScale = scale

	vec4 quat = createQuaternionFromAxisAngle( normalize( cross( vec3(0,0,1), position ) ), -scale);
	
	newPosition = rotateVector( quat, position );

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
