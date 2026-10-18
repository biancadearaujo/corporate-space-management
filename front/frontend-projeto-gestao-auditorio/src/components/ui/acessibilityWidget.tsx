'use client';
import React, { useState, useEffect } from 'react';
import AccessibilityBar from '@/components/ui/acessibility-bar'; // Ajuste o caminho se necessário
import { PersonStanding } from 'lucide-react';

const AccessibilityWidget: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [fontSize, setFontSize] = useState(16);
    const [darkMode, setDarkMode] = useState(false);
    const [readingEnabled, setReadingEnabled] = useState(false);

    useEffect(() => {
        const v = localStorage.getItem('accessibility_visible');
        if (v !== null) setVisible(JSON.parse(v));
        const fs = localStorage.getItem('accessibility_fontSize');
        if (fs) setFontSize(Number(fs));
        const dm = localStorage.getItem('accessibility_darkMode');
        if (dm) setDarkMode(dm === 'true');
        const re = localStorage.getItem('accessibility_readingEnabled');
        if (re) setReadingEnabled(re === 'true');
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
                onClick={() => setVisible((v) => !v)}
                className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition z-[9999]"
                aria-label="Acessibilidade"
            >
                <PersonStanding size={24} />
            </button>
        </>
    );
};

export default AccessibilityWidget;