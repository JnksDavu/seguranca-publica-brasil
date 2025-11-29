import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  loading = false,
}: StatCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card style={{ backgroundColor: bgColor }} className="border-0 shadow-lg overflow-hidden relative">
          <CardContent className="p-6 relative z-10 min-h-[96px]">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {loading ? '' : value}
                  </h3>
                </div>
              </div>

              {!loading && (
                <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              )}
            </div>
          </CardContent>
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm pointer-events-none">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
      </Card>
    </motion.div>
  );
}

