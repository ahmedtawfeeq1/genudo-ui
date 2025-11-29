// MagicPipelinePage.tsx — numbered stages + two‑line descriptions
import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* ===================== Types ===================== */
interface Agent { name: string; persona: string }
interface PipelineData { pipelineName: string; pipelineDescription: string }
interface StageData   { order: number; stageName: string; description: string; badge?: 'WON'|'LOST' }
interface AgentData   { agent: Agent }

/* ===================== Nodes ===================== */
const PipelineNode = ({ data }: { data: PipelineData }) => (
  <div className="relative w-[520px] bg-indigo-50 border-2 border-indigo-400 rounded-xl shadow px-8 py-5 text-center">
    <h2 className="font-bold text-indigo-900 text-xl leading-snug">
      {data.pipelineName}
    </h2>
    <p className="text-indigo-700 text-sm leading-snug whitespace-pre-line">
      {data.pipelineDescription}
    </p>
    <Handle type="source" position={Position.Bottom} id="pipeline-out" style={{ opacity: 0 }} />
  </div>
);

const StageNode = ({ data }: { data: StageData }) => (
  <div className="relative w-[230px] bg-white border border-gray-300 rounded-lg shadow px-5 py-3 text-center">
    {/* numeric badge */}
    <span className="absolute -left-4 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
      {data.order}
    </span>
    {/* status badge */}
    {data.badge && (
      <span className={`absolute -right-2 -top-2 text-white text-[10px] px-2 py-0.5 rounded-full shadow ${data.badge==='WON'?'bg-green-600':'bg-red-500'}`}>{data.badge}</span>
    )}
    <h3 className="font-semibold text-gray-800 text-sm leading-snug">{data.stageName}</h3>
    <p className="text-gray-500 text-xs leading-snug whitespace-pre-line">{data.description}</p>
    <Handle type="target" position={Position.Top}    id="stage-in"  style={{ opacity: 0 }} />
    <Handle type="source" position={Position.Bottom} id="stage-out" style={{ opacity: 0 }} />
    <Handle type="source" position={Position.Right}  id="to-agent" style={{ opacity: 0 }} />
  </div>
);

const AgentNode = ({ data }: { data: AgentData }) => (
  <div className="relative w-[200px] bg-gray-50 border border-gray-300 rounded-md shadow-inner p-3 text-xs">
    <div className="font-semibold text-gray-900 text-sm leading-snug">{data.agent.name}</div>
    <div className="text-gray-600 leading-snug whitespace-pre-line">{data.agent.persona}</div>
    <Handle type="target" position={Position.Left} id="agent-in" style={{ opacity: 0 }} />
  </div>
);

/* ===================== Data ===================== */
const stageDefs = [
    { id: 'signup',     name: 'Signup',            desc: 'User created a free trial account.\nNo onboarding yet.' },
    { id: 'onboarding', name: 'Onboarding Started',desc: 'User accessed onboarding tutorial.\nStarted setup journey.' },
    { id: 'active',     name: 'First Activity',     desc: 'User engaged with a core feature.\nInitial value delivered.' },
    { id: 'feedback',   name: 'Gave Feedback',      desc: 'Submitted product feedback.\nIndicates active usage.' },
    { id: 'upgrade',    name: 'Upgrade Prompted',   desc: 'Received upgrade email or message.\nDecision point reached.' },
    { id: 'converted',  name: 'Converted to Paid',  desc: 'User completed upgrade.\nActivated subscription.', badge: 'WON' as const },
    { id: 'churned',    name: 'Churned',            desc: 'Did not convert within trial period.\nTrial expired.', badge: 'LOST' as const },
    { id: 'closed',     name: 'Closed',             desc: 'User closed account.\nNo conversion.', badge: 'LOST' as const },
  ];
  

  const agentMap: Record<string, Agent> = {
    signup:     { name: 'Aria',  persona: 'Signup Tracker.\nCaptures user metadata.' },
    onboarding: { name: 'Bento', persona: 'Onboarding Assistant.\nGuides through setup steps.' },
    active:     { name: 'Clio',  persona: 'Feature Usage Analyst.\nMonitors first actions.' },
    feedback:   { name: 'Dex',   persona: 'Feedback Collector.\nSurfaces user insights.' },
    upgrade:    { name: 'Ivy',   persona: 'Upgrade Advisor.\nDelivers personalized plans.' },
    converted:  { name: 'Nico',  persona: 'Billing Manager.\nHandles paid activation.' },
    churned:    { name: 'Vee',   persona: 'Re‑engagement Bot.\nTriggers retry campaigns.' },
    closed:     { name: 'Zoe',   persona: 'Sales Manager.\nManages closed deals.' },
  };
  

/* ===================== Build nodes & edges ===================== */
const stageX = 50, agentX = 400, startY = 150, gap = 130;

const initialNodes: Node[] = [
  {
    id: 'pipeline', type: 'pipeline', position: { x: stageX, y: 20 },
    data: { pipelineName: 'LoopX AI Sales Pipeline', pipelineDescription: 'Automated multi‑agent funnel.\nTurn leads into customers.' },
  },
  ...stageDefs.map((s, idx) => ({
    id: s.id, type: 'stage', position: { x: stageX, y: startY + idx * gap },
    data: { order: idx + 1, stageName: s.name, description: s.desc, badge: s.badge },
  })),
  ...stageDefs.map((s, idx) => ({
    id: `agent-${s.id}`, type: 'agent', position: { x: agentX, y: startY + idx * gap },
    data: { agent: agentMap[s.id] },
  })),
];

const edgeStyle = { stroke: '#64748b', strokeDasharray: 5, strokeWidth: 1.5 } as const;

const initialEdges: Edge[] = [
  { id: 'p-new', source: 'pipeline', target: 'new', animated: true, type: 'smoothstep', style: edgeStyle },
  ...stageDefs.slice(0, -1).map((s, i) => ({ id: `v-${s.id}-${stageDefs[i+1].id}`, source: s.id, target: stageDefs[i+1].id, animated: true, type: 'smoothstep', style: edgeStyle })),
  ...stageDefs.map((s) => ({ id: `h-${s.id}`, source: s.id, target: `agent-${s.id}`, animated: true, type: 'smoothstep', style: edgeStyle })),
];

/* ===================== Main Component ===================== */
export default function MagicPipelinePage(){
  const [input,setInput]=useState('');
  const [msgs,setMsgs]=useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((c: Connection) => setEdges((eds)=>addEdge({ ...c, style: edgeStyle, type:'smoothstep' }, eds)), []);
  const nodeTypes = useMemo(()=>({ pipeline:PipelineNode, stage:StageNode, agent:AgentNode }),[]);

  return(
    <div className="flex h-screen">
      {/* Chat */}
      <div className="w-1/3 border-r border-gray-300 p-4 flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto space-y-2">
          {msgs.length===0?(
            <p className="text-center text-gray-500 mt-20">Your sales pipeline appears here!<br/>Ask Nase7 to build it for you.</p>
          ):msgs.map((m,i)=>(<div key={i} className="bg-indigo-100 p-2 rounded w-fit">{m}</div>))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask Nase7…" className="flex-1 border px-3 py-2 rounded" />
          <button onClick={()=>{ if(input){setMsgs(m=>[...m,input]); setInput('');} }} className="bg-indigo-600 text-white px-4 rounded">Send</button>
        </div>
      </div>

      {/* Flow */}
      <div className="w-2/3 h-full">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
          <MiniMap/><Controls/>
          <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
        </ReactFlow>
      </div>
    </div>
  );
}
