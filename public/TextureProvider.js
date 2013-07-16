define(function (require, exports, module) {
    module.exports = TextureProvider = function (renderer, radius, rx, ry, seed) {

        var THREE = require('lib/three');

        var vertexShader = require('text!heightMapVertexShader.glsl');
        var fragmentShader = require('text!heightMapFragmentShader.glsl');

        var quadTarget;
        var cameraOrtho, sceneRenderTarget = new THREE.Scene();
        var pars = { format: THREE.RGBFormat };

        seed = seed ? seed : Math.floor(Math.random() * 10000000000 + 1);

        rx = rx ? rx : 128;
        ry = ry ? ry : 64;

        cameraOrtho = new THREE.OrthographicCamera(rx / -2, rx / 2, ry / 2, ry / -2, -10000, 10000);
        cameraOrtho.position.z = 100;

        sceneRenderTarget.add(cameraOrtho);

        //var pars = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat };


        var material = new THREE.ShaderMaterial({
            uniforms: {
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
                    value: new THREE.Vector4(0, 0, 0, 0),
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
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        var geo = new THREE.PlaneGeometry(rx, ry, rx, ry);

        quadTarget = new THREE.Mesh(geo, material);
//	quadTarget.position.z = -500;

        sceneRenderTarget.add(quadTarget);

        var textureHash = {};
        var textureArray = [];

        this.getTexture = function (rotate, scaledPI) {

            var heightMap = new THREE.WebGLRenderTarget(rx, ry, pars);
//		var normalMap  = new THREE.WebGLRenderTarget( rx, ry, pars );

            quadTarget.material.uniforms.meshRotation.value = rotate;
            quadTarget.material.uniforms.scaledPI.value = scaledPI;
            renderer.render(sceneRenderTarget, cameraOrtho, heightMap, false);

            return heightMap;

        };
    }
});
