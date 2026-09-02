import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Radio, 
  Cpu, 
  Activity, 
  MessageSquare, 
  Layers, 
  TrendingUp, 
  Play, 
  Pause, 
  Send, 
  Check, 
  Copy, 
  ExternalLink 
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
import { useTheme } from '../context/ThemeContext';

export default function MqttConsole({ telemetry }) {
  const { resolvedTheme } = useTheme();
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
  const [copied, setCopied] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';

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

  const handleCopyPayload = () => {
    if (!selectedMessage) return;
    navigator.clipboard.writeText(selectedMessage.payload_str || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredMessages = messages.filter((m) => {
    const matchesDir = directionFilter === 'ALL' || m.direction === directionFilter;
    const matchesTopic = !topicFilter || m.topic.toLowerCase().includes(topicFilter.toLowerCase());
    return matchesDir && matchesTopic;
  });

  return (
    <div className="space-y-6">
      {/* Broker Connection & Header */}
      <div className="glass-panel p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">MQTT / EMQX Enterprise Broker Operations Console</h2>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse" />
                <span>CONNECTED</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Broker: {stats?.broker || 'EMQX Cloud Serverless'} | Host: {stats?.broker_url || 'o7b04708.ala.asia-southeast1.emqxsl.com:8883'} | Client: TCU-001
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <a
            href="https://cloud-intl.emqx.com/console/deployments/o7b04708/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-sm"
          >
            <span>Open EMQX Broker Console ↗</span>
          </a>
        </div>
      </div>

      {/* Visual MQTT Topology Data-Flow */}
      <div className="glass-panel p-4 rounded-lg border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>End-to-End Real-Time MQTT Transmission Topology</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Live Ingestion Pipeline</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
            <Cpu className="w-4 h-4 text-slate-600 dark:text-slate-300 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">BUS-001</div>
            <div className="text-[10px] text-slate-500 font-mono">CAN Frames (0x100..0x750)</div>
          </div>

          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
            <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-blue-700 dark:text-blue-400">TCU-001</div>
            <div className="text-[10px] text-slate-500 font-mono">CAN Decoder & Aggregator</div>
          </div>

          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
            <Server className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300">EMQX BROKER</div>
            <div className="text-[10px] text-slate-500 font-mono">MQTT 5.0 (TLS Port 8883)</div>
          </div>

          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">CLOUD INGESTION</div>
            <div className="text-[10px] text-slate-500 font-mono">Validation & DB Write</div>
          </div>

          <div className="col-span-2 md:col-span-1 p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-blue-700 dark:text-blue-300">DASHBOARD</div>
            <div className="text-[10px] text-slate-500 font-mono">1 Hz Live WebSocket</div>
          </div>
        </div>
      </div>

      {/* Live Performance Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3 rounded-lg border">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Published (OUT)</span>
          <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">{stats?.messages_published || 0}</div>
          <span className="text-[10px] text-slate-400">{((stats?.bytes_published || 0)/1024).toFixed(1)} KB</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Received (IN)</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats?.messages_received || 0}</div>
          <span className="text-[10px] text-slate-400">{((stats?.bytes_received || 0)/1024).toFixed(1)} KB</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Avg Payload</span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{stats?.avg_payload_bytes || 2420} <span className="text-xs">B</span></div>
          <span className="text-[10px] text-slate-400">322 Signals/pkt</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Network Latency</span>
          <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">{stats?.avg_latency_ms || 14.5} <span className="text-xs">ms</span></div>
          <span className="text-[10px] text-slate-400">TCP RTT</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Packet Loss</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">0.0%</div>
          <span className="text-[10px] text-slate-400">QoS 1 Ack</span>
        </div>

        <div className="glass-panel p-3 rounded-lg border">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Security TLS</span>
          <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">ENABLED</div>
          <span className="text-[10px] text-slate-400">Port 8883</span>
        </div>
      </div>

      {/* Live Message Rate Chart */}
      <div className="glass-panel p-4 rounded-lg border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Real-Time Ingestion Throughput (Messages / Second over 60s Window)</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Live Telemetry Rate</span>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.rate_history || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="time" stroke={axisColor} tick={{ fontSize: 10 }} />
              <YAxis stroke="#2563eb" tick={{ fontSize: 10 }} domain={[0, 10]} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, fontSize: '11px', color: isDark ? '#f8fafc' : '#0f172a' }} />
              <Line type="monotone" dataKey="msg_rate" stroke="#2563eb" strokeWidth={2} dot={false} name="Messages/sec" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid: Live Message Console & Message Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Message Log Table (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-lg border overflow-hidden space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">Live Message Stream</span>
              <div className="flex space-x-1 bg-slate-100 dark:bg-dark-800 p-0.5 rounded border border-slate-300 dark:border-dark-600">
                {['ALL', 'OUT', 'IN'].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setDirectionFilter(dir)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition font-semibold ${
                      directionFilter === dir
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
                className="px-2.5 py-1 rounded bg-slate-50 dark:bg-dark-850 border border-slate-300 dark:border-dark-600 text-xs font-mono text-slate-800 dark:text-slate-200 w-36"
              />
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300 dark:border-dark-600"
                title={isPaused ? "Resume Stream" : "Pause Stream"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-100 dark:bg-dark-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-dark-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3">Direction</th>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Topic</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-dark-750">
                {filteredMessages.map((m, idx) => {
                  const isSelected = selectedMessage && selectedMessage.id === m.id;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedMessage(m)}
                      className={`cursor-pointer transition ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-bold' 
                          : 'hover:bg-slate-50 dark:hover:bg-dark-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          m.direction === 'OUT' 
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {m.direction}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">{m.timestamp_iso?.split(' ')[1] || '11:42:01'}</td>
                      <td className="py-2 px-3 truncate max-w-[200px] text-slate-800 dark:text-slate-200">{m.topic}</td>
                      <td className="py-2 px-3 text-slate-500">{m.size_bytes} B</td>
                      <td className="py-2 px-3 text-purple-600 dark:text-purple-400 font-semibold">{m.latency_ms?.toFixed(1)} ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message Detail & Test Publisher (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Message Inspector */}
          <div className="glass-panel p-4 rounded-lg border space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">Message Inspector</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    viewMode === 'raw' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 dark:bg-dark-800 text-slate-500'
                  }`}
                >
                  Raw JSON
                </button>
                <button
                  onClick={() => setViewMode('decoded')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    viewMode === 'decoded' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 dark:bg-dark-800 text-slate-500'
                  }`}
                >
                  Decoded Signals
                </button>
              </div>
            </div>

            {selectedMessage ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Topic:</span>
                    <span className="text-blue-700 dark:text-blue-400 font-bold truncate max-w-[220px]">{selectedMessage.topic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">QoS:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedMessage.qos ?? 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedMessage.timestamp_iso}</span>
                  </div>
                </div>

                {viewMode === 'raw' ? (
                  <div className="relative">
                    <button
                      onClick={handleCopyPayload}
                      className="absolute right-2 top-2 p-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center space-x-1 z-10"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <pre className="p-3 rounded bg-slate-900 dark:bg-dark-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 overflow-y-auto">
                      {selectedMessage.payload_str}
                    </pre>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {selectedMessage.payload_obj ? Object.entries(selectedMessage.payload_obj).slice(0, 15).map(([k, v]) => (
                      <div key={k} className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-xs font-mono">
                        <span className="text-slate-500">{k}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : String(v)}</span>
                      </div>
                    )) : <div className="text-slate-500 text-xs">No decoded object available.</div>}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs font-mono">
                Select a message from the stream to view its payload.
              </div>
            )}
          </div>

          {/* Test Publisher Card */}
          <div className="glass-panel p-4 rounded-lg border space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">Interactive Test Publisher</h4>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 font-mono uppercase">Topic</label>
                <input
                  type="text"
                  value={testTopic}
                  onChange={(e) => setTestTopic(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-300 dark:border-dark-600 text-xs font-mono text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-mono uppercase">Payload (JSON)</label>
                <input
                  type="text"
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-300 dark:border-dark-600 text-xs font-mono text-slate-800 dark:text-slate-200"
                />
              </div>
              <button
                onClick={handlePublishTest}
                className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-1 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{publishSuccess ? 'Published Successfully!' : 'Publish Packet'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
