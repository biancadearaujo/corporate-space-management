'use client';

import type React from 'react';

import Link from 'next/link';
import {
    FileText,
    BriefcaseBusiness,
    Presentation,
    Map,
    IdCard,
    Calendar,
    Sparkles,
    Smartphone,
} from 'lucide-react';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

export default function Navbar() {
    const navItems: NavItem[] = [
        {
            icon: (
                <FileText className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Auditórios',
            href: '/auditorios',
        },
        {
            icon: (
                <BriefcaseBusiness className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Coworking',
            href: '/coworking',
        },
        {
            icon: (
                <Presentation className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Salas de reunião',
            href: '/salas-reuniao',
        },
        {
            icon: (
                <IdCard className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Associe-se',
            href: '/associe-se',
        },
        {
            icon: (
                <Map className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Endereços',
            href: '/enderecos',
        },
        {
            icon: (
                <Smartphone className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Contato',
            href: '/contato',
        },
        {
            icon: (
                <Calendar className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Diárias',
            href: '/diarias',
        },
        {
            icon: (
                <Sparkles className="h-6 w-6 transition-colors group-hover:text-blue-500" />
            ),
            label: 'Eventos',
            href: '/eventos',
        },
    ];

    return (
        <nav className="w-full border-b py-4">
            <div className="container mx-auto">
                <ul className="flex flex-wrap justify-between items-center px-4 md:px-0">
                    {navItems.map((item, index) => (
                        <li
                            key={index}
                            className="w-1/4 sm:w-auto mb-4 sm:mb-0"
                        >
                            <Link
                                href={item.href}
                                className="group flex flex-col items-center text-center transition-colors hover:text-blue-500"
                            >
                                {item.icon}
                                <span className="mt-1 text-xs sm:text-sm">
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
