


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

    camera.position.z = radius;

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
	

	var sunGeo = new THREE.SphereGeometry(radius/10);
	var sun = new THREE.Mesh(sunGeo, new THREE.MeshPhongMaterial( { color: 0xFFFF00, specular: 0xffaa00, shininess: 5 } ) );	
	var earthGeo = new THREE.SphereGeometry(radius/30);
	var earth = new THREE.Mesh(earthGeo, new THREE.MeshPhongMaterial( { color: 0x0000FF, specular: 0xffaa00, shininess: 5 } ) );	
	var moonGeo = new THREE.SphereGeometry(radius/80);
	var moon = new THREE.Mesh(moonGeo, new THREE.MeshPhongMaterial( { color: 0x808080, specular: 0xffaa00, shininess: 5 } ) );

	var poleGeo = new THREE.CylinderGeometry(.1,.1,30);
	var sunPole = new THREE.Mesh(poleGeo);
	var earthPole = new THREE.Mesh(poleGeo);
	var moonPole = new THREE.Mesh(poleGeo);
	sun.add(sunPole);
	earth.add(earthPole);
	moon.add(moonPole);
	
	earth.position.x += radius/2;
	moon.position.x += radius/12;
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
	sun.add(earth);
	earth.add(moon);


	var clock = new THREE.Clock(), delta;
	function render(){
		delta = clock.getDelta();
	
		logText = '';
		log('sun position', sun.position);
		log('sun rotation', sun.rotation);
		log('earth position', earth.position);
		log('earth rotation', earth.rotation);
		log('moon position', moon.position);
		log('moon rotation', moon.rotation);
/*

		sun.rotation.y += delta * .2;
		earth.rotation.y += delta * .6;
		moon.rotation.y += delta * .2;
*/
		var sunEq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 4 * delta);
		sun.quaternion.multiply(sunEq);
		
		var earthEq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 4 * delta);
		earth.quaternion.multiply(earthEq);
		
		var moonEq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 4 * delta);
		moon.quaternion.multiply(moonEq);


		renderer.render( scene, camera );
		requestAnimationFrame( render );

		controls.update();
		stats.update();

		$('#info').html(logText);
	}

	render();
			

};


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


