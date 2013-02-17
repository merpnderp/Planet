var container,
    renderer,
    scene,
    camera,
    controls,
    planet,
    oldAngles,
    start = Date.now(),
    fov = 60,
    pause = false,
    setRez = 20,
//    radius = 5.913520000 * Math.pow(10,11);//size of sun
//    radius = 149597870700 * 50000;//Size of solar system
    radius = 100;
//    radius = 6378000;
    //set up stats
    
   
var stats = new Stats();
stats.setMode( 0 );
stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    stats.domElement.style.width = '90px';
    document.body.appendChild( stats.domElement );


/*    window.addEventListener('keypress', function(e){
        if(e.charCode === 112){
            pause = ! pause;
        }
        if(! pause){
            render();
            $('#paused').text('');
        }else{
            $('#paused').text('PAUSED');
        }
    });
*/
window.addEventListener( 'load', function() {


    // grab the container from the DOM
    container = document.getElementById( "container" );
    // create a scene
    scene = new THREE.Scene();

    // create a camera the size of the browser window
    // and place it 100 units away, looking towards the center of the scene
    camera = new THREE.PerspectiveCamera( 
        fov, 
        window.innerWidth / window.innerHeight, 
        1, 
        10000000000 );
    camera.position.z = radius*4;
//    camera.position.y = radius*2;
//    camera.position.x = radius;
//    camera.target = new THREE.Vector3( 0, 0, 0 );
    controls = new THREE.FlyControls( camera );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ));
    controls.movementSpeed = radius / .5;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 12;
    controls.autoForward = false;
    controls.dragToLook = false;	

    scene.add( camera );

    // create a wireframe material		
  material = new THREE.ShaderMaterial( {
        uniforms: { 
            tExplosion: { // texture in slot 0, loaded with ImageUtils
                type: "t", 
                value: THREE.ImageUtils.loadTexture( 'explosion.png' )
            },
            time: { // float initialized to 0
                type: "f", 
                value: 0.0 
            }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent

    } );	
    
    // create a sphere and assign the material

    planet = new THREE.Object3D();
    //planet.position.x = 10;
    oldAngles = getAngles();
    createSpheres(oldAngles);
    var testSphere = new THREE.Mesh( new THREE.SphereGeometry( radius/10, setRez,setRez), new THREE.MeshBasicMaterial({color:'#000000'}));
    testSphere.position = new THREE.Vector3(0,0,0);
    scene.add( testSphere );
    scene.add( planet );
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); 
    directionalLight.position.set( 0, 0, 1 ); 
    scene.add( directionalLight );
    //Add axis markers
    var xaxis = new THREE.Mesh( new THREE.CylinderGeometry(radius/60, radius/60, radius*100), new THREE.MeshBasicMaterial({color:'#FF0000'}) );
    xaxis.rotation.z += Math.PI/2;
    var yaxis = new THREE.Mesh( new THREE.CylinderGeometry(radius/60, radius/60, radius*100), new THREE.MeshBasicMaterial({color:'#FFFF00'}) );
    var zaxis = new THREE.Mesh( new THREE.CylinderGeometry(radius/60, radius/60, radius*100), new THREE.MeshBasicMaterial({color:'#0000FF'}) );
    zaxis.rotation.x += Math.PI/2;
    scene.add(xaxis);
    scene.add(yaxis);
    scene.add(zaxis);

