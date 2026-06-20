import React, { useState } from 'react';
import { Award, Plus, Search, Edit, Trash2 } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';
import ActionButtons from './ui/ActionButtons';

const ProdiTab = React.memo(function ProdiTab({
  studyPrograms,
  faculties,
  searchQuery,
  setSearchQuery,
  openModal,
  handleDeleteItem,
  facultyMap = {}
}) {
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    faculty_id: ''
  });

  const filteredItems = studyPrograms.filter(p => {
    const matchesGlobal = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesCode = filters.code === '' || p.code.toLowerCase().includes(filters.code.toLowerCase());
    const matchesName = filters.name === '' || p.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesFaculty = filters.faculty_id === '' || String(p.faculty_id) === String(filters.faculty_id);
    
    return matchesGlobal && matchesCode && matchesName && matchesFaculty;
  });

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      <PageHeader 
        title="Manage Program Studi"
        description={`Kelola data program studi dan hubungannya dengan faculties. Total: ${studyPrograms.length} program studi terdaftar.`}
        icon={Award}
        actionLabel="Tambah Program Studi"
        actionIcon={Plus}
        onActionClick={() => openModal('prodi', 'create')}
      />

      <div className="flex items-center justify-between">
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari program studi..."
        />
      </div>

      <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
              <th className="py-4 px-6">No</th>
              <th className="py-4 px-6">Kode Prodi</th>
              <th className="py-4 px-6">Nama Program Studi</th>
              <th className="py-4 px-6">Fakultas</th>
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
                  value={filters.faculty_id}
                  onChange={e => setFilters({ ...filters, faculty_id: e.target.value })}
                >
                  <option value="">Semua Fakultas</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </th>
              <th className="py-2 px-6">
                <button 
                  onClick={() => setFilters({ code: '', name: '', faculty_id: '' })}
                  className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                  title="Reset Filter"
                >
                  Reset
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-monday-border text-sm text-monday-black">
            {filteredItems.map((pr, index) => {
              const fakObj = facultyMap[pr.faculty_id];
              return (
                <tr key={pr.id} className="hover:bg-monday-gray-background/30 transition-colors">
                  <td className="py-3.5 px-6 text-monday-gray font-mono font-semibold">{index + 1}</td>
                  <td className="py-3.5 px-6 font-bold text-monday-blue">{pr.code}</td>
                  <td className="py-3.5 px-6 font-semibold">{pr.name}</td>
                  <td className="py-3.5 px-6">
                    {fakObj ? (
                      <span className="px-2.5 py-1 bg-monday-background border border-monday-border rounded-xl text-xs font-bold text-monday-gray">
                        {fakObj.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <ActionButtons 
                      onEdit={() => openModal('prodi', 'edit', pr)}
                      onDelete={() => handleDeleteItem('prodi', pr.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default ProdiTab;
