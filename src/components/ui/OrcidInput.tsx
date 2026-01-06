import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OrcidInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface OrcidValidationState {
  status: 'idle' | 'loading' | 'valid' | 'invalid' | 'error';
  name?: string;
  message?: string;
}

export function OrcidInput({ value, onChange, className }: OrcidInputProps) {
  const [validation, setValidation] = useState<OrcidValidationState>({ status: 'idle' });
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Format ORCID as user types (add dashes automatically)
  const formatOrcid = (input: string): string => {
    // Remove all non-alphanumeric except X
    const cleaned = input.replace(/[^0-9X]/gi, '').toUpperCase();
    
    // Add dashes at appropriate positions
    const parts = [];
    for (let i = 0; i < cleaned.length && i < 16; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    
    return parts.join('-');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatOrcid(e.target.value);
    onChange(formatted);
  };

  // Debounce the value for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  // Validate ORCID format
  const isValidFormat = (orcid: string): boolean => {
    const regex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    return regex.test(orcid);
  };

  // Verify ORCID with public API
  useEffect(() => {
    if (!debouncedValue) {
      setValidation({ status: 'idle' });
      return;
    }

    if (!isValidFormat(debouncedValue)) {
      setValidation({ 
        status: 'invalid', 
        message: 'Formato inválido. Ejemplo: 0000-0002-7793-9871' 
      });
      return;
    }

    const verifyOrcid = async () => {
      setValidation({ status: 'loading' });
      
      try {
        // Use ORCID public API
        const response = await fetch(`https://pub.orcid.org/v3.0/${debouncedValue}/person`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const givenNames = data.name?.['given-names']?.value || '';
          const familyName = data.name?.['family-name']?.value || '';
          const fullName = [givenNames, familyName].filter(Boolean).join(' ');
          
          setValidation({ 
            status: 'valid', 
            name: fullName || 'ORCID válido',
            message: fullName ? `Registrado como: ${fullName}` : 'ORCID verificado'
          });
        } else if (response.status === 404) {
          setValidation({ 
            status: 'invalid', 
            message: 'ORCID no encontrado en el registro' 
          });
        } else {
          setValidation({ 
            status: 'error', 
            message: 'Error al verificar. Intenta de nuevo.' 
          });
        }
      } catch (error) {
        // CORS error or network issue - fallback to format validation only
        setValidation({ 
          status: 'valid', 
          message: 'Formato válido (verificación offline)' 
        });
      }
    };

    verifyOrcid();
  }, [debouncedValue]);

  return (
    <div className="space-y-2">
      <Label htmlFor="orcid" className="flex items-center gap-2">
        <svg className="h-4 w-4" viewBox="0 0 256 256" fill="none">
          <path d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z" fill="#A6CE39"/>
          <path d="M86.3 186.2H70.9V79.1h15.4v107.1zm35.4 0h-15.2V79.1h15.2v107.1zm79.9-62.2c0 32.7-14.4 45.1-37.8 45.1-23.4 0-37.8-12.4-37.8-45.1V79.1h15.2v44.9c0 22.8 8.4 31.3 22.6 31.3 14.2 0 22.6-8.5 22.6-31.3V79.1h15.2v44.9z" fill="#fff"/>
        </svg>
        Código ORCID *
      </Label>
      
      <div className="relative">
        <Input
          id="orcid"
          value={value}
          onChange={handleChange}
          placeholder="0000-0002-7793-9871"
          maxLength={19}
          className={cn(
            "font-mono pr-10 bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50",
            validation.status === 'valid' && "border-green-500 focus:border-green-500",
            validation.status === 'invalid' && "border-red-500 focus:border-red-500",
            className
          )}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validation.status === 'loading' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {validation.status === 'valid' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {validation.status === 'invalid' && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Validation message */}
      {validation.message && (
        <p className={cn(
          "text-xs flex items-center gap-1",
          validation.status === 'valid' && "text-green-600 dark:text-green-400",
          validation.status === 'invalid' && "text-red-600 dark:text-red-400",
          validation.status === 'error' && "text-amber-600 dark:text-amber-400"
        )}>
          {validation.message}
        </p>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        ¿No tienes ORCID?{' '}
        <a 
          href="https://orcid.org/register" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-0.5"
        >
          Regístrate gratis
          <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
