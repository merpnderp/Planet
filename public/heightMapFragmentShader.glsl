//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

  }

float surface( vec4 coord ) {
    float n = 0.0;
    n += 0.7 * abs( snoise( coord ) );
    n += 0.25 * abs( snoise( coord * 2.0 ) );
    n += 0.125 * abs( snoise( coord * 4.0 ) );
    n += 0.0625 * abs( snoise( coord * 8.0 ) );
    return n;
}




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
vec4 qmul(vec4 a, vec4 b) {
	return vec4(cross(a.xyz,b.xyz) + a.xyz*b.w + b.xyz*a.w, a.w*b.w - dot(a.xyz,b.xyz));
}

varying vec3 norm;
varying vec2 vposition;
uniform float scale;
uniform float seed;
uniform float scaledPI;
uniform float rx;
uniform float ry;
uniform float phi;
uniform float theta;
uniform float radius;
/*
uniform float sx;
uniform float sy;
uniform vec2 uscale;
uniform vec2 uoffset;
*/
const float PI = 3.1415926535897932384626433832795;

void main() {
    //calculate offset then scale so that we're working with the same scale numbers

    float utheta = theta - scaledPI < 0.0 ? scaledPI : theta;
    utheta = theta + scaledPI > PI ? PI - scaledPI : utheta;

    vec2 pos = vec2( (vposition.x / (rx/2.0)) * scaledPI * 4.0, ( -1.0 * vposition.y / (ry/2.0)) * scaledPI);

    pos.x += phi;
    pos.y += utheta;

    vec3 coords = vec3( sin(pos.x) * sin(pos.y), cos(pos.y), cos(pos.x) * sin(pos.y) );
//    coords *= radius / 10000000.0;

    float n = surface( vec4( coords, seed ) );

    gl_FragColor = vec4( vec3( n, n, n ), 1.0 );

/*
    vec2 pos = vec2( ( vposition.x + (rx/2.0) ) * scale , ( vposition.y + (ry/2.0) ) * scale );

    //the left of a plane is negative, move it to the right to start at 0
    //pos.x = ( (pos.x + (sx / 2.0 )) * uscale.x ) + uoffset.x;
    //pos.y = ( (pos.y + (sy / 2.0 )) * uscale.y ) + uoffset.y;
    pos.x = pos.x * uscale.x + uoffset.x;
    pos.y = pos.y * uscale.y + uoffset.y;

    pos.x = pos.x > sx ? pos.x - sx : pos.x;
    pos.x = pos.x < 0.0 ? pos.x + sx : pos.x;

    n = surface( vec4( pos.x, pos.y, z, seed ) );

    float m = .01 ;

    vec2 aposition = vec2( ( vposition.x + (rx/2.0) ) , ( vposition.y + (ry/2.0) ) );
    if(aposition.x < .75 *rx + rx * m && aposition.x > .25 * rx - rx * m  && aposition.y < .25 * ry + ry * m && aposition.y > .25 * ry - ry * m){
        n = 1.0;
    }

    gl_FragColor = vec4( vec3( n, n, n ), 1.0 );
*/
}

