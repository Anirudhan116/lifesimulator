'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Component to display glassmorphic card style
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className={`p-4 rounded-xl border glass-card text-left max-w-[200px] ${
      data.active ? 'border-cyber-cyan shadow-[0_0_12px_rgba(0,240,255,0.2)]' : 'border-white/5'
    }`}>
      {data.active && (
        <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-cyber-cyan" />
      )}
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${data.active ? 'bg-cyber-cyan' : 'bg-slate-600'}`}></span>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{data.category}</span>
      </div>
      <h5 className="text-xs font-bold text-slate-100">{data.label}</h5>
      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">{data.description}</p>
      {data.impact && (
        <div className="mt-2 text-[9px] font-mono text-cyber-cyan bg-cyber-cyan/5 px-1.5 py-0.5 rounded inline-block">
          {data.impact}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-cyber-cyan" />
    </div>
  );
};

interface DecisionTreeProps {
  activeScenarios: string[];
}

export default function DecisionTree({ activeScenarios }: DecisionTreeProps) {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Determine which paths are highlighted as active
  const isHighSalaryActive = activeScenarios.includes('sc-high-salary');
  const isEduActive = activeScenarios.includes('sc-higher-studies');
  const isStartupActive = activeScenarios.includes('sc-startup');
  const isInvestActive = activeScenarios.includes('sc-aggressive-investing');
  const isFreelanceActive = activeScenarios.includes('sc-freelance');

  // Generate nodes
  const initialNodes: Node[] = [
    {
      id: 'root',
      type: 'custom',
      position: { x: 50, y: 150 },
      data: {
        category: 'Root Profile',
        label: 'Baseline (Age 24)',
        description: 'Software Engineer in Bangalore earning ₹85k/month.',
        active: true,
      },
    },
    // Upper Branch: Education
    {
      id: 'edu-path',
      type: 'custom',
      position: { x: 300, y: 30 },
      data: {
        category: 'Education Path',
        label: 'MBA/Post-Grad',
        description: 'Take educational loan of ₹16L. Studies for 2 years.',
        impact: 'Debt + ₹16L, Income = 0',
        active: isEduActive,
      },
    },
    {
      id: 'edu-post',
      type: 'custom',
      position: { x: 550, y: 30 },
      data: {
        category: 'Post-Grad Job',
        label: 'MNC Product Lead',
        description: 'Land leadership role with massive salary gain.',
        impact: 'Income + ₹90k, High Growth',
        active: isEduActive,
      },
    },
    // Middle Branch: Corporate & Freelance
    {
      id: 'corp-path',
      type: 'custom',
      position: { x: 300, y: 180 },
      data: {
        category: 'Job Branch',
        label: 'High Salary Shift',
        description: 'Take high-paying stress corporate job or stay.',
        impact: isHighSalaryActive ? 'Income + ₹65k, Stress + 25' : 'Income ₹85k (Base)',
        active: isHighSalaryActive || (!isEduActive && !isStartupActive),
      },
    },
    {
      id: 'freelance-path',
      type: 'custom',
      position: { x: 550, y: 180 },
      data: {
        category: 'Side Hustle',
        label: 'Freelancing Gig',
        description: 'Take part-time client projects on weekends.',
        impact: isFreelanceActive ? 'Income + ₹25k, Stress + 10' : 'None',
        active: (isHighSalaryActive || (!isEduActive && !isStartupActive)) && isFreelanceActive,
      },
    },
    // Lower Branch: Startup
    {
      id: 'startup-path',
      type: 'custom',
      position: { x: 300, y: 330 },
      data: {
        category: 'Startup Branch',
        label: 'FinTech Startup',
        description: 'Bootstrap bootstrap for 3 years, drop current salary.',
        impact: 'Income - ₹45k, Stress + 45',
        active: isStartupActive,
      },
    },
    {
      id: 'startup-scale',
      type: 'custom',
      position: { x: 550, y: 330 },
      data: {
        category: 'Startup Scale',
        label: 'VC Funding / Exit',
        description: 'Secure funding or achieve growth exit after 3-5 years.',
        impact: 'Net Worth +++ (95% Potential)',
        active: isStartupActive,
      },
    },
  ];

  // Connect edges
  const initialEdges: Edge[] = [
    // Edges from Root to Branches
    {
      id: 'r-edu',
      source: 'root',
      target: 'edu-path',
      animated: isEduActive,
      style: { stroke: isEduActive ? '#00f0ff' : '#334155', strokeWidth: isEduActive ? 2 : 1 },
    },
    {
      id: 'r-corp',
      source: 'root',
      target: 'corp-path',
      animated: isHighSalaryActive || (!isEduActive && !isStartupActive),
      style: {
        stroke: (isHighSalaryActive || (!isEduActive && !isStartupActive)) ? '#00f0ff' : '#334155',
        strokeWidth: (isHighSalaryActive || (!isEduActive && !isStartupActive)) ? 2 : 1,
      },
    },
    {
      id: 'r-startup',
      source: 'root',
      target: 'startup-path',
      animated: isStartupActive,
      style: { stroke: isStartupActive ? '#00f0ff' : '#334155', strokeWidth: isStartupActive ? 2 : 1 },
    },
    // Second-tier connections
    {
      id: 'e-post',
      source: 'edu-path',
      target: 'edu-post',
      animated: isEduActive,
      style: { stroke: isEduActive ? '#00f0ff' : '#334155', strokeWidth: isEduActive ? 2 : 1 },
    },
    {
      id: 'c-free',
      source: 'corp-path',
      target: 'freelance-path',
      animated: isFreelanceActive && (isHighSalaryActive || (!isEduActive && !isStartupActive)),
      style: {
        stroke: (isFreelanceActive && (isHighSalaryActive || (!isEduActive && !isStartupActive))) ? '#00f0ff' : '#334155',
        strokeWidth: (isFreelanceActive && (isHighSalaryActive || (!isEduActive && !isStartupActive))) ? 2 : 1,
      },
    },
    {
      id: 's-scale',
      source: 'startup-path',
      target: 'startup-scale',
      animated: isStartupActive,
      style: { stroke: isStartupActive ? '#00f0ff' : '#334155', strokeWidth: isStartupActive ? 2 : 1 },
    },
  ];

  return (
    <div className="w-full h-[400px] border border-white/5 rounded-2xl bg-[#060417]/80 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping"></span>
          Interactive Decision Tree Map
        </span>
      </div>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        className="text-slate-100"
      >
        <Background gap={16} size={1} color="rgba(255, 255, 255, 0.05)" />
        <Controls className="!bg-slate-900 !border-white/5 !text-slate-100 [&_button]:!bg-slate-950 [&_button]:!text-slate-400 [&_button]:!border-white/5" />
        <MiniMap 
          nodeColor={(n) => (n.data?.active ? 'rgba(0, 240, 255, 0.5)' : '#1e293b')} 
          maskColor="rgba(3, 0, 20, 0.7)" 
          className="!bg-slate-950 !border-white/5 !rounded-lg"
          style={{ width: 100, height: 75 }}
        />
      </ReactFlow>
    </div>
  );
}
