import React, { useState } from 'react';
import { Building, Plus, Search, Edit, Trash2 } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';
import ActionButtons from './ui/ActionButtons';

export default function FakultasTab({
  faculties,
  searchQuery,
  setSearchQuery,
  openModal,
  handleDeleteItem
}) {

  const [filters, setFilters] = useState({
    code: '',
    name: ''
  });

  const filteredItems = faculties.filter(f => {
    const matchesGlobal = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.code.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesCode = filters.code === '' || f.code.toLowerCase().includes(filters.code.toLowerCase());
    const matchesName = filters.name === '' || f.name.toLowerCase().includes(filters.name.toLowerCase());
    
    return matchesGlobal && matchesCode && matchesName;
  });

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      <PageHeader 
        title="Manajemen Fakultas"
        description={`Mengelola data referensi fakultas universitas. Total Fakultas: ${faculties.length}.`}
        icon={Building}
        actionLabel="Tambah Fakultas"
        actionIcon={Plus}
        onActionClick={() => openModal('faculties', 'create')}
      />

      <div className="flex items-center justify-between">
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari fakultas..."
        />
      </div>

      <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
              <th className="py-4 px-6">No</th>
              <th className="py-4 px-6">Kode Fakultas</th>
              <th className="py-4 px-6">Nama Fakultas</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
            <tr className="bg-monday-background/50 border-b border-monday-border">
              <th className="py-2 px-6"></th>
              <th className="py-2 px-6">
                <input
                  type="text"
                  placeholder="Filter Kode..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black placeholder:text-monday-gray/50 bg-white"
                  value={filters.code}
                  onChange={e => setFilters({ ...filters, code: e.target.value })}
                />
              </th>
              <th className="py-2 px-6">
                <input
                  type="text"
                  placeholder="Filter Nama..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black placeholder:text-monday-gray/50 bg-white"
                  value={filters.name}
                  onChange={e => setFilters({ ...filters, name: e.target.value })}
                />
              </th>
              <th className="py-2 px-6">
                <button 
                  onClick={() => setFilters({ code: '', name: '' })}
                  className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                  title="Reset Filter"
                >
                  Reset
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-monday-border text-sm text-monday-black">
            {filteredItems.length > 0 ? (
              filteredItems.map((fak, index) => (
                <tr key={fak.id} className="hover:bg-monday-gray-background/30 transition-colors">
                  <td className="py-3.5 px-6 text-monday-gray font-mono font-semibold">{index + 1}</td>
                  <td className="py-3.5 px-6 font-bold text-monday-blue">{fak.code}</td>
                  <td className="py-3.5 px-6 font-semibold">{fak.name}</td>
                  <td className="py-3.5 px-6 text-right">
                    <ActionButtons 
                      onEdit={() => openModal('faculties', 'edit', fak)}
                      onDelete={() => handleDeleteItem('faculties', fak.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-12 text-center bg-monday-background/30">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 rounded-full bg-white border border-dashed border-monday-border text-monday-gray/50">
                      <Building size={32} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-monday-black">Data Fakultas Kosong</h4>
                      <p className="text-xs text-monday-gray mt-1 max-w-sm mx-auto">
                        Tidak ada data fakultas yang sesuai dengan kriteria pencarian Anda.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
