define(function (require, exports, module) {
    module.exports = TextureProvider = function (renderer, radius, rx, ry, seed) {

        var THREE = require('lib/three');

        var vertexShader = require('text!heightMapVertexShader.glsl');
        var fragmentShader = require('text!heightMapFragmentShader.glsl');

        var quadTarget;
        var cameraOrtho, sceneRenderTarget = new THREE.Scene();
        //var pars = { format: THREE.RGBFormat };

        seed = seed ? seed : Math.floor(Math.random() * 10000000000 + 1);
        seed /= 1073741824.0;

        rx = rx ? rx : 128;
        ry = ry ? ry : 64;

        cameraOrtho = new THREE.OrthographicCamera(rx / -2, rx / 2, ry / 2, ry / -2, -10000, 10000);
        cameraOrtho.position.z = 100;

        sceneRenderTarget.add(cameraOrtho);

        var pars = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat };

        var scale = .010;
        var sx = rx * scale;
        var sy = ry * scale;

        var material = new THREE.ShaderMaterial({
            uniforms: {
                seed: {
                    type: "f",
                    value: seed
                },
                radius: {
                    type: "f",
                    value: radius
                },
                top: {
                    type: "f"
                },
                bottom: {
                    type: "f"
                },
                left: {
                    type: "f"
                },
                right: {
                    type: "f"
                },
                phi: {
                    type: "f"
                },
                rx: {
                    type: "f",
                    value: rx / 2
                },
                ry: {
                    type: "f",
                    value: ry / 2
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        var geo = new THREE.PlaneGeometry(rx, ry, rx, ry);

        quadTarget = new THREE.Mesh(geo, material);

        sceneRenderTarget.add(quadTarget);

        var textureHash = {};
        var textureArray = [];


        var uscale = new THREE.Vector2();
        var offset = new THREE.Vector2();
        var tau = Math.PI * 2;
        var halfPI = Math.PI / 2.0;
        var valueOffset;
        var halfSX = sx / 2;
        var halfSY = sy / 2;
        var start, finish, sxPower, syPower;

        var heightMaps = [], left, right, top, bottom;

        this.getTexture = function (scaledPI, phi, theta) {


//But anyway, you can conclude by yourself that n = (c - d) / (a - b), and m = c - a * n, so you know how to find both n and m.
//		var normalMap  = new THREE.WebGLRenderTarget( rx, ry, pars );

            if (!heightMaps[scaledPI])
                heightMaps[scaledPI] = new THREE.WebGLRenderTarget(rx, ry, pars);

            if (theta - scaledPI < 0) {
                left = phi - Math.PI;
                right = phi + Math.PI;
                top = 0;
                bottom = theta + scaledPI;
            } else if (theta + scaledPI > Math.PI) {
                left = phi - Math.PI;
                right  = phi + Math.PI;
                top = theta - scaledPI;
                bottom = Math.PI;
            } else if (theta < Math.PI / 2) {
                left = phi - (scaledPI / (1 - Math.cos(theta - scaledPI)));
                right = phi + (scaledPI / (1 - Math.cos(theta - scaledPI)));
                top = theta - scaledPI;
                bottom = theta + scaledPI;
            } else if (theta > Math.PI / 2) {
                left = phi - (scaledPI / (1 - Math.cos(theta + scaledPI)));
                right = phi + (scaledPI / (1 - Math.cos(theta + scaledPI)));
                top = theta - scaledPI;
                bottom = theta + scaledPI;
            }else{
                left = phi - scaledPI;
                right = phi + scaledPI;
                top = theta - scaledPI;
                bottom = theta + scaledPI;
            }


            quadTarget.material.uniforms.left.value = left;
            quadTarget.material.uniforms.phi.value = phi;
            quadTarget.material.uniforms.right.value = right;
            quadTarget.material.uniforms.top.value = bottom;
            quadTarget.material.uniforms.bottom.value = top;

            renderer.render(sceneRenderTarget, cameraOrtho, heightMaps[scaledPI], false);

            return heightMaps[scaledPI];

        };
    }
});
