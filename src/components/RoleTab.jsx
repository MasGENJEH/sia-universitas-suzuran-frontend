import React from 'react';
import { Shield, Plus, Lock } from 'lucide-react';
import PageHeader from './ui/PageHeader';

export default function RoleTab() {
  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm print:border-none print:shadow-none print:bg-white print:p-0">
      <PageHeader 
        title="Manajemen Role"
        description="Kelola peran dan hak akses sistem menggunakan Spatie Permissions."
        icon={Shield}
      />

      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-monday-gray-background/30 rounded-2xl border border-dashed border-monday-border">
        <Lock size={48} className="text-monday-gray/40" />
        <h3 className="text-lg font-extrabold text-monday-black">Fitur Sedang Dikembangkan</h3>
        <p className="text-sm font-semibold text-monday-gray text-center max-w-md">
          Modul manajemen role dan permissions ini masih dalam tahap integrasi dengan backend (Spatie Laravel Permission).
        </p>
      </div>
    </div>
  );
}
