

var so = so || {};

so.TextureProvider = function( renderer, radius, rx, ry, seed ) {

	var inited = false;
	var vertexShader, fragmentShader;

	var fileGetter = new so.FileLoader();
	fileGetter.getFiles(['heightMapVertexShader.glsl', 'heightMapFragmentShader.glsl'], init);

	var quadTarget;
	var cameraOrtho, sceneRenderTarget = new THREE.Scene();
	var pars = { format: THREE.RGBFormat };
	var vertexShader, fragmentShader;
	var textures;

	seed = seed ? seed : Math.floor( Math.random() * 10000000000 + 1 );

	function init( files ) {
		vertexShader = files['heightMapVertexShader.glsl'];
		fragmentShader = files['heightMapFragmentShader.glsl'];
		inited = true;

		rx = rx ? rx : 128;
		ry = ry ? ry : 64;



		cameraOrtho = new THREE.OrthographicCamera( rx / - 2, rx / 2, ry / 2, ry / - 2, -10000, 10000 );
		cameraOrtho.position.z = 100;

		sceneRenderTarget.add( cameraOrtho );

		//var pars = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat };


		var material = new THREE.ShaderMaterial( {
			uniforms:  {
				radius: {
					type: "f",
					value: radius
				},
				scaledPI: {
					type: "f",
					value: 0
				},
				meshRotation: {
					type: "v4",
					value: new THREE.Vector4(0,0,0,0),
				},
				seed: {
					type: "f",
					value: seed 
				},
				rx: {
					type: "f",
					value: rx 
				},
				ry: {
					type: "f",
					value: ry 
				},
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		} );

		var geo = new THREE.PlaneGeometry( rx, ry, rx, ry );
		//var geo = new THREE.RingGeometry( .000001, radius,  rx, ry, 0, Math.PI * 2 );

		quadTarget = new THREE.Mesh( geo, material );
	//	quadTarget.position.z = -500;

		sceneRenderTarget.add( quadTarget );
	}

	var textureHash = {};
	var textureArray = [];

	this.getTexture = function( rotate, scaledPI )  {

		if( ! inited ) return;		

		var heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
//		var normalMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
	
		quadTarget.material.uniforms.meshRotation.value = rotate;
		quadTarget.material.uniforms.scaledPI.value = scaledPI;
		renderer.render( sceneRenderTarget, cameraOrtho, heightMap, false );

		return heightMap;

	};
};
