import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";
import Stats from "three/addons/libs/stats.module.js";
import "./style.css";

const scene = new THREE.Scene(); // Scene setup
scene.background = new THREE.Color(0xe0e0e0); // Background color

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft overall light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // Directional light
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5); // Hemisphere light
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Dramatic spotlights
const spotlight1 = new THREE.SpotLight(0xffffff, 0.5);
spotlight1.position.set(5, 5, 5);
spotlight1.castShadow = true;
scene.add(spotlight1);

const spotlight2 = new THREE.SpotLight(0xffffff, 0.5);
spotlight2.position.set(-5, 5, 5);
spotlight2.castShadow = true;
scene.add(spotlight2);

// Platform for the model
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  metalness: 0.5,
  roughness: 0.3,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;
plane.receiveShadow = true;
scene.add(plane);

// Loading the model
const loader = new GLTFLoader();
let model;
const parts = {
  shield: null,
  knife: null,
  gun: null,
  camera: null,
  handle: null,
};

loader.load("/vacuumbat.glb", (gltf) => {
  model = gltf.scene;

  // Adjusting size of model
  model.scale.set(0.8, 0.8, 0.8);
  model.position.set(-6, -1.5, -2);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
    // Setting up individual parts to toggle visibility
    if (child.name.includes("Shield"))
      (parts.shield = child), (parts.shield.visible = false);
    if (child.name.includes("Knife"))
      (parts.knife = child), (parts.knife.visible = false);
    if (child.name.includes("Gun"))
      (parts.gun = child), (parts.gun.visible = false);
    if (child.name.includes("Camera"))
      (parts.camera = child), (parts.camera.visible = false);
    if (child.name.includes("Handle"))
      (parts.handle = child), (parts.handle.visible = false);
  });

  scene.add(model);

  // Setting up rotation around the model
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);

  function animate() {
    requestAnimationFrame(animate);

    if (modelControls.autoRotate) {
      modelControls.rotationAngle += modelControls.rotationSpeed;
      const radius = 3;
      camera.position.x =
        radius * Math.sin(modelControls.rotationAngle) + center.x;
      camera.position.z =
        radius * Math.cos(modelControls.rotationAngle) + center.z;
      camera.lookAt(center);
    }

    controls.update();
    stats.update();
    renderer.render(scene, camera);
  }
  animate();
});

// Setting up GUI controls
const gui = new GUI({ width: 300 });

// Rotation controls
const rotationFolder = gui.addFolder("Rotation Controls");
const modelControls = {
  rotationAngle: 0,
  rotationSpeed: 0.01,
  autoRotate: true,
};
rotationFolder.add(modelControls, "autoRotate").name("Toggle Rotation");
rotationFolder
  .add(modelControls, "rotationSpeed", 0, 0.1, 0.001)
  .name("Rotation Speed");
rotationFolder.open();

// Visibility controls
const visibilityFolder = gui.addFolder("Visibility Controls");
const toggleParts = {
  shield: false,
  knife: false,
  gun: false,
  camera: false,
  handle: false,
};

Object.keys(parts).forEach((part) => {
  visibilityFolder
    .add(toggleParts, part)
    .name(`Toggle ${part.charAt(0).toUpperCase() + part.slice(1)}`)
    .onChange((value) => {
      if (parts[part]) parts[part].visible = value;
    });
});
visibilityFolder.open();

// Setting up controls to manipulate the camera and model interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enableZoom = true;
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = 0;

// Resizing the renderer and camera on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
