import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Check, Calendar, TrendingUp, FileText, Users, Shield, Star, Quote, Home, Building2, BarChart3, FileBarChart, Coins, Settings, HelpCircle, BookOpen, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import analyticsImage from "@/assets/analytics-feature.jpg";
import bookingImage from "@/assets/booking-feature.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const functionalityItems = [
    {
      title: "Gestão de Reservas",
      description: "Centralize todas as suas reservas num único painel",
      icon: Calendar,
      href: "#features"
    },
    {
      title: "Relatórios INE",
      description: "Gere automaticamente os relatórios mensais",
      icon: FileText,
      href: "#features"
    },
    {
      title: "Taxa Turística",
      description: "Calcule e submeta automaticamente",
      icon: Coins,
      href: "#features"
    },
    {
      title: "Análise Financeira",
      description: "Acompanhe a rentabilidade em tempo real",
      icon: TrendingUp,
      href: "#features"
    }
  ];

  const solutionItems = [
    {
      title: "Proprietários Individuais",
      description: "Solução ideal para quem tem 1-3 propriedades",
      icon: Home,
      href: "#pricing"
    },
    {
      title: "Gestores Profissionais",
      description: "Para quem gere múltiplas propriedades",
      icon: Building2,
      href: "#pricing"
    },
    {
      title: "Agências",
      description: "Soluções enterprise para grandes volumes",
      icon: Users,
      href: "#pricing"
    }
  ];

  const resourceItems = [
    {
      title: "Centro de Ajuda",
      description: "Tutoriais e guias completos",
      icon: HelpCircle,
      href: "#"
    },
    {
      title: "Blog",
      description: "Artigos e dicas sobre gestão de AL",
      icon: BookOpen,
      href: "#"
    },
    {
      title: "Contacto",
      description: "Fale connosco",
      icon: Phone,
      href: "#"
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: "Gestão de Reservas",
      description: "Controle todas as suas reservas num só lugar, com sincronização automática"
    },
    {
      icon: TrendingUp,
      title: "Análise Financeira",
      description: "Acompanhe receitas, despesas e rentabilidade em tempo real"
    },
    {
      icon: FileText,
      title: "Relatórios INE",
      description: "Gere automaticamente os relatórios mensais para o INE"
    },
    {
      icon: Users,
      title: "Taxa Turística",
      description: "Calcule e submeta a taxa turística de forma automática"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Proprietária de 3 apartamentos",
      content: "Desde que comecei a usar a plataforma, poupo horas todos os meses. A gestão de reservas e relatórios automáticos são fantásticos!",
      rating: 5,
      initials: "MS"
    },
    {
      name: "João Costa",
      role: "Gestor de Alojamento Local",
      content: "A integração com o Airbnb e Booking facilita muito o trabalho. Recomendo a todos os proprietários de AL.",
      rating: 5,
      initials: "JC"
    },
    {
      name: "Ana Rodrigues",
      role: "Proprietária de 5 propriedades",
      content: "Plataforma intuitiva e completa. O suporte é excelente e os relatórios do INE são gerados automaticamente. Perfeito!",
      rating: 5,
      initials: "AR"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "0€",
      period: "para sempre",
      features: [
        "1 propriedade",
        "Gestão básica de reservas",
        "Relatórios mensais",
        "Suporte por email"
      ]
    },
    {
      name: "Basic",
      price: "19€",
      period: "/mês",
      popular: true,
      features: [
        "Até 3 propriedades",
        "Sincronização Airbnb/Booking",
        "Relatórios avançados",
        "Taxa turística automática",
        "Suporte prioritário"
      ]
    },
    {
      name: "Premium",
      price: "49€",
      period: "/mês",
      features: [
        "Propriedades ilimitadas",
        "Todas as integrações",
        "Relatórios personalizados",
        "Automação completa",
        "Gestor de conta dedicado",
        "API de acesso"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
        <div className="rounded-full border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img 
                src="/logos/monumenta-logo.svg" 
                alt="Monumental Atanti" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-semibold hidden sm:inline">Monumental Atanti</span>
            </div>

            {/* Navigation Menu */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {/* Funcionalidades */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Funcionalidades</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {functionalityItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium leading-none">{item.title}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Soluções */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Soluções</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {solutionItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium leading-none">{item.title}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Recursos */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-3 p-4">
                      {resourceItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium leading-none">{item.title}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Preços */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a
                      href="#pricing"
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      Preços
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
                Entrar
              </Button>
              <Button onClick={() => navigate("/auth?showPlans=true")}>
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Property Management" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestão de Alojamento Local
            <br />
            Simplificada
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma completa para gerir as suas propriedades de alojamento local.
            Reservas, finanças, relatórios INE e taxa turística - tudo num só lugar.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth?showPlans=true")}>
              Comece Gratuitamente
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?mode=login")}>
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo o que precisa para gerir o seu alojamento
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            O que dizem os nossos clientes
          </h2>
          <p className="text-muted-foreground text-lg">
            Centenas de proprietários já confiam na nossa plataforma
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <Quote className="h-10 w-10 text-primary/20 mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Planos para todos os tamanhos
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Escolha o plano ideal para o seu negócio
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </div>
              )}
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/auth?showPlans=true&plan=" + plan.name.toLowerCase())}
                >
                  Começar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">
          Seguro e Confiável
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Os seus dados estão protegidos com encriptação de nível bancário.
          Conforme com RGPD e todas as regulamentações portuguesas.
        </p>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-2">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para simplificar a sua gestão?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a centenas de proprietários que já confiam na nossa plataforma
            </p>
            <Button size="lg" onClick={() => navigate("/auth?showPlans=true")}>
              Comece Gratuitamente
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 Monumental Atanti. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
