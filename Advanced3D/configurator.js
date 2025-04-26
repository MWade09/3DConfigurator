// Current Date and Time (UTC): 2025-04-25 19:50:41
// User: MWade09
// Attempt: Corrected version after user feedback on Step 3 errors.

// --- Get DOM Elements ---
const backgroundColorInput = document.getElementById('backgroundColor');
const animateToggle = document.getElementById('animateToggle');
const rotationControls = document.getElementById('rotationControls');
const rotationXInput = document.getElementById('rotationX');
const rotationYInput = document.getElementById('rotationY');
const rotationZInput = document.getElementById('rotationZ');
const rotationXValueSpan = document.getElementById('rotationXValue');
const rotationYValueSpan = document.getElementById('rotationYValue');
const rotationZValueSpan = document.getElementById('rotationZValue');
const addObjectButton = document.getElementById('addObjectButton');
const objectListUl = document.getElementById('object-list');
const detailEditorDiv = document.getElementById('detailEditor');
const detailEditorTitle = document.getElementById('detailEditorTitle');
const geometrySelect = document.getElementById('geometry');
const positionXInput = document.getElementById('positionX');
const positionYInput = document.getElementById('positionY');
const positionZInput = document.getElementById('positionZ');
const materialTypeSelect = document.getElementById('materialType');
const objectColorInput = document.getElementById('objectColor');
const standardMaterialControls = document.getElementById('standardMaterialControls');
const metalnessInput = document.getElementById('metalness');
const roughnessInput = document.getElementById('roughness');
const metalnessValueSpan = document.getElementById('metalnessValue');
const roughnessValueSpan = document.getElementById('roughnessValue');
const wireframeToggle = document.getElementById('wireframeToggle');
const generateButton = document.getElementById('generateButton');
const downloadButton = document.getElementById('downloadButton');
const previewContainer = document.getElementById('preview-container');

// --- State Management ---
let globalSettings = {
    backgroundColor: '#000000',
    animate: true,
    rotationX: 0.005,
    rotationY: 0.01,
    rotationZ: 0
};

let sceneObjects = []; // Array holds config for each object
let nextObjectId = 1;
let selectedObjectId = null; // ID of the object being edited

// Store generated code for download
let generatedHtmlContent = '';
let generatedJsContent = '';

// --- Event Listeners ---
// Scene Settings Listeners
backgroundColorInput.addEventListener('input', () => globalSettings.backgroundColor = backgroundColorInput.value);
animateToggle.addEventListener('change', () => {
    globalSettings.animate = animateToggle.checked;
    toggleRotationControls();
});
rotationXInput.addEventListener('input', () => {
    globalSettings.rotationX = parseFloat(rotationXInput.value);
    updateSliderValue(rotationXInput, rotationXValueSpan);
});
rotationYInput.addEventListener('input', () => {
    globalSettings.rotationY = parseFloat(rotationYInput.value);
    updateSliderValue(rotationYInput, rotationYValueSpan);
});
rotationZInput.addEventListener('input', () => {
    globalSettings.rotationZ = parseFloat(rotationZInput.value);
    updateSliderValue(rotationZInput, rotationZValueSpan);
});

// Object Management Listeners
addObjectButton.addEventListener('click', addObject);

// Detail Editor Listeners
geometrySelect.addEventListener('change', handleDetailChange);
positionXInput.addEventListener('input', handleDetailChange);
positionYInput.addEventListener('input', handleDetailChange);
positionZInput.addEventListener('input', handleDetailChange);
materialTypeSelect.addEventListener('change', handleDetailChange);
objectColorInput.addEventListener('input', handleDetailChange);
wireframeToggle.addEventListener('change', handleDetailChange);
metalnessInput.addEventListener('input', handleDetailChange);
roughnessInput.addEventListener('input', handleDetailChange);

// Action Listeners
generateButton.addEventListener('click', handleGeneratePreview);
downloadButton.addEventListener('click', handleDownload);


// --- Initial Setup ---
updateGlobalControlsDisplay();
addObject(); // Start with one default object

// --- Helper Functions ---
function updateSliderValue(slider, span) {
    if (span) span.textContent = slider.value;
}

function toggleRotationControls() {
    // Show/hide global rotation speed sliders
    if (globalSettings.animate) {
        rotationControls.classList.remove('d-none');
    } else {
        rotationControls.classList.add('d-none');
    }
}

function updateGlobalControlsDisplay() {
    // Reflect initial globalSettings state in the UI
    backgroundColorInput.value = globalSettings.backgroundColor;
    animateToggle.checked = globalSettings.animate;
    rotationXInput.value = globalSettings.rotationX;
    rotationYInput.value = globalSettings.rotationY;
    rotationZInput.value = globalSettings.rotationZ;
    updateSliderValue(rotationXInput, rotationXValueSpan);
    updateSliderValue(rotationYInput, rotationYValueSpan);
    updateSliderValue(rotationZInput, rotationZValueSpan);
    toggleRotationControls();
}

