import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataPointsProps {
    count?: number;
    color?: string;
    radius?: number;
}

const DataPoints: React.FC<DataPointsProps> = ({ count = 50, color = '#00f0ff', radius = 1.2 }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Generate random points on a sphere
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);

            temp.push({ x, y, z, scale: Math.random() * 0.5 + 0.5, speed: Math.random() * 0.02 + 0.01 });
        }
        return temp;
    }, [count, radius]);

    const dummy = new THREE.Object3D();

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            const { x, y, z, scale, speed } = particle;

            // Pulse effect
            const s = scale + Math.sin(time * speed * 10) * 0.2;

            dummy.position.set(x, y, z);
            dummy.lookAt(0, 0, 0);
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();

            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
        </instancedMesh>
    );
};

export default DataPoints;
