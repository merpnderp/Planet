




var fragmentShader;
var vertexShader;

function init(){
    if(! fragmentShader){
        fragmentShader = 'trying';
        $.get('fragmentShader.glsl', function(data){
            fragmentShader = data; 
            init();
        });
    }
    if(! vertexShader){
        vertexShader = 'trying';
        $.get('vertexShader.glsl', function(data){
            vertexShader = data; 
            init();
        });
    }
    if(vertexShader.length > 10 && fragmentShader.length > 10){
        start();
    }
};

function start(){    
    var container,
        renderer,
        scene,
        camera,
        controls,
        planet,
        oldAngles,
        start = Date.now(),
        fov = 30,
        pause = false,
        setRez = 50,
    //    radius = 5.913520000 * Math.pow(10,11);//size of sun
    //    radius = 149597870700 * 50000;//Size of solar system
        radius = 30;
   //    radius = 6378000;//radius of earth
   


    var stats = new Stats();
    stats.setMode( 0 );
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    stats.domElement.style.width = '90px';
    document.body.appendChild( stats.domElement );


    container = document.getElementById( "container" );
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 
        fov, 
        window.innerWidth / window.innerHeight, 
        1, 
        10000000000 );
    camera.position.z = radius*9;
    
    scene.add( camera );
    //controls = new THREE.FlyControls( camera );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ));
    controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];

        //controls.addEventListener( 'change', render );

/*   old fly controls controls.movementSpeed = radius / .5;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 12;
    controls.autoForward = false;
    controls.dragToLook = false;	
    */


    // create a wireframe material		
  material = new THREE.ShaderMaterial( {
        uniforms: { 
            tExplosion: { // texture in slot 0, loaded with ImageUtils
                type: "t", 
                value: THREE.ImageUtils.loadTexture( '../explosion.png' )
            },
            time: { // float initialized to 0
                type: "f", 
                value: 0.0 
            },
            rotation: { 
                type: "v4",
                value: new THREE.Vector4(0,0,0,0),
            }
        },
        vertexShader: vertexShader,//document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: fragmentShader//document.getElementById( 'fragmentShader' ).textContent

    } );	
    
    // create a sphere and assign the material

    planet = new THREE.Object3D();
