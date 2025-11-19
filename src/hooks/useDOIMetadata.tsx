import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface ArticleMetadata {
  title: string;
  authors: string;
  year: string;
  journal?: string;
  volume?: string;
  issue?: string;
  doi: string;
}

export function useDOIMetadata() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetadata = async (doi: string): Promise<ArticleMetadata | null> => {
    setIsLoading(true);
    
    try {
      // Clean DOI (remove https://doi.org/ prefix if present)
      const cleanDOI = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
      
      // Fetch from CrossRef API
      // Documentation: https://api.crossref.org/swagger-ui/index.html
      const response = await fetch(`https://api.crossref.org/works/${cleanDOI}`);
      
      if (!response.ok) {
        throw new Error("DOI no encontrado");
      }
      
      const data = await response.json();
      const work = data.message;
      
      // Extract authors
      const authors = work.author
        ?.map((author: any) => `${author.family}, ${author.given?.[0] || ""}`)
        .join(", ") || "";
      
      // Extract publication year
      const year = work.published?.["date-parts"]?.[0]?.[0]?.toString() || "";
      
      // Extract journal info
      const journal = work["container-title"]?.[0] || "";
      const volume = work.volume || "";
      const issue = work.issue || "";
      
      const metadata: ArticleMetadata = {
        title: work.title?.[0] || "",
        authors,
        year,
        journal,
        volume,
        issue,
        doi: cleanDOI,
      };
      
      toast({
        title: "Metadata obtenida",
        description: "Los datos del artículo se han cargado correctamente.",
      });
      
      return metadata;
    } catch (error) {
      toast({
        title: "Error al obtener metadata",
        description: error instanceof Error ? error.message : "Por favor, verifica el DOI e intenta nuevamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchMetadata, isLoading };
}
