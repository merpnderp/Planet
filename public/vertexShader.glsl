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
uniform float xn;
uniform float xm;
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
	if( last == 1 ) {
		pointRotation = length( newPosition ) * scaledPI ;
	} else {
		pointRotation = length( newPosition ) * scaledPI / 2.0  + scaledPI / 2.0;
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
    t = t * yn + ym;

    float p = atan(newPosition.x, newPosition.z);

    p = p * xn + xm;

    //color = vec4(circlePointPosition.x, pointPosition.y,circlePointPosition.z, 1.0);
	//color = texture2D(texture, vec2(p, t));
	color = texture2D(texture, vec2(p, t));



//    float xoffset = ( ( atan( normPosition.z / normPosition.x )) + PI / 2.0 ) / PI;   // + scaledPI) / (scaledPI * 2.0) ;
//n = (c - d) / (a - b), and m = c - a * n,
//a = -1.57 b = 1.57
//c = .25 d = .75
/*
    float p = atan(pointPosition.x, pointPosition.z);
    float t = acos(-1.0 * pointPosition.y);
    n = -1.0 / ( (halfPI - scaledPI) - (halfPI + scaledPI) );
    m = 0.0 - ((halfPI - scaledPI) * n);
    float yoffset =  t * n + m;

    float xscaledPI = scaledPI / cos( utheta - PI / 2.0 );

    //float n = -.5 / ( -scaledPI - scaledPI ) ;
    float n = -.5 / ( -xscaledPI - xscaledPI ) ;
    float m = .25 - (-xscaledPI * n);
    float xoffset =  ( atan( pointPosition.x, pointPosition.z ) ) * n + m;

//n = (c - d) / (a - b), and m = c - a * n,
//a = 0 b = 3.14
//c = 0 d = 1

	color = texture2D(texture, vec2(xoffset, yoffset));

*/
	//newPosition = newPosition + newNormal * (1.0/color.r)*50000.0;

	//Move point back to its relative position to the mesh
	newPosition *= radius;
	newPosition.z -= radius;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
