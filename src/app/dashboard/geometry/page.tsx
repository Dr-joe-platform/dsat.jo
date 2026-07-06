'use client';

import React, { useState } from 'react';
import { GeometryVisualizer } from '@/components/geometry/GeometryVisualizer';
import { Box, Cylinder, Circle, Cone, TriangleRight } from 'lucide-react';

export default function GeometryShowcasePage() {
  const [selectedShape, setSelectedShape] = useState<'cube' | 'cylinder' | 'sphere' | 'cone' | 'pyramid'>('cylinder');
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Box className="text-indigo-600" /> Interactive 3D Geometry
          </h1>
          <p className="text-slate-500">Visualize complex SAT math shapes in full 3D space.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 select-none">
            <input 
              type="checkbox" 
              checked={wireframe} 
              onChange={(e) => setWireframe(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            X-Ray (Wireframe) Mode
          </label>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar Controls */}
        <div className="w-64 flex flex-col gap-3">
          <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-xs mb-2">Select Shape</h3>
          
          <button onClick={() => setSelectedShape('cylinder')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${selectedShape === 'cylinder' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'}`}>
            <Cylinder size={20} /> Cylinder
          </button>
          
          <button onClick={() => setSelectedShape('cone')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${selectedShape === 'cone' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'}`}>
            <Cone size={20} /> Cone
          </button>
          
          <button onClick={() => setSelectedShape('cube')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${selectedShape === 'cube' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'}`}>
            <Box size={20} /> Cube
          </button>
          
          <button onClick={() => setSelectedShape('sphere')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${selectedShape === 'sphere' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'}`}>
            <Circle size={20} /> Sphere
          </button>

          <button onClick={() => setSelectedShape('pyramid')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${selectedShape === 'pyramid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'}`}>
            <TriangleRight size={20} /> Pyramid
          </button>
        </div>

        {/* 3D Canvas Area */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
          <GeometryVisualizer shape={selectedShape} wireframe={wireframe} />
        </div>
      </div>
    </div>
  );
}
