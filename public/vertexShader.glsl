precision highp float;


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


uniform sampler2D texture;
uniform float scaledPI;
uniform float radius;
uniform vec4 meshRotation;
uniform int last;
varying vec2 vUv;
varying vec4 color;
vec3 front = vec3(0,0,1);

void main() {
 
	vUv = uv;

	vec3 newPosition = position;
	
	float pointRotation;

	//Test if this clipmap is a ring or a circle (is it the bottom level)
	if( last == 1 ) {
		pointRotation = ( length(newPosition) / radius ) * scaledPI ;
	} else {
	    //Push all points in
		pointRotation = ( length(newPosition) / radius ) * scaledPI / 2.0  + scaledPI / 2.0;
	}

	//Find the normal for the front of the sphere and this point
	vec3 axis = normalize( cross( front, newPosition ) );

	vec4 quat = createQuaternionFromAxisAngle( axis, pointRotation );

	//Create a brand new vertex at the prime meridian on the equator and rotate it to its correct position
	newPosition = rotateVector( quat, vec3( 0, 0, radius ) );

	//Now rotate this point to face the camera
	newPosition = rotateVector(meshRotation, newPosition );

	vec3 newNormal = rotateVector(meshRotation, normal);

	//Move point back to its relative position to the mesh
	newPosition.z -= radius;

//	float phi = atan( newPosition.z / newPosition.x ); 
	//float theta = acos( newPosition.y );
//	float theta = atan ( sqrt ( newPosition.y / ( newPosition.x * newPosition.x + newPosition.z + newPosition.z) ) );

//	phi += 3.14;
//	phi = phi / 6.28;

//	theta /= 3.14;

//	float xoffset = phi;
//	float yoffset = theta;

	float xoffset = ((position.x + radius) / (radius * 2.0) ) / 2.0 + .25;
	float yoffset = (newPosition.y + radius) / (radius * 2.0);

	color = texture2D(texture, vec2(xoffset, yoffset));

	newPosition = newPosition + newNormal * color.r ;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
