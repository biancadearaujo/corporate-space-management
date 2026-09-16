'use client';

import { 
  CalendarDays, 
  Users, 
  Building2, 
  Plus, 
  LogOut, 
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* --- 1. NAVBAR SUPERIOR --- */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
        
        {/* Logo / Nome */}
        <div className="flex items-center gap-2 font-bold text-blue-900 text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          Space Master
        </div>

        {/* Navegação Principal */}
        <nav className="hidden md:flex items-center gap-6 ml-6 text-sm font-medium text-slate-600">
          <a href="#" className="text-blue-600 hover:text-blue-700">Dashboard</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Auditórios</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Agendamentos</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Relatórios</a>
        </nav>

        {/* Lado Direito: Busca e Perfil */}
        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Buscar evento..." 
              className="w-64 pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all" 
            />
          </div>
          
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900">Bianca Dev</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
            <Avatar className="h-9 w-9 cursor-pointer border-2 border-white shadow-sm">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>BD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* --- 2. CONTEÚDO PRINCIPAL --- */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho da Página + Botão de Ação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Visão geral das reservas e ocupação.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
          </Button>
        </div>

        {/* Cards de KPI (Indicadores) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Reservas Hoje
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">12</div>
              <p className="text-xs text-slate-500 mt-1">
                +2 em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Auditórios Ativos
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">8</div>
              <p className="text-xs text-slate-500 mt-1">
                Total de 10 salas
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Usuários Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">573</div>
              <p className="text-xs text-slate-500 mt-1">
                +20 novos este mês
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 border-none shadow-md text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Próximo Evento
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">14:00</div>
              <p className="text-xs text-blue-100 mt-1 font-medium">
                Reunião de Diretoria
              </p>
              <p className="text-xs text-blue-200">
                Auditório Principal A
              </p>
            </CardContent>
          </Card>

        </div>

        {/* --- 3. LISTA DE AGENDAMENTOS (Tabela Simplificada) --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Tabela Principal (Ocupa 4 colunas) */}
          <Card className="col-span-4 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Próximos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                {/* Item da Lista 1 */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                            14h
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Reunião de Diretoria</p>
                            <p className="text-sm text-slate-500">Auditório Principal A • Samsung</p>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Confirmado
                    </div>
                </div>

                 {/* Item da Lista 2 */}
                 <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                            15h
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Treinamento Java Spring</p>
                            <p className="text-sm text-slate-500">Lab 03 • Tech Team</p>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        Pendente
                    </div>
                </div>

                {/* Item da Lista 3 */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                            16h
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Workshop UI/UX</p>
                            <p className="text-sm text-slate-500">Auditório B • Design Team</p>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Confirmado
                    </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Card Lateral (Ocupa 3 colunas) - Status Rápido */}
          <Card className="col-span-3 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Status dos Auditórios</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Status Bar 1 */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">Auditório Principal</span>
                            <span className="text-slate-500">80% Ocupado</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-blue-600 w-[80%]"></div>
                        </div>
                    </div>

                     {/* Status Bar 2 */}
                     <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">Laboratório 01</span>
                            <span className="text-slate-500">45% Ocupado</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-blue-400 w-[45%]"></div>
                        </div>
                    </div>

                     {/* Status Bar 3 */}
                     <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">Sala de Reunião C</span>
                            <span className="text-slate-500">10% Ocupado</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-blue-300 w-[10%]"></div>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}