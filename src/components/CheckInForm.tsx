import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Check, ArrowRight, ArrowLeft, Building2, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { enUS, pt } from "date-fns/locale";
import { Language, useTranslation } from "@/lib/checkin-translations";
import { CountryCombobox } from "@/components/checkin/CountryCombobox";
import { BirthDatePicker } from "@/components/checkin/BirthDatePicker";
import { DocumentUpload } from "@/components/checkin/DocumentUpload";
import { CheckInProgress } from "@/components/checkin/CheckInProgress";
import { LanguageSelector } from "@/components/checkin/LanguageSelector";

interface Guest {
  nome_completo: string;
  data_nascimento: string;
  local_nascimento: string;
  nacionalidade: string;
  local_residencia: string;
  pais_residencia: string;
  tipo_documento: string;
  numero_documento: string;
  pais_emissor: string;
  documento_foto?: string;
}

interface CheckInFormProps {
  reservation: any;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function CheckInForm({ reservation, language, onLanguageChange }: CheckInFormProps) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = useTranslation(language);
  const dateLocale = language === 'pt' ? pt : enUS;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([
    {
      nome_completo: "",
      data_nascimento: "",
      local_nascimento: "",
      nacionalidade: "",
      local_residencia: "",
      pais_residencia: "",
      tipo_documento: "",
      numero_documento: "",
      pais_emissor: "",
      documento_foto: undefined,
    },
  ]);

  const steps = [
    { id: 1, name: t.stepWelcome },
    { id: 2, name: t.stepDetails },
    { id: 3, name: t.stepGuests },
  ];

  const addGuest = () => {
    if (guests.length < reservation.num_guests) {
      setGuests([
        ...guests,
        {
          nome_completo: "",
          data_nascimento: "",
          local_nascimento: "",
          nacionalidade: "",
          local_residencia: "",
          pais_residencia: "",
          tipo_documento: "",
          numero_documento: "",
          pais_emissor: "",
          documento_foto: undefined,
        },
      ]);
    }
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index: number, field: keyof Guest, value: string | undefined) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setGuests(newGuests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allFilled = guests.every(
      (guest) =>
        guest.nome_completo &&
        guest.data_nascimento &&
        guest.pais_residencia &&
        guest.tipo_documento &&
        guest.numero_documento
    );

    if (!allFilled) {
      toast({
        title: t.incompleteData,
        description: t.fillAllRequired,
        variant: "destructive",
      });
      return;
    }

    if (guests.length !== reservation.num_guests) {
      toast({
        title: t.incorrectGuestCount,
        description: `${t.addAllGuests} ${reservation.num_guests} ${reservation.num_guests === 1 ? t.guest : t.guests}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-checkin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            guests: guests.map((guest) => ({
              nome_completo: guest.nome_completo,
              data_nascimento: guest.data_nascimento || null,
              local_nascimento: guest.local_nascimento || null,
              nacionalidade: guest.nacionalidade || null,
              local_residencia: guest.local_residencia || null,
              pais_residencia: guest.pais_residencia,
              tipo_documento: guest.tipo_documento || null,
              numero_documento: guest.numero_documento || null,
              pais_emissor: guest.pais_emissor || null,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || t.errorProcessing);
      }

      toast({
        title: t.checkInComplete,
        description: t.dataRegistered,
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting check-in:", error);
      toast({
        title: t.errorSaving,
        description: error.message || t.errorProcessing,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Welcome
  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
        <CheckInProgress currentStep={currentStep} steps={steps} />
        
        <Card className="p-8 text-center border-2 border-border">
          <div className="mb-6">
            <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t.welcomeTo}
            </h1>
            <h2 className="text-2xl font-semibold text-primary">
              {reservation.properties.name}
            </h2>
          </div>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t.weAreExcited}
          </p>
          
          <Button
            size="lg"
            onClick={() => setCurrentStep(2)}
            className="gap-2"
          >
            {t.continueButton}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  // Step 2: Reservation Details
  if (currentStep === 2) {
    return (
      <div className="space-y-6">
        <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
        <CheckInProgress currentStep={currentStep} steps={steps} />
        
        <Card className="p-6 border-2 border-border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t.reservationDetails}
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.property}</p>
              <p className="font-medium">{reservation.properties.name}</p>
              <p className="text-sm text-muted-foreground">{reservation.properties.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t.checkIn}
                </p>
                <p className="font-medium">
                  {format(new Date(reservation.check_in), "dd MMMM yyyy", { locale: dateLocale })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.at} {reservation.properties.check_in_time}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t.checkOut}
                </p>
                <p className="font-medium">
                  {format(new Date(reservation.check_out), "dd MMMM yyyy", { locale: dateLocale })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.until} {reservation.properties.check_out_time}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                {t.numberOfGuests}
              </p>
              <p className="font-medium">
                {reservation.num_guests} {reservation.num_guests === 1 ? t.guest : t.guests}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Button>
          <Button
            onClick={() => setCurrentStep(3)}
            className="flex-1 gap-2"
          >
            {t.next}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Guest Information
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
      <CheckInProgress currentStep={currentStep} steps={steps} />
      
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">{t.guestInformation}</h2>
        <p className="text-muted-foreground text-sm">{t.fillGuestData}</p>
      </div>

      {guests.map((guest, index) => (
        <Card key={index} className="p-6 border-2 border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t.guestNumber} {index + 1} {index === 0 && t.mainGuest}
            </h3>
            {guests.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGuest(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor={`nome-${index}`}>{t.fullName} *</Label>
              <Input
                id={`nome-${index}`}
                value={guest.nome_completo}
                onChange={(e) => updateGuest(index, "nome_completo", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor={`nascimento-${index}`}>{t.dateOfBirth}</Label>
              <BirthDatePicker
                date={guest.data_nascimento ? new Date(guest.data_nascimento) : undefined}
                onDateChange={(date) =>
                  updateGuest(index, "data_nascimento", date ? date.toISOString().split("T")[0] : "")
                }
                placeholder={t.selectOption}
              />
            </div>

            <div>
              <Label htmlFor={`local-nascimento-${index}`}>{t.placeOfBirth}</Label>
              <Input
                id={`local-nascimento-${index}`}
                value={guest.local_nascimento}
                onChange={(e) => updateGuest(index, "local_nascimento", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`nacionalidade-${index}`}>{t.nationality}</Label>
              <CountryCombobox
                value={guest.nacionalidade}
                onValueChange={(value) => updateGuest(index, "nacionalidade", value)}
                placeholder={t.selectOption}
                searchPlaceholder={t.searchCountry}
                emptyMessage={t.noCountryFound}
              />
            </div>

            <div>
              <Label htmlFor={`pais-residencia-${index}`}>{t.countryOfResidence} *</Label>
              <CountryCombobox
                value={guest.pais_residencia}
                onValueChange={(value) => updateGuest(index, "pais_residencia", value)}
                placeholder={t.selectOption}
                searchPlaceholder={t.searchCountry}
                emptyMessage={t.noCountryFound}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor={`local-residencia-${index}`}>{t.cityOfResidence}</Label>
              <Input
                id={`local-residencia-${index}`}
                value={guest.local_residencia}
                onChange={(e) => updateGuest(index, "local_residencia", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`tipo-documento-${index}`}>{t.documentType} *</Label>
              <Select
                value={guest.tipo_documento}
                onValueChange={(value) => updateGuest(index, "tipo_documento", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectOption} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cartão de Cidadão">{t.nationalIdCard}</SelectItem>
                  <SelectItem value="Passaporte">{t.passport}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`numero-documento-${index}`}>{t.documentNumber} *</Label>
              <Input
                id={`numero-documento-${index}`}
                value={guest.numero_documento}
                onChange={(e) => updateGuest(index, "numero_documento", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor={`pais-emissor-${index}`}>{t.issuingCountry}</Label>
              <CountryCombobox
                value={guest.pais_emissor}
                onValueChange={(value) => updateGuest(index, "pais_emissor", value)}
                placeholder={t.selectOption}
                searchPlaceholder={t.searchCountry}
                emptyMessage={t.noCountryFound}
              />
            </div>

            <div className="md:col-span-2">
              <Label>{t.documentPhoto}</Label>
              <DocumentUpload
                value={guest.documento_foto}
                onChange={(value) => updateGuest(index, "documento_foto", value)}
                uploadLabel={t.uploadDocument}
                photoLabel={t.takePhoto}
                uploadedLabel={t.documentUploaded}
                removeLabel={t.removeDocument}
              />
            </div>
          </div>
        </Card>
      ))}

      {guests.length < reservation.num_guests && (
        <Button
          type="button"
          variant="outline"
          onClick={addGuest}
          className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.addGuest} ({guests.length}/{reservation.num_guests})
        </Button>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
          className="gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Button>
        <Button
          type="submit"
          disabled={loading || guests.length !== reservation.num_guests}
          className="flex-1"
          size="lg"
        >
          {loading ? (
            <>{t.processing}</>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              {t.completeCheckIn}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