//    planet.position.x = .10;
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
    var xaxis = new THREE.Mesh( new THREE.CylinderGeometry(1,1, radius*100), new THREE.MeshBasicMaterial({color:'#FF0000'}) );
    xaxis.rotation.z += Math.PI/2;
    var yaxis = new THREE.Mesh( new THREE.CylinderGeometry(1,1, radius*100), new THREE.MeshBasicMaterial({color:'#FFFF00'}) );
    var zaxis = new THREE.Mesh( new THREE.CylinderGeometry(1,1, radius*100), new THREE.MeshBasicMaterial({color:'#0000FF'}) );
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

    var movement = radius;

    var clock = new THREE.Clock();
    var time = 0;
    var delta;

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); 
    directionalLight.position.set( 2, 2, 0 ); 
    scene.add( directionalLight );

    var oldD = getPlanetCamera();
    render();
    
    function getPlanetCamera(){
        return new THREE.Vector3(0,0,0).subVectors(camera.position, planet.position);
    }
    function logVector(s, v){
        console.log(s + " : " +v.x + ", " + v.y + ", " + v.z);
    }
    
    function render() {
        var angles = [];
        delta = clock.getDelta();

        var m = planet.matrix.clone();
        m.lookAt(camera.position, planet.position, planet.up);
       // var rr = m.decompose()[ 1 ];
        var tr = m.decompose()[ 1 ].inverse();

        material.uniforms[ 'time' ].value = .00005 * ( Date.now() - start );
        material.uniforms[ 'rotation' ].value = tr;
//        planet.lookAt(camera.position);
//        planet.rotation.y += delta * .13;
        
        // let there be light
        renderer.render( scene, camera );
        if(! pause){
            requestAnimationFrame( render );
        }
    //    controls.update( delta );
        controls.update( );

//        var d = getPlanetCamera().normalize();
       
//        planet.lookAt(camera.position);

        time += delta;
        stats.update();
    }
    function sign(number){
        return number?number<0?-1:1:0;
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
//        up.y += radius;
        dot = vdir.dot(up);
        d = vdir.length();
        p = up.length();
        vangle = Math.acos(dot / (d * p));

        return [hangle,vangle];
    }

    var flip = true;

    function createSpheres(angles){
        planet.updateMatrix();
        
        if(flip){
            green = wireFrame;
        }

        //flip = ! flip;
        //var green = new THREE.MeshBasicMaterial({color:'#008000', wireframe: flip});
        var green = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
        green = new THREE.MeshBasicMaterial({color:'#008000', wireframe: true});
        var red = new THREE.MeshBasicMaterial({color:'#FF0000', wireframe: true});
//    green = material;  

        var distance = camera.position.distanceTo(planet.position) - radius;
        var ico = new Icosahedron(radius, 5);

        var axis;
        var forward;
        var orig;
        var swizle;
        var angle;
        var front = new THREE.Vector3(0,0,radius);
        var dot;
        ico.vertices.forEach(function(vert){
            axis = new THREE.Vector3();
            
            (axis.crossVectors(front, vert)).normalize();

            dot = vert.clone();
            /*
            console.log("front: " + front.x + ", " + front.y + ", " + front.z);
            console.log("vert: " + vert.x + ", " + vert.y + ", " + vert.z);
            console.log("axis: " + axis.x + ", " + axis.y + ", " + axis.z);
            */ 
            angle = Math.acos( dot.dot(front) / ( front.length() *  vert.length() ));
            var move = ((1.57 - angle)/1.57)*angle;
            move = Math.pow(move, 1.1);
//            console.log("move: " + move + " angle: " + angle); 
            vert.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axis, -move));
            
        });


        planet.add(new THREE.Mesh(ico, green));
//        var ico2 = new THREE.IcosahedronGeometry(radius, 5);
//        planet.add(new THREE.Mesh(ico2, red));
        console.log(planet.children[0].geometry.vertices.length);
        console.log(planet.children[0].geometry.faces.length);
    }
};
$(init);

Icosahedron = function ( radius, detail ) {

  var t = ( 1 + Math.sqrt( 5 ) ) / 2;
  
    var vertices = [
    [ -1,  t,  0 ],//0
	[  1, t, 0 ],  //1
	[ -1, -t,  0 ],//2
	[  1, -t,  0 ],//3
    [  0, -1,  t ],//4
	[  0, 1, t ],  //5
//	[  0, -1, -t ],//6
//	[  0,  1, -t ],//7
    [  t,  0, -1 ],//8->6
	[  t, 0, 1 ],  //9->7
	[ -t,  0, -1 ],//10->8
	[ -t,  0,  1 ] //11->9
  ];

  var faces = [
    [ 0, 9,  5 ],
	[ 0,  5,  1 ],
//	[  0,  1,  7 ],
//	[  0,  7, 8 ],
	[  0, 8, 9 ],
    [ 1,  5,  7 ],
	[ 5, 9,  4 ],
	[ 9, 8,  2 ],
//	[ 8,  7,  6 ],
//	[  7,  1,  6 ],
    [ 3,  7,  4 ],
	[ 3,  4,  2 ],
	[  3,  2,  6 ],
//	[  3,  6,  6 ],
	[  3,  6,  7 ],
    [ 4,  7,  5 ],
	[ 2,  4, 9 ],
//	[  6,  2, 8 ],
//	[  6,  6,  7 ],
	[  7,  6,  1 ]
  ];
 
  THREE.PolyhedronGeometry.call( this, vertices, faces, radius, detail );

};

Icosahedron.prototype = Object.create( THREE.Geometry.prototype );
