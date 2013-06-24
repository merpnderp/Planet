'use strict'

var halfPI = Math.PI/2;
var quarterPI = Math.PI/4;
var tau = Math.PI * 2;
var TextureProvider = require('./TextureProvider');
var THREE = require('three');
var $ = require('./jquery');

exports = function( _camera, _radius, _position, _segments, _fov, _screenWidth, renderer, updatePlane ) {

	var me = this;

	renderer = renderer ? renderer : new THREE.WebGLRenderer();

	var position = new THREE.Vector3(0,0,0);

	me.obj = new THREE.Object3D();
	me.obj.position = _position || new THREE.Vector3();

//trying to solve clipping issue.
//	var placeHolder = new THREE.Mesh( new THREE.SphereGeometry( radius * 1.3 ) );
//	placeHolder.position.z -= radius;
//	me.obj.add( placeHolder );

	var camera = _camera;
	var radius = _radius || 6353000;
	var segments = _segments || 64;
	
	var fov = _fov || 30;
	fov = fov * .0174532925;//Convert to radians

	var textureProvider = new TextureProvider( renderer, radius, 128, 64, 42 );

	var screenWidth = _screenWidth || 768;
	//tan of fov/screenWidth is first half of pixel size on planet calc
	var vs = Math.tan(fov/screenWidth);

	var smallestTheta;
	function findClipMapCount(){
		smallestTheta = getMinTheta(radius, 2);//smallest theta is 2 units of height
		var i = 0;
		var theta = 100;
		while( theta > smallestTheta){
			i++;
			theta = (1 / Math.pow(2,i) ) * Math.PI;
		}
		var min = 21;
		return i < min ? i : min;
	}

	//Don't resond to update unless init has completed

	var fs = require('fs');
	var fragmentShader = fs.readFileSync('./fragmentShader.glsl');
	var vertexShader = fs.readFileSync('./vertexShader.glsl');
	
	
	initClipMaps();
	
	var clipMapCount = findClipMapCount();
	
	clipMapCount = 20;	
	
	var circleGeo = new THREE.RingGeometry( .000001, radius,  segments, segments, 0, tau ); 


/*
 *
 * Update loop
 *
 */

	var clock = new THREE.Clock(), localCam, cameraDistance, delta = 0, theta, phi, maxTheta, minTheta;
	var heightLock = 2, thetaLock = 0, phiLock = 0;//These are the discrete values we're locking to for the cameras phi/theta to the planet
	var oldHeightLock = 0, oldThetaLock = 0, oldPhiLock = 0;
	
	me.update = function( ) {
		logText = '';

		delta += clock.getDelta();
	
		if(delta >= .1){

			var tMesh = me.obj.clone();
			tMesh.position = tMesh.localToWorld(tMesh.position);
			tMesh.position.z -= radius;
			tMesh.updateMatrixWorld(false);

			localCam = camera.position.clone();
			tMesh.worldToLocal(localCam);
			cameraDistance = camera.position.distanceTo(tMesh.position) - radius;

			getTheta(localCam.x, localCam.y, localCam.z );
			getPhi(localCam.x, localCam.z );

			getHeightLock( cameraDistance );
			minTheta =  getMinTheta( radius, heightLock );
			maxTheta = getMaxTheta( radius, heightLock );
			getPhiLock( );
			getThetaLock( );

			if( oldHeightLock != heightLock || oldPhiLock != phiLock || oldThetaLock != thetaLock ) {
				oldHeightLock = heightLock;	
				oldPhiLock = phiLock;	
				oldThetaLock = thetaLock;	

				var pq = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -phiLock );
				var tq = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), (Math.PI / 2 ) - thetaLock);
				tq.multiply(pq);
				updateClipMaps(heightLock, tq, phi, theta);
	/*
				var m = new THREE.Matrix4();
				var p = new THREE.Vector3();
				m.lookAt(localCam, p, new THREE.Vector3(0,1,0) );
				var tr = m.decompose()[ 1 ].inverse();
				updateClipMaps(heightLock, tr, phi, theta);
	*/
				log('height', cameraDistance);
				log('heightLock', heightLock);
				log('phiSteps', Math.PI * 2 / minTheta);
				log('phiLock', phiLock);
				log("phi", phi);
				log('thetaSteps', Math.PI / minTheta);
				log('thetaLock', thetaLock);
				log("theta", theta);
				log("planetpos",me.obj.position);
				log("adjusted planetpos",tMesh.position);
				log('radius', radius);
				log("actualcam",camera.position);
				log("localcam",localCam);
				log('minTheta', minTheta);
				log('maxTheta',maxTheta);
				log('clipMapCount', clipMapCount+1);
				$('#info').html(logText);
			}
			delta = 0;
		}
	}

	function getPhiLock( ) {
		var max = Math.PI * 2 / minTheta, min = 0, midpoint = max / 2, step = midpoint, tphi = phi + Math.PI;
		var count = 0;
		while( 1 ) {
			step = step / 2;
			step = step == 0 ? 1 : step;

			phiLock = minTheta * midpoint;
		
			if( tphi >= phiLock ) {
				if( tphi < minTheta * (midpoint + 1 ) ) {
					break;
				} else {
					midpoint += step;
				}
			} else {
				midpoint -= step;
			}
		}
		phiLock -= Math.PI;
	}

	function getThetaLock( ) {
		var max = Math.PI / minTheta, min = 0, midpoint = max / 2, step = midpoint;
		var count = 0;
		while( 1 ) {
			step = step / 2;
			step = step == 0 ? 1 : step;

			thetaLock = minTheta * midpoint;
		
			if( theta >= thetaLock ) {
				if( theta < minTheta * (midpoint + 1 ) ) {
					break;
				} else {
					midpoint += step;
				}
			} else {
				midpoint -= step;
			}
		}
	}
	
	function getHeightLock( height ) {
		var max = 30, min = 1, midpoint = Math.round( max / 2), step = midpoint;

		while( 1 ) {
			step = Math.round( step / 2 );
			step = step == 0 ? 1 : step;
			heightLock = Math.pow(2,midpoint);

			if( height < 2 ) {//If we have a negative height, whups
				heightLock = 2;
				break;
			}

			if ( height >= heightLock ) {
				if( midpoint >= max || height < Math.pow(2, midpoint+1) ) {
					break;
				} else {
					midpoint += step ;
				}
			} else {
					midpoint -= step ;
			}
		}
	}
	
