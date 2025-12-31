// src/components/effects/NewYear2026Effect.tsx
import { useEffect, useState } from 'react';

interface FallingText {
    id: number;
    left: string;
    duration: number;
    rotate: number;
    fontSize: string;
}

export const NewYear2026Effect = () => {
    const [texts, setTexts] = useState<FallingText[]>([]);

    useEffect(() => {
        const addNewText = () => {
            const newText: FallingText = {
                id: Date.now() + Math.random(), // Unique key
                left: `${5 + Math.random() * 90}vw`, // Random position, avoid edges
                duration: 30 + Math.random() * 15, // 30-45s slow fall
                rotate: -30 + Math.random() * 60, // Gentle random tilt
                fontSize: `${0.8 + Math.random() * 0.4}rem`, // Small variation
            };

            setTexts((prev) => [...prev, newText]);

            // Optional: Clean up old texts after they finish falling (performance)
            setTimeout(() => {
                setTexts((prev) => prev.filter((t) => t.id !== newText.id));
            }, (newText.duration + 10) * 1000);
        };

        // Start dropping after 8 seconds
        const firstDrop = setTimeout(addNewText, 8000);

        // Then drop one every 4–9 seconds continuously
        const interval = setInterval(addNewText, 4000 + Math.random() * 5000);

        return () => {
            clearTimeout(firstDrop);
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            {/* Confetti strips - light and continuous */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {Array.from({ length: 80 }, (_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-4 animate-fall-confetti"
                        style={{
                            left: `${Math.random() * 100}vw`,
                            backgroundColor: ['#ffd700', '#c0c0c0', '#9d4edd', '#00b4d8'][i % 4],
                            animationDelay: `${Math.random() * 20}s`,
                            animationDuration: `${15 + Math.random() * 20}s`,
                            opacity: 0.6 + Math.random() * 0.4,
                            transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                    />
                ))}
            </div>

            {/* Gentle continuous falling texts - one by one like water drops */}
            {texts.map((text) => (
                <div
                    key={text.id}
                    className="fixed pointer-events-none z-50 select-none"
                    style={{
                        left: text.left,
                        top: '-100px',
                        animation: `fall-text-slow ${text.duration}s linear forwards`,
                        transform: `rotate(${text.rotate}deg)`,
                    }}
                >
                    <span
                        className="font-bold drop-shadow-md"
                        style={{
                            fontSize: text.fontSize,
                            background: 'linear-gradient(to right, #ffd700, #9d4edd, #00b4d8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Happy New Year 2026 🎉
                    </span>
                </div>
            ))}

            {/* Subtle fireworks bursts */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {Array.from({ length: 12 }, (_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1"
                        style={{
                            left: `${20 + Math.random() * 60}vw`,
                            top: `${20 + Math.random() * 60}vh`,
                            animation: 'firework-burst 4s ease-out infinite',
                            animationDelay: `${i * 8 + Math.random() * 10}s`,
                        }}
                    >
                        {Array.from({ length: 8 }, (_, j) => (
                            <div
                                key={j}
                                className="absolute w-2 h-2 bg-white rounded-full"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    boxShadow: '0 0 10px 3px currentColor',
                                    color: ['#ffd700', '#ff2a6d', '#05d9e8', '#d4af37'][j % 4],
                                    animation: `spark ${2 + Math.random() * 2}s linear forwards`,
                                    animationDelay: '0.5s',
                                    transform: `rotate(${j * 45}deg) translateY(0)`,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Global Keyframes */}
            <style jsx global>{`
                @keyframes fall-confetti {
                    0% { transform: translateY(-100px) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(720deg); }
                }

                @keyframes fall-text-slow {
                    0% { transform: translateY(-100px); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateY(110vh); opacity: 0; }
                }

                .animate-fall-confetti {
                    animation: fall-confetti linear infinite;
                }

                @keyframes firework-burst {
                    0%, 20%, 100% { opacity: 0; }
                    10% { opacity: 1; }
                }

                @keyframes spark {
                    0% { transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1); opacity: 1; }
                    100% { transform: rotate(var(--rotation, 0deg)) translateY(150px) scale(0); opacity: 0; }
                }
            `}</style>
        </>
    );
};