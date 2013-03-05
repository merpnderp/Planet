varying vec2 vUv;
uniform vec4 rotation;
uniform float radius;
uniform float minTheta;
uniform float maxTheta;

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

float percentOfTheta( ) {
	//return ( distance(vec3(0.0, 0.0, 0.0), position) )  / radius;
	return length(position) / radius;
}

void main() {
 
	vUv = uv;
	vec3 newPosition = position;

	float percent = percentOfTheta();

//	float a = acos ( dot ( vec3(0,0,1), position) / ( length(position) ) ) / 1.57;

	percent = pow(percent, 100.0);
	percent = pow(percent, .01);

	float rot = ( ( maxTheta - minTheta ) * percent ) + minTheta;

	vec4 quat = createQuaternionFromAxisAngle( normalize( cross( vec3(0,0,1), position ) ), rot);
	newPosition = rotateVector( quat, vec3(0,0,radius));

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
