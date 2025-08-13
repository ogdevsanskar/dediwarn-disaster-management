import React, { useState } from 'react';
import { Globe, Server, Wifi, Activity, MapPin, Zap, Shield } from 'lucide-react';
import styles from './Network.module.css';

export const Network: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const networkNodes = [
    { id: '1', location: 'New York, USA', status: 'online', uptime: '99.9%', warnings: 234, lat: 40.7128, lng: -74.0060 },
    { id: '2', location: 'London, UK', status: 'online', uptime: '99.8%', warnings: 189, lat: 51.5074, lng: -0.1278 },
    { id: '3', location: 'Tokyo, Japan', status: 'online', uptime: '99.7%', warnings: 156, lat: 35.6762, lng: 139.6503 },
    { id: '4', location: 'Sydney, Australia', status: 'maintenance', uptime: '98.5%', warnings: 98, lat: -33.8688, lng: 151.2093 },
    { id: '5', location: 'São Paulo, Brazil', status: 'online', uptime: '99.6%', warnings: 145, lat: -23.5505, lng: -46.6333 },
    { id: '6', location: 'Mumbai, India', status: 'online', uptime: '99.4%', warnings: 203, lat: 19.0760, lng: 72.8777 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-400/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/20';
      case 'offline': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 ${styles.fadeInUp}`}>
          <h1 className="text-4xl font-bold text-white mb-4">Global Network</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Monitor the decentralized warning network spanning across the globe
          </p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { title: 'Total Nodes', value: '2,547', icon: Server, color: 'from-blue-500 to-cyan-500' },
            { title: 'Active Connections', value: '98.7%', icon: Wifi, color: 'from-green-500 to-emerald-500' },
            { title: 'Network Latency', value: '45ms', icon: Zap, color: 'from-yellow-500 to-orange-500' },
            { title: 'Security Score', value: '99.9%', icon: Shield, color: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 ${styles.fadeInUp} ${styles[`networkStatDelay${index}`]}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <Activity className="h-5 w-5 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* World Map Visualization */}
        <div className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8 ${styles.fadeInUp} ${styles.animateDelay5}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Network Distribution</h3>
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          
          {/* Simplified world map representation */}
          <div className={`relative h-96 bg-slate-900 rounded-lg overflow-hidden ${styles.mapContainer}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 grid-rows-8 h-full">
                {[...Array(96)].map((_, i) => (
                  <div key={i} className="border border-slate-600" />
                ))}
              </div>
            </div>
            
            {/* Node markers */}
            {networkNodes.map((node, index) => {
              const nodeLeft = ((node.lng + 180) / 360) * 100;
              const nodeTop = ((90 - node.lat) / 180) * 100;
              return (
                <div
                  key={node.id}
                  className={`${styles.nodeMarker} ${styles[`animateDelay${index + 1}`]} ${
                    node.status === 'online' ? styles.nodeOnline : 
                    node.status === 'maintenance' ? styles.nodeMaintenance : styles.nodeOffline
                  }`}
                  data-node-left={nodeLeft}
                  data-node-top={nodeTop}
                  onClick={() => setSelectedNode(node.id)}
                />
              );
            })}
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {networkNodes.map((node, index) => (
                networkNodes.slice(index + 1).map((otherNode) => (
                  <line
                    key={`${node.id}-${otherNode.id}`}
                    x1={`${((node.lng + 180) / 360) * 100}%`}
                    y1={`${((90 - node.lat) / 180) * 100}%`}
                    x2={`${((otherNode.lng + 180) / 360) * 100}%`}
                    y2={`${((90 - otherNode.lat) / 180) * 100}%`}
                    className={styles.connectionLine}
                  />
                ))
              ))}
            </svg>
          </div>
        </div>

        {/* Node List */}
        <div className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden ${styles.fadeInUp} ${styles.animateDelay6}`}>
          <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <h3 className="text-lg font-semibold text-white">Network Nodes</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Uptime</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Warnings</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {networkNodes.map((node, index) => (
                  <tr 
                    key={node.id} 
                    className={`hover:bg-slate-700/30 transition-colors ${styles.slideInLeft} ${styles[`animateDelay${7 + index}`]} ${
                      selectedNode === node.id ? styles.selectedRow : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{node.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          node.status === 'online' ? 'bg-green-400' :
                          node.status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
                        } animate-pulse`} />
                        {node.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{node.uptime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{node.warnings}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedNode(node.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Network Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 ${styles.fadeInUp} ${styles.animateDelay8}`}>
            <h3 className="text-lg font-semibold text-white mb-4">Network Performance</h3>
            <div className="space-y-4">
              {[
                { label: 'Throughput', value: '1,247 tx/s', progress: 85 },
                { label: 'Bandwidth Usage', value: '67%', progress: 67 },
                { label: 'Error Rate', value: '0.03%', progress: 3 },
                { label: 'Consensus Time', value: '2.1s', progress: 92 }
              ].map((metric, index) => (
                <div key={index} className={`${styles.slideInLeft} ${styles[`animateDelay${9 + index}`]}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">{metric.label}</span>
                    <span className="text-sm text-white font-medium">{metric.value}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`${styles.progressBar} ${styles[`animateDelay${10 + index}`]}`}
                      data-progress-width={metric.progress}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 ${styles.fadeInUp} ${styles.animateDelay9}`}>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Network Events</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[
                { time: '2 min ago', event: 'Node joined network', location: 'Frankfurt, DE', type: 'success' },
                { time: '5 min ago', event: 'Consensus reached', location: 'Global', type: 'info' },
                { time: '8 min ago', event: 'Node maintenance started', location: 'Sydney, AU', type: 'warning' },
                { time: '12 min ago', event: 'Network upgrade completed', location: 'Global', type: 'success' },
                { time: '15 min ago', event: 'High traffic detected', location: 'Tokyo, JP', type: 'info' }
              ].map((event, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors ${styles.slideInLeft} ${styles[`animateDelay${10 + index}`]}`}
                >
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    event.type === 'success' ? 'bg-green-400' :
                    event.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{event.event}</p>
                    <p className="text-xs text-slate-400">{event.location}</p>
                  </div>
                  <span className="text-xs text-slate-400">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};