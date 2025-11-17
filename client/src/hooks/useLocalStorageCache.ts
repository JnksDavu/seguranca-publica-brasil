import { useState, useEffect } from 'react';

/**
 * Custom hook para cache com expiration no localStorage
 * 
 * @param key - Chave do localStorage
 * @param value - Valor a ser armazenado
 * @param expirationMinutes - Tempo de expiração em minutos (padrão: 5 minutos)
 */
export function useLocalStorageCache<T>(
  key: string,
  value: T,
  expirationMinutes: number = 5
) {
  const [cached, setCached] = useState<T | null>(null);

  // Buscar do cache ao montar
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        setCached(null);
        return;
      }

      const parsed = JSON.parse(item);
      const now = new Date().getTime();

      // Verificar se expirou
      if (parsed.expiration && parsed.expiration < now) {
        localStorage.removeItem(key);
        setCached(null);
        return;
      }

      setCached(parsed.value);
    } catch (error) {
      console.error('Erro ao ler cache:', error);
      setCached(null);
    }
  }, [key]);

  // Armazenar no cache
  useEffect(() => {
    try {
      const expiration = new Date().getTime() + expirationMinutes * 60 * 1000;
      const data = {
        value,
        expiration,
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }, [value, key, expirationMinutes]);

  return cached;
}

/**
 * Gera uma chave de cache baseada em filtros
 */
export function generateCacheKey(prefix: string, filters: Record<string, any>): string {
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = filters[key];
      return acc;
    }, {});

  const hash = JSON.stringify(sortedFilters);
  return `${prefix}:${hash}`;
}
