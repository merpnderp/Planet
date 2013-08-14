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
float halfPI = PI/2.0;
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

    vec3 pointPosition = normalize(vec3(newPosition));

	//Now rotate this point to face the camera
    newPosition = rotateVector(meshRotation, newPosition );

	vec3 newNormal = rotateVector(meshRotation, normal);

    vec3 normPosition = normalize(newPosition);

    //First find theta for the pointPosition
    float t = acos(pointPosition.y);

    //Then find mercator offset and phi
    float mercatorMod = cos(t - PI / 2.0);
    float p= atan(pointPosition.x, pointPosition.z);
    p /= mercatorMod;////////////////////////Need to find this for actual theta not this point's theta

    //Now scale theta inbetween scaledPI
    float n = (0.0 - 1.0 ) / (-scaledPI - scaledPI);
    float m = scaledPI * n;
    t = t * n + m;

    //Now scale phi between scaledPI modified by mercatorMod
    float mscaledPI = scaledPI / mercatorMod;
    n = (0.0 - 1.0) / (-mscaledPI - mscaledPI);
    m = mscaledPI * n;
    p = p * n + m;

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
	newPosition.z -= radius;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
