import Image from 'next/image';
import Link from 'next/link';
import {
    Building,
    Users,
    Monitor,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Menu,
    Settings,
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 px-3 items-center justify-center rounded-md bg-gradient-to-br from-slate-900 to-slate-700">
                                <span className="text-base sm:text-lg font-bold text-white">
                                    SGEC
                                </span>
                            </div>
                            {/*<span className="text-xl font-semibold tracking-tight text-slate-900">Sistema de Gestão de Espaços Corporativos</span>*/}
                        </Link>
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link
                                href="/solutions"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Ambientes
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Reservas
                            </Link>
                            <Link
                                href="/resources"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Dicas & Suporte
                            </Link>
                            <Link
                                href="/enterprise"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Nossa Equipe
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2">
                            <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                                <Settings size={20} />
                            </button>
                            <Link
                                href="/login"
                                className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                            >
                                <User size={16} />
                                Login
                            </Link>
                        </div>
                        <button className="flex md:hidden items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-32">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                                <span className="text-slate-700">
                                    Espaços projetados para
                                </span>{' '}
                                você
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-slate-600">
                                Oferecemos ambientes confortáveis e de alta
                                qualidade para que sua equipe se reúna, colabore
                                e cresça com tranquilidade e bem-estar.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button className="w-full sm:w-auto rounded-md bg-slate-900 hover:bg-slate-800 px-5 py-6 text-base">
                                    Reservar seu espaço
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto rounded-md border-slate-300 px-5 py-6 text-base text-slate-700 hover:bg-slate-50"
                                >
                                    Explorar ambientes{' '}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 sm:mt-24 relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-xl bg-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200">
                            <Image
                                src="/coworking.png"
                                alt="Workspace dashboard"
                                width={1200}
                                height={600}
                                className="w-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Logos Section */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-500">
                            Empresas que confiam em nossa plataforma
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex h-8 items-center justify-center grayscale transition hover:grayscale-0"
                                >
                                    <div className="h-6 w-24 rounded-md bg-slate-200"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                O conforto e a estrutura que sua equipe merece
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                Flexibilidade e qualidade, esteja sua equipe
                                onde estiver
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    icon: <Building className="h-6 w-6" />,
                                    title: 'Ambientes Sob Medida',
                                    description:
                                        'Salas e estações equipadas para acomodar desde reuniões rápidas até jornadas de trabalho prolongadas, com todo o conforto que sua equipe merece.',
                                },
                                {
                                    icon: <Monitor className="h-6 w-6" />,
                                    title: 'Conexão Simplificada',
                                    description:
                                        'Ferramentas de agendamento integradas, internet de alta velocidade e suportes plug-and-play para você começar a trabalhar sem complicação.',
                                },
                                {
                                    icon: <Users className="h-6 w-6" />,
                                    title: 'Rede Colaborativa',
                                    description:
                                        'Encontre colegas, troque insights em nossos espaços compartilhados e participe de encontros que reforçam a união do time.',
                                },
                            ].map((feature, i) => (
                                <Card
                                    key={i}
                                    className="border-0 bg-white shadow-lg shadow-slate-200/50 transition-all hover:shadow-xl hover:-translate-y-1"
                                >
                                    <CardHeader>
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
                                            {feature.icon}
                                        </div>
                                        <CardTitle className="text-xl font-semibold text-slate-900">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base text-slate-600">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        <Link
                                            href={`/features/${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="inline-flex items-center text-sm font-medium text-slate-900 hover:text-slate-700"
                                        >
                                            Saiba mais{' '}
                                            <ChevronRight
                                                size={16}
                                                className="ml-1"
                                            />
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Workspace Types */}
                <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                O espaço certo para cada momento
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                Escolha o ambiente ideal para sua equipe
                                trabalhar com máxima produtividade.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    image: '/MEETING.png',
                                    title: 'Salas de Reunião',
                                    description:
                                        'Espaços equipados com tecnologia de ponta para reuniões produtivas e apresentações impactantes.',
                                    features: [
                                        'Capacidade para 4-20 pessoas',
                                        'Equipamentos audiovisuais',
                                        'Serviço de café',
                                    ],
                                },
                                {
                                    image: '/ESCRITORIO.png',
                                    title: 'Escritórios Privativos',
                                    description:
                                        'Ambientes exclusivos e personalizáveis para equipes que precisam de privacidade e foco.',
                                    features: [
                                        'Acesso 24/7',
                                        'Mobiliário ergonômico',
                                        'Endereço comercial',
                                    ],
                                },
                                {
                                    image: '/WORKING.png',
                                    title: 'Coworking',
                                    description:
                                        'Espaços compartilhados com infraestrutura completa para profissionais independentes e pequenas equipes.',
                                    features: [
                                        'Mesas dedicadas ou flexíveis',
                                        'Áreas de descompressão',
                                        'Comunidade diversificada',
                                    ],
                                },
                            ].map((space, i) => (
                                <Card
                                    key={i}
                                    className="group overflow-hidden border-0 bg-white shadow-lg shadow-slate-200/50"
                                >
                                    <div className="aspect-w-16 aspect-h-9 relative h-48 w-full overflow-hidden rounded-lg">
                                        {/*<div className="absolute inset-0 bg-slate-200"></div>*/}
                                        <Image
                                            src={space.image}
                                            alt={space.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold text-slate-900">
                                            {space.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <CardDescription className="text-base text-slate-600">
                                            {space.description}
                                        </CardDescription>
                                        <ul className="space-y-2">
                                            {space.features.map(
                                                (feature, j) => (
                                                    <li
                                                        key={j}
                                                        className="flex items-start"
                                                    >
                                                        <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-emerald-500" />
                                                        <span className="text-sm text-slate-700">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full rounded-md bg-slate-900 hover:bg-slate-800">
                                            Reservar agora
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 shadow-xl">
                            <div className="px-6 py-16 sm:px-12 sm:py-20 lg:flex lg:items-center lg:justify-between lg:px-16">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                        Precisa de ajuda?
                                    </h2>
                                    <p className="mt-4 max-w-xl text-lg text-slate-300">
                                        Encontre respostas ou fale diretamente
                                        com nosso suporte.
                                    </p>
                                </div>
                                <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button className="rounded-md bg-white px-5 py-6 text-base font-medium text-slate-900 hover:bg-slate-100/2">
                                            Ver FAQ
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-md border-white/20 bg-transparent px-5 py-6 text-base font-medium text-white hover:bg-white/10"
                                        >
                                            Enviar uma mensagem
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="bg-slate-50 py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                O que nossos usuários dizem
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                Empresas de diversos setores transformaram sua
                                forma de trabalhar com nossas soluções.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <Card
                                    key={i}
                                    className="border-0 bg-white shadow-lg shadow-slate-200/50"
                                >
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    Nome do usuário
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Cargo, Empresa
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">
                                            "Os espaços de trabalho flexíveis e
                                            a infraestrutura de alta qualidade
                                            permitiram que nossa equipe
                                            colaborasse de forma mais eficiente,
                                            resultando em um aumento
                                            significativo de produtividade."
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 px-3 items-center justify-center rounded-md bg-gradient-to-br from-slate-900 to-slate-700">
                                    <span className="text-base sm:text-lg font-bold text-white">
                                        SGEC
                                    </span>
                                </div>
                                <span className="text-xl font-semibold tracking-tight text-slate-900">
                                    Sistema Gestão de Espaços Corporativos
                                </span>
                            </div>
                            <p className="mt-4 text-sm text-slate-600">
                                Ambientes personalizados que unem praticidade e
                                bem-estar para o dia a dia do seu time.
                            </p>
                            <div className="mt-6 flex space-x-4">
                                {[
                                    'twitter',
                                    'linkedin',
                                    'facebook',
                                    'instagram',
                                ].map((social) => (
                                    <Link
                                        key={social}
                                        href={`https://${social}.com`}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                    >
                                        <span className="sr-only">
                                            {social}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                                Produto
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {[
                                    'Espaços',
                                    'Opções de Reserva',
                                    'Recursos',
                                    'Empresas',
                                    'Depoimentos',
                                ].map((item) => (
                                    <li key={item}>
                                        <Link
                                            href="#"
                                            className="text-sm text-slate-600 hover:text-slate-900"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                                Empresa
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {[
                                    'Sobre nós',
                                    'Carreiras',
                                    'Blog',
                                    'Notícias',
                                    'Contato',
                                ].map((item) => (
                                    <li key={item}>
                                        <Link
                                            href="#"
                                            className="text-sm text-slate-600 hover:text-slate-900"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                                Legal
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {[
                                    'Termos de Uso',
                                    'Privacidade',
                                    'Cookies',
                                    'Licenças',
                                    'Configurações',
                                ].map((item) => (
                                    <li key={item}>
                                        <Link
                                            href="#"
                                            className="text-sm text-slate-600 hover:text-slate-900"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-200 pt-8">
                        <p className="text-center text-sm text-slate-500">
                            &copy; 2025 T2M, LTDA. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
