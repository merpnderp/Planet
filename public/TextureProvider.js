define(function (require, exports, module) {

    module.exports = TextureProvider = function (renderer, radius, rx, ry, seed) {

        var THREE = require('three');

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
                phi: {
                    type: "f"
                },
                theta: {
                    type: "f"
                },
                scaledPI: {
                    type: "f"
                },
                yn: {
                    type: "f"
                },
                ym: {
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

        var heightMaps = [], left, right, top, bottom;

        this.getTexture = function (scaledPI, phi, theta) {

            if (!heightMaps[scaledPI]) {
                heightMaps[scaledPI] = {};
                heightMaps[scaledPI].texture = new THREE.WebGLRenderTarget(rx, ry, pars);
            }

            return getUnaidedTexture(scaledPI, phi, theta);
        };

        var getUnaidedTexture = function (scaledPI, phi, theta) {


            var params = {};
            if (theta - scaledPI <= 0) {
                top = 0;
                bottom = theta + scaledPI;
            } else if (theta + scaledPI >= Math.PI) {
                top = theta - scaledPI;
                bottom = Math.PI;
            } else {
                top = theta - scaledPI;
                bottom = theta + scaledPI;
            }

            quadTarget.material.uniforms.phi.value = params['phi'] = phi;
            quadTarget.material.uniforms.theta.value = params['theta'] = theta;
            quadTarget.material.uniforms.scaledPI.value = params['scaledPI'] = scaledPI;

            quadTarget.material.uniforms.yn.value = params['yn'] = (bottom - top) / (-ry / 2 - ry / 2);
            quadTarget.material.uniforms.ym.value = params['ym'] = bottom - (-ry / 2 * quadTarget.material.uniforms.yn.value );

            params['top'] = top;
            params['bottom'] = bottom;

            renderer.render(sceneRenderTarget, cameraOrtho, heightMaps[scaledPI].texture, false);

            heightMaps[scaledPI].params = params;

            return heightMaps[scaledPI];

        };

        var getTextureFromParent = function (scaledPI, phi, theta, parentTexture) {

        };

        var getTextureFromParentAndSibling = function (scaledPI, phi, theta, parentHeightMap, siblingHeightMap) {

        };
    }
});
