import { Link } from "react-router-dom";
export function LegalFooter() {
  return <footer className="border-t bg-muted/30 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© 2026 GISICF - Universidad Estatal del Sur de Manabí</p>
            <p className="text-xs mt-1">Proyecto de Tesis - MADELIN ALBA CHANCAY BAQUE</p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Términos de Uso
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link to="/legal/notice" className="text-muted-foreground hover:text-primary transition-colors">
              Aviso Legal
            </Link>
          </nav>
        </div>
      </div>
    </footer>;
}