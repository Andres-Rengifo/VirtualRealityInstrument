import gsap from "gsap";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Howl } from 'howler';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';  // Add this import

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Enable WebXR
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));


const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xCC0000 });
const cube = new THREE.Mesh(geometry, material);
cube.position.z = -1;
scene.add(cube);
const edges = new THREE.EdgesGeometry(geometry); 
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); 
const wireframe = new THREE.LineSegments(edges, lineMaterial);
scene.add(wireframe); 

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

camera.position.z = 2;

const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2; 
ground.position.y = -1; 
scene.add(ground);

let sound;
try {
    sound = new Howl({
        src: ['./note1.mp3'], 
        loop: false, 
        onend: function() { 
            sound.canPlay = true; 
        }
    });

    sound.on('load', function() {
        console.log('Sound loaded!');
    });

    sound.on('loaderror', function(error) {
        console.error('Error loading sound:', error);
    });

    sound.canPlay = true;

} catch (error) {
    console.error("Howler initialization error:", error);
}

const raycaster = new THREE.Raycaster();

// Controllers 
const controller1 = renderer.xr.getController(0); 
const controller2 = renderer.xr.getController(1); 

scene.add(controller1);
scene.add(controller2);


const controllerModelFactory = new XRControllerModelFactory();

//model for controller 1
const controllerModel1 = controllerModelFactory.createControllerModel(controller1);
controller1.add(controllerModel1); 

//model for controller 2
const controllerModel2 = controllerModelFactory.createControllerModel(controller2);
controller2.add(controllerModel2); 

controller1.position.set(0, -0.1, -0.05);
controller2.position.set(0, -0.1, -0.05);

const controls = new OrbitControls(camera, renderer.domElement);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function onCubeClick(event) {
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([cube]); 

    if (intersects.length > 0) {
        const clickedCube = intersects[0].object;

        // Shrink the cube
        gsap.to(clickedCube.scale, { duration: 0.01, x: 0.95, y: 0.95, z: 0.95, ease: "power1.out", onComplete: () => {
          gsap.to(clickedCube.scale, { duration: 0.1, x: 1, y: 1, z: 1, ease: "power1.out" }); // Return to original size
        }});

        // Change color to darker red
        gsap.to(clickedCube.material.color, { duration: 0.01, r: 0.8, g: 0.5, b: 0.5, ease: "power1.out" , onComplete: () => {
          gsap.to(clickedCube.material.color, { duration: 0.5, r: 1, g: 0, b: 0, ease: "power1.out" }); // Return to original size
        }});

        // Sound playback logic:
        if (sound && !sound.isPlaying) { // Check if sound is loaded and not already playing
            sound.play();
        }
    }
    wireframe.position.copy(clickedCube.position);
    wireframe.scale.copy(clickedCube.scale);
}
window.addEventListener('click', onCubeClick);

// Track intersection state for each controller
let isIntersectingController1 = false;
let isIntersectingController2 = false;

const arrowHelpers = [controller1, controller2].map(() => {
    const arrowHelper = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, -1), 
        new THREE.Vector3(0, 0, 0),  
        1,                           
        0x00ff00                     
    );
    scene.add(arrowHelper); 
    return arrowHelper;
});

// Function to map velocity to volume using an exponential curve
function velocityToVolume(velocity, vMax = 5) {
    const vMin = 0.1; // Minimum velocity to trigger sound
    const volMin = 0.00001;
    const volMax = 1.0;
    const alpha = 5; // Adjust this for sensitivity
  
    velocity = Math.min(Math.max(velocity, vMin), vMax); // Clamp velocity
    return volMin + (volMax - volMin) * (1 - Math.exp(-alpha * (velocity / vMax)));
}
  
// Variables to store previous positions and timestamps
let previousPosition1 = new THREE.Vector3();
let previousPosition2 = new THREE.Vector3();
let previousTime = performance.now()

// Function to handle xylophone hit
function playNote(velocity) {
    const volume = velocityToVolume(velocity);
    sound.volume(volume);
    sound.play();
    console.log(`Velocity: ${velocity}, Volume: ${volume.toFixed(2)}`);
}

renderer.setAnimationLoop(() => {

    const currentTime = performance.now();
    const deltaTime = (currentTime - previousTime) / 1000; // Convert to seconds
    previousTime = currentTime;

    controls.update();
    cube.rotation.x += 0.005;

    // Sync wireframe with cube
    wireframe.position.copy(cube.position);
    wireframe.rotation.copy(cube.rotation);

    renderer.render(scene, camera);

    // Controller raycasting and intersection check
    [controller1, controller2].forEach((controller, index) => {
        if (!controller.matrixWorld) return; // Skip if controller matrix is not available

        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const arrowHelper = arrowHelpers[index];
        arrowHelper.position.copy(raycaster.ray.origin);
        arrowHelper.setDirection(raycaster.ray.direction);

        const intersects = raycaster.intersectObjects([cube]);

        // Check if the controller is currently intersecting the cube
        const isIntersectingNow = intersects.length > 0;

        let isIntersectingController = index === 0 ? isIntersectingController1 : isIntersectingController2;

        const currentPosition = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
        const previousPosition = index === 0 ? previousPosition1 : previousPosition2;
        const distance = currentPosition.distanceTo(previousPosition);
        const velocity = distance / deltaTime; // Velocity in units per second

        // Update previous position
        previousPosition.copy(currentPosition);

        // Play sound only when intersection starts
        if (isIntersectingNow && !isIntersectingController) {
            if (sound && sound.state() === 'loaded') {
                playNote(velocity);
            }
        }

        if (index === 0) {
            isIntersectingController1 = isIntersectingNow;
        } else {
            isIntersectingController2 = isIntersectingNow;
        }
    });
});

function animate() {
    renderer.render(scene, camera);
}
animate();


// Example of controlling sound with a button (outside the animation loop):
// const playButton = document.createElement('button');
// playButton.textContent = 'Play/Pause Sound';
// playButton.style.position = 'absolute'; // Position it
// playButton.style.top = '20px'; // Adjust top position
// playButton.style.left = '20px'; // Adjust left position
// playButton.style.zIndex = '10'; // Ensure it's on top of the canvas

// document.body.appendChild(playButton);

playButton.addEventListener('click', () => {
    if (sound) {
        if (sound.playing()) {
            sound.pause();
        } else {
            sound.play();
        }
    }
});

renderer.xr.addEventListener('sessionstart', () => {
    console.log("VR Session Started");
});

renderer.xr.addEventListener('sessionend', () => {
    console.log("VR Session Ended");
});

renderer.xr.addEventListener('error', (error) => {
    console.error("WebXR Error:", error);
});




