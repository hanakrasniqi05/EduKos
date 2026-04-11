import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  number: string;
  label: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className="relative group p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-xl flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div> 
      <h3 className="text-5xl font-bold text-gray-900 mb-2 tabular-nums">
        {number}
      </h3>
      <p className="text-gray-600 font-medium text-center uppercase tracking-wider text-sm">
        {label}
      </p>
    </motion.div>
  );
};

const HomeStats: React.FC = () => {
  const stats = [
    { number: "42", label: "Shkolla të regjistruara", delay: 0.1 },
    { number: "150+", label: "Programe studimore", delay: 0.2 },
    { number: "10k+", label: "Përdorues aktivë", delay: 0.3 },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              number={stat.number} 
              label={stat.label} 
              delay={stat.delay} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStats;