export type Language = 'en' | 'pt';

export const translations = {
  en: {
    // Welcome step
    welcomeTo: "Welcome to",
    weAreExcited: "We are excited to welcome you! Please complete the online check-in to make your arrival smoother.",
    continueButton: "Continue",
    
    // Reservation details step
    reservationDetails: "Reservation Details",
    property: "Property",
    checkIn: "Check-in",
    checkOut: "Check-out",
    at: "at",
    until: "until",
    numberOfGuests: "Number of Guests",
    guest: "guest",
    guests: "guests",
    next: "Next",
    back: "Back",
    
    // Guest info step
    guestInformation: "Guest Information",
    fillGuestData: "Please fill in the details for all guests to complete your check-in",
    guestNumber: "Guest",
    mainGuest: "(Main Guest)",
    fullName: "Full Name",
    dateOfBirth: "Date of Birth",
    placeOfBirth: "Place of Birth",
    nationality: "Nationality",
    countryOfResidence: "Country of Residence",
    cityOfResidence: "City/Place of Residence",
    documentType: "Document Type",
    documentNumber: "Document Number",
    issuingCountry: "Issuing Country",
    nationalIdCard: "National ID Card",
    passport: "Passport",
    selectOption: "Select...",
    searchCountry: "Search country...",
    noCountryFound: "No country found",
    
    // Document upload
    documentPhoto: "Document Photo",
    uploadDocument: "Upload Document",
    takePhoto: "Take Photo",
    documentUploaded: "Document uploaded",
    removeDocument: "Remove",
    
    // Actions
    addGuest: "Add Guest",
    completeCheckIn: "Complete Check-in",
    processing: "Processing...",
    
    // Messages
    incompleteData: "Incomplete Data",
    fillAllRequired: "Please fill in all required fields for all guests",
    incorrectGuestCount: "Incorrect Guest Count",
    addAllGuests: "Please add data for all",
    checkInComplete: "Check-in Complete!",
    dataRegistered: "Your data has been registered successfully. We look forward to welcoming you!",
    errorSaving: "Error Saving Data",
    errorProcessing: "An error occurred while processing the check-in",
    
    // Progress steps
    stepWelcome: "Welcome",
    stepDetails: "Details",
    stepGuests: "Guests",
  },
  pt: {
    // Welcome step
    welcomeTo: "Bem-vindo a",
    weAreExcited: "Estamos entusiasmados por recebê-lo! Por favor, complete o check-in online para tornar a sua chegada mais fácil.",
    continueButton: "Continuar",
    
    // Reservation details step
    reservationDetails: "Detalhes da Reserva",
    property: "Propriedade",
    checkIn: "Check-in",
    checkOut: "Check-out",
    at: "às",
    until: "até",
    numberOfGuests: "Número de Hóspedes",
    guest: "hóspede",
    guests: "hóspedes",
    next: "Seguinte",
    back: "Voltar",
    
    // Guest info step
    guestInformation: "Informação dos Hóspedes",
    fillGuestData: "Por favor preencha os dados de todos os hóspedes para completar o seu check-in",
    guestNumber: "Hóspede",
    mainGuest: "(Titular)",
    fullName: "Nome Completo",
    dateOfBirth: "Data de Nascimento",
    placeOfBirth: "Local de Nascimento",
    nationality: "Nacionalidade",
    countryOfResidence: "País de Residência",
    cityOfResidence: "Cidade/Local de Residência",
    documentType: "Tipo de Documento",
    documentNumber: "Número do Documento",
    issuingCountry: "País Emissor",
    nationalIdCard: "Cartão de Cidadão",
    passport: "Passaporte",
    selectOption: "Selecione...",
    searchCountry: "Pesquisar país...",
    noCountryFound: "Nenhum país encontrado",
    
    // Document upload
    documentPhoto: "Foto do Documento",
    uploadDocument: "Carregar Documento",
    takePhoto: "Tirar Foto",
    documentUploaded: "Documento carregado",
    removeDocument: "Remover",
    
    // Actions
    addGuest: "Adicionar Hóspede",
    completeCheckIn: "Concluir Check-in",
    processing: "A processar...",
    
    // Messages
    incompleteData: "Dados Incompletos",
    fillAllRequired: "Por favor preencha todos os campos obrigatórios de todos os hóspedes",
    incorrectGuestCount: "Número de Hóspedes Incorreto",
    addAllGuests: "Por favor adicione os dados de todos os",
    checkInComplete: "Check-in Completo!",
    dataRegistered: "Os seus dados foram registados com sucesso. Aguardamos por si!",
    errorSaving: "Erro ao Guardar Dados",
    errorProcessing: "Ocorreu um erro ao processar o check-in",
    
    // Progress steps
    stepWelcome: "Bem-vindo",
    stepDetails: "Detalhes",
    stepGuests: "Hóspedes",
  },
};

export function useTranslation(language: Language) {
  return translations[language];
}
