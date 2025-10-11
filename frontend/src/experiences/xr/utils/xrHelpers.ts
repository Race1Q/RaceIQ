// frontend/src/experiences/xr/utils/xrHelpers.ts
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export async function loadGLTF(url: string, dracoPath = "/draco/gltf/"): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  try {
    const draco = new DRACOLoader();
    draco.setDecoderPath(dracoPath);
    loader.setDRACOLoader(draco);
  } catch {}
  try {
    (loader as any).setMeshoptDecoder?.(MeshoptDecoder);
  } catch {}

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene || gltf.scenes?.[0] || new THREE.Group()),
      undefined,
      reject
    );
  });
}

export function centerAndScaleTo(obj: THREE.Object3D, targetDiag = 4): THREE.Box3 {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Recenter to origin
  obj.position.sub(center);

  // Uniform scale to target diagonal length
  const diag = size.length();
  const s = diag > 0 ? targetDiag / diag : 1;
  obj.scale.setScalar(s);

  // Recompute bounds after scale
  const newBox = new THREE.Box3().setFromObject(obj);
  return newBox;
}

export function buildController(renderer: THREE.WebGLRenderer, index = 0) {
  const controller = renderer.xr.getController(index);
  const lineGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1)]);
  const line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ linewidth: 2 }));
  line.name = "ray";
  line.scale.z = 5;
  controller.add(line);
  return controller;
}

export function buildGazeReticle(): THREE.Mesh {
  const geom = new THREE.RingGeometry(0.01, 0.015, 16);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.visible = false;
  return mesh;
}

