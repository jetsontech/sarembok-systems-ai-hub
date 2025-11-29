import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import DataPoints from './DataPoints';

interface HoloGlobeProps {
    speed?: number;
}

const HoloGlobe: React.FC<HoloGlobeProps> = ({ speed = 1 }) => {
    const globeRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (globeRef.current) {
            globeRef.current.rotation.y = time * 0.1 * speed;
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y = time * 0.05 * speed;
        }
    });

    return (
        <group>
            {/* Main Wireframe Sphere */}
            <Sphere ref={globeRef} args={[1.5, 32, 32]}>
                <meshBasicMaterial
                    color="#00f0ff"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </Sphere>

            {/* Inner Glowing Core */}
            <Sphere args={[1.4, 32, 32]}>
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.9}
                />
            </Sphere>

            {/* Data Points Layer */}
            <group rotation={[0, 0, Math.PI / 6]}>
                <DataPoints count={speed > 1 ? 100 : 40} radius={1.5} color="#00f0ff" />
                <DataPoints count={speed > 1 ? 50 : 20} radius={1.5} color="#ff00aa" />
            </group>

            {/* Floating Particles Ring */}
            <points ref={particlesRef}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <pointsMaterial
                    size={0.02}
                    color="#00f0ff"
                    transparent
                    opacity={0.4}
                    sizeAttenuation
                />
            </points>
        </group>
    );
};

export default HoloGlobe;
