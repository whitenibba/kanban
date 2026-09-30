'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { 
  PriorityChart, 
  WorkloadChart, 
  EfficiencyChart, 
  ThroughputChart 
} from '@/components/charts';

export default function DashboardGenerale() {
  const [data, setData] = useState({
    stats: null,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const statsData = await response.json();
          setData({
            stats: statsData,
            loading: false
          });
        }
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche:', error);
        setData({ stats: null, loading: false });
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <h1>Dashboard Generale</h1>

      {/* GRIGLIA STATISTICHE */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <h3>Progetti</h3>
          <p>{data.stats?.totalProjects || '-'}</p>
        </div>
        <div className={styles.card}>
          <h3>Task attivi</h3>
          <p>{data.stats?.inProgress || '-'}</p>
        </div>
        <div className={styles.card}>
          <h3>Task Completati (7gg)</h3>
          <p>{data.stats?.completedLastWeek || '-'}</p>
        </div>
      </div>

      {/* GRAFICI */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2>Priorità Task</h2>
          <PriorityChart data={data.stats?.priority} />
        </div>

        <div className={styles.chartCard}>
          <h2>Carico di Lavoro per Progetto</h2>
          <WorkloadChart data={data.stats?.taskPerProject} />
        </div>

        <div className={styles.chartCard}>
          <h2>Efficienza Completamento</h2>
          <EfficiencyChart data={data.stats?.completedVsInProgress} />
        </div>

        <div className={styles.chartCard}>
          <h2>Produttività Giornaliera</h2>
          <ThroughputChart data={data.stats?.tasksCompletedOverTime} />
        </div>
      </div>
    </>
  );
}