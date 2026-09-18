import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. 基础环境
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122); // 暗色展馆背景

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true }); // 开启抗锯齿
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // 开启阴影
container.appendChild(renderer.domElement);

// 2. 控制器 (研究任务1: OrbitControls)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 3. 光源 (研究任务中要求场景含光源)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// 窗口 Resize 适配
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 1. 展台 (PlaneGeometry / 地面)
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 2. 相机模型 (组合几何体：Box + Cylinder)
const cameraGroup = new THREE.Group();
const bodyGeo = new THREE.BoxGeometry(1.5, 1, 0.8);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
cameraGroup.add(body);

const lensGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32);
const lensMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
const lens = new THREE.Mesh(lensGeo, lensMat);
lens.rotation.z = Math.PI / 2;
lens.position.set(-0.8, 0, 0);
cameraGroup.add(lens);

cameraGroup.position.set(0, 1.5, 0);
scene.add(cameraGroup);

// 3. 相框/照片 (不同材质：Standard + 发光效果)
const photos = []; // 用于后续交互
const frameGeo = new THREE.BoxGeometry(1.5, 1.2, 0.1);
const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const textureLoader = new THREE.TextureLoader();
const imagePaths = [
    'images/photo1.jpg',
    'images/photo2.jpg',
    'images/photo3.jpg',
    'images/photo4.png'
];

for (let i = 0; i < imagePaths.length; i++) {
    const frame = new THREE.Mesh(frameGeo, frameMat.clone());
    frame.position.set(-3 + i * 2, 2, -2);
    frame.castShadow = true;
    frame.userData = { title: `摄影作品 ${i + 1}` }; // 添加自定义数据供交互使用
    
    const texture = textureLoader.load(imagePaths[i]);
    const photoMat = new THREE.MeshStandardMaterial({ map: texture });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), photoMat);
    photo.position.z = 0.06;
    frame.add(photo);
    
    photos.push(frame);
    scene.add(frame);
}

// 点击交互研究 (Raycaster)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoPanel = document.getElementById('info-panel');

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(photos);
    
    if (intersects.length > 0) {
        // 变色的核心代码
        const hitObject = intersects[0].object;
        hitObject.material.color.set(0xffaa00); // 相框变金色
        infoPanel.innerText = `当前查看：${hitObject.userData.title}\n点击其它相框可切换`;
    }
});

// 动画循环 (加入动画元素)
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // 让相机模型缓缓旋转，增加场景活力 (至少一处动画)
    cameraGroup.rotation.y += 0.005;
    
    // 相框轻微上下浮动
    photos.forEach((photo, index) => {
        photo.position.y = 2 + Math.sin(Date.now() * 0.002 + index) * 0.1;
    });
    
    renderer.render(scene, camera);
}
animate();