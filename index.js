import gsap from "gsap";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Howl } from 'howler'; // Import Howler
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';  // Add this import

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Enable WebXR
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Controllers 
const controller1 = renderer.xr.getController(0); // Get the first controller
const controller2 = renderer.xr.getController(1); // Get the second controller

// Add controllers to the scene
scene.add(controller1);
scene.add(controller2);

const controller1Raycaster = new THREE.Raycaster();
const controller2Raycaster = new THREE.Raycaster();


// Create the controller model factory
const controllerModelFactory = new XRControllerModelFactory();

// Create and add a model for controller 1
const controllerModel1 = controllerModelFactory.createControllerModel(controller1);
controller1.add(controllerModel1); // Attach the model to controller 1

// Create and add a model for controller 2
const controllerModel2 = controllerModelFactory.createControllerModel(controller2);
controller2.add(controllerModel2); // Attach the model to controller 2

// Optionally adjust their position or rotation
controller1.position.set(0, -0.1, -0.05);
controller2.position.set(0, -0.1, -0.05);

let sound;

// Load sound:
try {
    sound = new Howl({
        src: ['./note1.mp3'], // Provide multiple formats for browser compatibility
        loop: false, // Set to true if you want the sound to loop
        volume: 1, // Adjust volume (0.0 to 1.0)
        onend: function() { // Event listener for when the sound finishes playing
            sound.canPlay = true; // Reset the canPlay flag
        }
    });

    sound.on('load', function() {
        console.log('Sound loaded!');
        // Optionally, play the sound immediately after loading:
        // sound.play();
    });

    sound.on('loaderror', function(error) {
        console.error('Error loading sound:', error);
    });

    sound.canPlay = true;

} catch (error) {
    console.error("Howler initialization error:", error);
}

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xCC0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

camera.position.z = 2;

const edges = new THREE.EdgesGeometry(geometry); // Create edges geometry
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black lines
const wireframe = new THREE.LineSegments(edges, lineMaterial); // Create line segments
scene.add(wireframe); // Add wireframe as a child of the cube

const controls = new OrbitControls(camera, renderer.domElement);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const raycaster = new THREE.Raycaster();

// Function to handle cube click
function onCubeClick(event) {
    const mouse = new THREE.Vector2();

    // Calculate mouse position in normalized device coordinates (-1 to +1) for both axes
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the raycaster
    const intersects = raycaster.intersectObjects([cube]); // Pass an array of objects to check

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

renderer.setAnimationLoop(function () {
    controls.update(); // Update OrbitControls
    cube.rotation.x += 0.005; // Example animation
    renderer.render(scene, camera);
    wireframe.position.copy(cube.position); // Keep the wireframe synced
    wireframe.rotation.copy(cube.rotation);

    renderer.render(scene, camera);
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





