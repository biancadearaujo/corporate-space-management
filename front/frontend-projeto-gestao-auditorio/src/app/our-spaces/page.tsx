import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowRight, CheckCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OurSpacesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Seção Hero Profissional */}
            <section className="relative bg-gradient-to-br from-slate-50 to-white py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-6">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Soluções de Espaço de Trabalho Premium
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                            Nosso Portfólio
                            <span className="text-teal-600 block">
                                de Espaços Profissionais
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl">
                            Descubra soluções de espaço de trabalho premium
                            projetadas para empresas modernas. Nossos espaços
                            geridos profissionalmente combinam infraestrutura de
                            ponta com termos flexíveis, permitindo que sua
                            equipe prospere em ambientes que promovem inovação,
                            colaboração e crescimento de negócios.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg font-medium"
                                asChild
                            >
                                <Link href="/calendar">
                                    Agendar Consulta
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Soluções de Espaço de Trabalho */}
            <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            O Espaço Certo para Cada Necessidade de Negócio
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Escolha o ambiente ideal para sua equipe trabalhar
                            com máxima produtividade e excelência profissional.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                image: '/placeholder.svg?height=300&width=400',
                                title: 'Salas de Reunião Executivas',
                                description:
                                    'Espaços de última geração equipados com tecnologia avançada para reuniões produtivas e apresentações impactantes.',
                                features: [
                                    'Capacidade para 4-20 profissionais',
                                    'Equipamento audiovisual avançado',
                                    'Serviço de catering premium',
                                    'Suporte profissional para apresentações',
                                ],
                            },
                            {
                                image: '/placeholder.svg?height=300&width=400',
                                title: 'Escritórios Executivos Privativos',
                                description:
                                    'Ambientes exclusivos e personalizáveis para equipes que exigem privacidade, foco e prestígio profissional.',
                                features: [
                                    'Acesso seguro 24/7',
                                    'Mobiliário ergonômico premium',
                                    'Endereço comercial de prestígio',
                                    'Serviços de recepção dedicados',
                                ],
                            },
                            {
                                image: '/placeholder.svg?height=300&width=400',
                                title: 'Espaços de Coworking Premium',
                                description:
                                    'Ambientes compartilhados sofisticados com infraestrutura abrangente para profissionais independentes e equipes em crescimento.',
                                features: [
                                    'Estações de trabalho dedicadas ou flexíveis',
                                    'Áreas de lounge executivo',
                                    'Comunidade de networking profissional',
                                    'Serviços de concierge',
                                ],
                            },
                            {
                                image: '/placeholder.svg?height=300&width=400',
                                title: 'Soluções de Escritório Móvel',
                                description:
                                    'Espaços de trabalho móveis totalmente equipados entregues no local de sua preferência com configuração e suporte profissionais.',
                                features: [
                                    'Implantação sob demanda',
                                    'Infraestrutura tecnológica completa',
                                    'Equipe de instalação profissional',
                                    'Opções de agendamento flexíveis',
                                ],
                            },
                            {
                                image: '/placeholder.svg?height=300&width=400',
                                title: 'Espaços para Eventos e Conferências',
                                description:
                                    'Locais premium projetados para eventos corporativos, conferências e reuniões profissionais com suporte completo.',
                                features: [
                                    'Opções de capacidade escaláveis',
                                    'Coordenação profissional de eventos',
                                    'Parcerias de catering premium',
                                    'Sistemas avançados de áudio, vídeo e iluminação',
                                ],
                            },
                            {
                                image: '/placeholder.svg?height=300&width=400',
                                title: 'Laboratórios de Inovação',
                                description:
                                    'Espaços colaborativos de ponta projetados para equipes focadas em pesquisa, desenvolvimento e inovação.',
                                features: [
                                    'Infraestrutura tecnológica avançada',
                                    'Layouts colaborativos flexíveis',
                                    'Acesso a equipamentos especializados',
                                    'Programas de mentoria em inovação',
                                ],
                            },
                        ].map((space, i) => (
                            <Card
                                key={i}
                                className="group overflow-hidden border-0 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="aspect-w-16 aspect-h-9 relative h-48 w-full overflow-hidden rounded-t-lg">
                                    <Image
                                        src={space.image || '/placeholder.svg'}
                                        alt={space.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                                        {space.features.map((feature, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start"
                                            >
                                                <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-emerald-500" />
                                                <span className="text-sm text-slate-700">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full rounded-md bg-teal-600 hover:bg-teal-700 text-white font-medium">
                                        Agendar Visita
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Estatísticas Profissionais */}
            <section className="py-20 px-4 bg-teal-600 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Confiado por Líderes da Indústria
                        </h2>
                        <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                            Nosso compromisso com a excelência nos tornou o
                            parceiro de espaço de trabalho preferido para
                            empresas da Fortune 500 e empresas em crescimento.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">150+</div>
                            <div className="text-teal-100 font-medium">
                                Localizações Premium
                            </div>
                            <div className="text-sm text-teal-200">
                                Nos principais mercados
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">50K+</div>
                            <div className="text-teal-100 font-medium">
                                Profissionais Atendidos
                            </div>
                            <div className="text-sm text-teal-200">
                                Membros ativos mensais
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">99.9%</div>
                            <div className="text-teal-100 font-medium">
                                Disponibilidade do Serviço
                            </div>
                            <div className="text-sm text-teal-200">
                                Disponibilidade garantida
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">24/7</div>
                            <div className="text-teal-100 font-medium">
                                Suporte de Concierge
                            </div>
                            <div className="text-sm text-teal-200">
                                Assistência profissional
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Empresarial */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">
                        Pronto para Elevar Seu Espaço de Trabalho?
                    </h2>
                    <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                        Conecte-se com nossos consultores de espaço de trabalho
                        para discutir seus requisitos específicos e descobrir
                        como nossas soluções premium podem apoiar seus objetivos
                        de negócio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg font-medium"
                        >
                            Contate Nossa Equipe
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 py-4 text-lg font-medium border-slate-300"
                        >
                            Solicitar Proposta Personalizada
                        </Button>
                    </div>
                </div>
            </section>
            <footer className="bg-slate-900 text-white">
                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-4 text-center md:text-left">
                            <Link
                                href="/"
                                className="flex items-center justify-center md:justify-start gap-2"
                            >
                                <Image
                                    src="/assets/logo.svg"
                                    alt="Logo"
                                    width={120}
                                    height={40}
                                    className="h-10 w-auto"
                                />
                            </Link>
                            <p className="text-sm text-slate-300">
                                Fornecendo soluções premium de workspace desde
                                2002.
                            </p>
                            <div className="flex justify-center md:justify-start space-x-4">
                                {[
                                    'twitter',
                                    'linkedin',
                                    'facebook',
                                    'instagram',
                                ].map((social) => (
                                    <Link
                                        key={social}
                                        href={`https://www.${social}.com`}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-teal-500 hover:text-white transition-colors"
                                    >
                                        <span className="sr-only">
                                            {social}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
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
                                            className="text-sm text-slate-400 hover:text-white transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
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
                                            className="text-sm text-slate-400 hover:text-white transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
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
                                            className="text-sm text-slate-400 hover:text-white transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-slate-700 pt-8 text-center">
                        <p className="text-sm text-slate-400">
                            © 2025 Company. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
