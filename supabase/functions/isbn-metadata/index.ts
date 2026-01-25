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
      console.log("Rate limited 429, retrying after", backoff[i], "ms");
      await sleep(backoff[i]);
      continue;
    }
    return res;
  }
  return fetch(url, init);
}

// Source 1: Open Library API Books endpoint
async function tryOpenLibraryApiBooks(isbn: string): Promise<BookMetadata | null> {
  try {
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
  } catch (e) {
    console.warn("OpenLibrary API Books error:", e);
    return null;
  }
}

// Source 2: Open Library ISBN endpoint
async function tryOpenLibraryIsbnEndpoint(isbn: string): Promise<BookMetadata | null> {
  try {
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
  } catch (e) {
    console.warn("OpenLibrary ISBN endpoint error:", e);
    return null;
  }
}

// Source 3: Google Books API
async function tryGoogleBooks(isbn: string): Promise<BookMetadata | null> {
  try {
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
  } catch (e) {
    console.warn("Google Books error:", e);
    return null;
  }
}

// Source 4: Open Library Search API (broader search)
async function tryOpenLibrarySearch(isbn: string): Promise<BookMetadata | null> {
  try {
    const url = `https://openlibrary.org/search.json?isbn=${isbn}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.docs?.length) return null;

    const doc = data.docs[0];
    return {
      title: doc.title || "",
      authors: doc.author_name?.join(", ") || "",
      year: doc.first_publish_year?.toString() || extractYear(doc.publish_date?.[0]),
      isbn,
      editorial: doc.publisher?.[0] || "",
    };
  } catch (e) {
    console.warn("OpenLibrary Search error:", e);
    return null;
  }
}

// Source 5: Internet Archive (via Open Library works)
async function tryInternetArchive(isbn: string): Promise<BookMetadata | null> {
  try {
    // Search in Internet Archive's Open Library integration
    const url = `https://archive.org/advancedsearch.php?q=isbn:${isbn}&fl[]=title,creator,date,publisher&rows=1&output=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data?.response?.docs?.length) return null;
    const doc = data.response.docs[0];
    
    return {
      title: doc.title || "",
      authors: doc.creator || "",
      year: extractYear(doc.date),
      isbn,
      editorial: doc.publisher || "",
    };
  } catch (e) {
    console.warn("Internet Archive error:", e);
    return null;
  }
}

// Source 6: Library of Congress (LOC)
async function tryLibraryOfCongress(isbn: string): Promise<BookMetadata | null> {
  try {
    const url = `https://www.loc.gov/books/?fo=json&q=${isbn}&c=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data?.results?.length) return null;
    const result = data.results[0];
    
    // Extract contributor (author) if available
    const authors = result.contributor?.join(", ") || result.creator || "";
    
    return {
      title: result.title || "",
      authors: authors,
      year: extractYear(result.date),
      isbn,
      editorial: result.publisher || "",
    };
  } catch (e) {
    console.warn("Library of Congress error:", e);
    return null;
  }
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

    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );
    let authenticatedUserId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });

        const token = authHeader.replace("Bearer ", "");
        const { data: jwt, error: claimsError } = await supabase.auth.getClaims(token);
        if (claimsError || !jwt?.claims?.sub) {
          console.warn("Invalid JWT", claimsError?.message ?? String(claimsError));
        } else {
          authenticatedUserId = jwt.claims.sub;
        }
      } catch (e) {
        console.warn("JWT validation exception", e);
      }
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

    console.log("ISBN lookup", { isbn, user: authenticatedUserId });

    // Try multiple sources in order of preference/reliability
    
    // 1. Open Library API Books (fast, reliable)
    const ol1 = await tryOpenLibraryApiBooks(isbn);
    if (ol1) return jsonResponse({ ok: true, source: "Open Library", metadata: ol1 });

    // 2. Open Library ISBN endpoint (good for older books)
    const ol2 = await tryOpenLibraryIsbnEndpoint(isbn);
    if (ol2) return jsonResponse({ ok: true, source: "Open Library", metadata: ol2 });

    // 3. Open Library Search (broader search)
    const ol3 = await tryOpenLibrarySearch(isbn);
    if (ol3) return jsonResponse({ ok: true, source: "Open Library Search", metadata: ol3 });

    // 4. Google Books (only for authenticated users to protect quota)
    if (authenticatedUserId) {
      const gb = await tryGoogleBooks(isbn);
      if (gb) return jsonResponse({ ok: true, source: "Google Books", metadata: gb });
    }

    // 5. Internet Archive
    const ia = await tryInternetArchive(isbn);
    if (ia) return jsonResponse({ ok: true, source: "Internet Archive", metadata: ia });

    // 6. Library of Congress
    const loc = await tryLibraryOfCongress(isbn);
    if (loc) return jsonResponse({ ok: true, source: "Library of Congress", metadata: loc });

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
