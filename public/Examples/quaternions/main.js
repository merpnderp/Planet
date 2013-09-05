


function start(){

    var fov = 30, 
    stats = new Stats(),
	radius = 100;

    stats.setMode( 0 );
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    stats.domElement.style.width = '90px';
    document.body.appendChild( stats.domElement );

	var container = document.getElementById( "container" );
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 
        fov, 
        window.innerWidth / window.innerHeight, 
        .1, 
        1000000000);

    camera.position.z = radius * 2;
    camera.position.y = radius * 1;
    camera.position.x = radius * 1;

 	var controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];

    scene.add( camera );
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 2, 2, 10 );
	scene.add( directionalLight );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth-9, window.innerHeight-9);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = 0 + "px";
    renderer.domElement.style.left = "0px";
    container.appendChild( renderer.domElement );


	scene.add(new THREE.AxisHelper(100));
	

	var sunGeo = new THREE.SphereGeometry(radius/10);
	var sun = new THREE.Mesh(sunGeo, new THREE.MeshPhongMaterial( { color: 0xFFFF00, specular: 0xffaa00, shininess: 5 } ) );	
	var earthGeo = new THREE.SphereGeometry(radius/30);
	var earth = new THREE.Mesh(earthGeo, new THREE.MeshPhongMaterial( { color: 0x0000FF, specular: 0xffaa00, shininess: 5 } ) );	
	var moonGeo = new THREE.SphereGeometry(radius/80);
	var moon = new THREE.Mesh(moonGeo, new THREE.MeshPhongMaterial( { color: 0x808080, specular: 0xffaa00, shininess: 5 } ) );

/*	var poleGeo = new THREE.CylinderGeometry(.1,.1,30);
	var sunPole = new THREE.Mesh(poleGeo);
	var earthPole = new THREE.Mesh(poleGeo);
	var moonPole = new THREE.Mesh(poleGeo);
	sun.add(sunPole);
	earth.add(earthPole);
	moon.add(moonPole);*/
	
	sun.position.x += radius/5;
	sun.add(new THREE.AxisHelper(radius/3));
	earth.position.x += radius/1.5;
	earth.add(new THREE.AxisHelper(radius/10));
	moon.position.x += radius/1.3;
	moon.add(new THREE.AxisHelper(radius/10));
/*	
	earth.rotation.x += .5;
*/

	sun.useQuaternion = true;
	earth.useQuaternion = true;
	moon.useQuaternion = true;

	var eq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), .48);
	var neq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), -.48);
	earth.quaternion.multiply(eq);
	moon.quaternion.multiply(neq);
		

	scene.add(sun);
	scene.add(earth);
	scene.add(moon);
//	sun.add(earth);
//	earth.add(moon);


	var clock = new THREE.Clock(), delta;
	var x = 1;
	function render(){
		delta = clock.getDelta();
	
		logText = '';
		log('sun initial position', sun.position);
//		log('sun rotation', sun.rotation);
		log('earth initial position', earth.position);
//		log('earth rotation', earth.rotation);
		log('moon initial position', moon.position);
//		log('moon rotation', moon.rotation);
/*

		sun.rotation.y += delta * .2;
		earth.rotation.y += delta * .6;
		moon.rotation.y += delta * .2;
*/
		var sunEq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 4 * delta);
		sun.quaternion.multiply(sunEq);


//		var earthEq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 2 * delta);
//		earth.quaternion.multiply(earthEq);
		
		var moonEq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 8 * delta);
		moon.quaternion.multiply(moonEq);
		
		earthEq = getRotateAround( earth, sun, new THREE.Vector3(0,0,1), Math.PI / 3 * delta );			
		sun.worldToLocal(earth.position);
		sun.localToWorld(earth.position.applyQuaternion(earthEq));

		var tMoon = getRotateAround( moon, sun, new THREE.Vector3(0,0,1), Math.PI / 3 * delta );			
		sun.worldToLocal(moon.position);
		sun.localToWorld(moon.position.applyQuaternion(tMoon));
		
		var fMoon = getRotateAround( moon, earth, new THREE.Vector3(0,0,1), Math.PI / 3 * delta );			
		earth.worldToLocal(moon.position);
		earth.localToWorld(moon.position.applyQuaternion(fMoon));

//		earth.quaternion.multiply(earthEq);
		
//		var moonEq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 4 * delta);
//		moon.quaternion.multiply(moonEq);


		renderer.render( scene, camera );
		requestAnimationFrame( render );

		controls.update();
		stats.update();

		$('#info').html(logText);
	}


	render();
			

};


function getRotateAround( a, b, axis, angle) {
	var ap = a.position.clone();
	b.worldToLocal(ap);

	axis.cross(ap).normalize();
	var negation = axis.x + axis.y + axis.z;
	return new THREE.Quaternion().setFromAxisAngle(axis, (negation * angle));

	return a;
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

$(start);


