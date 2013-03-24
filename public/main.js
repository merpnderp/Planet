

var so = so || {};

function start(){   
	
//	var radius = 200,
	var radius = 6353000,
//	var radius = 10000,
	fov = 30,
    stats = new Stats();

    stats.setMode( 0 );
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    stats.domElement.style.width = '90px';
    document.body.appendChild( stats.domElement );

    container = document.getElementById( "container" );

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera( 
        fov, 
        window.innerWidth / window.innerHeight, 
        .01, 
        1000000000);

//   camera.position.x = radius;
 //  camera.position.y = radius;
   camera.position.z = 2;

//    var controls = new THREE.FirstPersonControls(camera);

	var controls = new THREE.FlyControls( camera );
        controls.movementSpeed = radius / 1;
//        controls.domElement = container;
        controls.domElement = document;
//        controls.rollSpeed = Math.PI / 24; 
        controls.rollSpeed = Math.PI / 3; 
        controls.autoForward = false;
        controls.dragToLook = false; 
		
    scene.add( camera );

//	camera.lookAt(new THREE.Vector3(0,radius*3,radius));

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth-9, window.innerHeight-9);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = 0 + "px";
    renderer.domElement.style.left = "0px";
    container.appendChild( renderer.domElement );
/*
    var controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];
*/ 

    var thetas = 20, phis = 20, 
    wf = true, 
    step = 1, count = 0;
    var mod = Math.random();
    var start = 0;
    var end = step;
    var colors = [0xFF0000, 0x0000FF, 0x00FF00];
    for(var i = 0; i <= 3; i++){
        var oradius = end + i * step;
        var iradius = start + i * step;
        var cgeo = new THREE.RingGeometry(iradius, oradius, thetas, phis, 0, Math.PI * 2);//10, 5, Math.PI, Math.PI);
		count += cgeo.vertices.length
        var c = new THREE.Mesh(cgeo, new THREE.MeshPhongMaterial( { color: colors[ i % 3], specular: 0xffaa00, shininess: 5, wireframe: wf } )); 
//        scene.add(c);
    }
//$('#info').append(count);
//$('#info').append('<br/>hi');
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ); 
    directionalLight.position.set( 2, 2, 10 ); 
    scene.add( directionalLight );

	var solarSystem = new THREE.Object3D();
	var planet = new so.Planet(camera, radius, new THREE.Vector3(), 52, fov, window.innerWidth, renderer);

	camera.lookAt( planet.obj.position );

	solarSystem.add(planet.obj);

	var axis = new THREE.AxisHelper( radius * 100 );
	axis.position = planet.obj.position;
	solarSystem.add(axis);
	var pipe = radius / 50;
	var Y = new THREE.Mesh( new THREE.CylinderGeometry (pipe, pipe, radius * 100) );
	var X = new THREE.Mesh( new THREE.CylinderGeometry (pipe, pipe, radius * 100) );
	var Z = new THREE.Mesh( new THREE.CylinderGeometry (pipe, pipe, radius * 100) );
	X.rotation.z += Math.PI/2;
	Z.rotation.x += Math.PI/2;
	Y.position.z -= radius;
	X.position.z -= radius;
	Z.position.z -= radius;
	solarSystem.add(Y);
	solarSystem.add(X);
	solarSystem.add(Z);
	scene.add(solarSystem);
	var clock = new THREE.Clock();
	var delta, logLimiter = 0;

    function render(){
		delta = clock.getDelta();
		controls.update( delta );
		logLimiter++;
		if( logLimiter % 180 == 0 ) {
			var r = 
				"programs: " + renderer.info.memory.programs + 
				"<br />geometries: " + renderer.info.memory.geometries + 
				"<br />textures: " + renderer.info.memory.textures + 
				"<br />calls: " + renderer.info.render.calls + 
				"<br />vertices: " + renderer.info.render.vertices + 
				"<br />faces: " + renderer.info.render.faces + 
				"<br />points: " + renderer.info.render.points + 
				"<br />camera x: " + camera.position.x + 
				"<br />camera y: " + camera.position.y + 
				"<br />camera z: " + camera.position.z + 
				"<br />"; 

			$('#render').html(r);
			logLimiter = 0;
		} 
        renderer.render( scene, camera );
        requestAnimationFrame( render );
        stats.update();
		if(camera.position.length() > 100){
			var t = new THREE.Vector3(0,0,0);
			t.subVectors(camera.position, t);
			solarSystem.position.sub(t);
			camera.position.x = 0;
			camera.position.y = 0;
			camera.position.z = 0;
		}

		planet.update();

    }
    render();
};

$(start);