/*
 *
 * Update Clipmaps
 *
 */
	var clipMaps = [], i;
	var colors = [0xFF0000, 0x0000FF, 0x00FF00];//red, blue, green
	var scaledPI = [];
	function updateClipMaps( height, rotate ) {
		
		//min theta planet pixel size / radius i minimum theta
		//max theta
		for( var i = 0; i < clipMapCount; i++ ) {
			if( clipMaps[i].visible === false ) {
				if( clipMaps[i].theta < maxTheta && clipMaps[i].theta > minTheta ) {
					me.obj.add(clipMaps[i].mesh);
					clipMaps[i].visible = true;
				}
			} else {
				if( clipMaps[i].theta < minTheta || clipMaps[i].theta > maxTheta ) {
					me.obj.remove(clipMaps[i].mesh);
					clipMaps[i].visible = false;
					continue;
				}
			}
			if(clipMaps[i].visible) {
				log('level: ' + i , ' theta:' + clipMaps[i].theta);
				clipMaps[i].material.uniforms.meshRotation.value = rotate ;
				//clipMaps[i].material.uniforms.texture = textureProvider.getTexture( rotate, scaledPI[i] ); 
				if(i === 0){
					clipMaps[i].material.uniforms.texture.value = textureProvider.getTexture( rotate, scaledPI[i] ); 
					var text = textureProvider.getTexture( rotate, scaledPI[i] ); 
					var pmat = new THREE.MeshBasicMaterial( { map: text } );
					var p = new THREE.Mesh( new THREE.PlaneGeometry(radius/2, radius/2, 128, 64 ), pmat);
					p.position.z = radius;
					updatePlane(p);
				}
				if(i+1 === clipMapCount || clipMaps[i+1].theta < minTheta ){
					clipMaps[i].material.uniforms.last.value =  1;
				}else{
					clipMaps[i].material.uniforms.last.value =  0;
				}
			}
		}
	}

	
	function initClipMaps( ) {

		clipMaps.length = 0;//empty array of any other clipMaps in case we've been re-init'd runtime
	
		var t = quarterPI;
		var scale;
		for( i = 0; i < clipMapCount; i++ ) {

			scale = ( 1 / Math.pow( 2, i+1 ) ) ;
			scaledPI[i] = Math.PI /  2 * scale ;
			clipMaps[i] = {};

			clipMaps[i].material = new THREE.ShaderMaterial( {
				uniforms: { 
					texture: { // texture in slot 0, loaded with ImageUtils
						type: "t", 
						value: undefined
					},  
					meshRotation: { 
						type: "v4",
						value: new THREE.Vector4(0,0,0,0),
					},
					icolor: {
						type: "c",
						value: new THREE.Color(colors[i % 3]),
					},
					scaledPI: {
						type: "f",
						value: scaledPI[i]
					},
					radius: {
						type: "f",
						value: radius 
					},
					last: {
						type: "i",
						value: 0 
					},
				},

				vertexShader: vertexShader,
				fragmentShader: fragmentShader

			} );	

			clipMaps[i].theta = t;
			clipMaps[i].mesh = new THREE.Mesh(circleGeo, clipMaps[i].material);
			clipMaps[i].visible = false;

			t /= 2;//Each successive clipMap covers half as much theta
		}
	}



/*
 *
 * Helper functions
 * 
 */
	function getMaxTheta( radius, height ) {
		var mt = Math.acos( radius / (radius + height ) );	
		return mt < halfPI ? mt : halfPI;
	}
	
	function getMinTheta( radius, height ) {
		var lt = ( (height * vs) / radius ) * segments;//multiply by segments because this is theta per triangle
		lt = lt < quarterPI ? lt : quarterPI;
		return lt < 0 ? smallestTheta : lt;
	}

	function getTheta( x, y, z) {
		//q =tan-1(y/(z2+x2)1/2)
		theta = Math.PI / 2 - Math.atan( y / Math.pow( z * z + x * x, .5 ) );
	}

	function getPhi( x,z ) {
		//f = tan-1(x/z).
		phi = Math.atan( localCam.x / localCam.z );
		//Now adjust for special cases
		if(localCam.x < 0 && localCam.z < 0){
			phi -= Math.PI;
		}else if(localCam.z < 0){
			phi += Math.PI;
		}
	}

	//Simple log function
	var logText;
	function log(s, t){
		if(t instanceof THREE.Vector3){
			logText += s + ": x " + t.x + ", y " + t.y + ", z " + t.z; 
		}else{
			logText += s + ": " + t;
		}
		logText += "<br />";
	}
};
