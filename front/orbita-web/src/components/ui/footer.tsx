import Image from 'next/image';
import Link from 'next/link';

interface FooterProps {
    logoUrl: string;
    flagUrl: string;
}

export default function Footer({ logoUrl, flagUrl }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-verde-t2m text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo column */}
                    <div className="flex items-start">
                        <Link href="/">
                            <Image
                                src={logoUrl || '/placeholder.svg'}
                                alt="Logo da empresa"
                                width={100}
                                height={40}
                                className="h-auto"
                            />
                        </Link>
                    </div>

                    {/* Sobre column */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6">Sobre</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/sobre" className="hover:underline">
                                    SOBRE O SITE
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/empresas"
                                    className="hover:underline"
                                >
                                    EMPRESAS
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/trabalhe-conosco"
                                    className="hover:underline"
                                >
                                    TRABALHE CONOSCO
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/termos"
                                    className="hover:underline"
                                >
                                    TERMOS DE USO
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Organizadores column */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6">
                            Organizadores
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/demonstracao"
                                    className="hover:underline"
                                >
                                    SOLICITAR DEMONSTRAÇÃO
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/planos"
                                    className="hover:underline"
                                >
                                    PLANOS
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/consultor"
                                    className="hover:underline"
                                >
                                    CONSULTOR
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contato column */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6">Contato</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/email" className="hover:underline">
                                    ENVIE UM E-MAIL
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/proprietario"
                                    className="hover:underline"
                                >
                                    PROPRIETÁRIO
                                </Link>
                            </li>
                            <li>
                                <Link href="/ajuda" className="hover:underline">
                                    AJUDA
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom section with copyright and additional links */}
            <div className="bg-teal-600 py-4 bg-verde-hover">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                            <span>© Equipe T2M, {currentYear}</span>
                            <Link href="/endereco" className="hover:underline">
                                ENDEREÇO
                            </Link>
                            <Link
                                href="/politica-cookies"
                                className="hover:underline"
                            >
                                POLÍTICA DE COOKIES
                            </Link>
                            <Link href="/cnpj" className="hover:underline">
                                CNPJ
                            </Link>
                            <Link
                                href="/configuracoes-cookies"
                                className="hover:underline"
                            >
                                CONFIGURAÇÕES DE COOKIES
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image
                                src={flagUrl}
                                alt="Bandeira do Brasil"
                                width={30}
                                height={20}
                                className="h-auto"
                            />
                            <span>PORTUGUÊS (BR)</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
