import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from "../../lib/utils";

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const SpotlightCard = ({ children, className = '', onClick = undefined }: SpotlightCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const hoverX = useMotionValue(0.5); // Center 0.5
    const hoverY = useMotionValue(0.5); // Center 0.5

    // Spring physics for smooth tilt
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const springX = useSpring(hoverX, springConfig);
    const springY = useSpring(hoverY, springConfig);

    // Map 0 -> 1 hover to -degree -> degree tilt
    const maxTilt = 8;
    const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
    const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        if (!ref.current) return;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        
        // For spotlight
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
        
        // For tilt (normalized 0 to 1)
        hoverX.set((clientX - left) / width);
        hoverY.set((clientY - top) / height);
    }

    function handleMouseLeave() {
        // Reset to center
        hoverX.set(0.5);
        hoverY.set(0.5);
    }

    return (
        <motion.div
            ref={ref}
            className={cn(
                "group relative overflow-hidden rounded-2xl bg-background-card/60 border border-border-cyan/50 backdrop-blur-xl transition-colors duration-500 hover:border-accent-primary/60 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] cursor-pointer",
                className
            )}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl bg-gradient-to-t from-white/0 to-white-[0.02] mix-blend-overlay" />
            
            {/* Spotlight that follows mouse */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            {/* Inner Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};
