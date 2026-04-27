'use client';

import React from 'react';

export interface IndicatorRow {
  name: string;
  value: string;
  action:
    | 'Buy'
    | 'Sell'
    | 'Neutral'
    | 'Strong Buy'
    | 'Strong Sell'
    | 'Overbought'
    | 'Oversold';
}

interface IndicatorTableProps {
  title: string;
  rows: IndicatorRow[];
  summary: { buy: number; neutral: number; sell: number };
}

const ACTION_COLOR: Record<string, string> = {
  Buy: '#2962FF',
  'Strong Buy': '#2962FF',
  Sell: '#F23645',
  'Strong Sell': '#F23645',
  Overbought: '#F23645',
  Oversold: '#26A69A',
  Neutral: '#787B86',
};

const IndicatorTable: React.FC<IndicatorTableProps> = ({ title, rows }) => (
  <div>
    {/* Header */}
    <h4 className="text-sm font-semibold text-[#131722] mb-3">{title} &rsaquo;</h4>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#E0E3EB]">
            <th className="text-[11px] text-[#787B86] uppercase font-medium px-0 py-2 pr-4">Name</th>
            <th className="text-[11px] text-[#787B86] uppercase font-medium px-0 py-2 pr-4">Value</th>
            <th className="text-[11px] text-[#787B86] uppercase font-medium px-0 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.name}
              className="border-b border-[#F0F3FA] hover:bg-[#F8F9FD] transition-colors"
              style={{
                animation: `fadeInRow 0.3s ease ${i * 50}ms forwards`,
                opacity: 0,
              }}
            >
              <td className="py-2.5 pr-4 text-[13px] text-[#131722]">{row.name}</td>
              <td className="py-2.5 pr-4 text-[13px] text-[#131722] font-mono">
                {row.value}
              </td>
              <td className="py-2.5">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: ACTION_COLOR[row.action] || '#787B86' }}
                >
                  {row.action}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default IndicatorTable;
