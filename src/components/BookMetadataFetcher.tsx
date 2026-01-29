import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, Info, Search, PenLine } from "lucide-react";
import { useISBNMetadata, BookMetadata } from "@/hooks/useISBNMetadata";
import { motion, AnimatePresence } from "framer-motion";

interface BookMetadataFetcherProps {
  onMetadataFetched?: (metadata: BookMetadata) => void;
}

export function BookMetadataFetcher({ onMetadataFetched }: BookMetadataFetcherProps) {
  const [isbnInput, setIsbnInput] = useState("");
  const [metadata, setMetadata] = useState<BookMetadata | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const { fetchMetadata, isLoading } = useISBNMetadata();

  const handleFetchMetadata = async () => {
    if (!isbnInput.trim()) return;
    
    setSearchFailed(false);
    const result = await fetchMetadata(isbnInput);
    if (result) {
      setMetadata(result);
      setIsVerified(true);
      setShowManualEntry(false);
      onMetadataFetched?.(result);
    } else {
      setSearchFailed(true);
    }
  };

  const handleEnableManualEntry = () => {
    setShowManualEntry(true);
    setSearchFailed(false);
    // Initialize empty metadata for manual entry
    const emptyMetadata: BookMetadata = {
      title: "",
      authors: "",
      year: "",
      isbn: isbnInput.trim(),
      editorial: "",
    };
    setMetadata(emptyMetadata);
    onMetadataFetched?.(emptyMetadata);
  };

  const handleMetadataChange = (updatedMetadata: BookMetadata) => {
    setMetadata(updatedMetadata);
    onMetadataFetched?.(updatedMetadata);
  };

  return (
    <div className="space-y-6">
      {/* Glassmorphism Auto-Fetch Card */}
      <Card 
        className="relative overflow-hidden border-2 transition-all duration-300 border-border/50"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                Búsqueda Inteligente ISBN <span className="text-destructive">*</span>
              </Label>
            </div>
            <AnimatePresence>
              {isVerified && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verificado
                  </div>
                </motion.div>
              )}
              {showManualEntry && !isVerified && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <PenLine className="h-3 w-3" />
                    Entrada manual
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid gap-2">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="isbn"
                  placeholder="978-84-1234-567-8"
                  value={isbnInput}
                  onChange={(e) => setIsbnInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchMetadata()}
                  className="flex-1"
                />
                <Button
                  onClick={handleFetchMetadata}
                  disabled={isLoading || !isbnInput.trim()}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingrese el ISBN del libro. Este campo es obligatorio.
              </p>

              {/* Alert about sources */}
              <Alert className="mt-3 bg-muted/50 border-muted">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs leading-relaxed">
                  <strong>Nota:</strong> La búsqueda se limita a bases de datos públicas: 
                  <strong> Open Library</strong>, <strong>Google Books</strong>, <strong>Internet Archive</strong> y 
                  <strong> Library of Congress (EE.UU.)</strong>. 
                  Algunos libros académicos, ediciones regionales o publicaciones recientes pueden no estar indexados en estas fuentes.
                  Si no se encuentra el libro, puede ingresar los datos manualmente.
                </AlertDescription>
              </Alert>

              {/* Search failed - show manual entry option */}
              <AnimatePresence>
                {searchFailed && !showManualEntry && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3"
                  >
                    <Alert className="border-amber-500/50 bg-amber-500/10">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-sm">
                        <div className="flex flex-col gap-2">
                          <span>No se encontró información para este ISBN en las fuentes disponibles.</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEnableManualEntry}
                            className="w-fit gap-2"
                          >
                            <PenLine className="h-4 w-4" />
                            Ingresar datos manualmente
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Show fetched metadata preview */}
              <AnimatePresence>
                {metadata && isVerified && !showManualEntry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-muted/30 rounded-md text-sm space-y-1"
                  >
                    <p><strong>Título:</strong> {metadata.title}</p>
                    <p><strong>Autores:</strong> {metadata.authors}</p>
                    {metadata.editorial && <p><strong>Editorial:</strong> {metadata.editorial}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>

      {/* Metadata Form Fields - Always visible after fetch or manual entry */}
      <AnimatePresence>
        {metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="Título del libro"
                  value={metadata.title}
                  onChange={(e) => handleMetadataChange({ ...metadata, title: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authors">Autores <span className="text-destructive">*</span></Label>
                <Input
                  id="authors"
                  placeholder="Apellido, N., et al."
                  value={metadata.authors}
                  onChange={(e) => handleMetadataChange({ ...metadata, authors: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Año <span className="text-destructive">*</span></Label>
                  <Input
                    id="year"
                    placeholder="2024"
                    value={metadata.year}
                    onChange={(e) => handleMetadataChange({ ...metadata, year: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn-display">ISBN <span className="text-destructive">*</span></Label>
                  <Input
                    id="isbn-display"
                    placeholder="978-84-1234-567-8"
                    value={metadata.isbn}
                    onChange={(e) => handleMetadataChange({ ...metadata, isbn: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editorial">Editorial</Label>
                <Input
                  id="editorial"
                  placeholder="Nombre de la editorial"
                  value={metadata.editorial || ""}
                  onChange={(e) => handleMetadataChange({ ...metadata, editorial: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
