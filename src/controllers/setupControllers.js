import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

export function setupControllers(scene, renderer) {
    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);
    scene.add(controller1);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();
    const controllerModel1 = controllerModelFactory.createControllerModel(controller1);
    const controllerModel2 = controllerModelFactory.createControllerModel(controller2);
    controller1.add(controllerModel1);
    controller2.add(controllerModel2);

    const controller1Raycaster = new THREE.Raycaster();
    const controller2Raycaster = new THREE.Raycaster();

    return { controller1, controller2, controller1Raycaster, controller2Raycaster };
}