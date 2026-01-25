const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type BookMetadata = {
  title: string;
  authors: string;
  year: string;
  isbn: string;
  editorial?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanIsbn(input: string) {
  return String(input ?? "").replace(/[-\s]/g, "").trim();
}

function isValidIsbn(clean: string) {
  return /^(\d{10}|\d{13})$/.test(clean);
}

function extractYear(input?: string): string {
  if (!input) return "";
  const match = String(input).match(/\d{4}/);
  return match?.[0] ?? "";
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWith429Retry(url: string, init?: RequestInit) {
  const backoff = [400, 1200, 2500];
  for (let i = 0; i < backoff.length + 1; i++) {
    const res = await fetch(url, init);
    if (res.status !== 429) return res;
    if (i < backoff.length) {
      console.log("Google Books 429, retrying after", backoff[i], "ms");
      await sleep(backoff[i]);
      continue;
    }
    return res;
  }
  // unreachable
  return fetch(url, init);
}

async function tryOpenLibraryApiBooks(isbn: string): Promise<BookMetadata | null> {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const key = `ISBN:${isbn}`;
  if (!data?.[key]) return null;
  const book = data[key];

  return {
    title: book.title || "",
    authors: book.authors?.map((a: { name: string }) => a.name).join(", ") || "",
    year: extractYear(book.publish_date),
    isbn,
    editorial: book.publishers?.[0]?.name || "",
  };
}

async function tryOpenLibraryIsbnEndpoint(isbn: string): Promise<BookMetadata | null> {
  const url = `https://openlibrary.org/isbn/${isbn}.json`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const book = await res.json();

  const authorKeys: string[] = Array.isArray(book.authors)
    ? book.authors
        .map((a: { key?: string }) => a?.key)
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const authorNames = await Promise.all(
    authorKeys.map(async (k) => {
      try {
        const r = await fetch(`https://openlibrary.org${k}.json`);
        if (!r.ok) return null;
        const a = await r.json();
        return a?.name ? String(a.name) : null;
      } catch {
        return null;
      }
    }),
  );

  const authors = authorNames.filter(Boolean).join(", ");
  const editorial = Array.isArray(book.publishers) ? book.publishers?.[0] : "";

  return {
    title: book.title || "",
    authors,
    year: extractYear(book.publish_date),
    isbn,
    editorial,
  };
}

async function tryGoogleBooks(isbn: string): Promise<BookMetadata | null> {
  const apiKey = Deno.env.get("GOOGLE_BOOKS_API_KEY");
  const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${keyParam}`;
  const res = await fetchWith429Retry(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.items?.length) return null;

  const book = data.items[0].volumeInfo;
  return {
    title: book.title || "",
    authors: book.authors?.join(", ") || "",
    year: (book.publishedDate || "").split("-")[0] || "",
    isbn,
    editorial: book.publisher || "",
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require a valid authenticated session to prevent abuse
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars");
      return jsonResponse({ ok: false, error: "Configuración incompleta" }, 500);
    }

    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader) {
      return jsonResponse({ ok: false, error: "No autorizado" }, 401);
    }

    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claims, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || !claims) {
      console.warn("Invalid JWT", claimsError?.message);
      return jsonResponse({ ok: false, error: "No autorizado" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const isbn = cleanIsbn(body?.isbn);

    if (!isbn || !isValidIsbn(isbn)) {
      return jsonResponse(
        {
          ok: false,
          error: "ISBN inválido: debe tener 10 o 13 dígitos",
        },
        400,
      );
    }

    console.log("ISBN lookup", { isbn, user: claims?.claims?.sub });

    // Prefer Open Library (no quota issues), then Google Books
    const ol1 = await tryOpenLibraryApiBooks(isbn);
    if (ol1) return jsonResponse({ ok: true, source: "Open Library", metadata: ol1 });

    const ol2 = await tryOpenLibraryIsbnEndpoint(isbn);
    if (ol2) return jsonResponse({ ok: true, source: "Open Library", metadata: ol2 });

    const gb = await tryGoogleBooks(isbn);
    if (gb) return jsonResponse({ ok: true, source: "Google Books", metadata: gb });

    return jsonResponse({ ok: false, notFound: true }, 200);
  } catch (e) {
    console.error("isbn-metadata error", e);
    return jsonResponse(
      {
        ok: false,
        error: "No se pudo consultar el servicio de ISBN. Intenta nuevamente.",
      },
      500,
    );
  }
});
