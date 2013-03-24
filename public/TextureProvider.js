

var so = so || {};

so.TextureProvider = function( renderer, radius, rx, ry, seed ) {

	var inited = false;
	var vertexShader, fragmentShader;

	var fileGetter = new so.FileLoader();
	fileGetter.getFiles(['heightMapVertexShader.glsl', 'heightMapFragmentShader.glsl'], init);

	function init( files ) {
		vertexShader = files['heightMapVertexShader.glsl'];
		fragmentShader = files['heightMapFragmentShader.glsl'];
		inited = true;
	}

	rx = rx ? rx : 50;
	ry = ry ? ry : 50;

	var textures;

	var cameraOrtho, sceneRenderTarget = new THREE.Scene();
	cameraOrtho = new THREE.OrthographicCamera( rx / - 2, rx / 2, ry / 2, ry / - 2, -10000, 10000 );
	cameraOrtho.position.z = 100;

	sceneRenderTarget.add( cameraOrtho );

	var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	var heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
	var normalMap  = new THREE.WebGLRenderTarget( rx, ry, pars );

	var vertexShader, fragmentShader;

	var material = new THREE.ShaderMaterial( {
		uniforms:  {
			radius: {
				type: "f",
				value: radius
			},

		},
		vertexShader: vertexShader,
		fragmentShader, fragmentShader
	} );

	//var geo = new so.RingGeometry( .000001, radius, rx, ry, 0, Math.PI * 2 );
	var geo = new THREE.PlaneGeometry( rx, ry );

	var quadTarget = new THREE.Mesh( geo, material );
	quadTarget.position.z = -500;

	sceneRenderTarget.add( quadTarget );


	seed = seed ? seed : Math.floor( Math.random() * 10000000000 + 1 );

	var textureHash = {};
	var textureArray = [];

	this.getTexture = function( level, phi, theta )  {
		if( ! inited ) return;		
	
		// At level 0 phi = 0 and theta = 1.57 we want back a texture spanning from -PI, 0 to PI, PI.
		// At level 1 phi = 0 and theta = 1.57 we want back a texture spanning from -1.57, 0 to 1.57, PI.
		// At level 2 phi = 0 and theta = 1.57 we want back a texture spanning from -.79, .79 to .79, 2.36.

		var step = Math.PI / ( level + 1 );
		//solve for phi which goes form -PI to PI
		var mapPhi = 0, mapTheta = 0;
		while(1) {
			if ( phi - step >= mapPhi && phi + step < mapPhi ) {
				mapTheta = 0;
			} else if (phi < mapPhi ){
		//		mapPhi
			}
			break;
		}

		for( var i = 0; i < Math.PI; i+= step ) {
		}


	};
};
