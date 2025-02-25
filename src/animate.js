import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { handleControllers } from './controllers/handleControllers.js';

export function animate(scene, camera, renderer, cube, wireframe, controller1, controller2, controller1Raycaster, controller2Raycaster, sound) {
    const controls = new OrbitControls(camera, renderer.domElement);

    renderer.setAnimationLoop(() => {
        controls.update();
        cube.rotation.x += 0.005;

        handleControllers(controller1, controller1Raycaster, cube, sound);
        handleControllers(controller2, controller2Raycaster, cube, sound);

        renderer.render(scene, camera);
    });
}