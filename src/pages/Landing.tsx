import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PricingSection, PricingTier } from "@/components/blocks/pricing-section";
import { HeroSection } from "@/components/blocks/hero-section-landing";
import {
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
  ScaleOnScroll,
  GlowingOrb,
  FloatingElement,
  Parallax,
} from "@/components/ui/scroll-animations";
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
  ArrowRight,
  Sparkles,
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
        yearly: 199,
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
        yearly: 499,
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GlowingOrb className="-top-40 -left-40" color="primary" size={600} />
        <GlowingOrb className="top-1/3 -right-60" color="accent" size={500} />
        <GlowingOrb className="bottom-1/4 left-1/4" color="primary" size={400} />
      </div>

      {/* Floating decorative shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingElement className="absolute top-20 right-[15%] opacity-20" duration={4} distance={15}>
          <div className="w-16 h-16 rounded-full border-2 border-primary/30" />
        </FloatingElement>
        <FloatingElement className="absolute top-[40%] left-[10%] opacity-20" duration={5} distance={20}>
          <div className="w-24 h-24 rounded-2xl border-2 border-accent/30 rotate-45" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-[30%] right-[20%] opacity-20" duration={3.5} distance={12}>
          <Sparkles className="w-12 h-12 text-primary/30" />
        </FloatingElement>
      </div>

      {/* Header */}
      <motion.header 
        className="fixed top-5 left-0 w-full z-50 px-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
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
              <a
                href="/proprietario/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/proprietario/login");
                }}
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Área do Proprietário
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
                    <Button
                      variant="ghost"
                      className="justify-start p-0 h-auto"
                      onClick={() => {
                        navigate("/proprietario/login");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Área do Proprietário
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
      </motion.header>

      {/* Hero Section */}
      <HeroSection
        badge={{
          text: "Novo: Guidebooks digitais para hóspedes",
          action: {
            text: "Ver mais",
            onClick: () => navigate("/auth?showPlans=true"),
          },
        }}
        title="Gestão de Alojamento Local Simplificada"
        description="Plataforma completa para gerir as suas propriedades de AL. Reservas, finanças, relatórios INE e taxa turística - tudo num só lugar."
        actions={[
          {
            text: "Comece Gratuitamente",
            onClick: () => navigate("/auth?showPlans=true"),
            variant: "glow",
            icon: <ArrowRight className="h-4 w-4" />,
          },
          {
            text: "Ver Demo",
            onClick: () => navigate("/auth?mode=login"),
            variant: "outline",
          },
        ]}
        image={{
          src: heroImage,
          alt: "Dashboard de Gestão de Alojamento Local",
        }}
        stats="+370 propriedades já geridas através da Monumental Atlantic"
      />

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
      <section id="features" className="container mx-auto px-4 py-20 relative">
        <FadeInOnScroll>
          <h2 className="text-3xl font-bold text-center mb-12">Tudo o que precisa para gerir o seu alojamento</h2>
        </FadeInOnScroll>
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {features.map((feature, i) => (
            <StaggerItem key={i}>
              <Card
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-primary/5 h-full group"
              >
                <CardContent className="pt-6">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20 relative">
        <ScaleOnScroll>
          <PricingSection
            tiers={pricingTiers}
            onSelectPlan={(tier, isYearly) => navigate(`/auth?showPlans=true&plan=${tier.name.toLowerCase()}`)}
          />
        </ScaleOnScroll>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        <Parallax speed={-0.2}>
          <FadeInOnScroll>
            <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-2 overflow-hidden relative">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              />
              <CardContent className="pt-12 pb-12 relative z-10">
                <h2 className="text-3xl font-bold mb-4">Pronto para simplificar a sua gestão?</h2>
                <p className="text-xl text-muted-foreground mb-6">
                  +370 propriedades já geridas através da Monumental Atlantic
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" onClick={() => navigate("/auth?showPlans=true")} className="shadow-lg">
                    Comece Gratuitamente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </FadeInOnScroll>
        </Parallax>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 bg-muted/50 relative">
        <FadeInOnScroll>
          <h2 className="text-3xl font-bold text-center mb-8">O que dizem os nossos clientes</h2>
        </FadeInOnScroll>
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {testimonials.map((t, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-2 hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="pt-6">
                    <motion.div
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 12, scale: 1.1 }}
                    >
                      <Quote className="h-10 w-10 text-primary/20 mb-4" />
                    </motion.div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(t.rating)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <Star className="h-5 w-5 text-primary fill-primary" />
                        </motion.div>
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
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <img src="/logos/monumenta-logo.svg" alt="Monumenta Logo" className="h-16 mb-4" />
              <p className="text-muted-foreground text-sm leading-relaxed">
                Gestão profissional de Alojamento Local na Madeira. Simplifique as suas operações com a nossa plataforma completa.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h6 className="font-semibold mb-4 text-foreground">Links Rápidos</h6>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#features" 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a 
                    href="#pricing" 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Planos e Preços
                  </a>
                </li>
                <li>
                  <a 
                    href="/simulador"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/simulador");
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    Gestão de AL
                  </a>
                </li>
                <li>
                  <a 
                    href="/proprietario/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/proprietario/login");
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    Área do Proprietário
                  </a>
                </li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h6 className="font-semibold mb-4 text-foreground">Suporte</h6>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="/ajuda"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/ajuda");
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a 
                    href="/contactos"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/contactos");
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    Contactos
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacidade"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/privacidade");
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a 
                    href="/termos"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/termos");
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    Termos e Condições
                  </a>
                </li>
              </ul>
            </div>

            {/* Redes Sociais */}
            <div>
              <h6 className="font-semibold mb-4 text-foreground">Redes Sociais</h6>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Monumental Atlantic. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a 
                href="/privacidade"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/privacidade");
                }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Privacidade
              </a>
              <a 
                href="/termos"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/termos");
                }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Termos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
