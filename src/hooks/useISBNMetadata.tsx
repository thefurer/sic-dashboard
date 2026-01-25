import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface BookMetadata {
  title: string;
  authors: string;
  year: string;
  isbn: string;
  editorial?: string;
}

// Try fetching from Google Books API
async function fetchFromGoogleBooks(cleanISBN: string): Promise<BookMetadata | null> {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`
  );
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    return null;
  }
  
  const book = data.items[0].volumeInfo;
  
  return {
    title: book.title || "",
    authors: book.authors?.join(", ") || "",
    year: book.publishedDate?.split("-")[0] || "",
    isbn: cleanISBN,
    editorial: book.publisher || "",
  };
}

// Try fetching from Open Library API (fallback)
async function fetchFromOpenLibrary(cleanISBN: string): Promise<BookMetadata | null> {
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`
  );
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  const key = `ISBN:${cleanISBN}`;
  
  if (!data[key]) {
    return null;
  }
  
  const book = data[key];
  
  // Extract year from publish_date (can be in various formats like "2005", "March 2005", etc.)
  let year = "";
  if (book.publish_date) {
    const yearMatch = book.publish_date.match(/\d{4}/);
    if (yearMatch) {
      year = yearMatch[0];
    }
  }
  
  return {
    title: book.title || "",
    authors: book.authors?.map((a: { name: string }) => a.name).join(", ") || "",
    year,
    isbn: cleanISBN,
    editorial: book.publishers?.[0]?.name || "",
  };
}

export function useISBNMetadata() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetadata = async (isbn: string): Promise<BookMetadata | null> => {
    setIsLoading(true);
    
    try {
      // Clean ISBN (remove hyphens and spaces)
      const cleanISBN = isbn.replace(/[-\s]/g, "");
      
      // Try Google Books first
      let metadata = await fetchFromGoogleBooks(cleanISBN);
      
      // If not found in Google Books, try Open Library
      if (!metadata) {
        metadata = await fetchFromOpenLibrary(cleanISBN);
      }
      
      // If still not found, throw error
      if (!metadata) {
        throw new Error("No se encontró información para este ISBN en ninguna base de datos");
      }
      
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
