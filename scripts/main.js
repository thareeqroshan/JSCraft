import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { World } from "./world.js";
import { createUI } from "./ui.js";
import { Player } from "./player.js";

const stats = new Stats();
document.body.appendChild(stats.dom);

//Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Camera setup
const orbitCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
orbitCamera.position.set(-24, 50, 20);
orbitCamera.lookAt(0, 0, 0);

const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.target.set(32, 0, 16);
controls.update();

// Scene setup
const scene = new THREE.Scene();
const world = new World();
world.generate();
scene.add(world);

const player = new Player(scene);

function setupLights() {
  const sun = new THREE.DirectionalLight();
  sun.position.set(50, 50, 50);
  sun.castShadow = true;
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.001;
  sun.shadow.mapSize = new THREE.Vector2(512, 512);
  scene.add(sun);

  const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
  // scene.add(shadowHelper);
  const ambientLight = new THREE.AmbientLight();
  ambientLight.intensity = 0.1;
  scene.add(ambientLight);
}

let previousTime = performance.now();

// Render loop
function animate() {
  let currentTime = performance.now();
  let deltaTime = (currentTime - previousTime) / 1000;
  requestAnimationFrame(animate);
  player.applyInput(deltaTime);
  renderer.render(
    scene,
    player.controls.isLocked ? player.camera : orbitCamera
  );
  stats.update();

  previousTime = currentTime;
}

window.addEventListener("resize", () => {
  orbitCamera.aspect = window.innerWidth / window.innerHeight;
  orbitCamera.updateProjectionMatrix();
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setupLights();
createUI(world, player);
animate();
