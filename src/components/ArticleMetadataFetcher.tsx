import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wand2, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { useDOIMetadata, ArticleMetadata } from "@/hooks/useDOIMetadata";
import { motion, AnimatePresence } from "framer-motion";

type DatabaseType = "Scopus" | "SciELO" | "Latindex" | "WOS" | "";

const DATABASE_COLORS: Record<string, { badge: string; theme: string; accent: string }> = {
  Scopus: { badge: "bg-orange-500", theme: "border-orange-500/30 bg-orange-500/5", accent: "text-orange-500" },
  SciELO: { badge: "bg-blue-600", theme: "border-blue-600/30 bg-blue-600/5", accent: "text-blue-600" },
  Latindex: { badge: "bg-red-600", theme: "border-red-600/30 bg-red-600/5", accent: "text-red-600" },
  WOS: { badge: "bg-purple-600", theme: "border-purple-600/30 bg-purple-600/5", accent: "text-purple-600" },
};

interface ArticleMetadataFetcherProps {
  onMetadataFetched?: (metadata: ArticleMetadata & { database: DatabaseType }) => void;
}

export function ArticleMetadataFetcher({ onMetadataFetched }: ArticleMetadataFetcherProps) {
  const [doiInput, setDoiInput] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType>("");
  const [metadata, setMetadata] = useState<ArticleMetadata | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { fetchMetadata, isLoading } = useDOIMetadata();

  const handleFetchMetadata = async () => {
    if (!doiInput.trim()) return;
    
    const result = await fetchMetadata(doiInput);
    if (result) {
      setMetadata(result);
      setIsVerified(true);
      onMetadataFetched?.({ ...result, database: selectedDatabase });
    }
  };

  const databaseTheme = selectedDatabase ? DATABASE_COLORS[selectedDatabase] : null;

  const getDatabaseLink = (doi: string) => {
    if (!selectedDatabase || !doi) return `https://doi.org/${doi}`;
    
    switch (selectedDatabase) {
      case "Scopus":
        return `https://doi.org/${doi}`;
      case "SciELO":
        return `https://doi.org/${doi}`;
      case "Latindex":
        return `https://doi.org/${doi}`;
      case "WOS":
        return `https://doi.org/${doi}`;
      default:
        return `https://doi.org/${doi}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Glassmorphism Auto-Fetch Card */}
      <Card 
        className={`relative overflow-hidden border-2 transition-all duration-300 ${
          databaseTheme?.theme || "border-border/50"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Búsqueda Inteligente de Metadata
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ingrese el DOI para obtener automáticamente los datos del artículo
              </p>
            </div>
            <AnimatePresence>
              {isVerified && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Badge className="bg-primary text-primary-foreground">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doi-input">DOI o URL del Artículo</Label>
              <div className="flex gap-2">
                <Input
                  id="doi-input"
                  placeholder="10.1234/example.2024 o https://doi.org/..."
                  value={doiInput}
                  onChange={(e) => {
                    setDoiInput(e.target.value);
                    setIsVerified(false);
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleFetchMetadata}
                  disabled={!doiInput.trim() || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Buscar Datos
                </Button>
              </div>
              {selectedDatabase && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Ingrese el DOI para generar el enlace a {selectedDatabase}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="database-select" className="flex items-center gap-2">
                Base Indexada
                {selectedDatabase && (
                  <Badge className={`${DATABASE_COLORS[selectedDatabase]?.badge} text-white`}>
                    {selectedDatabase}
                  </Badge>
                )}
              </Label>
              <Select
                value={selectedDatabase}
                onValueChange={(value) => setSelectedDatabase(value as DatabaseType)}
              >
                <SelectTrigger id="database-select">
                  <SelectValue placeholder="Seleccione base" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="Scopus">Scopus</SelectItem>
                  <SelectItem value="SciELO">SciELO</SelectItem>
                  <SelectItem value="Latindex">Latindex</SelectItem>
                  <SelectItem value="WOS">Web of Science</SelectItem>
                </SelectContent>
              </Select>
              {metadata?.doi && selectedDatabase && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full mt-2 ${databaseTheme?.accent}`}
                  onClick={() => window.open(getDatabaseLink(metadata.doi), "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Ver en {selectedDatabase}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Auto-populated Fields */}
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
              <div className="grid gap-2">
                <Label htmlFor="article-title">Título *</Label>
                <Input
                  id="article-title"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="Título del artículo"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="authors">Autores *</Label>
                <Input
                  id="authors"
                  value={metadata.authors}
                  onChange={(e) => setMetadata({ ...metadata, authors: e.target.value })}
                  placeholder="Apellido, N., Apellido, N."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">Año *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={metadata.year}
                    onChange={(e) => setMetadata({ ...metadata, year: e.target.value })}
                    placeholder="2024"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="volume">Volumen</Label>
                  <Input
                    id="volume"
                    value={metadata.volume || ""}
                    onChange={(e) => setMetadata({ ...metadata, volume: e.target.value })}
                    placeholder="Vol. 12"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="issue">Número</Label>
                  <Input
                    id="issue"
                    value={metadata.issue || ""}
                    onChange={(e) => setMetadata({ ...metadata, issue: e.target.value })}
                    placeholder="No. 3"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="journal">Revista / Journal</Label>
                <Input
                  id="journal"
                  value={metadata.journal || ""}
                  onChange={(e) => setMetadata({ ...metadata, journal: e.target.value })}
                  placeholder="Nombre de la revista"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="doi-display">DOI/URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="doi-display"
                    value={`https://doi.org/${metadata.doi}`}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`https://doi.org/${metadata.doi}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
