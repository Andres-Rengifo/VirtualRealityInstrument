import * as THREE from 'three';

export function createCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xCC0000 });
    const cube = new THREE.Mesh(geometry, material);
    return cube;
}