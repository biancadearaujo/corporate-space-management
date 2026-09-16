import { PersonStanding } from 'lucide-react';

export default function AccessibilityButton() {
    return (
        <button
            className="
        absolute 
        right-0 
        top-1/2 
        -translate-y-1/2 
        bg-blue-500 
        text-white 
        p-3 
        rounded-full 
        shadow-lg 
        cursor-pointer
        hover:bg-blue-600
      "
            aria-label="Acessibilidade"
        >
            <PersonStanding size={24} />
        </button>
    );
}
