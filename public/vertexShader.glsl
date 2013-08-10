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


const float PI = 3.1415926535897932384626433832795;
const vec3 front = vec3(0,0,-1);

void main() {
 
	vUv = uv;

	vec3 newPosition = position;
	
	float pointRotation;

	//Test if this clipmap is a ring or a circle (is it the bottom level)
	if( last == 1 ) {
		pointRotation = length( newPosition ) * scaledPI ;
	} else {
		pointRotation = length( newPosition ) * scaledPI / 2.0  + scaledPI / 2.0;
	}

	//Find the normal for the front of the sphere and this point
	vec3 axis = normalize( cross( front, newPosition ) );

	vec4 quat = createQuaternionFromAxisAngle( axis, pointRotation );

	//Create a brand new vertex at the prime meridian on the equator and rotate it to its correct position
	newPosition = rotateVector( quat, vec3( 0, 0, radius ) );

	//Now rotate this point to face the camera
	newPosition = rotateVector(meshRotation, newPosition );

	vec3 newNormal = rotateVector(meshRotation, normal);


    float xoffset = ( atan( newPosition.z / newPosition.x )) / (PI * 2.0);   // + scaledPI) / (scaledPI * 2.0) ;
    float yoffset = 1.0 - ( ( ( -1.0 * acos(newPosition.y) ) + PI / 2.0 ) / PI ) ;// / scaledPI ;


	color = texture2D(texture, vec2(xoffset, yoffset));

	newPosition = newPosition;// + newNormal * color.r ;
	
	//Move point back to its relative position to the mesh
	newPosition.z -= radius;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
