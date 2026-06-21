'use client';

import React, { useState } from 'react';
import { useApp, Stall, Food, Review, Complaint, Profile } from '@/context/AppContext';
import { ArrowLeft, ShieldAlert, Check, Ban, Trash2, UserCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminView() {
  const { 
    stalls, 
    foods, 
    reviews, 
    complaints, 
    profiles, 
    approveVendor, 
    suspendVendor, 
    deleteVendor, 
    blockUser, 
    unblockUser, 
    resolveComplaint,
    deleteFood,
    deleteReview
  } = useApp();
  
  const router = useRouter();
  const [adminTab, setAdminTab] = useState<'approvals' | 'moderation' | 'users' | 'complaints' | 'reports'>('approvals');

  // Statistics
  const totalUsers = profiles.length;
  const totalVendors = stalls.length;
  const totalFoods = foods.length;
  const totalReviews = reviews.length;
  const pendingApprovals = stalls.filter(s => s.status === 'pending');
  const activeComplaints = complaints.filter(c => c.status === 'pending');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-foreground animate-fade-in print:p-0">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button 
          onClick={() => router.push('/auth')}
          className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>Back to Profile</span>
        </button>
        <h1 className="text-2xl font-black font-outfit text-foreground flex items-center gap-2">
          <ShieldAlert size={24} className="text-gold" />
          <span>Admin Moderation Console</span>
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 print:hidden">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] text-brand-gray font-black uppercase">Total Accounts</span>
          <h4 className="text-2xl font-black text-foreground mt-1">{totalUsers}</h4>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] text-brand-gray font-black uppercase">Total Food Stalls</span>
          <h4 className="text-2xl font-black text-foreground mt-1">{totalVendors}</h4>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] text-brand-gray font-black uppercase">Pending Approvals</span>
          <h4 className="text-2xl font-black text-amber-500 mt-1">{pendingApprovals.length}</h4>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] text-brand-gray font-black uppercase">Active Complaints</span>
          <h4 className="text-2xl font-black text-brand-firebrick mt-1">{activeComplaints.length}</h4>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-6 mb-6 border-b border-neutral-105 dark:border-neutral-805 pb-px text-xs font-black uppercase tracking-wider print:hidden">
        {(['approvals', 'moderation', 'users', 'complaints', 'reports'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`pb-3 relative transition-colors ${adminTab === tab ? 'text-gold' : 'text-brand-gray hover:text-foreground'}`}
          >
            {tab === 'approvals' ? 'Stall Approvals' : tab === 'moderation' ? 'Content Moderation' : tab === 'users' ? 'User Accounts' : tab === 'complaints' ? 'Complaints Board' : 'Performance Reports'}
            {adminTab === tab && (
              <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Tabs content rendering */}
      {adminTab === 'approvals' ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold font-outfit text-foreground">Pending Vendor Applications</h3>
          
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-4">
            {stalls.map(stall => {
              const statusColors = {
                pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                approved: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                suspended: 'bg-red-500/10 text-red-500 border border-red-500/20',
                closed: 'bg-neutral-500/10 text-neutral-450 border border-neutral-500/20'
              };

              return (
                <div key={stall.id} className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground text-sm">{stall.name}</span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[stall.status]}`}>
                        {stall.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-brand-gray font-semibold">Tagline: {stall.title}</p>
                    <p className="text-[10px] text-neutral-450">Location: {stall.area} ({stall.lat}, {stall.lng})</p>
                  </div>

                  <div className="flex gap-2">
                    {stall.status === 'pending' && (
                      <button 
                        onClick={async () => {
                          await approveVendor(stall.id);
                          alert(`✓ Stall "${stall.name}" has been approved!`);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider text-[9px] flex items-center gap-1 shadow-sm"
                      >
                        <Check size={11} /> Approve
                      </button>
                    )}
                    {stall.status === 'approved' && (
                      <button 
                        onClick={async () => {
                          await suspendVendor(stall.id);
                          alert(`✓ Stall "${stall.name}" suspended.`);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider text-[9px] flex items-center gap-1 shadow-sm"
                      >
                        <Ban size={11} /> Suspend
                      </button>
                    )}
                    {stall.status === 'suspended' && (
                      <button 
                        onClick={async () => {
                          await approveVendor(stall.id);
                          alert(`✓ Stall "${stall.name}" unsuspended.`);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider text-[9px] flex items-center gap-1 shadow-sm"
                      >
                        <UserCheck size={11} /> Reactivate
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        if (confirm('Delete this stall permanently?')) {
                          await deleteVendor(stall.id);
                          alert('Stall deleted.');
                        }
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : adminTab === 'moderation' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Foods list */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-outfit text-foreground">Menu Postings Moderation</h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar text-xs">
              {foods.map(food => (
                <div key={food.id} className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-3">
                    <img src={food.cover_pic} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <span className="font-black text-foreground block">{food.name}</span>
                      <span className="text-[8px] text-brand-gray font-bold uppercase block">${food.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (confirm('Flag & Delete this food listing?')) {
                        await deleteFood(food.id);
                        alert('Dish deleted.');
                      }
                    }}
                    className="text-red-500 hover:text-red-600 font-black text-[10px]"
                  >
                    Delete Post
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-outfit text-foreground">Customer Reviews Moderation</h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar text-xs">
              {reviews.map(r => (
                <div key={r.id} className="py-2.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-foreground">{r.user_name || 'Anonymous'}</span>
                    <button 
                      onClick={async () => {
                        if (confirm('Delete this review?')) {
                          await deleteReview(r.id);
                          alert('Review deleted.');
                        }
                      }}
                      className="text-red-500 text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-brand-gray leading-normal">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : adminTab === 'users' ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold font-outfit text-foreground">Registered User Profiles</h3>
          
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-3">
            {profiles.map(p => (
              <div key={p.id} className="flex justify-between items-center py-3 text-xs">
                <div>
                  <span className="font-extrabold text-foreground block">{p.full_name}</span>
                  <span className="text-[10px] text-brand-gray">{p.email} • Role: {p.role}</span>
                </div>

                <div>
                  {p.blocked ? (
                    <button 
                      onClick={async () => {
                        await unblockUser(p.email);
                        alert(`User ${p.full_name} unblocked.`);
                      }}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-xl text-[9px] font-black uppercase"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button 
                      onClick={async () => {
                        await blockUser(p.email);
                        alert(`User ${p.full_name} blocked.`);
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1 rounded-xl text-[9px] font-black uppercase"
                    >
                      Block User
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : adminTab === 'complaints' ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold font-outfit text-foreground flex items-center gap-1.5">
            <ShieldAlert className="text-brand-firebrick" size={16} />
            <span>Customer Complaints Escalations</span>
          </h3>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-4">
            {complaints.length === 0 ? (
              <p className="text-xs text-brand-gray font-bold text-center py-6">No complaints reported.</p>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="py-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-brand-firebrick uppercase text-[9px] tracking-wider block">Escalation log</span>
                      <h4 className="font-extrabold text-foreground text-sm mt-0.5">Stall: {c.stall_name}</h4>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${c.status === 'resolved' ? 'bg-emerald-50 text-emerald-500 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-brand-gray italic bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-200/40">
                    "{c.reason}"
                  </p>
                  
                  <div className="flex justify-between items-center text-[10px] text-brand-gray font-bold pt-1">
                    <span>Submitted by: {c.user_name}</span>
                    {c.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => alert(`⚠️ Warning notification dispatched to the owner of "${c.stall_name}".`)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl font-black uppercase text-[8px]"
                        >
                          Warn Vendor
                        </button>
                        <button 
                          onClick={async () => {
                            await resolveComplaint(c.id);
                            alert('Complaint marked as resolved.');
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-black uppercase text-[8px] flex items-center gap-0.5"
                        >
                          <CheckCircle size={10} /> Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Performance Reports Tab */
        <div className="space-y-6">
          <div className="flex justify-between items-center print:hidden bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-4 rounded-2xl">
            <p className="text-xs text-brand-gray font-bold">Compile and export the platform statistics report sheet.</p>
            <button 
              onClick={handlePrint}
              className="bg-gold hover:bg-gold-hover text-brand-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
            >
              <FileText size={13} />
              <span>Print / PDF Export</span>
            </button>
          </div>

          <div className="bg-white text-black p-8 rounded-[28px] border border-neutral-200 shadow-sm space-y-8 font-sans w-full print:border-none print:shadow-none">
            {/* Report Header */}
            <div className="text-center border-b-2 border-black pb-4">
              <h2 className="text-xl font-black tracking-wide uppercase">Vrooklyn Street Food Discovery Platform</h2>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mt-1">System Audit & Performance Report</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Date Compiled: {new Date().toLocaleString()}</p>
            </div>

            {/* Metrics Overview Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider border-b border-neutral-300 pb-1">1. Summary Metrics</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-100 font-extrabold uppercase text-[10px] border-b border-neutral-300">
                    <th className="py-2 px-3">Metric Category</th>
                    <th className="py-2 px-3 text-right">Count / Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Total Accounts Registered</td>
                    <td className="py-2 px-3 text-right font-black">{totalUsers}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Total Active Stalls</td>
                    <td className="py-2 px-3 text-right font-black">{stalls.filter(s => s.status === 'approved').length}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Total Food Items Listed</td>
                    <td className="py-2 px-3 text-right font-black">{totalFoods}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Pending Approvals Queue</td>
                    <td className="py-2 px-3 text-right font-black text-amber-600">{pendingApprovals.length}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Total Customer Reviews</td>
                    <td className="py-2 px-3 text-right font-black">{totalReviews}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Vendor List Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider border-b border-neutral-300 pb-1">2. Stalls Performance Ledger</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-100 font-extrabold uppercase text-[10px] border-b border-neutral-300">
                    <th className="py-2 px-3">Stall Name</th>
                    <th className="py-2 px-3">Area</th>
                    <th className="py-2 px-3 text-center">Avg Rating</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {stalls.map(s => (
                    <tr key={s.id}>
                      <td className="py-2 px-3 font-extrabold">{s.name}</td>
                      <td className="py-2 px-3 text-neutral-600">{s.area}</td>
                      <td className="py-2 px-3 text-center font-bold">★ {s.avg_rating}</td>
                      <td className="py-2 px-3 text-right uppercase font-black text-[9px]">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Signature Block */}
            <div className="flex justify-between items-end pt-12 text-[10px] text-neutral-500 font-semibold">
              <div>
                <p>Authorized Admin Signature:</p>
                <div className="w-40 border-b border-neutral-400 mt-6"></div>
              </div>
              <p>© Vrooklyn Discovery Platform System Audit</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
