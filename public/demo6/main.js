var container,
    renderer,
    scene,
    camera,
    controls,
    planet,
    start = Date.now(),
    fov = 30,
    pause = false,
    hrez = lrez = 30,
    radius = 20;
    //set up stats
var stats = new Stats();
stats.setMode( 1 );
stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
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

//        var radius = 6378000;

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
    camera.target = new THREE.Vector3( 0, 0, 0 );

    controls = new THREE.FlyControls( camera );
    controls.movementSpeed = radius / 2.5;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 24;
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
    planet.position.x = 10;
    createSpheres();
    scene.add( planet );

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
function render() {

    var delta = clock.getDelta();
    material.uniforms[ 'time' ].value = .0000025 * ( Date.now() - start );
    planet.rotation.y += delta * .01;
    
    // let there be light
    renderer.render( scene, camera );
    if(! pause){
        requestAnimationFrame( render );
    }
    controls.update( delta );
//    createSpheres();
    time += delta;
    if(time > 1){
        var angle = getAngle();
        $('#info').html(
            "Planet rotation: " + 
            planet.rotation.x + "," +
            planet.rotation.y + "," + 
            planet.rotation.z + 
            "<br/>Left Angle: " + angle
            );
        time = 0;
    }

    stats.update();
}
function getAngle(){
    var direction = new THREE.Vector3(0,0,0).subVectors(planet.position, camera.position);
    direction.y = 0;
    direction.normalize();
    var left = planet.position.clone();
    left.y = 0;
    left.x - radius;
    left.normalize();
    var dot = direction.dot(left);
    var d = direction.length();
    var p = left.length();

    var value = dot / (d * p);

    return Math.acos(value);
}

function createSpheres(){
    var meshes = [];
    planet.children.forEach(function(mesh){
        planet.remove(mesh);
    });
    meshes.push(new THREE.Mesh( new THREE.SphereGeometry( radius, hrez,hrez, 0, Math.PI/2, 0, Math.PI/2 ), material ));
    meshes.push(new THREE.Mesh( new THREE.SphereGeometry( radius, lrez,lrez, Math.PI/2, Math.PI/2, 0, Math.PI/2 ), material ));
    meshes.push(new THREE.Mesh( new THREE.SphereGeometry( radius, lrez,lrez, Math.PI, Math.PI/2, 0, Math.PI/2 ), material ));
    meshes.push(new THREE.Mesh( new THREE.SphereGeometry( radius, lrez,lrez, Math.PI * 1.5, Math.PI/2, 0, Math.PI/2 ), material ));

    meshes.push(new THREE.Mesh( new THREE.SphereGeometry( radius, hrez,hrez, 0, Math.PI/2, Math.PI/2, Math.PI/2 ), material ));
    meshes.push( new THREE.Mesh( new THREE.SphereGeometry( radius, lrez,lrez, Math.PI/2, Math.PI/2, Math.PI/2, Math.PI/2 ), material ));
    meshes.push(new THREE.Mesh( new THREE.SphereGeometry( radius, lrez,lrez, Math.PI, Math.PI/2, Math.PI/2, Math.PI/2 ), material ));
    meshes.push(new THREE.Mesh( new THREE.SphereGeometry( radius, lrez,lrez, Math.PI * 1.5, Math.PI/2, Math.PI/2, Math.PI/2 ), material ));

    meshes.forEach(function(mesh){
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        planet.add(mesh);
    });
}
