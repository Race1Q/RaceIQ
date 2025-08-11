import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DbTest() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('healthcheck').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => error ? setErr(error.message) : setRows(data ?? []));
  }, []);

  if (err) return <div>DB error: {err}</div>;
  return <pre>{JSON.stringify(rows, null, 2)}</pre>;
}
