// frontend/src/experiences/xr/utils/xrHelpers.ts
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js"; // Disabled - models have corrupted BASIS textures
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export async function loadGLTF(url: string, dracoPath = "/draco/gltf/", renderer?: THREE.WebGLRenderer): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  
  // DRACO decoder for mesh compression
  try {
    const draco = new DRACOLoader();
    draco.setDecoderPath(dracoPath);
    loader.setDRACOLoader(draco);
  } catch {}
  
  // KTX2 decoder disabled - some models have corrupted BASIS texture metadata
  // Models will fallback to standard PNG/JPEG textures which work fine
  
  // Meshopt decoder
  try {
    (loader as any).setMeshoptDecoder?.(MeshoptDecoder);
  } catch {}

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        // Successfully loaded
        const scene = gltf.scene || gltf.scenes?.[0] || new THREE.Group();
        resolve(scene);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        reject(error);
      }
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

