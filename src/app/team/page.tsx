'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Globe } from 'lucide-react';

export default function TeamPage() {
  const team = [
    {
      name: 'John Smith',
      role: 'Executive Chef & Culinary Advisor',
      desc: 'Expert culinary strategist with 15+ years of experience managing high-volume mobile street kitchens.',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sarah Johnson',
      role: 'Food Safety & Quality Lead',
      desc: 'Ensuring every listed stall meets rigorous Brooklyn street safety regulations and hygiene standards.',
      avatar: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Michael Brown',
      role: 'Operations & Logistics Manager',
      desc: 'Pioneering quick-fulfillment routes and local carrier integrations to deliver street food hot.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Emily Davis',
      role: 'Blogger Relations Manager',
      desc: 'Coordinating local video review uploads and Cloudinary storage pipeline with street food critics.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'David Wilson',
      role: 'Vendor Onboarding Specialist',
      desc: 'Empowering local street carts to digitize their menus and accept secure payments effortlessly.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jessica Taylor',
      role: 'Customer Support Lead',
      desc: 'Working 24/7 to solve delivery queries and maintain outstanding service quality scores.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    }
  ];

  return (
    <div className="w-full py-6 text-foreground">
      <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
        <span className="text-xs text-gold font-black uppercase tracking-wider">Our Services</span>
        <h1 className="text-3xl sm:text-5xl font-black font-outfit">All Star Talent</h1>
        <p className="text-xs text-brand-gray font-semibold leading-relaxed">
          No matter the project, our team can handle it. Meet the professionals behind Vrooklyn Street Food.
        </p>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {team.map((member, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[32px] p-5 text-center flex flex-col items-center space-y-4 hover:shadow-lg transition-shadow group"
          >
            {/* Avatar container */}
            <div className="w-32 h-32 rounded-3xl overflow-hidden relative bg-neutral-100 shadow border border-neutral-200/20">
              <img 
                src={member.avatar} 
                alt={member.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 w-7 h-7 bg-gold text-brand-black rounded-xl flex items-center justify-center">
                <ChefHat size={14} />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-sm text-foreground">{member.name}</h3>
              <p className="text-[10px] text-gold font-black uppercase tracking-wide">{member.role}</p>
              <p className="text-[11px] text-brand-gray font-medium leading-relaxed max-w-[200px] mx-auto">
                {member.desc}
              </p>
            </div>

            {/* Social Icons (using inline SVGs for compatibility) */}
            <div className="flex gap-3 text-neutral-450 dark:text-neutral-500 pt-2 items-center">
              <a href="#" className="hover:text-gold transition-colors" title="Twitter">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-gold transition-colors" title="LinkedIn">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-gold transition-colors" title="GitHub">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
