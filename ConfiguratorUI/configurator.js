// --- Get DOM Elements ---
// (Keep all existing variables)
const geometrySelect = document.getElementById('geometry');
const materialTypeSelect = document.getElementById('materialType');
const objectColorInput = document.getElementById('objectColor');
const backgroundColorInput = document.getElementById('backgroundColor');
const standardMaterialControls = document.getElementById('standardMaterialControls');
const metalnessInput = document.getElementById('metalness');
const roughnessInput = document.getElementById('roughness');
const metalnessValueSpan = document.getElementById('metalnessValue');
const roughnessValueSpan = document.getElementById('roughnessValue');
const wireframeToggle = document.getElementById('wireframeToggle');
const animateToggle = document.getElementById('animateToggle');
const rotationControls = document.getElementById('rotationControls');
const rotationXInput = document.getElementById('rotationX');
const rotationYInput = document.getElementById('rotationY');
const rotationZInput = document.getElementById('rotationZ');
const rotationXValueSpan = document.getElementById('rotationXValue');
const rotationYValueSpan = document.getElementById('rotationYValue');
const rotationZValueSpan = document.getElementById('rotationZValue');
const generateButton = document.getElementById('generateButton');
const downloadButton = document.getElementById('downloadButton');
const previewContainer = document.getElementById('preview-container');

// Store generated code for download
let generatedHtmlContent = '';
let generatedJsContent = '';

// --- Event Listeners ---
// (Keep all existing listeners)
generateButton.addEventListener('click', handleGeneratePreview);
downloadButton.addEventListener('click', handleDownload);
materialTypeSelect.addEventListener('change', toggleMaterialControls);
metalnessInput.addEventListener('input', () => updateSliderValue(metalnessInput, metalnessValueSpan));
roughnessInput.addEventListener('input', () => updateSliderValue(roughnessInput, roughnessValueSpan));
rotationXInput.addEventListener('input', () => updateSliderValue(rotationXInput, rotationXValueSpan));
rotationYInput.addEventListener('input', () => updateSliderValue(rotationYInput, rotationYValueSpan));
rotationZInput.addEventListener('input', () => updateSliderValue(rotationZInput, rotationZValueSpan));
animateToggle.addEventListener('change', toggleRotationControls);

// --- Initial Setup ---
// (Keep existing setup calls)
toggleMaterialControls();
toggleRotationControls();
updateSliderValue(metalnessInput, metalnessValueSpan);
updateSliderValue(roughnessInput, roughnessValueSpan);
updateSliderValue(rotationXInput, rotationXValueSpan);
updateSliderValue(rotationYInput, rotationYValueSpan);
updateSliderValue(rotationZInput, rotationZValueSpan);


// --- Helper Functions ---
// (Keep existing helpers: updateSliderValue, toggleMaterialControls, toggleRotationControls)
function updateSliderValue(slider, span) {
    if (span) span.textContent = slider.value;
}

function toggleMaterialControls() {
    const selectedMaterial = materialTypeSelect.value;
    if (selectedMaterial === 'MeshStandardMaterial') {
        standardMaterialControls.classList.remove('d-none');
    } else {
        standardMaterialControls.classList.add('d-none');
    }
}

function toggleRotationControls() {
    if (animateToggle.checked) {
        rotationControls.classList.remove('d-none');
    } else {
        rotationControls.classList.add('d-none');
    }
}


// --- Core Functions ---

function handleGeneratePreview() {
    // (Keep existing config object creation)
     const config = {
        geometry: geometrySelect.value,
        materialType: materialTypeSelect.value,
        objectColor: objectColorInput.value,
        backgroundColor: backgroundColorInput.value,
        metalness: metalnessInput.value,
        roughness: roughnessInput.value,
        wireframe: wireframeToggle.checked,
        animate: animateToggle.checked,
        rotationX: rotationXInput.value,
        rotationY: rotationYInput.value,
        rotationZ: rotationZInput.value
    };

    generatedJsContent = generateScriptCode(config);
    generatedHtmlContent = generateHtmlCode(generatedJsContent, config.backgroundColor);
    displayPreview(generatedHtmlContent);
    downloadButton.disabled = false;
}


