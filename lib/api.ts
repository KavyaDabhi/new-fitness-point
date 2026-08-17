// src/lib/api.ts
import { supabase } from './supabase';

export async function fetchTable(tableName: string) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return [];
  }
  return data;
}