var so = so || {};


so.Planet = function( _camera, _radius, _position, _segments, _fov, _screenWidth ) {
	var halfPI = Math.PI/2;
	var quarterPI = Math.PI/4;
	var tau = Math.PI * 2;

	var me = this;
	
	var fragmentShader;
	var vertexShader;

	var position = new THREE.Vector3(0,0,0);

	me.obj = new THREE.Object3D();
	me.obj.position = _position || new THREE.Vector3();

	var camera = _camera;
	var radius = _radius || 6353000;
	var segments = _segments || 20;
	
	var fov = _fov || 30;
	fov = fov * .0174532925;//Convert to radians

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

	var clock = new THREE.Clock(), localCam, cameraDistance, delta, theta, phi;
var logLimiter = 0;
	me.update = function( ) {
		logText = '';

		if(! inited){ return; }
		
		delta = clock.getDelta();
		
		log("planetpos",me.obj.position);
		var tMesh = me.obj.clone();
		tMesh.position.z -= radius;
		tMesh.updateMatrixWorld(false);
		log("adjusted planetpos",tMesh.position);


		localCam = camera.position.clone();
//		localCam.z -= radius;
		log("actualcam",localCam);
		tMesh.worldToLocal(localCam);
		log("localcam",localCam);
		cameraDistance = camera.position.distanceTo(tMesh.position) - radius;
		log('camera distance', cameraDistance);	


		getTheta(localCam.x, localCam.y, localCam.z );
		log("theta", theta);
		getPhi(localCam.x, localCam.z );
		log("phi", phi);

		//Get -radius localToWorld and that's the point to rotate the mesh around

//		var center = planet.obj.localToWorld( new THREE.Vector3(0,0,-radius) );

		//var m = me.obj.matrix.clone();
		var m = new THREE.Matrix4();
		var p = new THREE.Vector3();
		//var p = new THREE.Vector3().getPositionFromMatrix(m);
		//p.z -= radius;
		//m.setPosition(p);
		
//		m.lookAt(camera.position, me.obj.position, me.obj.up);
		m.lookAt(localCam, p, new THREE.Vector3(0,1,0) );
		var tr = m.decompose()[ 1 ].inverse();

		//updateClipMaps(cameraDistance, tr);
		updateClipMaps(cameraDistance, tr);

		/*
		var forward = new THREE.Vector3(0,1,0);
		forward.cross(localCam).normalize();
		var tr = new THREE.Quaternion().setFromAxisAngle(forward, halfPI - theta);
		
		var up = new THREE.Vector3(1,0,1);
		up.cross(localCam).normalize();
		var pr = new THREE.Quaternion().setFromAxisAngle(up, phi);

		var mr = pr.multiplyQuaternions(tr, pr);

		updateClipMaps(cameraDistance, mr);
		*/	

		logLimiter++;
		if( logLimiter % 30 == 0 ) {
			$('#info').html(logText);
			logLimiter = 0;
		}
	}
	
/*
 *
 * Update Clipmaps
 *
 */
	var s, maxTheta, clipMaps = [], i;
	var colors = [0xFF0000, 0x0000FF, 0x00FF00];//red, blue, green
	var wireframe = true;
	
	function initClipMaps( ) {

		clipMaps.length = 0;//empty array of any other clipMaps in case we've been re-init'd runtime
	
		var t = quarterPI;

		for( i = 0; i < clipMapCount; i++ ) {
			var scale = ( 1 / Math.pow( 2, i+1 ) ) ;
			var scaledPI = Math.PI /  2 * scale ;
			clipMaps[i] = {};
			clipMaps[i].material = new THREE.ShaderMaterial( {
				uniforms: { 
/*
					tHeightmap: { // texture in slot 0, loaded with ImageUtils
						type: "t", 
						value: THREE.ImageUtils.loadTexture( 'explosion.png' )
					},  
*/
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
//			clipMaps[i].mesh = new THREE.Mesh(circleGeos[i], new THREE.MeshBasicMaterial({color:'#FF0000'}));
			clipMaps[i].visible = false;
	//		me.obj.add(clipMaps[i].mesh);
//			clipMaps[i].mesh.translateZ(radius);

			t /= 2;//Each successive clipMap covers half as much theta
		}
	}

	function updateClipMaps( height, rotate ) {
		log('radius', radius);
		log('height', height);
		
		//min theta planet pixel size / radius i minimum theta
		var minTheta =  getMinTheta( radius, height );
		log('minTheta', minTheta);
		//max theta
		var maxTheta = getMaxTheta( radius, height );
		log('maxTheta',maxTheta);
		log('clipMapCount', clipMapCount+1);
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
				if(i+1 === clipMapCount || clipMaps[i+1].theta < minTheta ){
					clipMaps[i].material.uniforms.last.value =  1;
				}else{
					clipMaps[i].material.uniforms.last.value =  0;
				}
			}
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

















