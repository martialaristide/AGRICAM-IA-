import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Text, Box, Cylinder, Sphere } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { 
  Bot, Play, Pause, RotateCcw, Eye, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Maximize2, ZoomIn, ZoomOut, Move3d
} from "lucide-react";
import { cn } from "../lib/utils";

// 3D Robot Model Component
const RobotModel = ({ position, rotation, isMoving, taskType }) => {
  const groupRef = useRef();
  const wheelRefs = [useRef(), useRef(), useRef(), useRef()];
  const armRef = useRef();
  const [armAngle, setArmAngle] = useState(0);

  useFrame((state, delta) => {
    if (isMoving && groupRef.current) {
      // Rotate wheels when moving
      wheelRefs.forEach(wheel => {
        if (wheel.current) {
          wheel.current.rotation.x += delta * 5;
        }
      });
    }

    // Arm animation based on task
    if (armRef.current) {
      if (taskType === "spraying") {
        armRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.3;
      } else if (taskType === "weeding") {
        armRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.5;
      }
    }
  });

  const bodyColor = isMoving ? "#10b981" : "#6b7280";
  const wheelColor = "#1f2937";

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Robot Body */}
      <Box args={[1.5, 0.6, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </Box>

      {/* Top Cabin */}
      <Box args={[0.8, 0.4, 0.6]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
      </Box>

      {/* Camera/Sensor on top */}
      <Sphere args={[0.15]} position={[0.2, 1.35, 0]}>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </Sphere>

      {/* Wheels */}
      {[
        [-0.6, 0.15, 0.5],
        [0.6, 0.15, 0.5],
        [-0.6, 0.15, -0.5],
        [0.6, 0.15, -0.5]
      ].map((pos, i) => (
        <group key={i} position={pos}>
          <Cylinder ref={wheelRefs[i]} args={[0.2, 0.2, 0.15, 16]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color={wheelColor} metalness={0.3} roughness={0.7} />
          </Cylinder>
        </group>
      ))}

      {/* Robotic Arm */}
      <group ref={armRef} position={[0.8, 0.7, 0]}>
        <Box args={[0.8, 0.1, 0.1]} position={[0.4, 0, 0]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </Box>
        {/* End effector */}
        <Sphere args={[0.08]} position={[0.8, 0, 0]}>
          <meshStandardMaterial color="#ef4444" />
        </Sphere>
        {/* Sprayer nozzle for spraying task */}
        {taskType === "spraying" && (
          <Cylinder args={[0.03, 0.05, 0.15, 8]} position={[0.9, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <meshStandardMaterial color="#3b82f6" />
          </Cylinder>
        )}
      </group>

      {/* Status light */}
      <Sphere args={[0.05]} position={[0, 1.25, 0.35]}>
        <meshStandardMaterial 
          color={isMoving ? "#22c55e" : "#ef4444"} 
          emissive={isMoving ? "#22c55e" : "#ef4444"}
          emissiveIntensity={1}
        />
      </Sphere>

      {/* Label */}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        AgriBot-01
      </Text>
    </group>
  );
};

// Path visualization
const RobotPath = ({ waypoints }) => {
  if (!waypoints || waypoints.length < 2) return null;

  return (
    <>
      {waypoints.map((point, i) => (
        <group key={i}>
          <Sphere args={[0.1]} position={[point.x, 0.1, point.z]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
          </Sphere>
          {i < waypoints.length - 1 && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    point.x, 0.1, point.z,
                    waypoints[i + 1].x, 0.1, waypoints[i + 1].z
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#3b82f6" linewidth={2} />
            </line>
          )}
        </group>
      ))}
    </>
  );
};

// Field/Ground with crop rows
const Field = () => {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#4a5d23" />
      </mesh>

      {/* Crop rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[-8 + i * 2, 0, 0]}>
          {Array.from({ length: 20 }).map((_, j) => (
            <Box 
              key={j} 
              args={[0.3, 0.4 + Math.random() * 0.3, 0.3]} 
              position={[Math.random() * 0.3, 0.2, -10 + j]}
            >
              <meshStandardMaterial color={`hsl(${100 + Math.random() * 40}, 70%, ${30 + Math.random() * 20}%)`} />
            </Box>
          ))}
        </group>
      ))}
    </group>
  );
};

// Main Scene
const Scene = ({ robotPosition, robotRotation, isMoving, waypoints, taskType }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      <Field />
      <RobotModel 
        position={robotPosition} 
        rotation={robotRotation}
        isMoving={isMoving}
        taskType={taskType}
      />
      <RobotPath waypoints={waypoints} />
      <Grid 
        args={[20, 20]} 
        cellSize={1} 
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        position={[0, 0.01, 0]}
        fadeDistance={30}
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
};

const Robot3DViewer = ({ robotId, robotName = "AgriBot-01" }) => {
  const [isMoving, setIsMoving] = useState(false);
  const [robotPosition, setRobotPosition] = useState([0, 0, 0]);
  const [robotRotation, setRobotRotation] = useState([0, 0, 0]);
  const [taskType, setTaskType] = useState("patrol");
  const [speed, setSpeed] = useState(50);
  const [waypoints, setWaypoints] = useState([
    { x: 0, z: 0 },
    { x: 2, z: 2 },
    { x: 4, z: 1 },
    { x: 6, z: 3 },
    { x: 4, z: 5 }
  ]);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);

  useEffect(() => {
    if (!isMoving || waypoints.length === 0) return;

    const interval = setInterval(() => {
      setCurrentWaypointIndex(prev => {
        const next = (prev + 1) % waypoints.length;
        const target = waypoints[next];
        const current = waypoints[prev];
        
        // Calculate rotation to face target
        const angle = Math.atan2(target.x - current.x, target.z - current.z);
        setRobotRotation([0, angle, 0]);
        setRobotPosition([target.x, 0, target.z]);
        
        return next;
      });
    }, 2000 - speed * 15);

    return () => clearInterval(interval);
  }, [isMoving, waypoints, speed]);

  const moveRobot = (direction) => {
    const step = 0.5;
    setRobotPosition(prev => {
      const [x, y, z] = prev;
      switch (direction) {
        case "forward": return [x, y, z - step];
        case "backward": return [x, y, z + step];
        case "left": return [x - step, y, z];
        case "right": return [x + step, y, z];
        default: return prev;
      }
    });
  };

  const resetPosition = () => {
    setRobotPosition([0, 0, 0]);
    setRobotRotation([0, 0, 0]);
    setCurrentWaypointIndex(0);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Move3d className="h-5 w-5 text-emerald-600" />
            Vue 3D - {robotName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isMoving ? "default" : "secondary"}>
              {isMoving ? "EN MOUVEMENT" : "ARRÊTÉ"}
            </Badge>
            <Badge variant="outline">{taskType}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 3D Canvas */}
        <div className="h-80 bg-slate-900 rounded-lg overflow-hidden">
          <Canvas
            camera={{ position: [8, 8, 8], fov: 50 }}
            shadows
          >
            <Suspense fallback={null}>
              <Scene 
                robotPosition={robotPosition}
                robotRotation={robotRotation}
                isMoving={isMoving}
                waypoints={waypoints}
                taskType={taskType}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Task Selection */}
        <div className="flex flex-wrap gap-2">
          {["patrol", "weeding", "spraying", "sampling"].map(task => (
            <Button
              key={task}
              variant={taskType === task ? "default" : "outline"}
              size="sm"
              onClick={() => setTaskType(task)}
            >
              {task === "patrol" && "Patrouille"}
              {task === "weeding" && "Désherbage"}
              {task === "spraying" && "Pulvérisation"}
              {task === "sampling" && "Échantillonnage"}
            </Button>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contrôle automatique</label>
            <div className="flex gap-2">
              <Button
                variant={isMoving ? "destructive" : "default"}
                onClick={() => setIsMoving(!isMoving)}
                className="flex-1"
              >
                {isMoving ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isMoving ? "Stop" : "Démarrer"}
              </Button>
              <Button variant="outline" onClick={resetPosition}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contrôle manuel</label>
            <div className="grid grid-cols-3 gap-1">
              <div />
              <Button size="sm" variant="outline" onClick={() => moveRobot("forward")}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <div />
              <Button size="sm" variant="outline" onClick={() => moveRobot("left")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => moveRobot("backward")}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => moveRobot("right")}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Vitesse</span>
            <span className="font-bold">{speed}%</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={([v]) => setSpeed(v)}
            max={100}
            min={10}
            step={10}
          />
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-100 rounded">
            <div className="font-bold">{robotPosition[0].toFixed(1)}m</div>
            <div className="text-slate-500">Position X</div>
          </div>
          <div className="p-2 bg-slate-100 rounded">
            <div className="font-bold">{robotPosition[2].toFixed(1)}m</div>
            <div className="text-slate-500">Position Z</div>
          </div>
          <div className="p-2 bg-slate-100 rounded">
            <div className="font-bold">{(robotRotation[1] * 180 / Math.PI).toFixed(0)}°</div>
            <div className="text-slate-500">Direction</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Robot3DViewer;
