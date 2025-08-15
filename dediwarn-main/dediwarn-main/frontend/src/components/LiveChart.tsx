import React, { useEffect, useState } from 'react';
import styles from './LiveChart.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface LiveChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  height?: number;
}

export const LiveChart: React.FC<LiveChartProps> = ({ type, title, height = 300 }) => {
  const [chartData, setChartData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateLiveData = () => {
      const now = new Date();
      const labels = [];
      const values = [];

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        values.push(Math.floor(Math.random() * 100) + 20);
      }

      if (type === 'line') {
        return {
          labels,
          datasets: [
            {
              label: 'Warnings Issued',
              data: values,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: 'rgb(59, 130, 246)',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };
      } else if (type === 'bar') {
        return {
          labels: ['Critical', 'High', 'Medium', 'Low'],
          datasets: [
            {
              label: 'Warning Severity Distribution',
              data: [12, 35, 67, 23],
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(34, 197, 94, 0.8)',
              ],
              borderColor: [
                'rgb(239, 68, 68)',
                'rgb(245, 158, 11)',
                'rgb(251, 191, 36)',
                'rgb(34, 197, 94)',
              ],
              borderWidth: 1,
            },
          ],
        };
      } else {
        return {
          labels: ['Active', 'Resolved', 'Pending'],
          datasets: [
            {
              data: [45, 78, 12],
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
              ],
              borderColor: [
                'rgb(239, 68, 68)',
                'rgb(34, 197, 94)',
                'rgb(251, 191, 36)',
              ],
              borderWidth: 2,
            },
          ],
        };
      }
    };

    setChartData(generateLiveData());
    setIsLoading(false);

    const interval = setInterval(() => {
      setChartData(generateLiveData());
    }, 5000);

    return () => clearInterval(interval);
  }, [type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
    } : {},
  };

  const getIcon = () => {
    switch (type) {
      case 'line': return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'bar': return <BarChart3 className="h-5 w-5 text-purple-400" />;
      case 'doughnut': return <Activity className="h-5 w-5 text-green-400" />;
    }
  };

  if (isLoading || !chartData) {
    return (
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {getIcon()}
        <div className={`flex items-center justify-center live-chart-loader`} >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
        </div>
      </div>
    );
  }

  const ChartComponent = type === 'line' ? Line : type === 'bar' ? Bar : Doughnut;

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          {getIcon()}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ChartComponent data={chartData as any} options={options} height={height} />
      </div>
    </div>
  );
};