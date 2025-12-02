import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PricingSection, PricingTier } from "@/components/blocks/pricing-section";
import {
  Check,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  Star,
  Quote,
  Home,
  BarChart3,
  Headphones,
  Menu,
  Building2,
  Crown,
} from "lucide-react";

// Assets
import heroImage from "@/assets/hero-image.jpg";
import analyticsImage from "@/assets/analytics-feature.jpg";
import bookingImage from "@/assets/booking-feature.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Features
  const features = [
    {
      icon: Calendar,
      title: "Gestão de Reservas",
      description: "Controle todas as suas reservas num só lugar, com sincronização automática",
    },
    {
      icon: TrendingUp,
      title: "Análise Financeira",
      description: "Acompanhe receitas, despesas e rentabilidade em tempo real",
    },
    { icon: FileText, title: "Relatórios INE", description: "Gere automaticamente os relatórios mensais para o INE" },
    { icon: Users, title: "Taxa Turística", description: "Calcule e submeta a taxa turística de forma automática" },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Proprietária de 3 apartamentos",
      content:
        "Desde que comecei a usar a plataforma, poupo horas todos os meses. A gestão de reservas e relatórios automáticos são fantásticos!",
      rating: 5,
      initials: "MS",
    },
    {
      name: "João Costa",
      role: "Gestor de Alojamento Local",
      content:
        "A integração com o Airbnb e Booking facilita muito o trabalho. Recomendo a todos os proprietários de AL.",
      rating: 5,
      initials: "JC",
    },
    {
      name: "Ana Rodrigues",
      role: "Proprietária de 5 propriedades",
      content:
        "Plataforma intuitiva e completa. O suporte é excelente e os relatórios do INE são gerados automaticamente. Perfeito!",
      rating: 5,
      initials: "AR",
    },
  ];

  // Plans
  const pricingTiers: PricingTier[] = [
    {
      name: "Basic",
      price: {
        monthly: 7,
        yearly: 79,
      },
      description: "Para começar",
      features: [
        { name: "1 propriedade", description: "Gerir uma única propriedade", included: true },
        { name: "Gestão básica de reservas", description: "Controlo de reservas", included: true },
        { name: "Resumo mensal básico", description: "Resumos financeiros simples", included: true },
        { name: "Suporte por email", description: "Resposta em até 48h", included: true },
      ],
      icon: <Home className="w-6 h-6" />,
      highlight: false,
    },
    {
      name: "Pro",
      price: {
        monthly: 19,
        yearly: 190,
      },
      description: "Para quem está a crescer",
      features: [
        { name: "Até 5 propriedades", description: "Gerir múltiplas propriedades", included: true },
        { name: "Formulários de check-in", description: "Envio automático aos hóspedes", included: true },
        { name: "Taxa turística automática", description: "Cálculo automático", included: true },
        { name: "Calendário Fiscal", description: "Notificações automáticas", included: true },
        { name: "Suporte prioritário", description: "Resposta em até 24h", included: true },
      ],
      icon: <Building2 className="w-6 h-6" />,
      highlight: true,
      badge: "Mais Popular",
    },
    {
      name: "Premium",
      price: {
        monthly: 49,
        yearly: 490,
      },
      description: "Para gestores profissionais",
      features: [
        { name: "Propriedades ilimitadas", description: "Sem limite de propriedades", included: true },
        { name: "Check-in automatizado completo", description: "Sistema completo", included: true },
        { name: "Taxa turística + SIBA (INE)", description: "Envio automático", included: true },
        { name: "Calendário Fiscal completo", description: "Alertas personalizados", included: true },
        { name: "Relatórios personalizados", description: "Análises detalhadas", included: true },
        { name: "Gestor de conta dedicado", description: "Suporte VIP", included: true },
        { name: "API de acesso", description: "Integração avançada", included: true },
      ],
      icon: <Crown className="w-6 h-6" />,
      highlight: false,
    },
  ];

  // Statistics
  const statistics = [
    { label: "Propriedades geridas", value: 370, icon: Home, color: "bg-primary/20 text-primary" },
    { label: "Reservas processadas", value: 120000, icon: Calendar, color: "bg-accent/20 text-accent" },
    { label: "Uptime da plataforma", value: 99.9, suffix: "%", icon: BarChart3, color: "bg-green-200 text-green-700" },
    { label: "Suporte ativo", value: 24, suffix: "/7", icon: Headphones, color: "bg-yellow-200 text-yellow-700" },
  ];

  const [counts, setCounts] = useState(statistics.map(() => 0));

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((count, i) => {
          const target = statistics[i].value;
          const increment = target / 100;
          return count < target ? Math.min(count + increment, target) : count;
        }),
      );
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => (num >= 1000 ? Math.floor(num).toLocaleString() : Number(num.toFixed(1)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="fixed top-5 left-0 w-full z-50 px-4">
        <div className="mx-auto max-w-7xl rounded-full border bg-background/90 backdrop-blur shadow-lg px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logos/monumenta-logo.svg" alt="Monumental Atlantic" className="h-10 w-auto" />
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              <a
                href="#features"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#pricing"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Planos
              </a>
              <a
                href="/simulador"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/simulador");
                }}
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Gestão de AL
              </a>
            </nav>

            {/* Menu / Buttons */}
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    <a
                      href="#features"
                      className="text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Funcionalidades
                    </a>
                    <a
                      href="#pricing"
                      className="text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Planos
                    </a>
                    <Button
                      variant="ghost"
                      className="justify-start p-0 h-auto"
                      onClick={() => {
                        navigate("/simulador");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Gestão de AL
                    </Button>
                    <div className="border-t pt-4 mt-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/auth?mode=login");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Entrar
                      </Button>
                      <Button
                        className="w-full mt-2"
                        onClick={() => {
                          navigate("/auth?showPlans=true");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Começar Agora
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Desktop buttons */}
              <Button variant="ghost" onClick={() => navigate("/auth?mode=login")} className="hidden sm:flex">
                Entrar
              </Button>
              <Button onClick={() => navigate("/auth?showPlans=true")} className="hidden sm:flex">
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[60vh] pt-[80px]">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Gestão de Alojamento Local" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 pt-20 pb-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestão de Alojamento Local Simplificada
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma completa para gerir as suas propriedades de AL. Reservas, finanças, relatórios INE e taxa
            turística - tudo num só lugar.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth?showPlans=true")}>
              Comece Gratuitamente
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?mode=login")}>
              Ver Demo
            </Button>
          </div>
          <p className="mt-4 text-muted-foreground">+370 propriedades já geridas através da Monumental Atlantic</p>
        </div>
      </section>

      {/* Statistics 
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">Que os dados falem por nós!</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {statistics.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`rounded-lg p-6 flex flex-col items-center justify-center ${stat.color} shadow-md hover:shadow-lg transition`}
              >
                <Icon className="h-12 w-12 mb-4" />
                <span className="text-4xl md:text-5xl font-bold">
                  {formatNumber(counts[i])}
                  {stat.suffix || ""}
                </span>
                <p className="mt-2 text-lg font-medium text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>*/}

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Tudo o que precisa para gerir o seu alojamento</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card
              key={i}
              className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-primary/5"
            >
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <PricingSection
          tiers={pricingTiers}
          onSelectPlan={(tier, isYearly) => navigate(`/auth?showPlans=true&plan=${tier.name.toLowerCase()}`)}
        />
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-2">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-3xl font-bold mb-4">Pronto para simplificar a sua gestão?</h2>
            <p className="text-xl text-muted-foreground mb-4">
              +370 propriedades já geridas através da Monumental Atlantic
            </p>
            <Button size="lg" onClick={() => navigate("/auth?showPlans=true")}>
              Comece Gratuitamente
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-8">O que dizem os nossos clientes</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-2 hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <Quote className="h-10 w-10 text-primary/20 mb-4" />
                <div className="flex gap-1 mb-2">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 bg-background/90 py-8">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-4 text-center md:text-left">
          <div>
            <img src="/logos/monumenta-logo.svg" alt="Monumenta Logo" className="h-20 mb-2" />
            <p>Gestão profissional de Alojamento Local na Madeira.</p>
          </div>
          <div>
            <h6 className="font-bold mb-2">Links</h6>
            <ul className="space-y-1">
              <li>
                <Button variant="link" onClick={() => navigate("/")}>
                  Início
                </Button>
              </li>
              <li>
                <Button variant="link" onClick={() => navigate("/pricing")}>
                  Planos
                </Button>
              </li>
              <li>
                <Button variant="link" onClick={() => navigate("/features")}>
                  Serviços
                </Button>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold mb-2">Suporte</h6>
            <ul className="space-y-1">
              <li>
                <Button variant="link" onClick={() => navigate("/contact")}>
                  Contacto
                </Button>
              </li>
              <li>
                <Button variant="link" onClick={() => navigate("/privacy")}>
                  Política de Privacidade
                </Button>
              </li>
              <li>
                <Button variant="link" onClick={() => navigate("/terms")}>
                  Termos e Condições
                </Button>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold mb-2">Redes Sociais</h6>
            <ul className="space-y-1">
              <li>
                <a href="#">Instagram</a>
              </li>
              <li>
                <a href="#">Facebook</a>
              </li>
              <li>
                <a href="#">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-6">
          <p>© 2025 Monumental Atlantic. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
