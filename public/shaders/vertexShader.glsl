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
uniform float phi;
uniform float theta;
uniform float top;
uniform float bottom;
uniform float left;
uniform float right;
uniform float yn;
uniform float ym;
uniform vec4 meshRotation;
uniform int last;
varying vec2 vUv;
varying vec4 color;


const float PI = 3.1415926535897932384626433832795;
const float halfPI = 1.5707963267948966;
const vec3 front = vec3(0,0,-1);

void main() {
 
	vUv = uv;

	vec3 newPosition = position;

	float pointRotation;

	//Test if this clipmap is a ring or a circle (is it the bottom level)
	if(pow(position.x,2.0) + pow(position.y, 2.0) > .99){
        pointRotation = length( newPosition ) * scaledPI * 1.01 ;
	}else{
        pointRotation = length( newPosition ) * scaledPI ;
	}

	//Find the normal for the front of the sphere and this point
	vec3 axis = normalize( cross( front, newPosition ) );

	vec4 quat = createQuaternionFromAxisAngle( axis, pointRotation );

	//Create a brand new vertex at the prime meridian on the equator and rotate it to its correct position
	newPosition = rotateVector( quat, vec3( 0.0, 0.0, 1.0) );

    vec3 circlePointPosition = vec3(newPosition.x, newPosition.y, newPosition.z);

	//Now rotate this point to face the camera
    newPosition = rotateVector(meshRotation, newPosition );

//	vec3 newNormal = rotateVector(meshRotation, normal);

//    vec3 normPosition = normalize(newPosition);

    //if scaledPI is 1.57
    //n = 1/PI
    //m = .5

    //First find theta for the pointPosition
    float t = acos(newPosition.y);
    float p = atan(newPosition.x, newPosition.z);

    float mscaled = scaledPI / (1.0 - abs(cos(t)));
    mscaled = mscaled < PI ? mscaled : PI;

    float left = phi - mscaled;
    float right = phi + mscaled;
    float xn = (0.0 - 1.0) / (left - right);
    float xm = -left * xn;
    p = p * xn + xm;

    t = t * yn + ym;

    color = texture2D(texture, vec2(p, t));


	//Move point back to its relative position to the mesh
	newPosition *= radius;
	newPosition = newPosition * (1.0 + color.r / 59.0);
	newPosition.z -= radius;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
