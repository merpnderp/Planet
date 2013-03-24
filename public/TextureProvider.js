

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

	rx = rx ? rx : 52;
	ry = ry ? ry : 52;

	var textures;

	var cameraOrtho, sceneRenderTarget = new THREE.Scene();
	cameraOrtho = new THREE.OrthographicCamera( rx / - 2, rx / 2, ry / 2, ry / - 2, -10000, 10000 );
	cameraOrtho.position.z = 100;

	sceneRenderTarget.add( cameraOrtho );

	var pars = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat };
	var heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
	var normalMap  = new THREE.WebGLRenderTarget( rx, ry, pars );

	var vertexShader, fragmentShader;

	var material = new THREE.ShaderMaterial( {
		uniforms:  {
			radius: {
				type: "f",
				value: radius
			},
			phi: {
				type: "f",
				value: 0
			},
			theta: {
				type: "f",
				value: 0
			},
			level: {
				type: "f",
				value: 0
			},
			seed: {
				type: "f",
				value: seed 
			},
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	} );

	var geo = new THREE.PlaneGeometry( rx, ry );

	var quadTarget = new THREE.Mesh( geo, material );
	quadTarget.position.z = -500;

	sceneRenderTarget.add( quadTarget );

	seed = seed ? seed : Math.floor( Math.random() * 10000000000 + 1 );

	var textureHash = {};
	var textureArray = [];

	this.getTexture = function( level, phi, theta )  {

		if( ! inited ) return;		
		
		quadTarget.material.uniforms.level = level;
		quadTarget.material.uniforms.phi = phi;
		quadTarget.material.uniforms.theta = theta;

		renderer.render( sceneRenderTarget, cameraOrtho, heightMap, true );

		return heightMap;

	};
};
