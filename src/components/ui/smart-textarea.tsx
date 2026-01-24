import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lightbulb, History, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SmartTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Unique key for storing suggestions in localStorage */
  storageKey: string;
  /** Predefined quick suggestions */
  quickSuggestions?: string[];
  /** Maximum number of saved suggestions to keep */
  maxSavedSuggestions?: number;
  /** Label for the suggestions button */
  suggestionsLabel?: string;
}

const STORAGE_PREFIX = "smart_textarea_history_";

const SmartTextarea = React.forwardRef<HTMLTextAreaElement, SmartTextareaProps>(
  ({ 
    className, 
    storageKey,
    quickSuggestions = [],
    maxSavedSuggestions = 10,
    suggestionsLabel = "Sugerencias",
    value,
    onChange,
    onBlur,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [savedSuggestions, setSavedSuggestions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Load saved suggestions from localStorage
    useEffect(() => {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSavedSuggestions(Array.isArray(parsed) ? parsed : []);
        } catch {
          setSavedSuggestions([]);
        }
      }
    }, [storageKey]);

    // Save suggestion to history
    const saveSuggestion = useCallback((text: string) => {
      if (!text || text.trim().length < 10) return;
      
      const trimmedText = text.trim();
      setSavedSuggestions(prev => {
        // Don't add duplicates
        if (prev.some(s => s.toLowerCase() === trimmedText.toLowerCase())) {
          return prev;
        }
        
        const newSuggestions = [trimmedText, ...prev].slice(0, maxSavedSuggestions);
        localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, JSON.stringify(newSuggestions));
        return newSuggestions;
      });
    }, [storageKey, maxSavedSuggestions]);

    // Handle blur to save the current value
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      saveSuggestion(e.target.value);
      onBlur?.(e);
    };

    // Select a suggestion
    const selectSuggestion = (suggestion: string) => {
      if (onChange) {
        const syntheticEvent = {
          target: { value: suggestion },
          currentTarget: { value: suggestion },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
      setIsOpen(false);
      textareaRef.current?.focus();
    };

    // Remove a saved suggestion
    const removeSuggestion = (suggestion: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSavedSuggestions(prev => {
        const newSuggestions = prev.filter(s => s !== suggestion);
        localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, JSON.stringify(newSuggestions));
        return newSuggestions;
      });
    };

    // Filter suggestions based on search
    const filteredQuickSuggestions = quickSuggestions.filter(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredSavedSuggestions = savedSuggestions.filter(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasSuggestions = quickSuggestions.length > 0 || savedSuggestions.length > 0;

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            hasSuggestions && "pr-12",
            className,
          )}
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          {...props}
        />
        
        {hasSuggestions && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-primary"
                title={suggestionsLabel}
              >
                <Lightbulb className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput 
                  placeholder="Buscar sugerencias..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList className="max-h-64">
                  <CommandEmpty>No se encontraron sugerencias</CommandEmpty>
                  
                  {filteredQuickSuggestions.length > 0 && (
                    <CommandGroup heading="Respuestas rápidas">
                      {filteredQuickSuggestions.map((suggestion, index) => (
                        <CommandItem
                          key={`quick-${index}`}
                          value={suggestion}
                          onSelect={() => selectSuggestion(suggestion)}
                          className="cursor-pointer"
                        >
                          <Clock className="mr-2 h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate text-sm">{suggestion}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  
                  {filteredSavedSuggestions.length > 0 && (
                    <CommandGroup heading="Historial">
                      {filteredSavedSuggestions.map((suggestion, index) => (
                        <CommandItem
                          key={`saved-${index}`}
                          value={suggestion}
                          onSelect={() => selectSuggestion(suggestion)}
                          className="cursor-pointer group"
                        >
                          <History className="mr-2 h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate text-sm flex-1">{suggestion}</span>
                          <button
                            type="button"
                            onClick={(e) => removeSuggestion(suggestion, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                          >
                            <X className="h-3 w-3 text-destructive" />
                          </button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
              
              {savedSuggestions.length > 0 && (
                <div className="border-t p-2">
                  <p className="text-xs text-muted-foreground text-center">
                    {savedSuggestions.length} respuestas guardadas
                  </p>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }
);

SmartTextarea.displayName = "SmartTextarea";

export { SmartTextarea };
