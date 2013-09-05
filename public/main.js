requirejs.config({
    baseUrl: '/',
    paths: {
        jquery: 'lib/jquery',
        three: 'lib/three',
        flycontrols: 'lib/flycontrols',
        stats: 'lib/stats'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'flycontrols': {
            deps: ['three'],
            exports: 'FlyControls'
        },
        'stats': {
            exports: 'Stats'
        },
        'three': {
            exports: 'THREE'
        }
    }
});


requirejs(['jquery', 'stats', 'three', './Planet', 'flycontrols'],
    function ($, Stats, THREE, Planet) {
        "use strict";

        var radius = 6353000,
            fov = 30,
            mode = 0,
            z = radius * 3,
            //z = 20,
            clipMapResolution = 64;

        var stats = new Stats();
        stats.setMode(mode);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '5px';
        stats.domElement.style.top = '5px';
        stats.domElement.style.width = '90px';
        document.body.appendChild(stats.domElement);

        var container = document.getElementById("container");

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(
            fov,
            window.innerWidth / window.innerHeight,
            .01,
            1000000000);

        camera.position.z = z;

        //    var controls = new THREE.FirstPersonControls(camera);

        var controls = new THREE.FlyControls(camera);
        controls.movementSpeed = (radius  );
        controls.domElement = document;
        controls.rollSpeed = Math.PI / 8;
        controls.autoForward = false;
        controls.dragToLook = false;

        scene.add(camera);

        //	camera.lookAt(new THREE.Vector3(0,radius*3,radius));

        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth - 9, window.innerHeight - 9);
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = 0 + "px";
        renderer.domElement.style.left = "0px";
        container.appendChild(renderer.domElement);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 1);
        scene.add(directionalLight);

        var solarSystem = new THREE.Object3D();

        var planet = new Planet(camera, radius, new THREE.Vector3(), clipMapResolution, fov, window.innerWidth, renderer);

        camera.lookAt(planet.obj.position);

        solarSystem.add(planet.obj);

        scene.add(solarSystem);

        var clock = new THREE.Clock();
        var delta, logLimiter = 0, limiter = 0, t = new THREE.Vector3(0, 0, 0);

        var pause = false;

        $(document).keyup(function (evt) {
            if (evt.keyCode == 32) {
                pause = !pause;
            }
        }).keydown(function (evt) {
                if (evt.keyCode == 32) {
//                        space = true;
                }
            });

        function render() {
            delta = clock.getDelta();

            var r =
                "programs: " + renderer.info.memory.programs +
                    "<br />geometries: " + renderer.info.memory.geometries +
                    "<br />textures: " + renderer.info.memory.textures +
                    "<br />calls: " + renderer.info.render.calls +
                    "<br />vertices: " + renderer.info.render.vertices +
                    "<br />faces: " + renderer.info.render.faces +
                    "<br />points: " + renderer.info.render.points +
                    "<br />camera x: " + camera.position.x +
                    "<br />camera y: " + camera.position.y +
                    "<br />camera z: " + camera.position.z +
                    "<br />";

            $('#render').html(r);
            logLimiter = 0;
            //           }
            renderer.render(scene, camera);
            requestAnimationFrame(render);
            stats.update();
            //           if (camera.position.length > 10000) {
            t.x = 0;
            t.y = 0;
            t.z = 0;
            t.subVectors(camera.position, t);
            solarSystem.position.sub(t);
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 0;
            if (!pause) {
                planet.update();
            }
            controls.update(delta);
        }

        render();
    })
;

