import React from 'react';
import { Moon, Volume2, Languages } from 'lucide-react';

export interface AccessibilityBarProps {
    fontSize: number;
    darkMode: boolean;
    readingEnabled: boolean;
    onIncreaseFont: () => void;
    onDecreaseFont: () => void;
    onToggleDark: () => void;
    onToggleReading: () => void;
}

const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
    fontSize,
    darkMode,
    readingEnabled,
    onIncreaseFont,
    onDecreaseFont,
    onToggleDark,
    onToggleReading,
}) => (
    <header className="flex items-center justify-start gap-4 bg-blue-500 px-6 py-2 dark:bg-gray-800 transition-colors duration-300">
        <button
            onClick={onToggleDark}
            className="text-white hover:scale-110 transition"
        >
            <Moon size={16} />
        </button>
        <button
            onClick={onToggleReading}
            className={`text-white hover:scale-110 transition ${
                readingEnabled ? 'bg-green-600 px-2 py-1 rounded' : ''
            }`}
        >
            <Volume2 size={16} />
        </button>
        <button className="text-white hover:scale-110 transition">
            <Languages size={16} />
        </button>
        <div className="flex items-center gap-2 ml-6">
            <button
                onClick={onDecreaseFont}
                className="text-white hover:scale-110 transition"
                aria-label="Diminuir fonte"
            >
                <span className="text-sm">A-</span>
            </button>
            <div className="w-16 h-px bg-white relative">
                <div className="absolute left-1/2 -translate-x-1/2 w-1 h-4 bg-white rounded-full" />
            </div>
            <button
                onClick={onIncreaseFont}
                className="text-white hover:scale-110 transition"
                aria-label="Aumentar fonte"
            >
                <span className="text-lg font-bold">A+</span>
            </button>
        </div>
    </header>
);

export default AccessibilityBar;
