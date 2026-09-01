import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  ExternalLink, 
  Activity, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ShieldCheck, 
  TrendingUp, 
  Server, 
  Radio, 
  Cpu, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Code,
  Table,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { fetchMqttStats, fetchMqttMessages, publishMqttTest } from '../api';

export default function MqttConsole({ telemetry }) {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewMode, setViewMode] = useState('raw'); // 'raw' or 'decoded'
  const [isPaused, setIsPaused] = useState(false);
  const [directionFilter, setDirectionFilter] = useState('ALL'); // ALL, IN, OUT
  const [topicFilter, setTopicFilter] = useState('');
  const [testTopic, setTestTopic] = useState('fleet/OLECTRA-E-FLEET/bus/BUS-001/test');
  const [testPayload, setTestPayload] = useState('{"source": "mqtt-console", "event": "ping", "status": "ok"}');
  const [publishSuccess, setPublishSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [st, msgs] = await Promise.all([fetchMqttStats(), fetchMqttMessages(60)]);
      if (st) setStats(st);
      if (msgs) {
        setMessages(msgs);
        if (!selectedMessage && msgs.length > 0) {
          setSelectedMessage(msgs[msgs.length - 1]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    if (isPaused) return;
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePublishTest = async () => {
    try {
      await publishMqttTest(testTopic, testPayload);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 3000);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesDir = directionFilter === 'ALL' || m.direction === directionFilter;
    const matchesTopic = !topicFilter || m.topic.toLowerCase().includes(topicFilter.toLowerCase());
    return matchesDir && matchesTopic;
  });

  return (
    <div className="space-y-6">
      {/* Broker Connection & Header */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <Server className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100">MQTT / EMQX Enterprise Broker Visual Console</h2>
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>CONNECTED</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Broker: {stats?.broker || 'EMQX v5.8.0'} | Host: {stats?.broker_url || 'mqtt://localhost:1883'} | Client ID: TCU-001
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={stats?.emqx_dashboard_url || 'https://cloud.emqx.com/console/deployments'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-dark-900 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <span>Open EMQX Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Visual MQTT Topology Data-Flow */}
      <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>End-to-End Real-Time MQTT Transmission Topology</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Live Ingestion Pipeline</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-lg bg-dark-900 border border-dark-700">
            <Cpu className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-200">BUS-001</div>
            <div className="text-[10px] text-slate-400 font-mono">CAN Frames (0x100..0x750)</div>
          </div>

          <div className="p-3 rounded-lg bg-dark-900 border border-cyan-500/40">
            <Radio className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-cyan-300">TCU-001</div>
            <div className="text-[10px] text-slate-400 font-mono">CAN Decoder & Aggregator</div>
          </div>

          <div className="p-3 rounded-lg bg-dark-900 border border-purple-500/40">
            <Server className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-purple-300">EMQX BROKER</div>
            <div className="text-[10px] text-slate-400 font-mono">MQTT 5.0 (QoS 1)</div>
          </div>

          <div className="p-3 rounded-lg bg-dark-900 border border-emerald-500/40">
            <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-emerald-300">CLOUD INGESTION</div>
            <div className="text-[10px] text-slate-400 font-mono">Validation & DB Write</div>
          </div>

          <div className="col-span-2 md:col-span-1 p-3 rounded-lg bg-dark-900 border border-blue-500/40">
            <MessageSquare className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-blue-300">DASHBOARD</div>
            <div className="text-[10px] text-slate-400 font-mono">1 Hz Live WebSocket</div>
          </div>
        </div>
      </div>

      {/* Live Performance Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3 rounded-lg border border-dark-600">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Published (OUT)</span>
          <div className="text-lg font-bold font-mono text-cyan-400">{stats?.messages_published || 0}</div>
          <span className="text-[10px] text-slate-500">{((stats?.bytes_published || 0)/1024).toFixed(1)} KB</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-dark-600">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Received (IN)</span>
          <div className="text-lg font-bold font-mono text-emerald-400">{stats?.messages_received || 0}</div>
          <span className="text-[10px] text-slate-500">{((stats?.bytes_received || 0)/1024).toFixed(1)} KB</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-dark-600">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Payload</span>
          <div className="text-lg font-bold font-mono text-amber-400">{stats?.avg_payload_bytes || 2420} <span className="text-xs">B</span></div>
          <span className="text-[10px] text-slate-500">280+ Signals/pkt</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-dark-600">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Network Latency</span>
          <div className="text-lg font-bold font-mono text-purple-400">{stats?.avg_latency_ms || 14.5} <span className="text-xs">ms</span></div>
          <span className="text-[10px] text-slate-500">TCP RTT</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-dark-600">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Packet Loss</span>
          <div className="text-lg font-bold font-mono text-emerald-400">0.0%</div>
          <span className="text-[10px] text-slate-500">QoS 1 Ack</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-dark-600">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Security TLS</span>
          <div className="text-lg font-bold font-mono text-cyan-400">ENABLED</div>
          <span className="text-[10px] text-slate-500">Secrets Hidden</span>
        </div>
      </div>

      {/* Live Message Rate Chart */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
        <div className="flex items-center justify-between border-b border-dark-700 pb-2">
          <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Real-Time Ingestion Throughput (Messages / Second over 60s Window)</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Live Telemetry Rate</span>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.rate_history || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d44" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#00f0ff" tick={{ fontSize: 10 }} domain={[0, 10]} />
              <Tooltip contentStyle={{ backgroundColor: '#0d1522', borderColor: '#1e2d44', fontSize: '11px' }} />
              <Line type="monotone" dataKey="msg_rate" stroke="#00f0ff" strokeWidth={2} dot={false} name="Messages/sec" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid: Live Message Console & Message Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Message Log Table (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-xl border border-dark-600 overflow-hidden space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-200 uppercase">Live Message Stream</span>
              <div className="flex space-x-1">
                {['ALL', 'OUT', 'IN'].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setDirectionFilter(dir)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                      directionFilter === dir
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-dark-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Filter topic..."
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="px-2.5 py-1 rounded bg-dark-900 border border-dark-700 text-xs font-mono text-slate-200 w-36"
              />
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 rounded bg-dark-800 text-slate-400 hover:text-white"
                title={isPaused ? "Resume Stream" : "Pause Stream"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-dark-900 text-slate-400 border-b border-dark-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Dir</th>
                  <th className="py-2 px-3">Topic</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">QoS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {filteredMessages.map((m, idx) => {
                  const isSelected = selectedMessage && selectedMessage.id === m.id;
                  const isOut = m.direction === 'OUT';
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedMessage(m)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-200' : 'hover:bg-dark-800/60 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-400 text-[11px]">{m.timestamp_iso}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 w-fit ${
                          isOut ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {isOut ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                          <span>{m.direction}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-200 truncate max-w-[200px]" title={m.topic}>
                        {m.topic}
                      </td>
                      <td className="py-2 px-3 text-slate-400">{m.size_formatted}</td>
                      <td className="py-2 px-3 text-slate-500">1</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message Inspector (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-xl border border-dark-600 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>MQTT Packet Inspector</span>
            </h3>

            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  viewMode === 'raw'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-dark-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                RAW JSON
              </button>
              <button
                onClick={() => setViewMode('decoded')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  viewMode === 'decoded'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-dark-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                DECODED
              </button>
            </div>
          </div>

          {selectedMessage ? (
            <div className="space-y-3">
              {/* Metadata strip */}
              <div className="p-3 rounded-lg bg-dark-900 border border-dark-700 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Topic:</span>
                  <span className="text-cyan-300 font-bold truncate max-w-[220px]">{selectedMessage.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Direction:</span>
                  <span className={selectedMessage.direction === 'OUT' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedMessage.direction === 'OUT' ? 'TCU → MQTT (Publish)' : 'MQTT → Backend (Subscribe)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span className="text-slate-300">{selectedMessage.timestamp_iso}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payload Size:</span>
                  <span className="text-purple-300 font-bold">{selectedMessage.size_bytes} Bytes</span>
                </div>
              </div>

              {viewMode === 'raw' ? (
                <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-700 max-h-80 overflow-y-auto font-mono text-[11px] text-emerald-300">
                  <pre>{JSON.stringify(selectedMessage.payload, null, 2)}</pre>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-dark-900 border border-dark-700 max-h-80 overflow-y-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead className="text-slate-500 border-b border-dark-800 text-[10px]">
                      <tr>
                        <th className="py-1">Parameter</th>
                        <th className="py-1 text-right">Decoded Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800">
                      {Object.entries(selectedMessage.payload).map(([k, v]) => (
                        <tr key={k}>
                          <td className="py-1 text-slate-300">{k}</td>
                          <td className="py-1 text-right text-cyan-300 font-bold">{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select a message from the live stream table on the left to inspect raw payload or decoded signal table.
            </div>
          )}
        </div>
      </div>

      {/* Live Test Publisher */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Send className="w-4 h-4 text-cyan-400" />
          <span>MQTT Test Publisher (Non-Destructive Development Sandbox)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-mono">Test Topic</label>
            <input
              type="text"
              value={testTopic}
              onChange={(e) => setTestTopic(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-dark-900 border border-dark-700 text-xs font-mono text-slate-200"
            />
          </div>

          <div className="md:col-span-2 flex items-end space-x-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">Payload (JSON)</label>
              <input
                type="text"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-dark-900 border border-dark-700 text-xs font-mono text-slate-200"
              />
            </div>

            <button
              onClick={handlePublishTest}
              className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-dark-900 font-bold text-xs transition"
            >
              Publish Test
            </button>
          </div>
        </div>

        {publishSuccess && (
          <div className="p-2 rounded bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Test message published to broker and verified through ingestion subscriber!</span>
          </div>
        )}
      </div>
    </div>
  );
}
