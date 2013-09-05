var window = window || {};

function onWindowResize() {

    var windowHalfX = window.innerWidth / 2,
        windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
window.addEventListener('resize', onWindowResize, false);
