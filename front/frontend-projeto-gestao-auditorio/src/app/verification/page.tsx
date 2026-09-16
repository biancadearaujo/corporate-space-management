import { VerificationForm } from '@/components/ui/verification-form';
import Image from 'next/image';

export default function VerificationPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a
                    href="#"
                    className="flex items-center gap-2 self-center font-medium text-verde-t2m"
                >
                    <Image
                        src="/assets/logo.svg"
                        alt="Logo da empresa"
                        width={100}
                        height={40}
                        className="h-auto"
                    />
                </a>
                <VerificationForm />
            </div>
        </div>
    );
}
