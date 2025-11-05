import { createContext, useContext, useState, ReactNode } from "react";

export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  checkInTime: string;
  checkOutTime: string;
  wifiPassword: string;
  parkingInfo: string;
  alNumber?: string;
}

interface PropertyContextType {
  properties: Property[];
  selectedPropertyId: string;
  selectedProperty: Property | undefined;
  setSelectedPropertyId: (id: string) => void;
  addProperty: (property: Omit<Property, "id">) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const initialProperties: Property[] = [
  {
    id: "1",
    name: "Casa da Praia",
    address: "Rua da Praia, 123, Porto",
    description: "Apartamento moderno com vista para o mar",
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    wifiPassword: "praia2024",
    parkingInfo: "Estacionamento gratuito na rua",
  },
  {
    id: "2",
    name: "Apartamento Centro",
    address: "Av. Liberdade, 45, Lisboa",
    description: "No coração de Lisboa, próximo a tudo",
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    wifiPassword: "lisboa123",
    parkingInfo: "Garagem privada incluída",
  },
  {
    id: "3",
    name: "Villa do Douro",
    address: "Quinta do Douro, Peso da Régua",
    description: "Villa com piscina e vista para vinhas",
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    checkInTime: "16:00",
    checkOutTime: "10:00",
    wifiPassword: "douro2024",
    parkingInfo: "Estacionamento privado para 3 carros",
  },
];

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const stored = localStorage.getItem("properties");
    return stored ? JSON.parse(stored) : initialProperties;
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(() => {
    return localStorage.getItem("selectedPropertyId") || "1";
  });

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const handleSetSelectedPropertyId = (id: string) => {
    setSelectedPropertyId(id);
    localStorage.setItem("selectedPropertyId", id);
  };

  const addProperty = (property: Omit<Property, "id">) => {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
    };
    const updated = [...properties, newProperty];
    setProperties(updated);
    localStorage.setItem("properties", JSON.stringify(updated));
    setSelectedPropertyId(newProperty.id);
    localStorage.setItem("selectedPropertyId", newProperty.id);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProperties(updated);
    localStorage.setItem("properties", JSON.stringify(updated));
  };

  const deleteProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    localStorage.setItem("properties", JSON.stringify(updated));
    if (selectedPropertyId === id && properties.length > 1) {
      const newId = properties[0].id;
      setSelectedPropertyId(newId);
      localStorage.setItem("selectedPropertyId", newId);
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        selectedPropertyId,
        selectedProperty,
        setSelectedPropertyId: handleSetSelectedPropertyId,
        addProperty,
        updateProperty,
        deleteProperty,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperty must be used within PropertyProvider");
  }
  return context;
};
