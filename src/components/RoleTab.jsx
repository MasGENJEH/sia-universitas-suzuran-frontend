import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import PageHeader from './ui/PageHeader';

export default function RoleTab() {
  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm print:border-none print:shadow-none print:bg-white print:p-0">
      <PageHeader 
        title="Manajemen Hak Akses & Role"
        description="Pengaturan keamanan level sistem (Spatie Permissions)."
        icon={Shield}
      />

      <div className="flex flex-col items-center justify-center py-16 px-6 gap-5 bg-monday-gray-background/40 rounded-3xl border border-monday-border text-center max-w-2xl mx-auto my-4 shadow-inner">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white border border-monday-border shadow-sm flex items-center justify-center z-10 relative">
            <Lock size={32} className="text-monday-gray" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center z-20">
            <AlertTriangle size={14} className="text-amber-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-monday-black tracking-tight">Konfigurasi Terkunci</h3>
          <p className="text-sm font-medium text-monday-gray leading-relaxed max-w-md mx-auto">
            Demi menjaga integritas keamanan sistem akademik, pengelolaan <strong>Role dan Permissions</strong> saat ini dikelola secara terpusat melalui lapisan konfigurasi backend. 
          </p>
        </div>
        
        <div className="mt-4 p-4 rounded-2xl bg-white border border-monday-border text-left space-y-2 w-full max-w-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-monday-gray mb-2">Informasi Akses</p>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-monday-gray">Level Modul</span>
            <span className="px-2 py-0.5 rounded-md bg-monday-background border border-monday-border text-monday-black font-mono">ROOT_ADMIN</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-monday-gray">Status Modul UI</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">READ_ONLY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
