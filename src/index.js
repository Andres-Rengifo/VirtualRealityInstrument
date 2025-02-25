import { setupScene } from './scene/setupScene.js';
import { setupCamera } from './scene/setupCamera.js';
import { setupRenderer } from './scene/setupRenderer.js';
import { setupLights } from './scene/setupLights.js';
import { createCube } from './objects/createCube.js';
import { createWireframe } from './objects/createWireframe.js';
import { setupControllers } from './controllers/setupControllers.js';
import { setupAudio } from './audio/setupAudio.js';
import { initResizeHandler } from './utils/resizeHandler.js';
import { animate } from './animate.js';

// Initialize scene, camera, renderer, and lights
const scene = setupScene();
const camera = setupCamera();
const renderer = setupRenderer();
setupLights(scene);

// Create cube and wireframe
const cube = createCube();
scene.add(cube);
const wireframe = createWireframe(cube);
scene.add(wireframe);

// Set up VR controllers
const { controller1, controller2, controller1Raycaster, controller2Raycaster } = setupControllers(scene, renderer);

// Set up audio
const sound = setupAudio();

// Handle window resizing
initResizeHandler(camera, renderer);

// Start animation loop
animate(scene, camera, renderer, cube, wireframe, controller1, controller2, controller1Raycaster, controller2Raycaster, sound);