//        var directionalLight = new THREE.DirectionalLight( 0xffffff, .5 ); 
//        directionalLight.position.set( 0, 0, -1 ); 
//        scene.add( directionalLight );

    // create the renderer and attach it to the DOM
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth-50, window.innerHeight-50 );
    
    container.appendChild( renderer.domElement );

    render();

    var movement = radius;

} );
var clock = new THREE.Clock();
var time = 0;
var delta;
function render() {
    var angles = [];
    delta = clock.getDelta();

    material.uniforms[ 'time' ].value = .0000025 * ( Date.now() - start );
//    planet.rotation.y += delta * .03;
    
    // let there be light
    renderer.render( scene, camera );
    if(! pause){
        requestAnimationFrame( render );
    }
    controls.update( delta );
    
    angles = getAngles();
    if(angles[0] !== oldAngles[0] || angles[1] !== oldAngles[1]){
        createSpheres(angles );
        oldAngles = angles;
    }
    
    time += delta;
    if(time > .5){
        var d = getPlanetCamera();
        var p = planet.position;
        var c = camera.position;
        $('#info').html(
            "Planet rotation: " + 
            planet.rotation.x + "," +
            planet.rotation.y + "," + 
            planet.rotation.z + 
            "<br/>Horizontal Angle: " + angles[0] + 
            "<br/>Vertical Angle: " + angles[1] + 
            "<br/>Planet->Camera: " + sign(d.x) + " : " + sign(d.y) + " : " + sign(d.z) + 
            "<br/>Planet: " + p.x + " : " + p.y + " : " + p.z + 
            "<br/>Camera: " + c.x + " : " + c.y + " : " + c.z
            );
        time = 0;
    }
    stats.update();
}
function sign(number){
    return number?number<0?-1:1:0;
}
function getPlanetCamera(){
    //return new THREE.Vector3(0,0,0).subVectors(planet.position, camera.position);
    return new THREE.Vector3(0,0,0).subVectors(camera.position, planet.position);
}
function getAngles(){
    var direction = getPlanetCamera(), hdir, vdir, left, up, dot, d, p, hangle, vangle,
    
    //Get horizontal angle
    hdir = direction.clone();
    left = planet.position.clone();
    left.x -= radius;
    dot = left.dot(hdir);
    d = hdir.length();
    p = left.length();
    hangle = Math.acos(dot / (d * p));
    if(camera.position.z < planet.position.z){
        hangle = Math.PI*2 - hangle;
    }


    //Get vertical angle
    vdir = direction.clone();
    up = planet.position.clone();
    up.y += radius;
    dot = vdir.dot(up);
    d = vdir.length();
    p = up.length();
    vangle = Math.acos(dot / (d * p));

    return [hangle,vangle];
}

var flip = true;

function createSpheres(angles){
    var meshes = [];
    planet.children.forEach(function(mesh){
        planet.remove(mesh);
    });
    planet.updateMatrix();

//    flip = ! flip;
    var green = new THREE.MeshBasicMaterial({color:'#008000', wireframe: flip});
//    green = new THREE.MeshPhongMaterial();
//green = material;  

    var distance = camera.position.distanceTo(planet.position) - radius;
    var circ = Math.PI/2;
    if(distance < radius ){
        circ = THREE.Math.clampBottom(circ * (distance / (radius/2)), circ / 5) ;
        controls.movementSpeed = THREE.Math.clamp(radius*.5*(distance/radius), radius*.05, radius*.5);
    }
    var hangle = angles[0];
    var vangle = angles[1];

    var mod = 1;
    var iterations = 4;
    var rezMod = iterations * iterations;
    var rez = setRez/ iterations;
    var geos = new Array();
    for(var i = 1; i < iterations; i++){
//        rez = setRez / rezMod;
//        rezMod /= 2;

        //top 4
        geos.push(new THREE.SphereGeometry( radius, rez,rez, hangle - (circ*mod), circ*mod/2 , vangle - (circ*mod), circ*mod/2 ));
        geos.push(new THREE.SphereGeometry( radius, rez,rez, hangle - (circ*mod/2), circ*mod/2 , vangle - (circ*mod), circ*mod/2 ));
        geos.push(new THREE.SphereGeometry( radius, rez,rez, hangle, circ*mod/2 , vangle - (circ*mod), circ*mod/2 ));
        geos.push(new THREE.SphereGeometry( radius, rez,rez, hangle + circ*mod/2, circ*mod/2 , vangle - (circ*mod), circ*mod/2 ));
        //left 2
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle - circ*mod, circ*mod/2 , vangle - (circ*mod/2), circ*mod/2 ));
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle - circ*mod, circ*mod/2 , vangle, circ*mod/2 ));
        //right 2
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle + (circ*mod/2), circ*mod/2 , vangle - (circ*mod/2), circ*mod/2 ));
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle + (circ*mod/2), circ*mod/2 , vangle, circ*mod/2 ));
        //bottom 4
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle - (circ*mod), circ*mod/2 , vangle + (circ*mod/2), circ*mod/2 ));
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle - (circ*mod/2), circ*mod/2 , vangle + (circ*mod/2), circ*mod/2 ));
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle, circ*mod/2 , vangle + (circ*mod/2), circ*mod/2 ));
        geos.push( new THREE.SphereGeometry( radius, rez,rez, hangle + circ*mod/2, circ*mod/2 , vangle + (circ*mod/2), circ*mod/2 ));
        
        rez *= 1.2;       
        mod /= 2;         
    }
    //Final Patch
    geos.push( new THREE.SphereGeometry( radius, setRez, setRez, hangle - (circ*mod), circ*mod*2 , vangle - (circ*mod), circ*mod*2 ));
      
    geos.forEach(function(geo){
        meshes.push( new THREE.Mesh(geo, green));
    });
    meshes.forEach(function(mesh){
        planet.add(mesh);
    });

}