// --- Object Management Functions ---

function renderObjectList() {
    objectListUl.innerHTML = ''; // Clear current list
    if (sceneObjects.length === 0) {
        objectListUl.innerHTML = '<li class="list-group-item text-muted">No objects added yet.</li>';
        return;
    }

    sceneObjects.forEach(obj => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        if (obj.id === selectedObjectId) {
            li.classList.add('active'); // Bootstrap class for highlighting
        }
        li.setAttribute('role', 'button'); // Make it seem clickable

        const nameSpan = document.createElement('span');
        // Use textContent for security
        nameSpan.textContent = obj.name || `Object ${obj.id}`;
        li.appendChild(nameSpan);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-close'; // Bootstrap close button
        removeBtn.setAttribute('aria-label', 'Remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent li click event when clicking button
            removeObject(obj.id);
        });
        li.appendChild(removeBtn);

        // Select object when clicking the list item (but not the remove button)
        li.addEventListener('click', () => {
            selectObject(obj.id);
        });

        objectListUl.appendChild(li);
    });
}

function addObject() {
    const newId = nextObjectId++;
    const defaultGeometry = 'BoxGeometry';
    const newObject = {
        id: newId,
        name: `${defaultGeometry.replace('Geometry', '')} ${newId}`,
        geometry: defaultGeometry,
        materialType: 'MeshStandardMaterial',
        color: '#3399ff',
        wireframe: false,
        metalness: 0.5,
        roughness: 0.5,
        position: { x: 0, y: 0, z: 0 },
    };
    sceneObjects.push(newObject);
    selectObject(newId); // Select the newly added object
}

function removeObject(id) {
    sceneObjects = sceneObjects.filter(obj => obj.id !== id);
    if (selectedObjectId === id) {
        selectedObjectId = sceneObjects.length > 0 ? sceneObjects[sceneObjects.length - 1].id : null;
        // Update detail controls *after* selectedObjectId might have changed
        populateDetailControls();
    }
    // Always re-render the list after removal
    renderObjectList();
}

function selectObject(id) {
    if (selectedObjectId !== id) { // Only run if selection actually changes
        selectedObjectId = id;
        populateDetailControls();
        renderObjectList(); // Update highlighting
    }
}

function populateDetailControls() {
    const selectedObject = sceneObjects.find(obj => obj.id === selectedObjectId);

    // Define all detail control elements in one place
    const detailControls = [
        geometrySelect, positionXInput, positionYInput, positionZInput,
        materialTypeSelect, objectColorInput, wireframeToggle,
        metalnessInput, roughnessInput
    ];

    if (selectedObject) {
        detailEditorDiv.classList.remove('opacity-50');
        detailEditorTitle.textContent = `Editing: ${selectedObject.name}`;

        // Enable controls
        detailControls.forEach(control => control.disabled = false);

        // Set values from selectedObject state
        geometrySelect.value = selectedObject.geometry;
        positionXInput.value = selectedObject.position.x;
        positionYInput.value = selectedObject.position.y;
        positionZInput.value = selectedObject.position.z;
        materialTypeSelect.value = selectedObject.materialType;
        objectColorInput.value = selectedObject.color;
        wireframeToggle.checked = selectedObject.wireframe;
        metalnessInput.value = selectedObject.metalness;
        roughnessInput.value = selectedObject.roughness;
        updateSliderValue(metalnessInput, metalnessValueSpan);
        updateSliderValue(roughnessInput, roughnessValueSpan);

        toggleDetailMaterialControls(); // Show/hide relevant controls based on material

    } else {
        // No object selected, clear/disable the form
        detailEditorDiv.classList.add('opacity-50');
        detailEditorTitle.textContent = 'Select an object to edit';

        // Disable controls
        detailControls.forEach(control => control.disabled = true);
        wireframeToggle.checked = false; // Explicitly uncheck
        standardMaterialControls.classList.add('d-none'); // Ensure standard controls are hidden

        // Optional: Reset form fields to default values if desired
        // geometrySelect.value = 'BoxGeometry';
        // ... etc ...
    }
}

