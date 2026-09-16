'use client';

import React from 'react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <h1 className="text-6xl font-bold mb-4 text-verde-t2m">
                Erro 404!
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400">
                Página não encontrada
            </p>
        </div>
    );
}
