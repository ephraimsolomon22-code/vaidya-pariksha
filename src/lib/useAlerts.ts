import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Alert } from '../types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (active) setAlerts((data as Alert[]) ?? []);
      });

    // Guard against React 18 StrictMode running this effect twice in
    // development, which would otherwise try to subscribe the same
    // channel name twice and throw "cannot add callbacks after subscribe()".
    const existing = supabase.getChannels().find((c) => c.topic === 'realtime:alerts-realtime');
    if (existing) supabase.removeChannel(existing);

    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        setAlerts((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as Alert, ...prev];
          if (payload.eventType === 'UPDATE')
            return prev.map((a) => (a.id === (payload.new as Alert).id ? (payload.new as Alert) : a));
          if (payload.eventType === 'DELETE') return prev.filter((a) => a.id !== (payload.old as Alert).id);
          return prev;
        });
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { alerts };
}
