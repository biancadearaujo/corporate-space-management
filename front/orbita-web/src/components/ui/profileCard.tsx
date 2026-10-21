'use client';

import {
    Card as MtwCard,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Tooltip,
} from '@material-tailwind/react';
import type { CardProps } from '@material-tailwind/react';

import { Linkedin, Github } from 'lucide-react';

type ProfileCardProps = {
    imageUrl: string;
    name: string;
    role: string;
    linkedinUrl: string;
    githubUrl: string;
    className?: string;
};

export function ProfileCard({
    imageUrl,
    name,
    role,
    linkedinUrl,
    githubUrl,
    className,
}: ProfileCardProps) {
    const mtwCardProps: Partial<CardProps> = {
        className: [
            'w-96',
            'border border-gray-200',
            'rounded-xl',
            'hover:shadow-lg',
            'transition-shadow duration-300',
            className,
        ]
            .filter(Boolean)
            .join(' '),
    };

    return (
        <MtwCard {...mtwCardProps}>
            <CardHeader floated={false} className="h-96 rounded-t-xl p-4">
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-t-xl">
                    <img
                        src={imageUrl}
                        alt={`Foto de ${name}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </CardHeader>

            <CardBody className="text-center">
                <Typography variant="h4" color="blue-gray" className="mb-2">
                    {name}
                </Typography>
                <Typography
                    color="blue-gray"
                    className="font-medium"
                    textGradient
                >
                    {role}
                </Typography>
            </CardBody>

            <CardFooter className="flex justify-center gap-7 pt-2 pb-4">
                <Tooltip content="LinkedIn">
                    <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative p-2 rounded-full transition-all duration-300 hover:bg-blue-100/50"
                    >
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                        <Linkedin
                            className="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors duration-300 hover:scale-110"
                            strokeWidth={1.5}
                        />
                    </a>
                </Tooltip>
                <Tooltip content="GitHub">
                    <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative p-2 rounded-full transition-all duration-300 hover:bg-gray-100/50"
                    >
                        <div className="absolute inset-0 bg-gray-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                        <Github
                            className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors duration-300 hover:scale-110"
                            strokeWidth={1.5}
                        />
                    </a>
                </Tooltip>
            </CardFooter>
        </MtwCard>
    );
}
