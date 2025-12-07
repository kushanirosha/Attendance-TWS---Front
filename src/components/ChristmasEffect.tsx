// src/components/effects/ChristmasEffect.tsx
import { useEffect, useState } from 'react';
import GIF from '../public/animated-santa-claus-image-0420.gif';

export const ChristmasEffect = () => {
    const [santaKey, setSantaKey] = useState(0);
    const [santaTop, setSantaTop] = useState('30%'); // default fallback

    // Random height: Top (10–25%), Middle (35–60%), Bottom (70–85%)
    const getRandomTop = () => {
        const rand = Math.random();
        if (rand < 0.33) return `${10 + Math.random() * 15}%`;     // Top
        if (rand < 0.66) return `${35 + Math.random() * 25}%`;     // Middle
        return `${70 + Math.random() * 15}%`;                        // Bottom
    };

    // Trigger new flight with new random height
    useEffect(() => {
        const flySanta = () => {
            setSantaTop(getRandomTop());  // New height
            setSantaKey(prev => prev + 1); // Restart animation
        };

        const firstFly = setTimeout(flySanta, 8000);
        const interval = setInterval(flySanta, 35000 + Math.random() * 20000);

        return () => {
            clearTimeout(firstFly);
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            {/* Snowfall */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {Array.from({ length: 70 }, (_, i) => (
                    <div
                        key={i}
                        className="absolute animate-fall"
                        style={{
                            left: `${Math.random() * 100}vw`,
                            animationDelay: `${Math.random() * 15}s`,
                            animationDuration: `${12 + Math.random() * 18}s`,
                            opacity: 0.4 + Math.random() * 0.5,
                        }}
                    >
                        <span className="text-2xl md:text-3xl text-white drop-shadow-2xl">
                            {i % 3 === 0 ? '❄️' : i % 3 === 1 ? '❅' : '✵'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Santa — flies right to left at random height */}
            {/*<div
                key={santaKey}
                className="fixed right-[-200px] pointer-events-none z-50"
                style={{
                    top: santaTop,
                    animation: 'flyRightToLeft 32s linear forwards',
                }}
            >
                <img
                    src={GIF}
                    alt="Santa flying"
                    //  className="w-36 h-36 md:w-64 md:h-48 drop-shadow-2xl select-none"
                    className="drop-shadow-2xl select-none"
                    draggable={false}
                />
            </div>*/}

            {/* Global Keyframes */}
            <style jsx global>{`
        @keyframes fall {
          from {
            transform: translateY(-100px) rotate(0deg);
          }
          to {
            transform: translateY(110vh) rotate(360deg);
          }
        }

        @keyframes flyRightToLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-110vw);
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
        </>
    );
};