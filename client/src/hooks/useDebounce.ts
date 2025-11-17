import { useEffect, useState } from 'react';

/**
 * Custom hook para debounce de valores
 * Aguarda um tempo antes de atualizar o valor
 * 
 * @param value - Valor a ser debouncado
 * @param delay - Tempo de espera em ms (padrão: 500ms)
 * @returns Valor debouncado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Aguarda o tempo definido antes de atualizar o valor
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timeout se o valor mudar antes do delay terminar
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
