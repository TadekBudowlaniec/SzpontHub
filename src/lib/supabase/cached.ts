import { cache } from 'react';
import { createClient } from './server';

// Deduplikuje getUser() w ramach jednego renderowania requestu
// (layout + page + actions wywołane w tym samym renderze = 1 call zamiast 3)
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
