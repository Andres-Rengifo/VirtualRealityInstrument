import * as THREE from 'three';

export function createWireframe(cube) {
    const edges = new THREE.EdgesGeometry(cube.geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    cube.add(wireframe); 
    return wireframe;
}