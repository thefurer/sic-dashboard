import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface BookMetadata {
  title: string;
  authors: string;
  year: string;
  isbn: string;
  editorial?: string;
}

type IsbnFunctionResponse =
  | { ok: true; source: string; metadata: BookMetadata }
  | { ok: false; notFound: true }
  | { ok: false; error: string };

export function useISBNMetadata() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetadata = async (isbn: string): Promise<BookMetadata | null> => {
    setIsLoading(true);
    
    try {
      // Clean ISBN (remove hyphens and spaces)
      const cleanISBN = isbn.replace(/[-\s]/g, "");

      // Basic validation (avoid calling external APIs with invalid input)
      if (!/^(\d{10}|\d{13})$/.test(cleanISBN)) {
        throw new Error("ISBN inválido: debe tener 10 o 13 dígitos");
      }
      
      const { data, error } = await supabase.functions.invoke<IsbnFunctionResponse>(
        "isbn-metadata",
        {
          body: { isbn: cleanISBN },
        }
      );

      if (error) {
        throw new Error(
          error.message || "No se pudo consultar el servicio de ISBN. Intenta nuevamente."
        );
      }

      if (!data) {
        throw new Error("Respuesta inválida del servicio de ISBN");
      }

      if (data.ok) {
        toast({
          title: "Metadata obtenida",
          description: `Los datos del libro se han cargado correctamente. (${data.source})`,
        });
        return data.metadata;
      }

      if ("notFound" in data && data.notFound) {
        throw new Error(
          "No se encontró información para este ISBN en las fuentes disponibles"
        );
      }

      if ("error" in data) {
        throw new Error(data.error || "No se pudo consultar el servicio de ISBN");
      }

      throw new Error("No se pudo consultar el servicio de ISBN");
      
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
