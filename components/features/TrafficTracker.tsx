'use client';

import { useEffect } from 'react';
import { trafficService } from '@/services/traffic.service';

export default function TrafficTracker() {
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // "2026-05-26"
    const lastLogged = localStorage.getItem('2el_visitor_logged');

    // Only hit the backend if the user hasn't been logged today
    if (lastLogged !== today) {
      trafficService.logTraffic().then(() => {
        localStorage.setItem('2el_visitor_logged', today);
      }).catch((err) => {
        console.error('Failed to log traffic:', err);
      });
    }
  }, []);

  return null;
}
