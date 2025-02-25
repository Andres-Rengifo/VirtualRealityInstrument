import * as THREE from 'three';

export function setupLights(scene) {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
}