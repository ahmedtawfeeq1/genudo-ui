
import React from "react";
import { Globe, Link } from "lucide-react";

// Utility functions for dashboard calculations

// Colors for charts and graphs
export const COLORS = {
  primary: "#6c5ce7",
  primaryLight: "#a29bfe",
  primaryDark: "#483D8B",
  secondary: "#9b87f5", 
  accent: "#7E69AB",
  accent2: "#8B5CF6"
};

export const PIE_COLORS = ["#6c5ce7", "#8B5CF6", "#a29bfe", "#7E69AB"];
export const RING_COLORS = ["#6c5ce7", "#9b87f5", "#a29bfe", "#7E69AB", "#D6BCFA"];
export const BAR_COLORS = {
  conversations: "#6c5ce7",
  clients: "#8B5CF6",
  users: "#7E69AB",
};

export const generateSparklineData = (data: any[], key: string) => {
  return data.map(item => ({
    value: item[key]
  }));
};

export const calculateMetricData = (data: any[], keys: string[]) => {
  const total = data.reduce((acc, item) => {
    let sum = 0;
    keys.forEach(key => {
      if (item[key]) sum += item[key];
    });
    return acc + sum;
  }, 0);
  
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);
  
  const firstHalfTotal = firstHalf.reduce((acc, item) => {
    let sum = 0;
    keys.forEach(key => {
      if (item[key]) sum += item[key];
    });
    return acc + sum;
  }, 0);
  
  const secondHalfTotal = secondHalf.reduce((acc, item) => {
    let sum = 0;
    keys.forEach(key => {
      if (item[key]) sum += item[key];
    });
    return acc + sum;
  }, 0);
  
  const trendPercentage = firstHalfTotal > 0 
    ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 
    : 0;
  
  return {
    total: Math.round(total),
    trend: {
      value: Math.abs(Math.round(trendPercentage)),
      isPositive: trendPercentage >= 0
    }
  };
};

export const formatDollarValue = (value: number) => `$${value.toLocaleString()}`;
export const formatNumberValue = (value: number) => value.toLocaleString();

export const RADIAN = Math.PI / 180;
export const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
