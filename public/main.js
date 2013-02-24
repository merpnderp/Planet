
function start(){    

    var stats = new Stats();
    stats.setMode( 1 );
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    stats.domElement.style.width = '90px';
    document.body.appendChild( stats.domElement );

    container = document.getElementById( "container" );

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera( 
        30, 
        window.innerWidth / window.innerHeight, 
        1, 
        1000000);

    camera.position.z = 1000;
//    camera.lookAt( new THREE.Vector3( 0, 0, 0 ));
    
    scene.add( camera );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = 1 + "px";
    renderer.domElement.style.left = "0px";
    container.appendChild( renderer.domElement );

    var controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];
        
    var planeGeo = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
    //var planeGeo = new THREE.SphereGeometry( 10, 10, 50, 50);
    var plane = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0xffaa00, shininess: 5 } )); 
    plane.position = new THREE.Vector3(0,0,0);
    scene.add(plane);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); 
    directionalLight.position.set( 1, 1, 1 ); 
    scene.add( directionalLight );

    render();

    function render(){

        renderer.render( scene, camera );
        requestAnimationFrame( render );
        
        controls.update();
        stats.update();

    }
};
$(start);
