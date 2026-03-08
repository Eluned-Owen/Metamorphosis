import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//loading in audio
var heartbeat = document.getElementById("heartbeat");
var cough= document.getElementById("cough");
var loadingCondition = 1

function heartbeatPlay(){
  heartbeat.play()
  heartbeat.loop = true;
}

function coughPlay(){
  cough.play()
}

//hiding the loading screen on button press
function hidingLoading() {
  const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
  loadingCondition = 0;
  heartbeatPlay()
  
};

const hideLoadingButton = document.getElementById('hideLoadingButton');

if (hideLoadingButton) {
    hideLoadingButton.addEventListener('click', hidingLoading);
}

//ThreeJS assigning renderer and canvas size
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//background colour
const r = 67 / 255;
const g = 23 / 255;
const b = 85 / 255;
const backgroundColor = new renderer.setClearColor(new THREE.Color(r, g, b))
renderer.setClearColor(backgroundColor)

//scene and camera 
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//                  x  y  z
camera.position.set(0, 3.1, 9);

//orbit controls and aids
/* const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 20, 100 );
controls.update();  */

/* const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper); */

// Lights
const directional = new THREE.DirectionalLight(0xff84a1, 4);
directional.position.set(10, 15, 3);
scene.add(directional);

const directional2 = new THREE.DirectionalLight(0xfffff, 1);
directional2.position.set(1, 15, 10);
scene.add(directional2);

const directional3 = new THREE.DirectionalLight(0xff84a1, 2);
directional3.position.set(10, 0, 3);
scene.add(directional3);

const directional4 = new THREE.DirectionalLight(0x2596be, 1);
directional4.position.set(-5, 3, 3);
scene.add(directional4);

//creating variable names for objects to append by
let eyeLeft = null
let eyeRight = null

let icon = null
let bar = null
let originalScale = null
let filter = null

let backVain
let frontLVein
let frontRVein

let originalScaleLiver
let originalScaleLung
let originalScaleHeart

let liver = null
let heart = null
let lung = null

//loading models from blender
const loader = new GLTFLoader();
loader.load(
  'assets/TheGuts.glb',
  (gltf) => {
    backVain = gltf.scene.getObjectByName("BackVain")
    frontLVein = gltf.scene.getObjectByName("FrontLVein")
    frontRVein = gltf.scene.getObjectByName("FrontRVein")

    scene.add(gltf.scene);
  });

loader.load(
  'assets/TheEyes.glb',
  (gltf) => {
    eyeRight = gltf.scene.getObjectByName('EyeRight')
    eyeLeft = gltf.scene.getObjectByName('EyeLeft');

    scene.add(gltf.scene);
  }
);

loader.load(
  'assets/Filter.glb',
  (gltf) => {
    filter = gltf.scene.getObjectByName("filter")

    scene.add(gltf.scene);
  }
);

loader.load(
  'assets/TheOrgans3.glb',
  (gltf) => {
    liver = gltf.scene.getObjectByName('Liver');
    heart = gltf.scene.getObjectByName('Heart');
    lung = gltf.scene.getObjectByName('Sphere');

    //storing the original size for use later
    if (liver) {
    originalScaleLiver = liver.scale.clone(); 
    }
    if (heart) {
    originalScaleHeart = heart.scale.clone(); 
    }
    if (lung) {
    originalScaleLung = lung.scale.clone();
    }

    scene.add(gltf.scene);
  });
loader.load('assets/gameAssets.glb', 
  (gltf) => {
  bar = gltf.scene.getObjectByName('bar');
  icon = gltf.scene.getObjectByName('icon');
  
  //storing the original size for later use
  if (icon) {
    originalScale = icon.scale.clone();
  }

  scene.add(gltf.scene);
});

//ThreeJS ineraction data
let mouseX = 0;
let mouseY = 0;
let press = 0;

document.addEventListener('mousemove', (event) => {
  //normailising the mouseX and Y for eye tracking ease
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  //console.log("X =", mouseX,"Y =", mouseY )
});

document.addEventListener('keydown', (event) => {
  press = event.key;
});

//creating a clock for animation uses
const state = {
    clock: new THREE.Clock(),
    frame: 0,
    maxFrame: 90,
    fps: 30,
    per: 0
};

//variables for mini game
const startX = 2.6;
const endX = -3.2
const speed = 0.03;

var pressTrue = 0
let targetOpacity = 0;

state.clock.start();

function animate() {
  requestAnimationFrame(animate);

  if (eyeLeft && eyeRight) {
    //the constraints of the eye for realism
    const maxYaw = 0.8; 
    const maxPitch = 0.6;

    const yaw = mouseX * maxYaw;
    const pitch = mouseY * -maxPitch;

    eyeLeft.rotation.y = yaw;
    eyeLeft.rotation.x = pitch;

    eyeRight.rotation.y = yaw;
    eyeRight.rotation.x = pitch;
  }
   
  if (bar && icon) {
    bar.position.y = 2.1;
    bar.position.z = 2.8;

    icon.position.y = 2.1;
    icon.position.z = 2.9;

    // move icon backwards each frame
    icon.position.x -= speed;
    //console.log(icon.position.x)

    // when it passes the end, teleport it back
  if (icon.position.x <= endX) {
    icon.position.x = startX;
    press = 0;
  }

  //if the icon is at the end and the user pressed space scale up the icon
  if (icon.position.x <= -2.7 && press === " ") {
  icon.scale.set(-1, icon.scale.y, -1); 
  pressTrue = true;
  }
  if (pressTrue && icon && originalScale) {
  const speed = 0.03;

  //smoothly move scale back to original
  icon.scale.x += (originalScale.x - icon.scale.x) * speed;
  icon.scale.y += (originalScale.y - icon.scale.y) * speed;
  icon.scale.z += (originalScale.z - icon.scale.z) * speed;
  }

  //creating the organs animation
  if (liver && heart && lung ){
  const totalSecs = state.clock.getElapsedTime();

  liver.scale.x = 1+ Math.sin(totalSecs)/2
  heart.scale.z = 0.1 + Math.sin(totalSecs)/20
  lung.scale.z = 1 + Math.sin(totalSecs)/8
  }

  // stop when close enough
  if (
    Math.abs(icon.scale.x - originalScale.x) < 0.001 &&
    Math.abs(icon.scale.z - originalScale.z) < 0.001
  ) {
    icon.scale.copy(originalScale);
    pressTrue = false;
  }
  
  //setting up the red gradiant when the user misses a beat
  if (filter){
    filter.material.transparent = true;
    filter.position.y = 2;
    filter.position.z = 3.2;
  }

  // trigger fade-in otherwise fade out
  if (icon.position.x <= -3.1 && press === 0 && loadingCondition === 0) {
    coughPlay()
    targetOpacity = 6;
  }
  else {
    targetOpacity = 0;
  }
  if (filter && filter.material) {
  const fadeSpeed = 0.05; 

  filter.material.transparent = true;
  filter.material.opacity += (targetOpacity - filter.material.opacity) * fadeSpeed;
  }
  
  }

  renderer.render(scene, camera);
}


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
