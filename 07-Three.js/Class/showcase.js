const scene = new THREE.Scene();
scene.background = new THREE.Color(0x16213e);
scene.fog = new THREE.Fog(0x16213e, 8, 20);         // 雾：远处渐隐，出氛围

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 3, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

// 光源：环境光+方向光双光源
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(3, 6, 4);
scene.add(dir);

// 展台底座：大圆柱
const stage = new THREE.Mesh(
  new THREE.CylinderGeometry(2.2, 2.4, 0.3, 48),
  new THREE.MeshStandardMaterial({ color: 0x37474f })
);
stage.position.y = -0.15;
scene.add(stage);

// 展品组：3个不同几何体摆一圈
const items = new THREE.Group();                    // 组：整体旋转就转组
const geos = [
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.TorusGeometry(0.4, 0.16, 16, 48)
];
const colors = [0x4fc3f7, 0xffb74d, 0xef5350];
geos.forEach((geo, i) => {
  const angle = (i / geos.length) * Math.PI * 2;
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colors[i] }));
  mesh.position.set(Math.cos(angle) * 1.4, 0.6, Math.sin(angle) * 1.4);
  mesh.userData.originalColor = mesh.material.color.clone();
  items.add(mesh);
});
scene.add(items);

// 点击展品：将鼠标位置映射到相机射线，再找出射线命中的展品
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedItem = null;

const clearHighlight = (mesh) => {
  if (!mesh) return;
  mesh.material.emissive.set(0x000000);
  mesh.scale.setScalar(1);
};

const highlightItem = (mesh) => {
  if (selectedItem === mesh) return;
  clearHighlight(selectedItem);
  selectedItem = mesh;
  selectedItem.material.emissive.copy(selectedItem.userData.originalColor).multiplyScalar(0.35);
  selectedItem.scale.setScalar(1.15);
};

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(items.children, false);

  if (intersections.length > 0) {
    highlightItem(intersections[0].object);
  } else {
    clearHighlight(selectedItem);
    selectedItem = null;
  }
});

// 动画：展台整体缓转，展品上下浮动
const clock = new THREE.Clock();
const baseHeight = items.position.y;
const floatAmplitude = 0.25;
const animate = () => {
  requestAnimationFrame(animate);
  items.rotation.y += 0.005;
  items.position.y = baseHeight + Math.sin(clock.getElapsedTime()) * floatAmplitude;
  renderer.render(scene, camera);
};
animate();

// 窗口适配
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});