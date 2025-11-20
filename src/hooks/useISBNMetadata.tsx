import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface BookMetadata {
  title: string;
  authors: string;
  year: string;
  isbn: string;
  editorial?: string;
}

export function useISBNMetadata() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetadata = async (isbn: string): Promise<BookMetadata | null> => {
    setIsLoading(true);
    
    try {
      // Clean ISBN (remove hyphens and spaces)
      const cleanISBN = isbn.replace(/[-\s]/g, "");
      
      // Fetch from Google Books API
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`
      );
      
      if (!response.ok) {
        throw new Error("ISBN no encontrado");
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error("No se encontró información para este ISBN");
      }
      
      const book = data.items[0].volumeInfo;
      
      // Extract authors
      const authors = book.authors?.join(", ") || "";
      
      // Extract publication year
      const year = book.publishedDate?.split("-")[0] || "";
      
      // Extract publisher
      const editorial = book.publisher || "";
      
      const metadata: BookMetadata = {
        title: book.title || "",
        authors,
        year,
        isbn: cleanISBN,
        editorial,
      };
      
      toast({
        title: "Metadata obtenida",
        description: "Los datos del libro se han cargado correctamente.",
      });
      
      return metadata;
    } catch (error) {
      toast({
        title: "Error al obtener metadata",
        description: error instanceof Error ? error.message : "Por favor, verifica el ISBN e intenta nuevamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchMetadata, isLoading };
}
