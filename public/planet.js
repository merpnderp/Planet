var so = so || {};


so.Planet = function( _camera, _radius, _position, _segments ) {

	var me = this;
	
	me.obj = new THREE.Object3D();
	me.obj.position = _position;
	var camera = _camera;
	var radius = _radius;
	var segments = _segments;

	var fragmentShader;
	var vertexShader;

	var circleGeo = new THREE.RingGeometry(.00001, radius, segments, segments, 0, Math.PI * 2);
	var ringGeo = new THREE.RingGeometry(radius, radius * 2, segments, segments, 0, Math.PI * 2);
	[circleGeo, ringGeo].forEach( function(g) {
		g.vertices.forEach( function(v) {
			v.z = radius;
			v.setLength(radius);
		});
	});
	

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

	var rotate = -Math.PI/2;
	var clock = new THREE.Clock();

	me.update = function( ) {
		
		var delta = clock.getDelta();
		rotate += delta;
		if( rotate > Math.PI/2){rotate = -Math.PI /2;}
		//me.obj.rotation = new THREE.Vector3( rotate, 0, 0 );

		if(! inited){ return; }

		var cameraDistance = camera.position.distanceTo(me.obj.position);
		
		var localCam = camera.position.clone();
		me.obj.worldToLocal(localCam);

		//q =tan-1(y/(z2+x2)1/2)
		var theta = Math.atan( localCam.y / Math.pow( localCam.z * localCam.z + localCam.x * localCam.x, .5 ) ) + Math.PI/2;

		//f = tan-1(x/z).
		var phi = Math.atan( localCam.x / localCam.z );

		$('#info').html("phi: " + phi + "<br/>theta: "  +theta + "<br/>rotation: " + rotate);
	}

};

















