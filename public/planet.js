var so = so || {};


so.Planet = function( _camera, _radius, _position, _segments, _fov, _screenWidth, _clipMapCount ) {

	var me = this;
	
	me.obj = new THREE.Object3D();
	me.obj.position = _position || new THREE.Vector3();

	var camera = _camera;
	var radius = _radius || 6353000;
	var segments = _segments || 20;
	var clipMapCount = _clipMapCount || 10;

	var fov = _fov || 30;
	fov = fov * .0174532925;//Convert to radians

	var screenWidth = _screenWidth || 768;

	//tan of fov/screenWidth is first half of pixel size on planet calc
	var vs = Math.tan(fov/screenWidth);

	var fragmentShader;
	var vertexShader;
	
	var halfPI = Math.PI/2;
	var quarterPI = Math.PI/4;
	var tau = Math.PI * 2;

	//Create two reused geos
//	var smallestTheta = getMinTheta(radius, 2);
//	var smallestCirc = Math.PI * radius * 2 * ( smallestTheta / halfPI );//circumference divided by the percentage of 90 degrees this theta represents
//var smallestCirc = 1;
	var circleGeo = new THREE.RingGeometry( .00000001, radius,  segments, segments, 0, tau );
//	var ringGeo = new THREE.RingGeometry(smallestCirc, smallestCirc * 2, segments, segments, 0, Math.PI * 2);
	//Project geos to a sphere
	//[circleGeo, ringGeo].forEach( function(g) {
	circleGeo.vertices.forEach( function(v) {
			//if(Math.abs(v.y) < 1) v.y = 0.000000000000000;
			//if(Math.abs(v.x) < 1) v.x = 0.000000000000000;
			v.z = 0;
//			v.x += .5;
//			v.y += .5;
//		v.z = radius;
//		v.setLength(radius);
//		v.z -= radius;
	});

	//Don't resond to update unless init has completed
	var inited = false;


	//load shaders before init
	var fileGetter = new so.FileLoader();
	fileGetter.getFiles(['fragmentShader.glsl', 'vertexShader.glsl'], init);

	
	function init( files ) {

		fragmentShader = files['fragmentShader.glsl'];
		vertexShader = files['vertexShader.glsl'];
		inited = true;
		initClipMaps();

	}

/*
 *
 * Update loop
 *
 */

	var clock = new THREE.Clock(), localCam, cameraDistance, delta, theta, phi;
	me.update = function( ) {
		logText = '';

		if(! inited){ return; }
		
		delta = clock.getDelta();
		
		log("planetpos",me.obj.position);

		localCam = camera.position.clone();
		log("actualcam",localCam);
		me.obj.worldToLocal(localCam);
		log("localcam",localCam);
		cameraDistance = camera.position.distanceTo(me.obj.position);
		log('camera distance', cameraDistance);	


		getTheta(localCam.x, localCam.y, localCam.z);
		log("theta", theta);
		getPhi(localCam.x, localCam.z);
		log("phi", phi);

//		log("smallest theta possible", getMinTheta(radius, 2));
		var m = me.obj.matrix.clone();
		m.lookAt(camera.position, me.obj.position, me.obj.up);
		var tr = m.decompose()[ 1 ].inverse();

		updateClipMaps(cameraDistance - radius,tr);

//		$('#info').html(logText);
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
		
		for( i = 0; i < clipMapCount; i++ ) {
			clipMaps[i] = {};
			clipMaps[i].material = new THREE.ShaderMaterial( {
				uniforms: { 
					tHeightmap: { // texture in slot 0, loaded with ImageUtils
						type: "t", 
						value: THREE.ImageUtils.loadTexture( 'explosion.png' )
					},  
					radius: {
						type: 'f',
						value: radius 
					},
					minTheta: {
						type: 'f',
						value: 0.0
					},
					maxTheta: {
						type: 'f',
						value: 0.0
					},
					scale: {
						type: 'f',
						value: 1.0
					},
					rotation: { 
						type: "v4",
						value: new THREE.Vector4(0,0,0,0),
					},
					last: { 
						type: "i",
						value: 0,
					},
					icolor: {
						type: "c",
						value: new THREE.Color(colors[i % 3]),
					},
				},  
				vertexShader: vertexShader,
				fragmentShader: fragmentShader

			} );	

			clipMaps[i].mesh = new THREE.Mesh(circleGeo, clipMaps[i].material);
//			clipMaps[i].mesh = new THREE.Mesh(circleGeo, new THREE.MeshPhongMaterial( { color: colors[ i % 3], specular: 0xffaa00, shininess: 5, wireframe: wireframe } ));
//			clipMaps[i].mesh.translateZ(radius);
			me.obj.add(clipMaps[i].mesh);
		}
	}

	var thetaStep = 0, currentTheta = 0;
	function updateClipMaps( height, rotate ) {
		log('radius', radius);
		log('height', height);
		
		//min theta planet pixel size / radius i minimum theta
		minTheta =  getMinTheta( radius, height );
		log('minTheta', minTheta);
		//max theta
		maxTheta = getMaxTheta( radius, height );
		log('maxTheta',maxTheta);

		thetaStep = ( maxTheta - minTheta ) / clipMapCount;	
		currentTheta = 0;
		for( i = 0; i < clipMapCount; i++ ) {
			clipMaps[i].material.uniforms.rotation.value =  rotate ;
			clipMaps[i].material.uniforms.scale.value =  i+1 ;
			if(i+1 === clipMapCount){
				clipMaps[i].material.uniforms.scale.value =  i ;
				clipMaps[i].material.uniforms.last.value =  1;
			}else{
				clipMaps[i].material.uniforms.last.value =  0;
			}
				
log('minTheta #  ' + (i+1), clipMaps[i].material.uniforms.minTheta.value);
log('maxTheta #' + (i+1), clipMaps[i].material.uniforms.maxTheta.value);
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
		var lt = (height * vs) / radius;
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

















