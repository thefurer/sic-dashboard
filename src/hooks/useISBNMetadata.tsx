import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface BookMetadata {
  title: string;
  authors: string;
  year: string;
  isbn: string;
  editorial?: string;
}

type SourceResult =
  | { ok: true; metadata: BookMetadata }
  | { ok: false; notFound: true }
  | { ok: false; notFound: false; error: Error };

function extractYear(input?: string): string {
  if (!input) return "";
  const match = String(input).match(/\d{4}/);
  return match?.[0] ?? "";
}

function asError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  return res;
}

// Try fetching from Google Books API
async function fetchFromGoogleBooksByIsbn(cleanISBN: string): Promise<SourceResult> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`;
    const response = await fetchJson(url);

    if (!response.ok) {
      return {
        ok: false,
        notFound: false,
        error: new Error(`Google Books respondió ${response.status}`),
      };
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return { ok: false, notFound: true };
    }

    const book = data.items[0].volumeInfo;
    return {
      ok: true,
      metadata: {
        title: book.title || "",
        authors: book.authors?.join(", ") || "",
        year: book.publishedDate?.split("-")[0] || "",
        isbn: cleanISBN,
        editorial: book.publisher || "",
      },
    };
  } catch (e) {
    return { ok: false, notFound: false, error: asError(e) };
  }
}

// Google Books fallback: plain query (sometimes returns results even when isbn: doesn't)
async function fetchFromGoogleBooksPlain(cleanISBN: string): Promise<SourceResult> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanISBN)}`;
    const response = await fetchJson(url);

    if (!response.ok) {
      return {
        ok: false,
        notFound: false,
        error: new Error(`Google Books (búsqueda general) respondió ${response.status}`),
      };
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return { ok: false, notFound: true };
    }

    const book = data.items[0].volumeInfo;
    return {
      ok: true,
      metadata: {
        title: book.title || "",
        authors: book.authors?.join(", ") || "",
        year: book.publishedDate?.split("-")[0] || "",
        isbn: cleanISBN,
        editorial: book.publisher || "",
      },
    };
  } catch (e) {
    return { ok: false, notFound: false, error: asError(e) };
  }
}

// Try fetching from Open Library API (fallback)
async function fetchFromOpenLibraryApi(cleanISBN: string): Promise<SourceResult> {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`;
    const response = await fetchJson(url);

    if (!response.ok) {
      return {
        ok: false,
        notFound: false,
        error: new Error(`Open Library respondió ${response.status}`),
      };
    }

    const data = await response.json();
    const key = `ISBN:${cleanISBN}`;
    if (!data[key]) {
      return { ok: false, notFound: true };
    }

    const book = data[key];
    return {
      ok: true,
      metadata: {
        title: book.title || "",
        authors: book.authors?.map((a: { name: string }) => a.name).join(", ") || "",
        year: extractYear(book.publish_date),
        isbn: cleanISBN,
        editorial: book.publishers?.[0]?.name || "",
      },
    };
  } catch (e) {
    return { ok: false, notFound: false, error: asError(e) };
  }
}

// Open Library secondary fallback: /isbn/{isbn}.json (often has data when api/books doesn't)
async function fetchFromOpenLibraryIsbnEndpoint(cleanISBN: string): Promise<SourceResult> {
  try {
    const url = `https://openlibrary.org/isbn/${cleanISBN}.json`;
    const response = await fetchJson(url);
    if (response.status === 404) return { ok: false, notFound: true };
    if (!response.ok) {
      return {
        ok: false,
        notFound: false,
        error: new Error(`Open Library (/isbn) respondió ${response.status}`),
      };
    }

    const book = await response.json();

    // Resolve author names if possible (best-effort)
    const authorKeys: string[] = Array.isArray(book.authors)
      ? book.authors
          .map((a: { key?: string }) => a?.key)
          .filter(Boolean)
          .slice(0, 8)
      : [];

    const authorNames = await Promise.all(
      authorKeys.map(async (k) => {
        try {
          const res = await fetchJson(`https://openlibrary.org${k}.json`);
          if (!res.ok) return null;
          const a = await res.json();
          return a?.name ? String(a.name) : null;
        } catch {
          return null;
        }
      })
    );

    const authors = authorNames.filter(Boolean).join(", ");

    return {
      ok: true,
      metadata: {
        title: book.title || "",
        authors,
        year: extractYear(book.publish_date),
        isbn: cleanISBN,
        editorial: Array.isArray(book.publishers) ? book.publishers?.[0] : "",
      },
    };
  } catch (e) {
    return { ok: false, notFound: false, error: asError(e) };
  }
}

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
      
      const errors: string[] = [];
      const sources: Array<{ name: string; run: () => Promise<SourceResult> }> = [
        { name: "Google Books", run: () => fetchFromGoogleBooksByIsbn(cleanISBN) },
        { name: "Google Books (búsqueda general)", run: () => fetchFromGoogleBooksPlain(cleanISBN) },
        { name: "Open Library", run: () => fetchFromOpenLibraryApi(cleanISBN) },
        { name: "Open Library (/isbn)", run: () => fetchFromOpenLibraryIsbnEndpoint(cleanISBN) },
      ];

      for (const s of sources) {
        const res = await s.run();
        if (res.ok) {
          toast({
            title: "Metadata obtenida",
            description: `Los datos del libro se han cargado correctamente. (${s.name})`,
          });
          return res.metadata;
        }

        if ("notFound" in res && res.notFound) {
          continue;
        }

        if ("error" in res) {
          errors.push(`${s.name}: ${res.error.message}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `No se pudo consultar el servicio de ISBN. Intenta nuevamente.\n${errors.join(" | ")}`
        );
      }

      throw new Error("No se encontró información para este ISBN en las fuentes disponibles");
      
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
