// frontend/src/experiences/xr/F1CockpitXR.tsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadGLTF, centerAndScaleTo } from "./utils/xrHelpers";

type Props = { modelUrl?: string };

export default function F1CockpitXR({ modelUrl = "/assets/f1-2021-red-bull-rb16b/source/F1 2021 RedBull RB16b.glb" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHints, setShowHints] = useState(true);

  useEffect(() => {
    const container = containerRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b0b0c");

    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.01, 100);
    camera.position.set(0, 1.1, 0.8); // approx; will be refined after model load

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting & env
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.08).texture;
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const hemi = new THREE.HemisphereLight(0xffffff, 0x111122, 0.5);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(3, 4, 2);
    dir.castShadow = false;
    scene.add(dir);

    // Desktop controls (always enabled for better UX)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controls.minDistance = 0.5;
    controls.maxDistance = 8.0;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI * 0.65;
    controls.minPolarAngle = Math.PI * 0.1;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;

    const world = new THREE.Group();
    scene.add(world);

    // Load model
    (async () => {
      try {
        setIsLoading(true);
        const car = await loadGLTF(modelUrl);
        const bounds = centerAndScaleTo(car, 5.0); // normalize size
        world.add(car);

        // Position camera at driver's perspective
        const c = new THREE.Vector3();
        bounds.getCenter(c);
        // Position camera slightly behind and above center for good cockpit view
        camera.position.set(c.x - 0.2, c.y + 0.5, c.z + 1.2);
        camera.lookAt(c.x, c.y + 0.3, c.z - 0.5);
        
        // Update controls target
        controls.target.copy(new THREE.Vector3(c.x, c.y + 0.3, c.z - 0.5));
        controls.update();
        
        setIsLoading(false);
        
        // Hide hints after 5 seconds
        setTimeout(() => setShowHints(false), 5000);
      } catch (error) {
        console.error("Error loading 3D model:", error);
        setIsLoading(false);
      }
    })();

    // Create control buttons UI
    const controlsUI = document.createElement("div");
    controlsUI.style.position = "absolute";
    controlsUI.style.bottom = "16px";
    controlsUI.style.right = "16px";
    controlsUI.style.display = "flex";
    controlsUI.style.gap = "8px";
    controlsUI.style.zIndex = "10";
    
    // Reset View button
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "↺ Reset View";
    resetBtn.style.padding = "10px 14px";
    resetBtn.style.borderRadius = "8px";
    resetBtn.style.border = "1px solid #3a3a3a";
    resetBtn.style.background = "rgba(17, 17, 17, 0.9)";
    resetBtn.style.color = "#fff";
    resetBtn.style.cursor = "pointer";
    resetBtn.style.fontSize = "14px";
    resetBtn.style.backdropFilter = "blur(10px)";
    resetBtn.style.transition = "all 0.2s";
    resetBtn.onmouseover = () => {
      resetBtn.style.background = "rgba(30, 30, 30, 0.95)";
      resetBtn.style.borderColor = "#555";
    };
    resetBtn.onmouseout = () => {
      resetBtn.style.background = "rgba(17, 17, 17, 0.9)";
      resetBtn.style.borderColor = "#3a3a3a";
    };
    resetBtn.onclick = () => {
      // Reset camera to initial position
      camera.position.set(-0.2, 0.5, 1.2);
      controls.target.set(0, 0.3, -0.5);
      controls.update();
    };
    
    // Auto-rotate toggle button
    const rotateBtn = document.createElement("button");
    rotateBtn.textContent = "⟲ Auto";
    rotateBtn.style.padding = "10px 14px";
    rotateBtn.style.borderRadius = "8px";
    rotateBtn.style.border = "1px solid #3a3a3a";
    rotateBtn.style.background = "rgba(17, 17, 17, 0.9)";
    rotateBtn.style.color = "#fff";
    rotateBtn.style.cursor = "pointer";
    rotateBtn.style.fontSize = "14px";
    rotateBtn.style.backdropFilter = "blur(10px)";
    rotateBtn.style.transition = "all 0.2s";
    rotateBtn.onmouseover = () => {
      rotateBtn.style.background = "rgba(30, 30, 30, 0.95)";
      rotateBtn.style.borderColor = "#555";
    };
    rotateBtn.onmouseout = () => {
      const bg = controls.autoRotate ? "rgba(30, 100, 200, 0.9)" : "rgba(17, 17, 17, 0.9)";
      rotateBtn.style.background = bg;
      rotateBtn.style.borderColor = "#3a3a3a";
    };
    rotateBtn.onclick = () => {
      controls.autoRotate = !controls.autoRotate;
      rotateBtn.style.background = controls.autoRotate ? "rgba(30, 100, 200, 0.9)" : "rgba(17, 17, 17, 0.9)";
    };
    
    controlsUI.appendChild(rotateBtn);
    controlsUI.appendChild(resetBtn);
    container.style.position = "relative";
    container.appendChild(controlsUI);

    // Resize
    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Simple desktop WASD
    const keys: Record<string, boolean> = {};
    const speed = 0.02;
    const onKey = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = e.type === "keydown"; };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    // Animate
    renderer.setAnimationLoop(() => {
      // Update controls (for damping and auto-rotate)
      controls.update();
      
      // WASD navigation
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0; dir.normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0)).normalize();
      if (keys["w"]) camera.position.addScaledVector(dir, speed);
      if (keys["s"]) camera.position.addScaledVector(dir, -speed);
      if (keys["a"]) camera.position.addScaledVector(right, -speed);
      if (keys["d"]) camera.position.addScaledVector(right, speed);

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      controls.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (container.contains(controlsUI)) {
        container.removeChild(controlsUI);
      }
    };
  }, [modelUrl]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: "100%", 
        height: "600px", 
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden"
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          backdropFilter: "blur(5px)"
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "3px solid #333",
            borderTop: "3px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ 
            color: "#fff", 
            marginTop: "16px", 
            fontSize: "14px",
            fontFamily: "monospace"
          }}>
            Loading RB16B Cockpit...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Interactive Hints Overlay */}
      {showHints && !isLoading && (
        <div style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          background: "rgba(17, 17, 17, 0.95)",
          border: "1px solid #3a3a3a",
          borderRadius: "8px",
          padding: "12px 16px",
          backdropFilter: "blur(10px)",
          zIndex: 10,
          maxWidth: "300px",
          animation: "fadeIn 0.5s ease-in"
        }}>
          <div style={{ 
            color: "#fff", 
            fontSize: "13px", 
            lineHeight: "1.6",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}>
            <div style={{ fontWeight: "600", marginBottom: "8px", color: "#4a9eff" }}>
              🏎️ Explore the Cockpit
            </div>
            <div style={{ marginBottom: "4px" }}>🖱️ <strong>Drag</strong> to rotate</div>
            <div style={{ marginBottom: "4px" }}>🔍 <strong>Scroll</strong> to zoom</div>
            <div style={{ marginBottom: "4px" }}>⌨️ <strong>WASD</strong> to move around</div>
            <div style={{ marginTop: "8px", fontSize: "11px", color: "#888" }}>
              Tip: Click auto-rotate for a 360° view
            </div>
          </div>
          <button
            onClick={() => setShowHints(false)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "#888",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: "1",
              padding: "0",
              width: "20px",
              height: "20px"
            }}
          >
            ×
          </button>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