function toggleDetailMaterialControls() {
    // This function specifically handles the visibility and disabled state
    // of controls *within* the detail editor based on the selected material type.
    const selectedObject = sceneObjects.find(obj => obj.id === selectedObjectId);

    // Check if an object is selected and its material type
    const isStandard = selectedObject && selectedObject.materialType === 'MeshStandardMaterial';

    if (isStandard) {
        standardMaterialControls.classList.remove('d-none');
        metalnessInput.disabled = false;
        roughnessInput.disabled = false;
    } else {
        standardMaterialControls.classList.add('d-none');
        // Ensure disabled even if hidden, good practice
        metalnessInput.disabled = true;
        roughnessInput.disabled = true;
    }
}

// --- Detail Change Handler ---
function handleDetailChange(event) {
    if (selectedObjectId === null) return;

    const selectedObject = sceneObjects.find(obj => obj.id === selectedObjectId);
    if (!selectedObject) return;

    const target = event.target;
    const property = target.id;

    let value;
    let needsListRender = false;

    // Determine value based on input type
    switch (target.type) {
        case 'checkbox':
            value = target.checked;
            break;
        case 'range':
        case 'number':
            value = parseFloat(target.value);
            if (isNaN(value)) { // Handle potential NaN from parseFloat
                console.warn(`Invalid number input for ${property}: ${target.value}`);
                value = 0; // Or keep previous value? For now, default to 0.
            }
            if (target.type === 'range') {
                const spanId = property + 'Value';
                const spanElement = document.getElementById(spanId);
                updateSliderValue(target, spanElement);
            }
            break;
        case 'color':
        case 'select-one':
        default:
            value = target.value;
            break;
    }

    // Update the correct property in the selected object's state
    switch (property) {
        case 'geometry':
            selectedObject.geometry = value;
            selectedObject.name = `${value.replace('Geometry', '')} ${selectedObject.id}`;
            detailEditorTitle.textContent = `Editing: ${selectedObject.name}`;
            needsListRender = true;
            break;
        case 'positionX':
            selectedObject.position.x = value;
            break;
        case 'positionY':
            selectedObject.position.y = value;
            break;
        case 'positionZ':
            selectedObject.position.z = value;
            break;
        case 'materialType':
            selectedObject.materialType = value;
            // Update UI immediately after changing material type
            toggleDetailMaterialControls();
            break;
        case 'objectColor':
            selectedObject.color = value;
            break;
        case 'wireframeToggle':
            selectedObject.wireframe = value;
            break;
        case 'metalness':
            selectedObject.metalness = value;
            break;
        case 'roughness':
            selectedObject.roughness = value;
            break;
        // No default needed as we handle specific IDs
    }

    if (needsListRender) {
        renderObjectList();
    }
    // console.log(`Updated object ${selectedObjectId}:`, selectedObject); // For debugging
}


// --- Code Generation ---

function handleGeneratePreview() {
    console.log("Generating preview...");
    console.log("Current Global Settings:", globalSettings);
    console.log("Current Scene Objects:", sceneObjects);

    try {
        generatedJsContent = generateScriptCode(globalSettings, sceneObjects);
        generatedHtmlContent = generateHtmlCode(generatedJsContent, globalSettings.backgroundColor);

        displayPreview(generatedHtmlContent);
        downloadButton.disabled = false;
        console.log("Preview generation successful.");
    } catch (error) {
        console.error("Error during preview generation:", error);
        // Display error to user? Maybe in preview pane?
        previewContainer.innerHTML = `<div class="alert alert-danger m-3" role="alert">
            <strong>Error Generating Code:</strong><br>
            <pre>${error.message}\n\nPlease check your console for more details.</pre>
          </div>`;
        downloadButton.disabled = true;
    }
}

