var halfPI = Math.PI / 2;
var quarterPI = Math.PI / 4;
var tau = Math.PI * 2;

define(function (require) {
    'use strict';

    var THREE = require('three');
    var $ = require('jquery');
    var TextureProvider = require('./TextureProvider');

    return function (_camera, _radius, _position, _segments, _fov, _screenWidth, renderer) {

        var clipMaps = [], i;
        var colors = [0xFF0000, 0x0000FF, 0x00FF00];//red, blue, green
        var scaledPI = [];

        var me = this;
        renderer = renderer ? renderer : new THREE.WebGLRenderer();

        me.obj = new THREE.Object3D();
        me.obj.position = _position || new THREE.Vector3();


        var camera = _camera;
        var radius = _radius || 6353000;
        var segments = _segments || 32;
				this.cameraDistance = radius;

        var fov = _fov || 30;
        fov = fov * .0174532925;//Convert to radians

        var textureProvider = new TextureProvider(renderer, radius, 96, 96, 48);

        var screenWidth = _screenWidth || 768;

        //tan of fov/screenWidth is first half of pixel size on planet calc
        var vs = Math.tan(fov / screenWidth);

        var smallestTheta;


        //Don't respond to update unless init has completed

        var fragmentShader = require('text!shaders/fragmentShader.glsl');
        var vertexShader = require('text!shaders/vertexShader.glsl');


        var clipMapCount = findClipMapCount();

        var circleGeo = new THREE.RingGeometry(.000001, 1, segments * 2, segments * 2, 0, tau);
        var ringGeo = new THREE.RingGeometry(.5, 1, segments, segments, 0, tau);

        circleGeo.boundingSphere = radius * 1.1;
        ringGeo.boundingSphere = radius * 1.1;

        initClipMaps();


        /*
         *
         * Update loop
         *
         */

        var clock = new THREE.Clock(), localCam = new THREE.Vector3(), cameraDistance, delta = 0, theta, phi, maxTheta, minTheta;
        var heightLock = 2, thetaLock = 0, phiLock = 0;//These are the discrete values we're locking to for the cameras phi/theta to the planet
        var oldHeightLock = 0, oldThetaLock = 0, oldPhiLock = 0;
        var tMesh = new THREE.Object3D(), pq = new THREE.Quaternion(), tq = new THREE.Quaternion();
        var viewableClipmaps = 0;
        me.update = function () {
            logText = '';
//            delta += clock.getDelta();

//            if (delta >= .1) {

//            tMesh = me.obj.clone();

            tMesh.up.copy(me.obj.up);
            tMesh.position.copy(me.obj.position);
            tMesh.quaternion.copy(me.obj.quaternion);
            tMesh.scale.copy(me.obj.scale);
            tMesh.matrix.copy(me.obj.matrix);
            tMesh.matrixWorld.copy(me.obj.matrixWorld);

            tMesh.position = tMesh.localToWorld(tMesh.position);
            tMesh.position.z -= radius;
            tMesh.updateMatrixWorld(false);

            localCam.x = camera.position.x;
            localCam.y = camera.position.y;
            localCam.z = camera.position.z;

            tMesh.worldToLocal(localCam);
            this.cameraDistance = cameraDistance = camera.position.distanceTo(tMesh.position) - radius;

            getTheta(localCam.x, localCam.y, localCam.z);
            getPhi(localCam.z);

            getHeightLock(cameraDistance);
            minTheta = getMinTheta(radius, heightLock);
            maxTheta = getMaxTheta(radius, heightLock);
//            minTheta = getMinTheta(radius, cameraDistance);
//            maxTheta = getMaxTheta(radius, cameraDistance);
            getPhiLock();
            getThetaLock();
            if (oldHeightLock != heightLock || oldPhiLock != phiLock || oldThetaLock != thetaLock) {
//            if(true){
                oldHeightLock = heightLock;
                oldPhiLock = phiLock;
                oldThetaLock = thetaLock;
                /*            if (oldHeightLock != cameraDistance || oldPhiLock != phi || oldThetaLock != theta) {
                 oldHeightLock = cameraDistance;
                 oldPhiLock = phi;
                 oldThetaLock = theta;
                 */
//                pq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -phi);
//                tq.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (Math.PI / 2 ) - theta);
                pq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -phiLock);
                tq.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (Math.PI / 2 ) - thetaLock);
                tq.multiply(pq);
                updateClipMaps(tq, phiLock, thetaLock);
//                    var m = new THREE.Matrix4();
//                    var p = new THREE.Vector3();
//                    m.lookAt(localCam, p, new THREE.Vector3(0, 1, 0));
//                    var tr = m.decompose()[ 1 ].inverse();
//                    updateClipMaps(heightLock, tr, phi, theta);
                log('height', cameraDistance);
                log('heightLock', heightLock);
                log('phiSteps', Math.PI * 2 / minTheta);
                log('phiLock', phiLock);
                log("phi", phi);
                log('thetaSteps', Math.PI / minTheta);
                log('thetaLock', thetaLock);
                log("theta", theta);
                log("planetpos", me.obj.position);
                log("adjusted planetpos", tMesh.position);
                log('radius', radius);
                log("actualcam", camera.position);
                log("localcam", localCam);
                log('minTheta', minTheta);
                log('maxTheta', maxTheta);
                log('clipMapCount', clipMapCount + 1);
                log('clipMap in View', viewableClipmaps);
                $('#info').html(logText);
            }
            delta = 0;
        };

        function getPhiLock() {
            var max = Math.PI * 2 / minTheta, midpoint = max / 2, step = midpoint, tphi = phi + Math.PI;
            while (1) {
                step = step / 2;
                step = step == 0 ? 1 : step;

                phiLock = minTheta * midpoint;

                if (tphi >= phiLock) {
                    if (tphi < minTheta * (midpoint + 1 )) {
                        break;
                    } else {
                        midpoint += step;
                    }
                } else {
                    midpoint -= step;
                }
            }
            phiLock -= Math.PI;
        }

        function getThetaLock() {
            var max = Math.PI / minTheta, midpoint = max / 2, step = midpoint;
            while (1) {
                step = step / 2;
                step = step == 0 ? 1 : step;

                thetaLock = minTheta * midpoint;

                if (theta >= thetaLock) {
                    if (theta < minTheta * (midpoint + 1 )) {
                        break;
                    } else {
                        midpoint += step;
                    }
                } else {
                    midpoint -= step;
                }
            }
        }

        function getHeightLock(height) {
            var max = 30, midpoint = Math.round(max / 2), step = midpoint;

            while (1) {
                step = Math.round(step / 2);
                step = step == 0 ? 1 : step;
                heightLock = Math.pow(2, midpoint);

                if (height < 2) {//If we have a negative height, whups
                    heightLock = 2;
                    break;
                }

                if (height >= heightLock) {
                    if (midpoint >= max || height < Math.pow(2, midpoint + 1)) {
                        break;
                    } else {
                        midpoint += step;
                    }
                } else {
                    midpoint -= step;
                }
            }
        }

        /*
         *
         * Update Clipmaps
         *
         */

        function updateClipMaps(rotate, phi, theta) {
            //min theta planet pixel size / radius i minimum theta
            //max theta
            viewableClipmaps = 0;
            //           clipMapCount = 1;
            for (var i = 0; i < clipMapCount; i++) {
                if (clipMaps[i].mesh.visible === false) {
                    if (clipMaps[i].theta < maxTheta && clipMaps[i].theta > minTheta) {
                        clipMaps[i].mesh.visible = true;
                    }
                } else {
                    if (clipMaps[i].theta < minTheta || clipMaps[i].theta > maxTheta) {
                        clipMaps[i].mesh.visible = false;
                        continue;
                    }
                }
                if (clipMaps[i].mesh.visible) {
//                    var tpResult = textureProvider.getTexture(scaledPI[i], phi, theta);
                    if (i + 1 === clipMapCount || clipMaps[i + 1].theta < minTheta) {
                        clipMaps[i].mesh.visible = false;
                        clipMaps[clipMapCount].material.uniforms.scaledPI.value = scaledPI[i];
                        i = clipMapCount;
                    }
                    clipMaps[i].material.uniforms.meshRotation.value = rotate;
                    viewableClipmaps++;
//                    clipMaps[i].material.uniforms.texture.value = tpResult.texture;
                    clipMaps[i].material.uniforms.phi.value = phi;
                    clipMaps[i].material.uniforms.theta.value = theta;
//                    clipMaps[i].material.uniforms.top.value = tpResult.params['top'];
//                    clipMaps[i].material.uniforms.bottom.value = tpResult.params['bottom'];

//                    clipMaps[i].material.uniforms.yn.value = (0 - 1) / (tpResult.params['bottom'] - tpResult.params['top']);
//                    clipMaps[i].material.uniforms.ym.value = -tpResult.params['bottom'] * clipMaps[i].material.uniforms.yn.value;

                }
            }
//             updatePlane(textureProvider.getTexture(scaledPI[0], phi, theta).texture, 0);
//             updatePlane(textureProvider.getTexture(scaledPI[1], phi, theta).texture, 1);
//             updatePlane(textureProvider.getTexture(scaledPI[2], phi, theta).texture, 2);
        }

         var pmat = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('explosion.png')});
         var plane = [];
         var px = 256 * 1, py = 128 * 1, start = 170, xo = 400;
         plane[0] = new THREE.Mesh(new THREE.PlaneGeometry(px, py, 1, 1), pmat);
         plane[0].position.z = -1000;
         plane[0].position.x = xo;
         plane[0].position.y = start;
         camera.add(plane[0]);
         plane[1] = new THREE.Mesh(new THREE.PlaneGeometry(px, py, 1, 1), pmat);
         plane[1].material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('explosion.png')});
         plane[1].position.z = -1000;
         plane[1].position.x = xo;
         plane[1].position.y = start - py;
         camera.add(plane[1]);
         plane[2] = new THREE.Mesh(new THREE.PlaneGeometry(px, py, 1, 1), pmat);
         plane[2].material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('explosion.png')});
         plane[2].position.z = -1000;
         plane[2].position.x = xo;
         plane[2].position.y = start - py * 2;
         camera.add(plane[2]);
         function updatePlane(text, i) {
         plane[i].material.map = text;
         }

        function initClipMaps() {

            clipMaps.length = 0;//empty array of any other clipMaps in case we've been re-init'd runtime

            var t = quarterPI;
            var scale;
            for (i = 0; i <= clipMapCount; i++) {

                scale = ( 1 / Math.pow(2, i) );
                scaledPI[i] = Math.PI / 2 * scale;
                clipMaps[i] = {};

                clipMaps[i].material = new THREE.ShaderMaterial({
                    uniforms: {
                        texture: { // texture in slot 0, loaded with ImageUtils
                            type: "t",
                            value: THREE.ImageUtils.loadTexture("explosion.png")
                        },
                        meshRotation: {
                            type: "v4",
                            value: new THREE.Vector4(0, 0, 0, 0)
                        },
                        icolor: {
                            type: "c",
                            value: new THREE.Color(colors[i % 3])
                        },
                        scaledPI: {
                            type: "f",
                            value: scaledPI[i]
                        },
                        radius: {
                            type: "f",
                            value: radius
                        },
                        last: {
                            type: "i",
                            value: 0
                        },
                        phi: {
                            type: "f",
                            value: 0
                        },
                        theta: {
                            type: "f",
                            value: 0
                        },
                        left: {
                            type: "f"
                        },
                        right: {
                            type: "f"
                        },
                        top: {
                            type: "f"
                        },
                        bottom: {
                            type: "f"
                        },
                        yn: {
                            type: "f"
                        },
                        ym: {
                            type: "f"
                        },
                    },

                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
										wireframe: true

                });

                clipMaps[i].theta = t;
                if (i === clipMapCount) {
                    clipMaps[i].mesh = new THREE.Mesh(circleGeo, clipMaps[i].material);
                    clipMaps[i].mesh.visible = true;
                } else {
                    clipMaps[i].mesh = new THREE.Mesh(ringGeo, clipMaps[i].material);
                    clipMaps[i].mesh.visible = false;
                }

                t /= 2;//Each successive clipMap covers half as much theta
                me.obj.add(clipMaps[i].mesh);
            }
        }


        /*
         *
         * Helper functions
         *
         */
        function getMaxTheta(radius, height) {
            var mt = Math.acos(radius / (radius + height ));
            return mt < halfPI ? mt : halfPI;
        }

        function getMinTheta(radius, height) {
            var lt = ( (height * vs) / radius ) * segments;//multiply by segments because this is theta per triangle
       //     var lt = 200.5 * height / radius;
            lt = lt < quarterPI ? lt : quarterPI;
            return lt < 0 ? smallestTheta : lt;
        }

        function getTheta(x, y, z) {
            //q =tan-1(y/(z2+x2)1/2)
            theta = Math.PI / 2 - Math.atan(y / Math.pow(z * z + x * x, .5));
        }

        function getPhi() {
            //f = tan-1(x/z).
            phi = Math.atan(localCam.x / localCam.z);
            //Now adjust for special cases
            if (localCam.x < 0 && localCam.z < 0) {
                phi -= Math.PI;
            } else if (localCam.z < 0) {
                phi += Math.PI;
            }
        }

        //Simple log function
        var logText;

        function log(s, t) {
            if (t instanceof THREE.Vector3) {
                logText += s + ": x " + t.x + ", y " + t.y + ", z " + t.z;
            } else {
                logText += s + ": " + t;
            }
            logText += "<br />";
        }

        function findClipMapCount() {
            smallestTheta = getMinTheta(radius, 2);//smallest theta is 2 units of height
            var i = 0;
            var theta = 100;
            while (theta > smallestTheta) {
                i++;
                theta = (1 / Math.pow(2, i) ) * Math.PI;
            }
            var min = 21;
            return i < min ? i : min;
        }
    };
});
