import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface UseAutosaveOptions {
  key: string;
  debounceMs?: number;
  enabled?: boolean;
  onSave?: (data: unknown) => Promise<void>;
  onError?: (error: Error) => void;
}

/**
 * Hook para salvamento automático de rascunhos com debounce
 * Salva dados no localStorage e opcionalmente envia para o servidor
 */
export function useAutosave<T>(
  data: T,
  options: UseAutosaveOptions
) {
  const { key, debounceMs = 60000, enabled = true, onSave, onError } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef(data);

  // Atualizar referência de dados
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Função de salvamento
  const save = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Salvar no localStorage
      localStorage.setItem(`autosave_${key}`, JSON.stringify(dataRef.current));
      
      // Chamar callback de salvamento no servidor se fornecido
      if (onSave) {
        await onSave(dataRef.current);
      }
      
      setLastSaved(new Date());
      toast.success("Rascunho salvo automaticamente", { duration: 2000 });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      toast.error("Erro ao salvar rascunho: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [key, onSave, onError]);

  // Configurar debounce
  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configurar novo timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceMs, enabled, save]);

  // Recuperar rascunho do localStorage
  const loadDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    } catch (error) {
      console.error("Erro ao carregar rascunho:", error);
    }
    return null;
  }, [key]);

  // Limpar rascunho
  const clearDraft = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
  }, [key]);

  // Salvar imediatamente
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await save();
  }, [save]);

  return {
    isSaving,
    lastSaved,
    loadDraft,
    clearDraft,
    saveNow,
  };
}
