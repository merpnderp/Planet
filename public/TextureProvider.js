define(function (require, exports, module) {
    module.exports = TextureProvider = function (renderer, radius, rx, ry, seed) {

        var THREE = require('lib/three');

        var vertexShader = require('text!heightMapVertexShader.glsl');
        var fragmentShader = require('text!heightMapFragmentShader.glsl');

        var quadTarget;
        var cameraOrtho, sceneRenderTarget = new THREE.Scene();
        //var pars = { format: THREE.RGBFormat };

        seed = seed ? seed : Math.floor(Math.random() * 10000000000 + 1);

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
                rx: {
                    type: "f",
                    value: rx
                },
                ry: {
                    type: "f",
                    value: ry
                },
                sx: {
                    type: "f",
                    value: sx
                },
                sy: {
                    type: "f",
                    value: sy
                },
                scale: {
                    type: "f",
                    value: scale
                },
                uscale: {
                    type: "v2",
                    value: new THREE.Vector2()
                },
                uoffset: {
                    type: "v2",
                    value: new THREE.Vector2()
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
        var valueOffset;
        var halfSX = sx / 2;
        var halfSY = sy / 2;
        var start, finish, sxPower, syPower;

        this.getTexture = function (scaledPI, phi, theta, ringNumber) {
//But anyway, you can conclude by yourself that n = (c - d) / (a - b), and m = c - a * n, so you know how to find both n and m.
            var heightMap = new THREE.WebGLRenderTarget(rx, ry, pars);
//		var normalMap  = new THREE.WebGLRenderTarget( rx, ry, pars );

            phi = phi + Math.PI - (scaledPI * 2 );
            if (phi < 0) {
                phi = tau + phi;
            }
            if (phi > tau) {
                phi = phi - tau;
            }
            valueOffset = (phi / tau) * (sx);

            sxPower = (sx / Math.pow(2, ringNumber));

            start = halfSX - sxPower;
            finish = halfSX + sxPower;

            uscale.x = ( start - finish ) / ( 0 - sx );

            offset.x = start;// - ( 0 * uscale.x );
            console.log(valueOffset);
            offset.x += valueOffset;

//            theta = theta - (Math.PI / 2) + (scaledPI * (Math.pow(2, ringNumber)));

            syPower = (sy / Math.pow(2, ringNumber));

            start = halfSY - syPower;
            finish = halfSY + syPower;

            uscale.y = ( start - finish ) / ( 0 - sy );
            offset.y = start;// - ( 0 * uscale.y );

            console.log('sx ' + sx + ' ringNumber: ' + ringNumber + ' scale.x: ' + uscale.x.toFixed(2) + ' offset.x: ' + offset.x.toFixed(2) + " phiOffset " + valueOffset );
            console.log('sy ' + sy + ' ringNumber: ' + ringNumber + ' scale.y: ' + uscale.y.toFixed(2) + ' offset.y: ' + offset.y.toFixed(2) );

            quadTarget.material.uniforms.uscale.value = uscale;
            quadTarget.material.uniforms.uoffset.value = offset;

            renderer.render(sceneRenderTarget, cameraOrtho, heightMap, false);

            return heightMap;

        };
    }
});
