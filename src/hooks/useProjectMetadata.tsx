import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProjectMetadata {
  title: string;
  investigator: string;
  startDate: string;
  type: string;
}

export function useProjectMetadata() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMetadata = async (input: string): Promise<ProjectMetadata | null> => {
    setIsLoading(true);
    
    try {
      // Check if input is a DOI (starts with 10.)
      const isDOI = /^10\.\d{4,}/.test(input.trim());
      
      if (isDOI) {
        const doi = input.trim();
        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        
        if (!response.ok) {
          throw new Error("DOI no encontrado");
        }
        
        const data = await response.json();
        const message = data.message;
        
        // Extract author name (first author)
        const author = message.author?.[0];
        const authorName = author 
          ? `${author.given || ""} ${author.family || ""}`.trim()
          : "Desconocido";
        
        // Extract publication date
        const dateCreated = message.created?.["date-parts"]?.[0];
        const startDate = dateCreated 
          ? `${dateCreated[0]}-${String(dateCreated[1]).padStart(2, '0')}-${String(dateCreated[2] || 1).padStart(2, '0')}`
          : new Date().toISOString().split('T')[0];
        
        // Map title
        const title = message.title?.[0] || "Sin título";
        
        return {
          title,
          investigator: authorName,
          startDate,
          type: "applied", // Default to Applied Research
        };
      } else {
        // URL-based import (mock for now)
        const url = input.trim();
        
        // Simple mock logic based on URL content
        if (url.includes("scopus") || url.includes("science") || url.includes("research")) {
          // Simulate successful fetch with sample data
          return {
            title: "Proyecto Importado desde URL",
            investigator: "Investigador Principal",
            startDate: new Date().toISOString().split('T')[0],
            type: "applied",
          };
        } else {
          throw new Error("URL no soportada. Por favor use DOI o ingrese manualmente.");
        }
      }
    } catch (error) {
      toast({
        title: "Error al importar",
        description: error instanceof Error 
          ? error.message 
          : "No se encontraron datos. Por favor ingrese la información manualmente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchMetadata, isLoading };
}