function generateScriptCode(config) {
    // (Material, Lights, Animation code generation remains the same)
    let materialOptions = `
    color: '${config.objectColor}',
    wireframe: ${config.wireframe}`;

    if (config.materialType === 'MeshStandardMaterial') {
        materialOptions += `,
    metalness: ${config.metalness},
    roughness: ${config.roughness}`;
        // Plane geometry needs a DoubleSide material to be visible from both sides
        if (config.geometry === 'PlaneGeometry') {
             materialOptions += `,
    side: THREE.DoubleSide`;
        }
        materialCreationCode = `const material = new THREE.MeshStandardMaterial({${materialOptions}});`;
    } else { // Basic Material
         if (config.geometry === 'PlaneGeometry') {
             materialOptions += `,
    side: THREE.DoubleSide`;
        }
         materialCreationCode = `const material = new THREE.MeshBasicMaterial({${materialOptions}});`;
    }

    const includeLights = config.materialType === 'MeshStandardMaterial';
    const lightsCode = includeLights ? `
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);` : '// Lights not needed for this material';

    const animationCode = config.animate ? `
    mesh.rotation.x += ${config.rotationX};
    mesh.rotation.y += ${config.rotationY};
    mesh.rotation.z += ${config.rotationZ};` : '// Animation disabled';

    // --- UPDATE GEOMETRY SWITCH STATEMENT ---
    let geometryCode = `let geometry;
switch ('${config.geometry}') {`; // Start Switch

    geometryCode += `
    case 'SphereGeometry':
        geometry = new THREE.SphereGeometry(1.5, 32, 16); // radius, widthSegments, heightSegments
        break;
    case 'TorusGeometry':
        geometry = new THREE.TorusGeometry(1.5, 0.5, 32, 100); // radius, tube, radialSegments, tubularSegments
        break;
    case 'ConeGeometry':
        geometry = new THREE.ConeGeometry(1.5, 3, 32); // radius, height, radialSegments
        break;
    case 'CylinderGeometry': // New
        geometry = new THREE.CylinderGeometry(1, 1, 3, 32); // radiusTop, radiusBottom, height, radialSegments
        break;
    case 'DodecahedronGeometry': // New
        geometry = new THREE.DodecahedronGeometry(1.5); // radius
        break;
    case 'IcosahedronGeometry': // New
        geometry = new THREE.IcosahedronGeometry(1.5); // radius
        break;
    case 'PlaneGeometry': // New
        geometry = new THREE.PlaneGeometry(4, 4); // width, height
        break;
    case 'BoxGeometry':
    default:
        geometry = new THREE.BoxGeometry(2, 2, 2); // width, height, depth
        break;
}`; // End Switch

    return `
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Scene, Camera, Renderer ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

${lightsCode}

// --- Geometry ---
${geometryCode} // Inject the generated geometry code block

// --- Material ---
${materialCreationCode}

// --- Mesh ---
const mesh = new THREE.Mesh(geometry, material);
// Rotate plane slightly so it's not edge-on initially
if (geometry instanceof THREE.PlaneGeometry) {
    mesh.rotation.x = -Math.PI / 4; // Rotate -45 degrees on X axis
}
scene.add(mesh);


// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
${animationCode}
    controls.update();
    renderer.render(scene, camera);
}

// --- Resize Handling ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// --- Start ---
animate();
`;
}


// --- generateHtmlCode, displayPreview, handleDownload, downloadFile remain the same ---
function generateHtmlCode(scriptContent, backgroundColor) {
    // (Same as before)
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Three.js Scene</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: ${backgroundColor}; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.163.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.163.0/examples/jsm/"
            }
        }
    </script>
    <script type="module">
${scriptContent}
    </script>
</body>
</html>`;
}

function displayPreview(htmlContent) {
    // (Same as before)
    previewContainer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.srcdoc = htmlContent;
    previewContainer.appendChild(iframe);
}

function handleDownload() {
    // (Same as before)
    if (!generatedHtmlContent || !generatedJsContent) {
        alert("Please generate the scene first!");
        return;
    }
    downloadFile('index.html', generatedHtmlContent, 'text/html');
    downloadFile('script.js', generatedJsContent, 'text/javascript');
}

function downloadFile(filename, content, mimeType) {
    // (Same as before)
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
