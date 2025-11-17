import React from 'react';
import { motion } from 'motion/react';
import { TrendingDown, TrendingUp, LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  bgColor: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  trend = 'down',
  icon: Icon,
  color,
  bgColor,
  loading = false,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className={`border-0 shadow-lg ${bgColor} overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                {loading ? (
                  <div className="h-8 w-32 bg-gray-300 rounded animate-pulse" />
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {value}
                    </h3>
                    {change && (
                      <span
                        className={`text-sm font-semibold flex items-center gap-1 ${
                          trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {change}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {!loading && (
              <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
