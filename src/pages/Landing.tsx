import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Calendar, TrendingUp, FileText, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import analyticsImage from "@/assets/analytics-feature.jpg";
import bookingImage from "@/assets/booking-feature.jpg";

const Landing = () => {
  const navigate = useNavigate();

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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumental Atanti" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-semibold">Monumental Atanti</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
              Entrar
            </Button>
            <Button onClick={() => navigate("/auth?mode=register")}>
              Começar Agora
            </Button>
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
            <Button size="lg" onClick={() => navigate("/auth?mode=register")}>
              Comece Gratuitamente
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?mode=login")}>
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo o que precisa para gerir o seu alojamento
        </h2>
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div className="flex flex-col justify-center">
            <Calendar className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Gestão de Reservas</h3>
            <p className="text-lg text-muted-foreground">
              Controle todas as suas reservas num só lugar, com sincronização automática das principais plataformas.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img src={bookingImage} alt="Booking Management" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="rounded-lg overflow-hidden shadow-lg order-2 md:order-1">
            <img src={analyticsImage} alt="Analytics Dashboard" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center order-1 md:order-2">
            <TrendingUp className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Análise Financeira</h3>
            <p className="text-lg text-muted-foreground">
              Acompanhe receitas, despesas e rentabilidade em tempo real com relatórios detalhados.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.slice(2).map((feature, index) => (
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

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
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
                  onClick={() => navigate("/auth?mode=register&plan=" + plan.name.toLowerCase())}
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
            <Button size="lg" onClick={() => navigate("/auth?mode=register")}>
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
