import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Bead } from "../catalog";
import { braceletLayout } from "./layout";
import { beadMaterial } from "./materials";

export type PreviewScene = ReturnType<typeof createPreview>;

export function createPreview(
  host: HTMLElement,
  onSelect: (index: number) => void,
  onUnavailable: () => void,
) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "手串 3D 预览，可拖动旋转、双指缩放、点击珠子编辑",
  );
  canvas.setAttribute("aria-describedby", "preview-3d-help");
  host.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 50);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minDistance = 2.5;
  controls.maxDistance = 8;
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = Math.PI - 0.05;
  controls.autoRotateSpeed = 1.1;
  const model = new THREE.Group();
  scene.add(model);
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x7b8e79, 0.7));
  const key = new THREE.DirectionalLight(0xfff3dd, 2);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe2edff, 0.8);
  fill.position.set(4, 1, -3);
  scene.add(fill);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  let environment: THREE.WebGLRenderTarget;
  try {
    environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
  } catch (error) {
    controls.dispose();
    renderer.dispose();
    canvas.remove();
    throw error;
  } finally {
    room.dispose();
    pmrem.dispose();
  }

  let meshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>[] =
    [];
  let geometries: THREE.BufferGeometry[] = [];
  let materials: THREE.Material[] = [];
  let selected: number | null = null;
  let frame = 0;
  let disposed = false;
  let visible = true;
  let previousTime = 0;
  function draw(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const delta = previousTime
      ? Math.min((time - previousTime) / 1000, 0.05)
      : 0;
    previousTime = time;
    if (controls.autoRotate) controls.update(delta);
    renderer.render(scene, camera);
    if (controls.autoRotate) invalidate();
  }
  function invalidate() {
    if (!frame && !disposed && visible && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  function clearModel() {
    model.clear();
    for (const geometry of geometries) geometry.dispose();
    const textures = new Set<THREE.Texture>();
    for (const material of materials) {
      if (material instanceof THREE.MeshPhysicalMaterial && material.map)
        textures.add(material.map);
      material.dispose();
    }
    for (const texture of textures) texture.dispose();
    meshes = [];
    geometries = [];
    materials = [];
  }
  function setSelection(index: number | null) {
    selected = index;
    meshes.forEach((mesh, i) => {
      mesh.material.emissive.set(i === index ? "#31583b" : "#000000");
      mesh.material.emissiveIntensity = i === index ? 0.22 : 0;
    });
    invalidate();
  }
  function setBeads(items: Bead[]) {
    clearModel();
    const layout = braceletLayout(items);
    const scale = 1 / layout.extent;
    const sphere = new THREE.SphereGeometry(1, 32, 24);
    geometries.push(sphere);
    const byId = new Map<string, THREE.MeshPhysicalMaterial>();
    layout.beads.forEach(({ bead, x, z, angle }, i) => {
      let material = byId.get(bead.id);
      if (!material) {
        material = beadMaterial(bead);
        byId.set(bead.id, material);
        materials.push(material);
      }
      let geometry: THREE.BufferGeometry = sphere;
      if (bead.kind === "metal") {
        geometry = new THREE.TorusGeometry(0.69, 0.31, 12, 32);
        geometries.push(geometry);
      }
      // Selection is per bead; shared texture maps are disposed with their base material.
      const instanceMaterial = material.clone();
      instanceMaterial.map = material.map;
      const mesh = new THREE.Mesh(geometry, instanceMaterial);
      materials.push(instanceMaterial);
      mesh.position.set(x * scale, 0, z * scale);
      mesh.scale.setScalar((bead.size / 2) * scale);
      if (bead.kind === "pearl") mesh.scale.y *= 0.94;
      if (bead.kind === "metal")
        mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)),
        );
      mesh.userData.index = i;
      meshes.push(mesh);
      model.add(mesh);
    });
    if (layout.radius > 0) {
      const string = new THREE.TorusGeometry(
        layout.radius * scale,
        0.006,
        6,
        128,
      );
      const material = new THREE.MeshStandardMaterial({
        color: "#c8b899",
        roughness: 0.85,
      });
      const cord = new THREE.Mesh(string, material);
      cord.rotation.x = Math.PI / 2;
      model.add(cord);
      geometries.push(string);
      materials.push(material);
    }
    setSelection(selected);
  }
  function reset() {
    camera.position.set(0.4, 3.1, 3.4);
    controls.target.set(0, 0, 0);
    controls.update();
    invalidate();
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    invalidate();
  }
  function zoom(factor: number) {
    const offset = camera.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(
      offset.length() * factor,
      controls.minDistance,
      controls.maxDistance,
    );
    camera.position.copy(offset.setLength(distance).add(controls.target));
    controls.update();
    invalidate();
  }
  function keydown(event: KeyboardEvent) {
    const keys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "+",
      "=",
      "-",
      "Home",
    ];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") return reset();
    if (event.key === "+" || event.key === "=") return zoom(0.85);
    if (event.key === "-") return zoom(1.15);
    const spherical = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(controls.target),
    );
    spherical.theta +=
      event.key === "ArrowLeft" ? 0.15 : event.key === "ArrowRight" ? -0.15 : 0;
    spherical.phi = THREE.MathUtils.clamp(
      spherical.phi +
        (event.key === "ArrowUp"
          ? -0.15
          : event.key === "ArrowDown"
            ? 0.15
            : 0),
      0.05,
      Math.PI - 0.05,
    );
    camera.position.setFromSpherical(spherical).add(controls.target);
    controls.update();
    invalidate();
  }
  const raycaster = new THREE.Raycaster();
  let down: { x: number; y: number } | null = null;
  const pointers = new Set<number>();
  function pointerDown(event: PointerEvent) {
    pointers.add(event.pointerId);
    down = pointers.size === 1 ? { x: event.clientX, y: event.clientY } : null;
  }
  function pointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (
      !down ||
      Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5
    ) {
      down = null;
      return;
    }
    down = null;
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    );
    const hit = raycaster.intersectObjects(meshes)[0];
    if (hit) onSelect(hit.object.userData.index);
  }
  function cancelPointer(event: PointerEvent) {
    pointers.delete(event.pointerId);
    down = null;
  }
  function visibility() {
    previousTime = 0;
    invalidate();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    onUnavailable();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previousTime = 0;
    invalidate();
  });
  intersection.observe(host);
  controls.addEventListener("change", invalidate);
  canvas.addEventListener("keydown", keydown);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", cancelPointer);
  canvas.addEventListener("webglcontextlost", contextLost);
  document.addEventListener("visibilitychange", visibility);
  reset();
  resize();
  return {
    setBeads,
    setSelection,
    reset,
    zoom,
    setAutoRotate(value: boolean) {
      controls.autoRotate = value;
      previousTime = 0;
      invalidate();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("keydown", keydown);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", cancelPointer);
      canvas.removeEventListener("webglcontextlost", contextLost);
      controls.dispose();
      clearModel();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
