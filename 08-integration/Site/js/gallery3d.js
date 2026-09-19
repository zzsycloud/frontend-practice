/**
 * 3D 虚拟展馆（Three.js）
 * - 展台地面 + 旋转相机模型 + 4 个带贴图的相框
 * - OrbitControls 交互、Raycaster 点击选中相框变金色
 * - 相框标题来自作品管理页（localStorage）的前 4 件作品，没有则用默认标题
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('canvas-container');
const infoPanel = document.getElementById('info-panel');

const W = () => container.clientWidth;
const H = () => container.clientHeight;

// 1. 场景 / 相机 / 渲染器
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122);

const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 1000);
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W(), H());
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// 2. 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 3. 光源
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// 4. 地面
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.8 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 5. 相机模型（Box + Cylinder 组合）
const cameraGroup = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 })
);
body.castShadow = true;
cameraGroup.add(body);

const lens = new THREE.Mesh(
  new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32),
  new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 })
);
lens.rotation.z = Math.PI / 2;
lens.position.set(-0.8, 0, 0);
cameraGroup.add(lens);
cameraGroup.position.set(0, 1.5, 0);
scene.add(cameraGroup);

// 6. 相框 + 照片贴图
const imagePaths = [
  'assets/images/photo1.jpg',
  'assets/images/photo2.jpg',
  'assets/images/photo3.jpg',
  'assets/images/photo4.png'
];

// 与作品管理页联动：读取 localStorage 中的作品标题
let savedPhotos = [];
try {
  savedPhotos = JSON.parse(localStorage.getItem('photoclub:photos') || '[]');
} catch (e) {
  console.warn('读取作品数据失败，使用默认标题', e);
}

const frames = [];
const textureLoader = new THREE.TextureLoader();
const frameGeo = new THREE.BoxGeometry(1.5, 1.2, 0.1);

imagePaths.forEach((path, i) => {
  const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
  frame.position.set(-3 + i * 2, 2, -2);
  frame.castShadow = true;

  const saved = savedPhotos[i];
  frame.userData = {
    title: saved ? `《${saved.title}》` : `摄影作品 ${i + 1}`,
    author: saved ? saved.author : '社员',
    rating: saved ? saved.rating : null
  };

  const texture = textureLoader.load(
    path,
    undefined,
    undefined,
    () => console.error('贴图加载失败:', path)
  );
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.9),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  photo.position.z = 0.06;
  frame.add(photo);

  frames.push(frame);
  scene.add(frame);
});

// 7. Raycaster 点击交互
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selected = null;

renderer.domElement.addEventListener('click', event => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  // recursive = true：点到相框里的照片也算命中相框
  const hits = raycaster.intersectObjects(frames, true);
  if (!hits.length) return;

  let obj = hits[0].object;
  while (obj && !frames.includes(obj)) obj = obj.parent; // 找到所属相框

  if (selected) selected.material.color.set(0xffffff);   // 还原上一个
  selected = obj;
  selected.material.color.set(0xffaa00);                   // 当前变金色

  const d = obj.userData;
  infoPanel.innerHTML = `<h3>${d.title}</h3>作者：${d.author}` +
    (d.rating ? `<br>评分：${'★'.repeat(d.rating)}${'☆'.repeat(5 - d.rating)}` : '') +
    `<br><small>点击其它相框可切换</small>`;
});

// 8. 自适应
window.addEventListener('resize', () => {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
});

// 9. 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  cameraGroup.rotation.y += 0.005;
  frames.forEach((f, i) => { f.position.y = 2 + Math.sin(Date.now() * 0.002 + i) * 0.1; });
  renderer.render(scene, camera);
}
animate();