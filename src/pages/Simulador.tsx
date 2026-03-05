import { useState } from "react";
import { PackageCard } from "@/components/simulador/PackageCard";
import { SimulatorSection } from "@/components/simulador/SimulatorSection";
import { ProposalModal } from "@/components/simulador/ProposalModal";
import { CookieBanner } from "@/components/simulador/CookieBanner";
import { AccommodationInfo, type AccommodationFormData } from "@/components/simulador/AccommodationInfo";
import { ProgressIndicator } from "@/components/simulador/ProgressIndicator";
import { ConfirmationPage } from "@/components/simulador/ConfirmationPage";
import useAnalytics from "@/hooks/useAnalytics";
import AnimatedTabs from "@/components/simulador/AnimatedTabs";
import HeroSectionWithGradient from "@/components/simulador/HeroSectionWithGradient";
import luxuryVillaImage from "@/assets/luxury-villa-hero.jpg";

// Logo
import monumentaLogo from "/logos/monumenta-logo.svg";

import {
  Calendar,
  BookOpen,
  Search,
  Monitor,
  Camera,
  Star,
  Info,
  Globe,
  Phone,
  FileText,
  Plane,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Home,
  Wrench,
  Sparkles,
  Gift,
  Package,
  Zap,
  Shield,
  Crown,
} from "lucide-react";

const packages = [
  {
    id: "basic",
    name: "Basic",
    commission: 8,
    icon: Package,
    services: [
      { icon: Calendar, title: "Gestão de reservas e calendário" },
      { icon: BookOpen, title: "Elaboração do Livro de informações" },
      { icon: Search, title: "Apoio na legalização & Registo AL" },
      { icon: Monitor, title: "Área do proprietário personalizada" },
      { icon: Camera, title: "Fotografias, Staging e edição" },
      { icon: Star, title: "Análise e otimização de preços" },
      { icon: Info, title: "Apoio ao proprietário" },
      { icon: Globe, title: "Distribuição em +30 plataformas" },
    ],
  },
  {
    id: "essential",
    name: "Essential",
    commission: 10,
    icon: Zap,
    services: [
      { icon: CheckCircle, title: "Todos os serviços BASIC" },
      { icon: Phone, title: "Apoio ao hóspede 24/7" },
      { icon: Plane, title: "Organização de transfer" },
      { icon: Eye, title: "Consultoria de decoração" },
      { icon: MessageSquare, title: "Follow-up pós check-out" },
      { icon: FileText, title: "Comunicação ao SEF" },
    ],
  },
  {
    id: "smart",
    name: "Smart",
    commission: 12,
    icon: Shield,
    services: [
      { icon: CheckCircle, title: "Inclui Basic + Essential" },
      { icon: FileText, title: "Emissão de faturas do hóspede & TMT" },
      { icon: Gift, title: "Oferta da sessão fotográfica" },
      { icon: Star, title: "Comissão de venda de atividades" },
      { icon: AlertCircle, title: "Comunicação da estatística ao DREM" },
      { icon: CheckCircle, title: "Automatic check-in e check out" },
      { icon: FileText, title: "Recolha e declaração da Taxa Turística" },
      { icon: Info, title: "Apoio fiscal: obrigações legais" },
    ],
  },
  {
    id: "mindfree",
    name: "Mindfree",
    commission: 15,
    icon: Crown,
    services: [
      { icon: CheckCircle, title: "Complementa planos Essential & Smart" },
      { icon: Wrench, title: "Coordenação de manutenção e reparações" },
      { icon: Sparkles, title: "Limpeza completa & lavandaria" },
      { icon: Home, title: "Consumíveis de casa de banho" },
      { icon: Gift, title: "Pack de boas-vindas personalizado" },
    ],
  },
];

const Simulador = () => {
  useAnalytics(); // Track page views
  
  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [proposalData, setProposalData] = useState<{
    commission: number;
    services: string[];
    formData: AccommodationFormData | null;
  }>({
    commission: 0,
    services: [],
    formData: null,
  });

  const currentPackage = packages.find((pkg) => pkg.id === selectedPackage);

  const handlePackageAdvance = () => {
    setCurrentStep(2);
  };

  const handlePersonalizationAdvance = (commission: number, services: string[]) => {
    setTotalCommission(commission);
    setSelectedServices(services);
    setCurrentStep(3);
  };

  const handleOpenProposal = (commission: number, services: string[], formData: AccommodationFormData) => {
    setProposalData({ commission, services, formData });
    setTotalCommission(commission);
    setIsModalOpen(true);
  };

  const handleProposalSuccess = () => {
    setCurrentStep(4);
  };

  const handleBackToHome = () => {
    setCurrentStep(1);
    setSelectedPackage("basic");
    setSelectedServices([]);
    setTotalCommission(0);
  };

  const tabs = packages.map((pkg) => ({
    id: pkg.id,
    label: pkg.name,
    icon: pkg.icon,
    content: (
      <div key={pkg.id} className="animate-fade-in">
        <PackageCard
          name={pkg.name}
          commission={pkg.commission}
          services={pkg.services}
          onAdvance={handlePackageAdvance}
          buttonText="AVANÇAR"
        />
      </div>
    ),
  }));

  const steps = [
    { id: 1, name: "Escolher Pacote" },
    { id: 2, name: "Personalizar" },
    { id: 3, name: "Informações" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO + LOGO DENTRO DO HERO */}
      <div className="relative">
        <HeroSectionWithGradient
          title="PACOTES ANFITRIÃO"
          subtitle="Os melhores pacotes de serviços para os melhores clientes!"
          backgroundImage={luxuryVillaImage}
        />

        {/* Logo centrado no topo do hero */}
        <div className="absolute top-6 w-full flex justify-center z-20">
          <a href="/" className="inline-block">
            <img src={monumentaLogo} alt="Monumenta Logo" className="h-16 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] brightness-0 invert" />
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <ProgressIndicator
          currentStep={currentStep}
          steps={steps}
          onStepClick={(step) => {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {currentStep === 1 && (
          <div className="animate-fade-in">
            <AnimatedTabs tabs={tabs} defaultTab={selectedPackage} onTabChange={setSelectedPackage} />
          </div>
        )}

        {currentStep === 2 && currentPackage && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <SimulatorSection
              baseCommission={currentPackage.commission}
              packageName={currentPackage.name}
              onAdvance={handlePersonalizationAdvance}
              onBack={() => setCurrentStep(1)}
            />
          </div>
        )}

        {currentStep === 3 && currentPackage && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <AccommodationInfo
              packageName={currentPackage.name}
              totalCommission={totalCommission}
              selectedServices={selectedServices}
              onOpenProposal={handleOpenProposal}
              onBack={() => setCurrentStep(2)}
            />
          </div>
        )}

        {currentStep === 4 && currentPackage && (
          <div className="animate-fade-in">
            <ConfirmationPage
              packageName={currentPackage.name}
              totalCommission={totalCommission}
              onBackToHome={handleBackToHome}
            />
          </div>
        )}
      </div>

      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName={currentPackage?.name || ""}
        totalCommission={proposalData.commission}
        selectedServices={proposalData.services}
        formData={proposalData.formData}
        onSuccess={handleProposalSuccess}
      />

      <CookieBanner />
    </div>
  );
};

export default Simulador;
