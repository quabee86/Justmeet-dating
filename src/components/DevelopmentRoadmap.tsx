import React, { useState } from 'react';
import { 
  Milestone, Layers, Database, Cpu, HardDrive, Smartphone, Video, 
  CloudLightning, Globe, BookOpen, CheckCircle2, TrendingUp, Sliders,
  ArrowRight, Users, Play, ShieldAlert, GitBranch, Terminal, RefreshCw, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define roadmap phases and milestones
interface MilestoneTask {
  title: string;
  desc: string;
  status: 'completed' | 'in_progress' | 'planned';
  details: string[];
}

interface Phase {
  id: number;
  title: string;
  tagline: string;
  duration: string;
  color: string;
  milestones: {
    title: string;
    icon: any;
    tasks: MilestoneTask[];
  }[];
}

export default function DevelopmentRoadmap() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'phases' | 'scaling' | 'playbook'>('phases');
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [concurrentUsers, setConcurrentUsers] = useState<number>(150000); // Slider for scale simulation
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(0);
  
  // Custom interactive simulation log state
  const [scalingLog, setScalingLog] = useState<string[]>([]);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);

  const phases: Phase[] = [
    {
      id: 1,
      title: "Phase I: Scalable Engine & Cloud Data Store",
      tagline: "Construct core web endpoints, session controls, and high-performance database cluster schemas.",
      duration: "Months 1 - 3",
      color: "from-rose-500 to-pink-500",
      milestones: [
        {
          title: "Backend API Framework",
          icon: Layers,
          tasks: [
            {
              title: "Express/Fastify Node.js Service Layer",
              desc: "Deploy type-safe controllers with structured routing, modular request validation pipelines, and JSON-Schema bindings.",
              status: "completed",
              details: [
                "Strict TypeScript interfaces mapped across REST routers.",
                "Custom middleware validating payload constraints with ajv / zod libraries.",
                "Pristine error boundaries capturing server metrics with JSON structured outputs."
              ]
            },
            {
              title: "Secure Session Controls & JWT Signatures",
              desc: "Issue cryptographically signed JSON Web Tokens leveraging HMAC-SHA256 signatures to authorize request contexts.",
              status: "completed",
              details: [
                "Two-layer tokenization: short-lived access credentials coupled with encrypted database-backed refresh tokens.",
                "Stateless claims decryption executing on server gateways under 5ms.",
                "Secure cookies carrying SameSite=Strict, HttpOnly, and Secure directives."
              ]
            },
            {
              title: "IP Rate Limiter & Sliding-Window Filters",
              desc: "Protect the ingress boundary against DDoS floods and crawler scraper bot script loops.",
              status: "completed",
              details: [
                "Distributed sliding-window rate evaluation powered by local Redis counters.",
                "Standard HTTP 429 payload responses carrying precise 'Retry-After' timestamp tags.",
                "Dynamic threshold scaling: relaxed rules for logged-in VIP accounts, strict locks on registration routes."
              ]
            }
          ]
        },
        {
          title: "PostgreSQL Database Layer",
          icon: Database,
          tasks: [
            {
              title: "Relational Schemas & Indexes",
              desc: "Design strict relational modeling mapping out user profiles, private match records, billing ledgers, and secure coordinates.",
              status: "in_progress",
              details: [
                "Composite indexing bound on critical query targets (e.g., matching coordinates, user age ranges).",
                "Foreign keys tied with strict CASCADE execution triggers.",
                "UUID generators enforcing primary key randomness to hide database sizes from clients."
              ]
            },
            {
              title: "Connection Pooling (PgBouncer Integration)",
              desc: "Introduce PgBouncer proxy layers to optimize database connection reuse under rapid spike patterns.",
              status: "planned",
              details: [
                "Configure PgBouncer under 'transaction pooling' format to recycle ports immediately after query completion.",
                "Optimize maximum connection configurations to match database resource boundaries.",
                "Benchmark and reduce handshake socket latencies down to <1.5ms."
              ]
            },
            {
              title: "Read Replicas & Geographical Partitions",
              desc: "Replicate database nodes geographically to achieve high availability and reduce query delays for distributed users.",
              status: "planned",
              details: [
                "Configure logical database replication with secondary read-only nodes in multiple regions.",
                "Build read/write routing logic in the backend controllers to offload heavy lookup scans.",
                "Establish cron-scheduled backup routines with secure cloud bucket retention policies."
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Phase II: Native Clients & Immersive Communications",
      tagline: "Build high-fidelity Android and iOS applications equipped with real-time push engines and WebRTC.",
      duration: "Months 4 - 6",
      color: "from-purple-500 to-indigo-500",
      milestones: [
        {
          title: "Android Native Client App",
          icon: Smartphone,
          tasks: [
            {
              title: "Kotlin & Jetpack Compose Architecture",
              desc: "Construct a smooth swipe client leveraging state-driven Compose layout systems and clean architecture.",
              status: "planned",
              details: [
                "Implement Android MVI pattern (Model-View-Intent) to maintain predictable unidirectional rendering flows.",
                "Integrate Room Local SQLite Database to cache visitor logs and allow offline chat draft reading.",
                "Configure dynamic vector image layouts preventing RAM spikes during rapid profile swiping."
              ]
            },
            {
              title: "FCM Push Notifications Pipeline",
              desc: "Deliver high-priority push events when matches occur or new private chat messages land.",
              status: "planned",
              details: [
                "Integrate Firebase Cloud Messaging (FCM) with specialized app-side notification channels.",
                "Implement silent payload execution to wake up background sync engines safely.",
                "Manage deep-linking pathways taking user directly to the target chat thread on open."
              ]
            }
          ]
        },
        {
          title: "iOS Native Client App",
          icon: Globe,
          tasks: [
            {
              title: "Swift & SwiftUI MVVM Framework",
              desc: "Build a native iPhone client exploiting Apple's metal-accelerated fluid rendering structures.",
              status: "planned",
              details: [
                "Construct gesture tracking hooks supporting physical device haptics during matching 'Likes'.",
                "Utilize Swift Concurrency (async/await) to fetch profiles and chat history with zero main-thread blockages.",
                "Store credentials securely inside iOS Keychain clusters with biometric FaceID validations."
              ]
            },
            {
              title: "APNs Push Notification Channel",
              desc: "Configure direct communication tunnels with Apple Push Notification service (APNs).",
              status: "planned",
              details: [
                "Deploy Apple Developer credential profiles establishing HTTP/2 push tunnels.",
                "Format JSON payloads with notification service extensions to render visitor face avatars on the lock screen.",
                "Enable badge count synchronization across multi-device user log-ins."
              ]
            }
          ]
        },
        {
          title: "WebRTC Video Calling",
          icon: Video,
          tasks: [
            {
              title: "STUN & TURN Server Infrastructure",
              desc: "Establish coturn media gateways to bypass strict symmetric symmetric NAT firewalls on peer connections.",
              status: "planned",
              details: [
                "Deploy coturn relay servers in key geographic locations closer to user segments.",
                "Protect TURN bandwidth utilization with short-lived HMAC time-locked tokens.",
                "Benchmark latency metrics to maintain video connection handshakes under 300ms."
              ]
            },
            {
              title: "Signaling WebSocket Handshake Gateway",
              desc: "Deliver secure peer SDP offers, answers, and ICE candidate packages in real-time.",
              status: "planned",
              details: [
                "Build stateful WebSocket signaling routers in Node.js enforcing strict caller authentication.",
                "Prevent call spamming with matching checks (only mutual matches can transmit SDP candidates).",
                "Integrate fallback channels to automatically drop call screen if ping connection breaks."
              ]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Phase III: Deep Learning & Cloud-Native Deployment",
      tagline: "Deploy collaborative filtering recommendations and scale backend clusters on production clouds.",
      duration: "Months 7 - 9",
      color: "from-slate-800 to-slate-900",
      milestones: [
        {
          title: "AI Match Recommendations",
          icon: Cpu,
          tasks: [
            {
              title: "Profile Text/Vector Embedding Engine",
              desc: "Convert text biographies and interest chips into 1536-dimensional float arrays utilizing deep learning.",
              status: "planned",
              details: [
                "Establish a Python-based FastAPI service proxying requests to state-of-the-art embedding models.",
                "Store dimensional vector representations inside specialized database index extensions.",
                "Calculate cosine similarity metrics on database queries to extract immediate high-probability candidates."
              ]
            },
            {
              title: "Collaborative Filtering & Behavior Scoring",
              desc: "Tune match queues based on actual client behaviors, swiping preferences, and message reply velocities.",
              status: "planned",
              details: [
                "Deploy a real-time behavioral queue utilizing TensorFlow matching patterns.",
                "Reduce bias loop effects by introducing slight randomness coefficients to match decks.",
                "Run automated cron scoring tasks to update matchmaking priority coefficients every midnight."
              ]
            }
          ]
        },
        {
          title: "Cloud Native Deployments",
          icon: CloudLightning,
          tasks: [
            {
              title: "Dockerized Container Packaging",
              desc: "Construct hardened, minimal scratch-based Docker images containing compiled production software binaries.",
              status: "planned",
              details: [
                "Implement secure multi-stage builds stripping away devDependencies to keep image size under 100MB.",
                "Audit images for CVE vulnerabilities inside CI/CD linting checks.",
                "Expose specific port configurations matching ingress reverse proxy containers."
              ]
            },
            {
              title: "Kubernetes Orchestration Cluster (K8s)",
              desc: "Deploy self-healing containers running on elastic cloud infrastructure.",
              status: "planned",
              details: [
                "Configure Kubernetes Horizontal Pod Autoscaling (HPA) mapping rules triggered by memory and CPU thresholds.",
                "Establish rolling-update deployment schemes allowing zero-downtime client migrations.",
                "Mount Cloudflare CDN proxy setups on the K8s Ingress Controller to buffer static assets globally."
              ]
            }
          ]
        },
        {
          title: "App Store Publishing",
          icon: BookOpen,
          tasks: [
            {
              title: "Google Play Console Pipeline",
              desc: "Compile compliant Android App Bundles (AAB) to pass safety, accessibility, and content policy standards.",
              status: "planned",
              details: [
                "Automate release compiling processes inside GitHub Actions pipelines with Fastlane scripts.",
                "Establish testing tracks (Internal -> Alpha -> Production) to screen visual crashes early.",
                "Comply with privacy mandates by providing a clear in-app profile deletion link."
              ]
            },
            {
              title: "App Store Connect Review Process",
              desc: "Submit high-performance iOS builds satisfying Apple's Human Interface Guidelines.",
              status: "planned",
              details: [
                "Prepare complete mock credentials, testing profile, and screen recordings showing active features.",
                "Deploy Apple Privacy manifest documenting strict diagnostic and telemetry tracking rules.",
                "Establish direct in-app purchase hooks with Stripe or StoreKit APIs to manage memberships."
              ]
            }
          ]
        }
      ]
    }
  ];

  // Scaling Calculator Logic
  const simulateScalingMetrics = (users: number) => {
    const apiRequestsPerSecond = users * 0.15; // Assumption: 15% active swipe rate
    const recommendK8sPods = Math.ceil(apiRequestsPerSecond / 1200); // 1200 reqs/sec per pod
    const dbWriteIops = users * 0.04; // Swipe/chat writes
    const recommendedRedisCacheGb = Math.ceil((users * 8) / 1024); // 8kb per active session/state
    const estimateBandwidthGbps = (users * 25) / 1000000; // 25Kb per user request
    const pgConnectionsLimit = Math.ceil(users / 1000) * 12;

    return {
      apiRequestsPerSecond: apiRequestsPerSecond.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      recommendK8sPods,
      dbWriteIops: dbWriteIops.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      recommendedRedisCacheGb,
      estimateBandwidthGbps: estimateBandwidthGbps.toFixed(2),
      pgConnectionsLimit: pgConnectionsLimit.toLocaleString()
    };
  };

  const metrics = simulateScalingMetrics(concurrentUsers);

  // Load simulator action
  const runLoadSimulation = () => {
    setIsSimulatingLoad(true);
    setScalingLog([]);
    const lines = [
      "Initializing load test against simulated server cluster...",
      `Configuring user session vectors mimicking ${concurrentUsers.toLocaleString()} concurrent clients...`,
      "Verifying CORS and SSL/TLS cipher handshakes on load balancer nodes...",
      "Injecting swiping and private messaging queries at scale...",
      "Monitoring CPU scaling metric thresholds across horizontal pods...",
      `PgBouncer pool: active transaction recycled dynamically. Max connections: ${metrics.pgConnectionsLimit}.`,
      "HPA trigger: Auto-scaling active containers to handle rapid API spikes.",
      "Stress test successfully compiled. Zero memory leaks detected across standard clusters!"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setScalingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${lines[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setIsSimulatingLoad(false);
      }
    }, 450);
  };

  return (
    <div id="development-roadmap-layout" className="space-y-8 text-left animate-fadeIn">
      
      {/* Roadmap Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs text-rose-500 font-extrabold uppercase tracking-widest">Architectural Blueprints</p>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Scale-to-Millions Development Roadmap</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Review detailed production strategies for scaling the <strong>JustMeet</strong> dating platform to hundreds of thousands of active users. Explore database modeling, peer-to-peer real-time video, machine learning models, and native app delivery pathways.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          {[
            { id: 'phases', label: '1. Phase Milestones', icon: Milestone },
            { id: 'scaling', label: '2. Scale Calculator', icon: Sliders },
            { id: 'architecture', label: '3. System Diagram', icon: Layers },
            { id: 'playbook', label: '4. Playbook Guides', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`roadmap-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none p-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  isTabActive 
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10 scale-[1.01]' 
                    : 'bg-gray-50 text-gray-600 hover:bg-rose-50/20 hover:text-rose-500 border border-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: PHASE MILESTONES PROGRESSION */}
        {activeTab === 'phases' && (
          <motion.div
            key="phases-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Phase Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {phases.map((p) => (
                <button
                  key={p.id}
                  id={`select-phase-btn-${p.id}`}
                  onClick={() => {
                    setSelectedPhase(p.id);
                    setSelectedMilestoneIndex(0);
                  }}
                  className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden ${
                    selectedPhase === p.id 
                      ? 'bg-white border-rose-200 shadow-md ring-2 ring-rose-500/5' 
                      : 'bg-white border-gray-100 hover:border-rose-100'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color}`} />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Phase {p.id}</span>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{p.duration}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{p.title.split(":")[1] || p.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2">{p.tagline}</p>
                </button>
              ))}
            </div>

            {/* Selected Phase Details Panel */}
            {phases.filter(p => p.id === selectedPhase).map((p) => (
              <div key={p.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Milestones Left Panel */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Target Segments</span>
                    <h5 className="font-bold text-xs text-gray-800 leading-relaxed">{p.tagline}</h5>
                  </div>

                  <div className="space-y-2">
                    {p.milestones.map((m, idx) => {
                      const Icon = m.icon;
                      const isMilestoneSelected = selectedMilestoneIndex === idx;
                      return (
                        <button
                          key={idx}
                          id={`milestone-selector-${idx}`}
                          onClick={() => setSelectedMilestoneIndex(idx)}
                          className={`w-full p-4 rounded-2xl flex items-center gap-3 text-left transition-all border ${
                            isMilestoneSelected 
                              ? 'bg-rose-50/30 border-rose-200 text-rose-600' 
                              : 'bg-white border-gray-100 hover:bg-gray-50/50 text-gray-700'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${isMilestoneSelected ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Milestone {idx + 1}</span>
                            <h4 className="font-extrabold text-xs leading-tight">{m.title}</h4>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tasks Right Panel */}
                <div className="lg:col-span-2 bg-white border border-rose-100 rounded-3xl p-6 space-y-6">
                  <div>
                    <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest block">Active Tasks Matrix</span>
                    <h3 className="text-lg font-black text-gray-900 mt-1">
                      {p.milestones[selectedMilestoneIndex]?.title} Blueprint
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {p.milestones[selectedMilestoneIndex]?.tasks.map((t, tid) => (
                      <div key={tid} className="p-5 bg-gray-50/30 border border-gray-100 rounded-2xl space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                          <h4 className="font-extrabold text-xs text-gray-800 flex items-center gap-2">
                            <CheckCircle2 className={`w-4.5 h-4.5 shrink-0 ${
                              t.status === 'completed' ? 'text-emerald-500' :
                              t.status === 'in_progress' ? 'text-amber-500 animate-pulse' : 'text-gray-300'
                            }`} />
                            <span>{t.title}</span>
                          </h4>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                            t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                            t.status === 'in_progress' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {t.status === 'completed' ? 'Fully Configured' :
                             t.status === 'in_progress' ? 'In Active Sprint' : 'Planned'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                          {t.desc}
                        </p>

                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Production Specifications:</span>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-medium text-gray-600">
                            {t.details.map((det, di) => (
                              <li key={di} className="flex items-start gap-1.5 leading-snug">
                                <span className="text-rose-500 select-none">•</span>
                                <span>{det}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </motion.div>
        )}

        {/* VIEW 2: SCALING CALCULATOR */}
        {activeTab === 'scaling' && (
          <motion.div
            key="scaling-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Slider Input Column */}
            <div className="lg:col-span-1 bg-white border border-rose-100 rounded-3xl p-6 space-y-6">
              <div>
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-500" />
                  Target Audience Simulator
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Adjust the slider below to calculate backend specifications, DB connection limits, and pod replicas needed.
                </p>
              </div>

              <div className="space-y-4 py-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-gray-400 uppercase">Simulated Concurrent Users</span>
                  <span className="text-lg font-black text-rose-500 font-mono">{concurrentUsers.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={concurrentUsers}
                  onChange={(e) => setConcurrentUsers(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>10K Users</span>
                  <span>500K Users</span>
                  <span>1M Users (Limit)</span>
                </div>
              </div>

              {/* Quick Actions / Trigger simulated stress tests */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <button
                  id="stress-test-btn"
                  onClick={runLoadSimulation}
                  disabled={isSimulatingLoad}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isSimulatingLoad ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isSimulatingLoad ? 'Injecting stress vectors...' : 'Trigger Virtual Load stress Test'}
                </button>

                {scalingLog.length > 0 && (
                  <div className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[9px] rounded-xl border border-slate-900 space-y-1 max-h-48 overflow-y-auto leading-relaxed select-none">
                    {scalingLog.map((line, idx) => (
                      <p key={idx} className="animate-fadeIn">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estimated System Scaling Output Indicators */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {[
                { 
                  title: "API Ingress Reqs/Sec", 
                  val: `${metrics.apiRequestsPerSecond} RPS`, 
                  desc: "Estimated HTTP request traffic hitting backend gateways during peak swipe activities.",
                  icon: Layers,
                  color: "text-blue-500 bg-blue-50"
                },
                { 
                  title: "Kubernetes Pods Replicas", 
                  val: `${metrics.recommendK8sPods} Nodes`, 
                  desc: "Recommended K8s containers to guarantee stable CPU limits <60% per process.",
                  icon: Users,
                  color: "text-rose-500 bg-rose-50"
                },
                { 
                  title: "PostgreSQL pgBouncer Pool", 
                  val: `${metrics.pgConnectionsLimit} Ports`, 
                  desc: "Maximum recycled connections configured in transactional pooling nodes.",
                  icon: Database,
                  color: "text-emerald-500 bg-emerald-50"
                },
                { 
                  title: "Write Query DB IOPS", 
                  val: `${metrics.dbWriteIops} IOPS`, 
                  desc: "Persistent solid-state write IO operations required for swiping ledger records.",
                  icon: HardDrive,
                  color: "text-amber-500 bg-amber-50"
                },
                { 
                  title: "In-Memory Session Cache", 
                  val: `${metrics.recommendedRedisCacheGb} GB Redis`, 
                  desc: "Recommended distributed memory cache capacity to hold stateless session tokens.",
                  icon: Cpu,
                  color: "text-purple-500 bg-purple-50"
                },
                { 
                  title: "Est. Edge Network Bandwidth", 
                  val: `${metrics.estimateBandwidthGbps} Gbps`, 
                  desc: "Throughput capacity needed across content delivery network edge routers.",
                  icon: Globe,
                  color: "text-cyan-500 bg-cyan-50"
                }
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="bg-white border border-rose-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">{m.title}</span>
                        <h4 className="font-black text-xl text-slate-900 tracking-tight">{m.val}</h4>
                      </div>
                      <div className={`p-2 rounded-xl ${m.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-normal font-semibold border-t border-gray-50 pt-2.5">
                      {m.desc}
                    </p>
                  </div>
                );
              })}

            </div>
          </motion.div>
        )}

        {/* VIEW 3: SYSTEM ARCHITECTURE DIAGRAM */}
        {activeTab === 'architecture' && (
          <motion.div
            key="arch-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-rose-100 rounded-3xl p-6 space-y-6"
          >
            <div>
              <h4 className="text-sm font-black text-gray-900">Distributed Scalable System Architecture</h4>
              <p className="text-xs text-gray-500 mt-1">
                Visual flow tracking how native iOS/Android nodes route requests safely through reverse proxies to database replicas.
              </p>
            </div>

            {/* Interactive Flow Diagram Visualizer */}
            <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-6 overflow-x-auto">
              <div className="min-w-[640px] flex flex-col items-center gap-6 font-mono text-xs text-center">
                
                {/* Layer 1: Client Layers */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                  <div className="p-3 bg-white border border-rose-100 rounded-xl shadow-sm text-gray-700 font-bold">
                    <Smartphone className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                    <span>iOS App (SwiftUI)</span>
                  </div>
                  <div className="p-3 bg-white border border-rose-100 rounded-xl shadow-sm text-gray-700 font-bold">
                    <Smartphone className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <span>Android App (Compose)</span>
                  </div>
                  <div className="p-3 bg-white border border-rose-100 rounded-xl shadow-sm text-gray-700 font-bold">
                    <Globe className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <span>Web Client (Next.js)</span>
                  </div>
                </div>

                <div className="text-gray-300 font-black">↓ SSL/TLS HTTPs Tunnels</div>

                {/* Layer 2: CDN & Load Balancing Ingress */}
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl w-full max-w-xl shadow-md border border-slate-800">
                  <div className="font-extrabold text-[11px] text-rose-400 mb-1">CLOUDFLARE CDN / EDGE LOGIC</div>
                  <p className="text-[10px] text-slate-300">Anycast DNS Routing • SSL Handshakes • HSTS Header Injector • Ingress WAF Protection</p>
                </div>

                <div className="text-gray-300 font-black">↓ High-speed TCP socket forwarding</div>

                {/* Layer 3: API Gateway & Service Pods */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="font-extrabold text-xs text-slate-800 mb-1">K8S Node.js Pod cluster</div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Stateless REST API controller layers processing JWT authentications & rate filters.</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="font-extrabold text-xs text-slate-800 mb-1">STUN / TURN Relays</div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Coturn media handlers mapping Ice Candidates for peer-to-peer video streams.</p>
                  </div>
                </div>

                <div className="text-gray-300 font-black">↓ PgBouncer Multiplexing</div>

                {/* Layer 4: Storage Cluster Layers */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl shadow-sm">
                    <div className="font-extrabold text-xs text-rose-800 mb-1">Redis Sentinel</div>
                    <p className="text-[9px] text-rose-600">Active session tokens & fast rate counters.</p>
                  </div>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm">
                    <div className="font-extrabold text-xs text-emerald-800 mb-1">PostgreSQL Master</div>
                    <p className="text-[9px] text-emerald-600">Write transaction queries & primary schemas.</p>
                  </div>
                  <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                    <div className="font-extrabold text-xs text-blue-800 mb-1">Postgres Replicas</div>
                    <p className="text-[9px] text-blue-600">Heavy query lookup and geo-distributed read scans.</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: PLAYBOOK GUIDES */}
        {activeTab === 'playbook' && (
          <motion.div
            key="guides-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn"
          >
            {/* Guide 1: Mobile publishing guide */}
            <div className="bg-white border border-rose-100 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500 text-white rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">App Publishing Playbook</span>
                  <h4 className="font-extrabold text-sm text-gray-900">App Store & Play Store Compliance</h4>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-gray-600 leading-relaxed font-semibold">
                <p>
                  Deploying to Apple App Store and Google Play Console requires strict compliance checks around dating platform safety. Follow this release validation script:
                </p>

                <div className="space-y-2 border-l-2 border-rose-100 pl-4">
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs">UGC (User Generated Content) Policy</h5>
                    <p className="text-[11px] text-gray-500 leading-normal">You must provide an easy, one-click block & report profile mechanism alongside daily moderator queues.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs">Account Portability Rights</h5>
                    <p className="text-[11px] text-gray-500 leading-normal">Apps must possess a prominent, user-accessible link to delete accounts and scrub databases per GDPR Article 17 protocols.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs">Sandbox Credentials for App Reviewers</h5>
                    <p className="text-[11px] text-gray-500 leading-normal">Provide mock cards, pre-configured swipe paths, and active chat loops for Apple inspectors to complete audits smoothly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guide 2: AI Embeddings Tuning guide */}
            <div className="bg-white border border-rose-100 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Artificial Intelligence Playbook</span>
                  <h4 className="font-extrabold text-sm text-gray-900">Embedding Vector Match Tuning</h4>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-gray-600 leading-relaxed font-semibold">
                <p>
                  Our match engine generates dimensional similarity scores rather than simple keyword matches. This ensures high compatibilities:
                </p>

                <div className="space-y-2 border-l-2 border-slate-900 pl-4">
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs">Cosine Vector Calculation</h5>
                    <p className="text-[11px] text-gray-500 leading-normal">Profiles are projected in high-dimensional vector spaces. Compatibility is computed via dot products yielding fast cosine percentages.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs">Collaborative Behavior Reinforcement</h5>
                    <p className="text-[11px] text-gray-500 leading-normal">If a user consistently likes profiles tagged with specific interests (e.g. Hiking, Fitness), vector distances on those tags compress dynamically.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs">Proximity Filtering Weights</h5>
                    <p className="text-[11px] text-gray-500 leading-normal">Scale vector scores based on real geographical coordinate distances. Matches further than 50km suffer automatic penalty metrics.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
