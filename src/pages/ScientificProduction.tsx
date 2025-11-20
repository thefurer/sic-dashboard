import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArticleMetadataFetcher } from "@/components/ArticleMetadataFetcher";
import { BookMetadataFetcher } from "@/components/BookMetadataFetcher";
import { toast } from "@/hooks/use-toast";

const mockArticles = [
  {
    id: 1,
    title: "Machine Learning Applications in Environmental Monitoring",
    authors: "González, M., Pérez, J.",
    year: 2024,
    indexed: "Scopus",
    doi: "10.1234/example.2024",
  },
  {
    id: 2,
    title: "IoT Systems for Precision Agriculture",
    authors: "Ramírez, C., Torres, A.",
    year: 2023,
    indexed: "Latindex",
    doi: "10.1234/example.2023",
  },
];

export default function ScientificProduction() {
  const [activeTab, setActiveTab] = useState("articles");
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [bookMetadata, setBookMetadata] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch books
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["scientific_books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scientific_books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Mutation to create a book
  const createBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      const { data, error } = await supabase
        .from("scientific_books")
        .insert([
          {
            ...bookData,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scientific_books"] });
      toast({
        title: "Libro guardado",
        description: "El libro ha sido registrado exitosamente.",
      });
      setIsBookDialogOpen(false);
      setBookMetadata(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBookSubmit = () => {
    if (!bookMetadata) {
      toast({
        title: "Error",
        description: "Por favor complete los datos del libro",
        variant: "destructive",
      });
      return;
    }

    createBookMutation.mutate(bookMetadata);
  };

  const handleArticleSubmit = () => {
    toast({
      title: "Artículo guardado",
      description: "El artículo ha sido registrado exitosamente.",
    });
    setIsArticleDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Producción Científica</h1>
          <p className="text-muted-foreground">Publicaciones y productos de investigación</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Artículos</TabsTrigger>
          <TabsTrigger value="books">Libros</TabsTrigger>
          <TabsTrigger value="conferences">Conferencias</TabsTrigger>
          <TabsTrigger value="patents">Patentes</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Artículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Artículo Científico</DialogTitle>
                  <DialogDescription>
                    Complete la información de la publicación
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ArticleMetadataFetcher />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsArticleDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleArticleSubmit}>
                    Guardar Artículo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {mockArticles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <Badge variant={article.indexed.includes("Scopus") ? "default" : "secondary"}>
                        {article.indexed}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{article.authors}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Año: {article.year}</span>
                      <a href="#" className="text-primary hover:underline">
                        {article.doi}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="books" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Libro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Libro</DialogTitle>
                  <DialogDescription>
                    Complete la información de la publicación
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <BookMetadataFetcher onMetadataFetched={setBookMetadata} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBookDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleBookSubmit} disabled={createBookMutation.isPending}>
                    {createBookMutation.isPending ? "Guardando..." : "Guardar Libro"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {booksLoading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Cargando libros...</p>
                </CardContent>
              </Card>
            ) : books.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">No hay libros registrados</p>
                </CardContent>
              </Card>
            ) : (
              books.map((book: any) => (
                <Card key={book.id}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.authors}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Año: {book.year}</span>
                        <span className="text-muted-foreground">ISBN: {book.isbn}</span>
                        {book.editorial && (
                          <span className="text-muted-foreground">{book.editorial}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="conferences">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No hay conferencias registradas aún
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patents">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No hay patentes registradas aún
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
