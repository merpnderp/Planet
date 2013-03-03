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
	fov = fov * .0174532925;

	var screenWidth = _screenWidth || 768;

	//tan of fov/screenWidth is first half of pixel size on planet calc
	var vs = Math.tan(fov/screenWidth);

	var fragmentShader;
	var vertexShader;

	//Create two reused geos
	var minTheta = getMinTheta(radius, 2);
	var smallestCirc = Math.PI * radius * 2 * ( minTheta / (Math.PI / 2) );
	
	var circleGeo = new THREE.RingGeometry(.00001, smallestCirc, segments, segments, 0, Math.PI * 2);
	var ringGeo = new THREE.RingGeometry(smallestCirc, smallestCirc * 2, segments, segments, 0, Math.PI * 2);
	//Project geos to a sphere
	[circleGeo, ringGeo].forEach( function(g) {
		g.vertices.forEach( function(v) {
			v.z = radius;
			v.setLength(radius);
			v.z -= radius;
		});
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

	}
	
	var colors = [0xFF0000, 0x0000FF, 0x00FF00];
	var wireframe = true;
	var c = new THREE.Mesh(circleGeo);//, new THREE.MeshPhongMaterial( { color: colors[ 0 % 3], specular: 0xffaa00, shininess: 5, wireframe: wireframe } ));
	c.translateZ(radius);
	var r = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial( { color: colors[ 0 % 3], specular: 0xffaa00, shininess: 5, wireframe: wireframe } ));
	r.translateZ(radius);
	me.obj.add(c);
	me.obj.add(r);

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


		updateClipMaps(cameraDistance - radius);

		log("smallest theta possible", getMinTheta(radius, 2));

		$('#info').html(logText);
	}

	var s, maxTheta, clipMaps;

	function updateClipMaps( height ) {
		log('radius', radius);
		log('height', height);
		//max theta
		maxTheta = getMaxTheta( radius, height );
		log('maxTheta',maxTheta);
		//min theta planet pixel size / radius i minimum theta
		minTheta =  getMinTheta( radius, height );
		log('minTheta', minTheta);
	}


/*
 *
 * Helper functions
 * 
 */

	function getMaxTheta( radius, height ) {
		return Math.acos( radius / (radius + height ) );	
	}
	function getMinTheta( radius, height ) {
		return (height * vs) / radius;
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

















