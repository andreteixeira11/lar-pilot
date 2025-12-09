import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  region: 'madeira' | 'continental';
  rnal?: string;
  insuranceValidity?: string;
  insuranceFileUrl?: string;
  platformStatus?: 'nao_submetido' | 'submetido' | 'aprovado';
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

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadProperties = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedProperties: Property[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          description: p.description || "",
          capacity: p.capacity || 4,
          bedrooms: p.bedrooms || 2,
          bathrooms: p.bathrooms || 1,
          checkInTime: p.check_in_time || "15:00",
          checkOutTime: p.check_out_time || "11:00",
          wifiPassword: p.wifi_password || "",
          parkingInfo: p.parking_info || "",
          region: (p.region as 'madeira' | 'continental') || "continental",
          rnal: p.rnal || undefined,
          insuranceValidity: p.insurance_validity || undefined,
          insuranceFileUrl: p.insurance_file_url || undefined,
          platformStatus: (p.platform_status as 'nao_submetido' | 'submetido' | 'aprovado') || "nao_submetido",
        }));

        setProperties(mappedProperties);

        // Set selected property from localStorage or use first property
        const savedId = localStorage.getItem("selectedPropertyId");
        const validSavedId = mappedProperties.find((p) => p.id === savedId);
        
        if (validSavedId) {
          setSelectedPropertyId(savedId!);
        } else {
          setSelectedPropertyId(mappedProperties[0].id);
          localStorage.setItem("selectedPropertyId", mappedProperties[0].id);
        }
      } else {
        setProperties([]);
        setSelectedPropertyId("");
      }
    } catch (error: any) {
      console.error("Error loading properties:", error);
      toast({
        title: "Erro ao carregar propriedades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen to auth state changes to reload properties
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setTimeout(() => {
            loadProperties(session.user.id);
          }, 0);
        } else {
          setProperties([]);
          setSelectedPropertyId("");
          setLoading(false);
        }
      }
    );

    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProperties(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const handleSetSelectedPropertyId = (id: string) => {
    setSelectedPropertyId(id);
    localStorage.setItem("selectedPropertyId", id);
  };

  const addProperty = async (property: Omit<Property, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("properties")
        .insert([{
          user_id: user.id,
          name: property.name,
          address: property.address,
          description: property.description,
          capacity: property.capacity,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          check_in_time: property.checkInTime,
          check_out_time: property.checkOutTime,
          wifi_password: property.wifiPassword,
          parking_info: property.parkingInfo,
          region: property.region,
          rnal: property.rnal,
          insurance_validity: property.insuranceValidity,
          insurance_file_url: property.insuranceFileUrl,
          platform_status: property.platformStatus,
        }])
        .select()
        .single();

      if (error) throw error;

      const newProperty: Property = {
        id: data.id,
        ...property,
      };

      const updated = [...properties, newProperty];
      setProperties(updated);
      setSelectedPropertyId(newProperty.id);
      localStorage.setItem("selectedPropertyId", newProperty.id);

      toast({
        title: "Propriedade adicionada",
        description: "A propriedade foi adicionada com sucesso",
      });
    } catch (error: any) {
      console.error("Error adding property:", error);
      toast({
        title: "Erro ao adicionar propriedade",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          name: updates.name,
          address: updates.address,
          description: updates.description,
          capacity: updates.capacity,
          bedrooms: updates.bedrooms,
          bathrooms: updates.bathrooms,
          check_in_time: updates.checkInTime,
          check_out_time: updates.checkOutTime,
          wifi_password: updates.wifiPassword,
          parking_info: updates.parkingInfo,
          region: updates.region,
          rnal: updates.rnal,
          insurance_validity: updates.insuranceValidity,
          insurance_file_url: updates.insuranceFileUrl,
          platform_status: updates.platformStatus,
        })
        .eq("id", id);

      if (error) throw error;

      const updated = properties.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setProperties(updated);

      toast({
        title: "Propriedade atualizada",
        description: "As alterações foram guardadas com sucesso",
      });
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({
        title: "Erro ao atualizar propriedade",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const updated = properties.filter((p) => p.id !== id);
      setProperties(updated);

      if (selectedPropertyId === id && updated.length > 0) {
        const newId = updated[0].id;
        setSelectedPropertyId(newId);
        localStorage.setItem("selectedPropertyId", newId);
      } else if (updated.length === 0) {
        setSelectedPropertyId("");
        localStorage.removeItem("selectedPropertyId");
      }

      toast({
        title: "Propriedade eliminada",
        description: "A propriedade foi removida com sucesso",
      });
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast({
        title: "Erro ao eliminar propriedade",
        description: error.message,
        variant: "destructive",
      });
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
