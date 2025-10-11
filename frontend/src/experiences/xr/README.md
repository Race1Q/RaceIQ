# F1 Cockpit XR Viewer

A WebXR-enabled 3D cockpit viewer for exploring F1 cars in immersive detail.

## Features

- **Desktop Mode**: Mouse orbit controls, WASD movement, scroll to zoom
- **VR Mode**: Full WebXR support with controller rays and gaze reticle
- **Auto Camera Positioning**: Automatically positions camera at driver's eye level
- **Hotspot Detection**: Identifies interactive elements like steering wheel, MFD, paddles
- **Performance Optimized**: DRACO and Meshopt compression support, capped pixel ratio

## Usage

### As a Component

```tsx
import F1CockpitXR from '@/experiences/xr/F1CockpitXR';

function MyPage() {
  return (
    <div>
      <F1CockpitXR modelUrl="/assets/f1-2021-red-bull-rb16b/source/F1 2021 RedBull RB16b.glb" />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelUrl` | `string` | `"/assets/f1-2021-red-bull-rb16b/source/F1 2021 RedBull RB16b.glb"` | Path to the GLB model file |

## Controls

### Desktop
- **Orbit**: Left click + drag
- **Pan**: Right click + drag (if enabled)
- **Zoom**: Scroll wheel
- **Move**: WASD keys
- **Exit**: Escape or close the viewer

### VR Mode
- **Enter VR**: Click the "Enter VR" button (appears only if WebXR is available)
- **Navigate**: Use VR controller rays
- **Interact**: Point at hotspots to see reticle indicator

## Model Requirements

The viewer works best with models that include named objects:

- `DriverEye` - Camera anchor point (optional, fallbacks to steering wheel or bounds center)
- `Wheel` or `SteeringWheel` - Steering wheel mesh
- `MFD` - Multi-function display
- `PaddleUp`, `PaddleDown` - Shift paddles
- `Radio` - Radio button

If these objects aren't named in your model, the viewer will still work but may not position the camera optimally or detect hotspots.

## Integration

Currently integrated in:
- **Constructor Details Page** (`/constructors/:id`) - Shows the team's cockpit viewer for Red Bull, Mercedes, Ferrari, and McLaren

## Technical Details

### Architecture

```
xr/
├── F1CockpitXR.tsx          # Main component
├── utils/
│   └── xrHelpers.ts         # Helper functions
└── README.md                # This file
```

### Dependencies

- `three` (^0.180.0)
- `three/examples/jsm/controls/OrbitControls`
- `three/examples/jsm/environments/RoomEnvironment`
- `three/examples/jsm/loaders/GLTFLoader`
- `three/examples/jsm/loaders/DRACOLoader` (optional)
- `three/examples/jsm/libs/meshopt_decoder.module` (optional)

### Performance Optimizations

1. **Capped Pixel Ratio**: Maximum 2x for performance
2. **DRACO Compression**: Automatic support for compressed models
3. **Meshopt Support**: Optimized mesh loading
4. **Environment Mapping**: Efficient room environment for realistic reflections
5. **Preflight Caching**: 24-hour cache for VR preflight requests

### Browser Support

- **Desktop**: All modern browsers with WebGL support
- **VR**: Chrome/Edge with WebXR, Oculus Browser, Quest Browser

## Customization

### Camera Position

To adjust the starting camera position, modify in `F1CockpitXR.tsx`:

```tsx
camera.position.set(0, 1.1, 0.8); // x, y, z coordinates
```

### Model Scaling

To change the model size, adjust the `centerAndScaleTo` parameter:

```tsx
const bounds = centerAndScaleTo(car, 5.0); // diagonal size in units
```

### Lighting

Modify the lighting setup:

```tsx
scene.add(new THREE.AmbientLight(0xffffff, 0.25)); // ambient intensity
const hemi = new THREE.HemisphereLight(0xffffff, 0x111122, 0.5); // hemisphere intensity
const dir = new THREE.DirectionalLight(0xffffff, 0.6); // directional intensity
```

## Adding More Cars

To add cockpit viewers for other teams:

1. Place the GLB model in `/public/assets/f1-[year]-[team]-[model]/source/[model-name].glb`
2. Add textures in `/public/assets/f1-[year]-[team]-[model]/textures/`
3. Update the team car models mapping in `frontend/src/lib/teamCarModels.ts`:

```tsx
export const teamCarModels: { [key: string]: string } = {
  "Red Bull": "/assets/f1-2021-red-bull-rb16b/source/F1 2021 RedBull RB16b.glb",
  "Mercedes": "/assets/f1-2023-mercedes-w14/source/mercedes_amg_petronas__w14_2023.glb",
  "Ferrari": "/assets/f1-2023-ferrari-sf23/source/F1 2023 Ferrari SF23 S2.glb",
  "McLaren": "/assets/f1-2024-mclaren-mcl38/source/F1 2024 Mclaren MCL38.glb",
  // Add your new team here
  "Aston Martin": "/assets/f1-[year]-aston-martin-[model]/source/[model-name].glb",
};
```

4. Add the team name to the conditional in `ConstructorsDetails.tsx`:

```tsx
{["Red Bull", "Mercedes", "Ferrari", "McLaren", "Aston Martin"].includes(constructor.name) && (
  <F1CockpitXR modelUrl={getTeamCarModel(constructor.name)} />
)}
```

## Troubleshooting

### Model doesn't load
- Check the console for error messages
- Verify the model path is correct
- Ensure the GLB file is valid and not corrupted

### Camera position is wrong
- Check if the model has a `DriverEye` or `Wheel` object
- Manually adjust the camera position in the code
- Verify the model's scale and orientation

### VR button doesn't appear
- WebXR is only available on compatible devices
- Try using Chrome/Edge on desktop with a VR headset connected
- Test on Oculus Quest with the browser

### Poor performance
- Reduce the pixel ratio in the code
- Optimize the model (reduce polygon count, use DRACO compression)
- Disable shadows if enabled
- Lower the environment map quality

## Future Enhancements

Potential improvements:
- [ ] Interactive hotspot UI with tooltips
- [ ] Telemetry data overlay
- [ ] Multiple camera presets (driver view, overhead, side view)
- [ ] Animation support for moving parts (steering, pedals)
- [ ] Screenshot/video capture functionality
- [ ] Multi-car comparison view
- [ ] AR mode support

## Credits

- **Models**: 
  - Red Bull RB16B (2021)
  - Mercedes W14 (2023)
  - Ferrari SF23 (2023)
  - McLaren MCL38 (2024)
- **Three.js**: 3D rendering engine
- **WebXR**: VR/AR API

