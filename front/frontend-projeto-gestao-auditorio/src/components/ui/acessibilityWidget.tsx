'use client';
import React, { useState, useEffect, useRef } from 'react';
import AccessibilityBar from '@/components/ui/acessibility-bar';
import { PersonStanding } from 'lucide-react';

const AccessibilityWidget: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [fontSize, setFontSize] = useState(16);
    const [darkMode, setDarkMode] = useState(false);
    const [readingEnabled, setReadingEnabled] = useState(false);

    const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const v = localStorage.getItem('accessibility_visible');
        if (v !== null) setVisible(JSON.parse(v));
        const fs = localStorage.getItem('accessibility_fontSize');
        if (fs) setFontSize(Number(fs));
        const dm = localStorage.getItem('accessibility_darkMode');
        if (dm) setDarkMode(dm === 'true');
        const re = localStorage.getItem('accessibility_readingEnabled');
        if (re) setReadingEnabled(re === 'true');
        const bp = localStorage.getItem('accessibility_btnPos');
        if (bp) {
            setPos(JSON.parse(bp));
        } else {
            setPos({ x: window.innerWidth - 60, y: window.innerHeight / 2 });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('accessibility_visible', JSON.stringify(visible));
    }, [visible]);
    useEffect(() => {
        localStorage.setItem('accessibility_fontSize', fontSize.toString());
    }, [fontSize]);
    useEffect(() => {
        localStorage.setItem('accessibility_darkMode', darkMode.toString());
    }, [darkMode]);
    useEffect(() => {
        localStorage.setItem(
            'accessibility_readingEnabled',
            readingEnabled.toString(),
        );
    }, [readingEnabled]);
    useEffect(() => {
        localStorage.setItem('accessibility_btnPos', JSON.stringify(pos));
    }, [pos]);

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [fontSize]);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    useEffect(() => {
        if (!readingEnabled) return window.speechSynthesis.cancel();
        const onOver = (e: MouseEvent) => {
            const tgt = (e.target as HTMLElement).closest(
                'p,span,h1,h2,h3,h4,button,a,div[data-speak]',
            );
            if (tgt) {
                const text = (tgt as HTMLElement).textContent?.trim();
                if (text) {
                    const u = new SpeechSynthesisUtterance(text);
                    u.lang = 'pt-BR';
                    window.speechSynthesis.speak(u);
                }
            }
        };
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', () =>
            window.speechSynthesis.cancel(),
        );
        return () => {
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', () => {});
            window.speechSynthesis.cancel();
        };
    }, [readingEnabled]);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!dragging.current) return;
            setPos({
                x: e.clientX - offset.current.x,
                y: e.clientY - offset.current.y,
            });
        };
        const onMouseUp = () => {
            dragging.current = false;
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        dragging.current = true;
        offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };

    return (
        <>
            {visible && (
                <AccessibilityBar
                    fontSize={fontSize}
                    darkMode={darkMode}
                    readingEnabled={readingEnabled}
                    onIncreaseFont={() =>
                        setFontSize((f) => Math.min(f + 2, 24))
                    }
                    onDecreaseFont={() =>
                        setFontSize((f) => Math.max(f - 2, 12))
                    }
                    onToggleDark={() => setDarkMode((d) => !d)}
                    onToggleReading={() => setReadingEnabled((r) => !r)}
                />
            )}

            <button
                onMouseDown={handleMouseDown}
                onClick={() => setVisible((v) => !v)}
                className="fixed bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
                style={{ top: pos.y, left: pos.x, zIndex: 9999 }}
                aria-label="Acessibilidade"
            >
                <PersonStanding size={24} />
            </button>
        </>
    );
};

export default AccessibilityWidget;
