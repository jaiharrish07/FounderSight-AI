import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RadialChartProps {
    value: number;
    maxValue?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}

export const RadialChart = ({
    value,
    maxValue = 100,
    size = 120,
    strokeWidth = 10,
    color = "var(--accent-primary)",
    label = "Score"
}: RadialChartProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const [progress, setProgress] = useState(0);

    // Animate target value on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(value);
        }, 100);
        return () => clearTimeout(timer);
    }, [value]);

    const offset = circumference - (progress / maxValue) * circumference;

    return (
        <div className="relative flex items-center justify-center flex-col" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Foreground Animated Ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                    style={{
                        filter: `drop-shadow(0 0 8px ${color})`
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-display font-bold leading-none mt-1">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        {progress}
                    </motion.span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-text-muted mt-1 font-semibold">{label}</span>
            </div>
        </div>
    );
};
