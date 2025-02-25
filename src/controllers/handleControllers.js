import * as THREE from 'three';
import gsap from 'gsap';

export function handleControllers(controller, raycaster, cube, sound) {
    raycaster.set(controller.position, new THREE.Vector3(0, 0, -1).applyQuaternion(controller.quaternion));

    const intersects = raycaster.intersectObjects([cube]);

    if (intersects.length > 0) {
        const intersectedCube = intersects[0].object;

        gsap.to(intersectedCube.scale, {
            duration: 0.01, x: 0.95, y: 0.95, z: 0.95, ease: "power1.out", onComplete: () => {
                gsap.to(intersectedCube.scale, { duration: 0.1, x: 1, y: 1, z: 1, ease: "power1.out" });
            }
        });

        gsap.to(intersectedCube.material.color, {
            duration: 0.01, r: 0.8, g: 0.5, b: 0.5, ease: "power1.out", onComplete: () => {
                gsap.to(intersectedCube.material.color, { duration: 0.5, r: 1, g: 0, b: 0, ease: "power1.out" });
            }
        });

        if (sound && !sound.playing()) {
            sound.play();
        }
    }
}