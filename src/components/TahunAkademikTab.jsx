import React, { useState } from 'react';
import { Calendar, Plus, Search, Edit, Trash2, Check } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';
import ActionButtons from './ui/ActionButtons';

export default function TahunAkademikTab({
  tahunAkademiks,
  searchQuery,
  setSearchQuery,
  openModal,
  handleDeleteItem,
  toggleTahunAkademikStatus
}) {
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    status: ''
  });

  const filteredItems = tahunAkademiks.filter(ta => {
    const matchesGlobal = ta.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ta.code.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesCode = filters.code === '' || ta.code.toLowerCase().includes(filters.code.toLowerCase());
    const matchesName = filters.name === '' || ta.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesStatus = filters.status === '' || (filters.status === '1' ? ta.status === true || ta.status === 1 : ta.status === false || ta.status === 0);
    
    return matchesGlobal && matchesCode && matchesName && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      <PageHeader 
        title="Manage Tahun Akademik"
        description="Kelola data tahun akademik dan aktifkan salah satu semester berjalan."
        icon={Calendar}
        actionLabel="Tambah Tahun Akademik"
        actionIcon={Plus}
        onActionClick={() => openModal('tahunAkademik', 'create')}
      />

      <div className="flex items-center justify-between">
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari tahun akademik..."
        />
      </div>

      <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
              <th className="py-4 px-6">No</th>
              <th className="py-4 px-6">Kode TA</th>
              <th className="py-4 px-6">Nama TA / Semester</th>
              <th className="py-4 px-6 text-center">Status Keaktifan</th>
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
                <select
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white"
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Semua Status</option>
                  <option value="1">Aktif</option>
                  <option value="0">Tidak Aktif</option>
                </select>
              </th>
              <th className="py-2 px-6">
                <button 
                  onClick={() => setFilters({ code: '', name: '', status: '' })}
                  className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                  title="Reset Filter"
                >
                  Reset
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-monday-border text-sm text-monday-black">
            {filteredItems.map((ta, index) => (
              <tr key={ta.id} className="hover:bg-monday-gray-background/30 transition-colors">
                <td className="py-3.5 px-6 text-monday-gray font-mono font-semibold">{index + 1}</td>
                <td className="py-3.5 px-6 font-bold text-monday-blue">{ta.code}</td>
                <td className="py-3.5 px-6 font-semibold">{ta.name}</td>
                <td className="py-3.5 px-6 text-center">
                  {ta.status ? (
                    <span className="px-3 py-1 bg-monday-lime-green/20 border border-monday-lime-green/30 text-monday-black text-xs font-bold rounded-full">
                      Aktif
                    </span>
                  ) : (
                    <button 
                      onClick={() => toggleTahunAkademikStatus(ta)}
                      className="px-3 py-1 bg-monday-gray-background border border-monday-border text-monday-gray hover:text-monday-blue hover:border-monday-blue/30 text-xs font-bold rounded-full transition-300 flex items-center gap-1 mx-auto"
                    >
                      <Check size={12} /> Aktifkan
                    </button>
                  )}
                </td>
                <td className="py-3.5 px-6 text-right">
                  <ActionButtons 
                    onEdit={() => openModal('tahunAkademik', 'edit', ta)}
                    onDelete={() => handleDeleteItem('tahunAkademik', ta.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
