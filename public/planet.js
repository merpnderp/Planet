'use strict'

var so = so || {};

var halfPI = Math.PI/2;
var quarterPI = Math.PI/4;
var tau = Math.PI * 2;

so.Planet = function( _camera, _radius, _position, _segments, _fov, _screenWidth, renderer ) {

	var me = this;
	
	var fragmentShader;
	var vertexShader;

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
	var segments = _segments || 20;
	
	var fov = _fov || 30;
	fov = fov * .0174532925;//Convert to radians

	var textureProvider = new so.TextureProvider( renderer, radius, 42 );

	var screenWidth = _screenWidth || 768;
	//tan of fov/screenWidth is first half of pixel size on planet calc
	var vs = Math.tan(fov/screenWidth);
	
	function findClipMapCount(){
		var minTheta = getMinTheta(radius, 2);//smallest theta is 2 units of height
		var i = 0;
		var theta = 100;
		while( theta > minTheta){
			i++;
			theta = (1 / Math.pow(2,i) ) * Math.PI;
		}
		var min = 21;
		return i < min ? i : min;
	}

	//Don't resond to update unless init has completed
	var inited = false;


	//load shaders before init
	var fileGetter = new so.FileLoader();
	fileGetter.getFiles(['fragmentShader.glsl', 'vertexShader.glsl', 'wireframeFragmentShader.glsl'], init);

	
	function init( files ) {

		fragmentShader = files['fragmentShader.glsl'];
//		fragmentShader = files['wireframeFragmentShader.glsl'];
		vertexShader = files['vertexShader.glsl'];
		inited = true;
		initClipMaps();

	}
	
	var clipMapCount = findClipMapCount();
	
	clipMapCount = 20;	
	
	var circleGeo = new THREE.RingGeometry( .000001, radius,  segments, segments, 0, tau ); 


/*
 *
 * Update loop
 *
 */

	var clock = new THREE.Clock(), localCam, cameraDistance, delta = 0, theta, phi, maxTheta, minTheta;
	var lockHeight = 2;
	
	me.update = function( ) {
		logText = '';

		if(! inited){ return; }
		
		delta += clock.getDelta();
	
		if(delta >= 1){

			var tMesh = me.obj.clone();
			tMesh.position = tMesh.localToWorld(tMesh.position);
			tMesh.position.z -= radius;
			tMesh.updateMatrixWorld(false);

			localCam = camera.position.clone();
			tMesh.worldToLocal(localCam);
			cameraDistance = camera.position.distanceTo(tMesh.position) - radius;


			getTheta(localCam.x, localCam.y, localCam.z );
			getPhi(localCam.x, localCam.z );
			minTheta =  getMinTheta( radius, cameraDistance );
			maxTheta = getMaxTheta( radius, cameraDistance );

			getLockHeight( cameraDistance );	

			//Determine if we need to update clipmaps and to which phi, theta

			var m = new THREE.Matrix4();
			var p = new THREE.Vector3();
			
			m.lookAt(localCam, p, new THREE.Vector3(0,1,0) );
			var tr = m.decompose()[ 1 ].inverse();

			updateClipMaps(lockHeight, tr, phi, theta);

			log('lockHeight', lockHeight);
			log("planetpos",me.obj.position);
			log("adjusted planetpos",tMesh.position);
			log('radius', radius);
			log('height', cameraDistance);
			log("actualcam",camera.position);
			log("localcam",localCam);
			log("theta", theta);
			log("phi", phi);
			log('minTheta', minTheta);
			log('maxTheta',maxTheta);
			log('clipMapCount', clipMapCount+1);
			$('#info').html(logText);
			delta = 0;
		}
	}
	
	function getLockHeight( height ) {
		var max = 30, min = 1, midpoint = Math.floor( max / 2), step = midpoint;

		while( 1 ) {
			step = Math.round( step / 2 );
			step = step == 0 ? 1 : step;
			lockHeight = Math.pow(2,midpoint);

			if( height < 2 ) {//If we have a negative height, whups
				lockHeight = 2;
				break;
			}

			if ( height >= lockHeight ) {
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
				//clipMaps[i].material.uniforms.texture = textureProvider.getTexture( i, phi, theta ); 
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
		var scale, scaledPI;
		for( i = 0; i < clipMapCount; i++ ) {

			scale = ( 1 / Math.pow( 2, i+1 ) ) ;
			scaledPI = Math.PI /  2 * scale ;
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
						value: scaledPI 
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
		return lt < quarterPI ? lt : quarterPI;
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

















