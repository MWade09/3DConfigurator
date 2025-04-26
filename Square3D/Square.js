// Import necessary parts from the Three.js library
import * as THREE from 'three';
// Import OrbitControls for mouse interaction
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Basic Setup ---

// 1. Scene: Like a container for all our objects, lights, cameras
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee); // Set background color to light gray

// 2. Camera: Defines what we see. PerspectiveCamera mimics the human eye.
//    Arguments: FOV (field of view), aspect ratio, near clip plane, far clip plane
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Move the camera back a bit so we can see the cube

// 3. Renderer: Draws the scene using WebGL.
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias smooths edges
renderer.setSize(window.innerWidth, window.innerHeight); // Set size to full window
document.body.appendChild(renderer.domElement); // Add the renderer's canvas element to the HTML

// --- Create the Cube ---

// Geometry: The shape of the object (a box)
const geometry = new THREE.BoxGeometry(1, 1, 1); // Width, height, depth

// Material: How the object looks (a simple blue color, doesn't need light)
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

// Mesh: Combines the geometry and material into an object
const cube = new THREE.Mesh(geometry, material);
scene.add(cube); // Add the cube to our scene

// --- Add Controls ---

// OrbitControls allow the camera to orbit around a target.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: adds inertia to camera movement
controls.dampingFactor = 0.05;

// --- Animation Loop ---

// This function runs over and over (ideally 60 times per second)
function animate() {
    requestAnimationFrame(animate); // Tell the browser to run this function again on the next frame

    // Rotate the cube slightly each frame
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Update the controls (needed if damping is enabled)
    controls.update();

    // Render the scene from the camera's perspective
    renderer.render(scene, camera);
}

// --- Handle Window Resizing ---

window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Apply the changes

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// --- Start the Animation ---
animate();