function generateScriptCode(globals, objects) {
    // --- Boilerplate ---
    let script = `
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Scene, Camera, Renderer ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Adjust camera Z based on number of objects? Maybe later.
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0); // Ensure controls target the origin

`; // End boilerplate

    // --- Lights ---
    const needsLights = objects.some(obj => obj.materialType === 'MeshStandardMaterial');
    if (needsLights) {
        script += `
// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5); // Position light source
scene.add(directionalLight);
// Optional: Add another light from a different angle?
// const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
// directionalLight2.position.set(-5, -5, -2);
// scene.add(directionalLight2);

`;
    } else {
        script += `
// --- Lights ---
// No MeshStandardMaterial used, skipping lights.

`;
    }

    // --- Object Creation Loop ---
    script += `
// --- Meshes ---
const meshes = []; // Array to hold mesh references for animation
`;

    if (objects.length === 0) {
        script += `
// No objects defined in the scene.
`;
    }

    objects.forEach(obj => {
        // Geometry Definition
        let geometryParams = '';
        switch (obj.geometry) {
            case 'SphereGeometry': geometryParams = `1.5, 32, 16`; break; // radius, widthSegments, heightSegments
            case 'TorusGeometry': geometryParams = `1.5, 0.5, 32, 100`; break; // radius, tube, radialSegments, tubularSegments
            case 'ConeGeometry': geometryParams = `1.5, 3, 32`; break; // radius, height, radialSegments
            case 'CylinderGeometry': geometryParams = `1, 1, 3, 32`; break; // radiusTop, radiusBottom, height, radialSegments
            case 'DodecahedronGeometry': geometryParams = `1.5`; break; // radius
            case 'IcosahedronGeometry': geometryParams = `1.5`; break; // radius
            case 'PlaneGeometry': geometryParams = `4, 4`; break; // width, height
            case 'BoxGeometry': default: geometryParams = `2, 2, 2`; break; // width, height, depth
        }
        const geometryCreationCode = `new THREE.${obj.geometry}(${geometryParams})`;

        // Material Options Object
        let materialOptions = {
            color: obj.color,
            wireframe: obj.wireframe
        };
        if (obj.geometry === 'PlaneGeometry') {
            materialOptions.side = 'THREE.DoubleSide'; // Use string for code gen
        }
        if (obj.materialType === 'MeshStandardMaterial') {
            materialOptions.metalness = obj.metalness;
            materialOptions.roughness = obj.roughness;
        }

        // Convert options object to string for code generation
        // Important: Handles string values vs numeric/boolean values correctly
        let optionsString = Object.entries(materialOptions)
            .map(([key, value]) => {
                if (key === 'side') return `side: ${value}`; // THREE.DoubleSide is special
                if (typeof value === 'string') return `${key}: '${value}'`;
                return `${key}: ${value}`;
            })
            .join(',\n        ');

        const materialCreationCode = `new THREE.${obj.materialType}({\n        ${optionsString}\n    })`;

        // Add code block for this object
        script += `
// Object ID: ${obj.id} (${obj.name})
try {
    const geometry_${obj.id} = ${geometryCreationCode};
    const material_${obj.id} = ${materialCreationCode};
    const mesh_${obj.id} = new THREE.Mesh(geometry_${obj.id}, material_${obj.id});
    mesh_${obj.id}.position.set(${obj.position.x}, ${obj.position.y}, ${obj.position.z});
    `;

        // Initial Plane rotation (only if it's a Plane)
        if (obj.geometry === 'PlaneGeometry') {
            script += `mesh_${obj.id}.rotation.x = -Math.PI / 4;\n    `;
        }

        script += `scene.add(mesh_${obj.id});
    meshes.push(mesh_${obj.id}); // Add to meshes array
} catch (error) {
    console.error('Error creating object ${obj.id} (${obj.name}):', error);
    // Optionally add a visual indicator in the scene?
}

`;
    }); // End forEach object

    // --- Animation Loop ---
    script += `
// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

`; // End Animation Loop start

    if (globals.animate && objects.length > 0) {
        script += `
    // Apply global rotation to all meshes
    meshes.forEach((mesh, index) => {
        // Example: Could vary rotation slightly per mesh index?
        // mesh.rotation.x += globals.rotationX * (1 + index * 0.1);
        mesh.rotation.x += ${globals.rotationX};
        mesh.rotation.y += ${globals.rotationY};
        mesh.rotation.z += ${globals.rotationZ};
    });
`;
    } else {
        script += `    // Global animation disabled or no objects in scene.\n`;
    }

    script += `
    controls.update(); // Update orbit controls
    renderer.render(scene, camera);
}

`; // End Animation Loop function

    // --- Resize Handler ---
    script += `
// --- Resize Handling ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

`; // End Resize Handler

    // --- Start ---
    script += `
// --- Start ---
try {
    animate();
} catch (error) {
    console.error("Error starting animation loop:", error);
    // Display error in UI?
}
`; // End Start

    return script;
}


// --- Unchanged Functions (generateHtmlCode, displayPreview, handleDownload, downloadFile) ---
function generateHtmlCode(scriptContent, backgroundColor) {
    // Simple HTML structure, includes import map
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
    // Use iframe to isolate preview context
    previewContainer.innerHTML = ''; // Clear previous preview / error message
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.srcdoc = htmlContent; // Safely renders the HTML content
    previewContainer.appendChild(iframe);
}

function handleDownload() {
    // Simple download logic for the generated files
    if (!generatedHtmlContent || !generatedJsContent) {
        alert("Please generate the scene first!");
        return;
    }
    downloadFile('index.html', generatedHtmlContent, 'text/html');
    downloadFile('script.js', generatedJsContent, 'text/javascript');
}

function downloadFile(filename, content, mimeType) {
    // Standard approach to trigger browser download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append anchor to body
    a.click(); // Simulate click
    document.body.removeChild(a); // Clean up anchor
    URL.revokeObjectURL(url); // Free up memory
}