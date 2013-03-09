

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
        .1, 
        1000000000);

   camera.position.z = radius +2;//* 4;

//    camera.position.x = radius * 2;
//	camera.lookAt( new THREE.Vector3( 0, 0, 0 ));
//    var controls = new THREE.FirstPersonControls(camera);

	var controls = new THREE.FlyControls( camera );
        controls.movementSpeed = radius / 200.5;
//        controls.domElement = container;
        controls.domElement = document;
        controls.rollSpeed = Math.PI / 24; 
        controls.autoForward = false;
        controls.dragToLook = false; 
		
    scene.add( camera );

	camera.lookAt(new THREE.Vector3(0,radius*3,radius));

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

	var planet = new so.Planet(camera, radius, new THREE.Vector3(), 50, fov, window.innerWidth);
var center = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.00));
//center.position.x = radius * 2; 
//center.position.z = radius;
scene.add(center);
//planet.obj.position.x = radius * 2; 
//planet.obj.position.z = radius * -1;//0;
center.position.z = planet.obj.position.z;
//controls.target =  planet.obj.position;
	scene.add(planet.obj);

	scene.add(new THREE.AxisHelper(radius * 10));

	var clock = new THREE.Clock();
	var delta;

    function render(){
		delta = clock.getDelta();

		planet.update();
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
        
		controls.update( delta );
        renderer.render( scene, camera );
        requestAnimationFrame( render );
        stats.update();

    }
    render();
};

$(start);
