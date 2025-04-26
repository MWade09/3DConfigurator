// Import necessary parts from the Three.js library
import * as THREE from 'three';
// Import OrbitControls for mouse interaction
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Basic Setup ---

// 1. Scene: Like a container for all our objects, lights, cameras
const scene = new THREE.Scene();
// Change background to black for deep space feel
scene.background = new THREE.Color(0x000000); // Black

// 2. Camera: Defines what we see. PerspectiveCamera mimics the human eye.
//    Arguments: FOV (field of view), aspect ratio, near clip plane, far clip plane
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Move the camera back a bit

// 3. Renderer: Draws the scene using WebGL.
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias smooths edges
renderer.setSize(window.innerWidth, window.innerHeight); // Set size to full window
document.body.appendChild(renderer.domElement); // Add the renderer's canvas element to the HTML

// --- Add Lights ---

// AmbientLight: Illuminates all objects in the scene equally from all directions.
// Doesn't cast shadows. Good for providing basic visibility.
// Arguments: color, intensity (0 to 1)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // White light, medium intensity
scene.add(ambientLight);

// Optional: Add a directional light for more definition
// DirectionalLight: Shines from a specific direction, like the sun. Can cast shadows.
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5); // Position the light source
scene.add(directionalLight);


// --- Create the Torus ---

// Geometry: Change from Box to Torus
// Arguments: radius, tubeRadius, radialSegments, tubularSegments
const geometry = new THREE.TorusGeometry(1.5, 0.5, 32, 100); // Make it a bit bigger

// Material: Change to MeshStandardMaterial for realistic lighting
// MeshStandardMaterial reacts to lights in the scene.
const material = new THREE.MeshStandardMaterial({
    color: 0xffd700,    // Gold color
    metalness: 0.7,     // How metallic it looks (0 to 1)
    roughness: 0.2      // How rough the surface is (0=smooth mirror, 1=diffuse)
});

// Mesh: Combines the geometry and material into an object
const torus = new THREE.Mesh(geometry, material);
scene.add(torus); // Add the torus to our scene

// --- Add Controls ---

// OrbitControls allow the camera to orbit around a target.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: adds inertia to camera movement
controls.dampingFactor = 0.05;

// --- Animation Loop ---

// This function runs over and over (ideally 60 times per second)
function animate() {
    requestAnimationFrame(animate); // Tell the browser to run this function again on the next frame

    // Rotate the torus slightly each frame
    torus.rotation.x += 0.005;
    torus.rotation.y += 0.01;
    torus.rotation.z -= 0.003; // Add some z-axis rotation too

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