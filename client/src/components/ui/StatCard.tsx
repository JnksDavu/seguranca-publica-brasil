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
    <motion.div
      whileHover={{ scale: loading ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className="border-0 shadow-lg overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            
            {/* ESQUERDA: título + valor */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>

              <div className="flex items-baseline gap-2">
                {loading ? (
                  <span className="text-base text-blue-600 animate-pulse">
                    Carregando...
                  </span>
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900">
                    {value}
                  </h3>
                )}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
