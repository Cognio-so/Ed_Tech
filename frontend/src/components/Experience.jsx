'use client'
import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Avatar } from "./Avatar";
import { Suspense } from "react";

function ExperienceContent({ lipSyncData, isConnected }) {
  const texture = useTexture("/textures/youtubeBackground.jpg");
  const { viewport, size } = useThree();

  return (
    <>
      <OrbitControls enableZoom={false} enablePan={false} />
      <Avatar position={[0, -3, 5]} scale={2} lipSyncData={lipSyncData} isConnected={isConnected} />
      <Environment preset="sunset" />
      
      {/* Background Image - Full Screen Coverage */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[size.width * 0.02, size.height * 0.02]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
}

export const Experience = ({ lipSyncData, isConnected }) => {
  return (
    <Suspense fallback={null}>
      <ExperienceContent lipSyncData={lipSyncData} isConnected={isConnected} />
    </Suspense>
  );
};