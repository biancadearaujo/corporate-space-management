import { ProfileCard } from '@/components/ui/profileCard';

export default function AboutUsPage() {
    // TODO adicionar fotos e informações dos outros integrantes da equipe
    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                    Equipe de Desenvolvimento
                </h2>

                <div className="flex flex-wrap justify-center gap-8">
                    <ProfileCard
                        imageUrl="/images/team2.jpg"
                        name="Luiza Assis"
                        role="Design UI/UX"
                        linkedinUrl="https://linkedin.com/in/#"
                        githubUrl="https://github.com/#"
                    />
                    <ProfileCard
                        imageUrl="/team/joão.jpg"
                        name="João Winter"
                        role="Product Owner"
                        linkedinUrl="https://www.linkedin.com/in/jo%C3%A3o-victor-winter-do-valle-queiroz-86bb0b206/"
                        githubUrl="https://github.com/#"
                    />
                    <ProfileCard
                        imageUrl="/images/team5.jpg"
                        name="Rodrigo Lischt"
                        role="Desenvolvedor Frontend"
                        linkedinUrl="https://www.linkedin.com/in/rodrigo-lischt-641b61322/"
                        githubUrl="https://github.com/rodrigolischt"
                    />
                    <ProfileCard
                        imageUrl="/images/team3.jpg"
                        name="Bianca Araújo"
                        role="Desenvolvedora Backend"
                        linkedinUrl="https://www.linkedin.com/in/bianca-de-araujo/"
                        githubUrl="https://github.com/biancadearaujo"
                    />
                    <ProfileCard
                        imageUrl="/team/herick.jpg"
                        name="Herick Moreira"
                        role="Desenvolvedor Full Stack"
                        linkedinUrl="https://www.linkedin.com/in/herick-moreira/"
                        githubUrl="https://github.com/Herick2D"
                    />
                </div>
            </div>
        </div>
    );
}
