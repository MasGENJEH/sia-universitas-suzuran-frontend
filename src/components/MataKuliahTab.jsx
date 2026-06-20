import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2, ChevronDown } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';
import ActionButtons from './ui/ActionButtons';

const MataKuliahTab = React.memo(function MataKuliahTab({
  mataKuliahs,
  studyPrograms,
  searchQuery,
  setSearchQuery,
  openModal,
  handleDeleteItem,
  studyProgramMap = {}
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    sks: '',
    study_program_id: ''
  });

  // Reset limit to 10 when searching
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, filters]);

  const filteredItems = mataKuliahs.filter(mk => {
    const matchesGlobal = mk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mk.code.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesCode = filters.code === '' || mk.code.toLowerCase().includes(filters.code.toLowerCase());
    const matchesName = filters.name === '' || mk.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesSks = filters.sks === '' || String(mk.sks) === String(filters.sks);
    const matchesProdi = filters.study_program_id === '' || String(mk.study_program_id) === String(filters.study_program_id);

    return matchesGlobal && matchesCode && matchesName && matchesSks && matchesProdi;
  });

  const itemsToDisplay = filteredItems.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      <PageHeader 
        title="Manage Mata Kuliah"
        description={`Kelola data kurikulum mata kuliah, jumlah SKS, dan relasi program studi. Total: ${mataKuliahs.length} mata kuliah terdaftar.`}
        icon={BookOpen}
        actionLabel="Tambah Mata Kuliah"
        actionIcon={Plus}
        onActionClick={() => openModal('mataKuliah', 'create')}
      />

      <div className="flex items-center justify-between">
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari mata kuliah..."
        />
      </div>

      <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
              <th className="py-4 px-6">No</th>
              <th className="py-4 px-6">Kode MK</th>
              <th className="py-4 px-6">Nama Mata Kuliah</th>
              <th className="py-4 px-6">SKS</th>
              <th className="py-4 px-6">Program Studi</th>
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
                  value={filters.sks}
                  onChange={e => setFilters({ ...filters, sks: e.target.value })}
                >
                  <option value="">Semua SKS</option>
                  {[...Array(6)].map((_, i) => <option key={i+1} value={i+1}>{i+1} SKS</option>)}
                </select>
              </th>
              <th className="py-2 px-6">
                <select
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white"
                  value={filters.study_program_id}
                  onChange={e => setFilters({ ...filters, study_program_id: e.target.value })}
                >
                  <option value="">Semua Prodi</option>
                  {studyPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </th>
              <th className="py-2 px-6">
                <button 
                  onClick={() => setFilters({ code: '', name: '', sks: '', study_program_id: '' })}
                  className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                  title="Reset Filter"
                >
                  Reset
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-monday-border text-sm text-monday-black">
            {itemsToDisplay.map((mk, index) => {
              const prObj = studyProgramMap[mk.study_program_id];
              return (
                <tr key={mk.id} className="hover:bg-monday-gray-background/30 transition-colors">
                  <td className="py-3.5 px-6 text-monday-gray font-mono font-semibold">{index + 1}</td>
                  <td className="py-3.5 px-6 font-bold text-monday-blue">{mk.code}</td>
                  <td className="py-3.5 px-6 font-semibold">{mk.name}</td>
                  <td className="py-3.5 px-6 font-bold text-monday-black">{mk.sks} SKS</td>
                  <td className="py-3.5 px-6">
                    {prObj ? (
                      <span className="px-2.5 py-1 bg-monday-background border border-monday-border rounded-xl text-xs font-bold text-monday-gray">
                        {prObj.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <ActionButtons 
                      onEdit={() => openModal('mataKuliah', 'edit', mk)}
                      onDelete={() => handleDeleteItem('mataKuliah', mk.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {visibleCount < filteredItems.length && (
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="px-6 py-2 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-full font-bold text-xs transition-all duration-300 flex items-center gap-2"
          >
            Tampilkan Lebih Banyak <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
});

export default MataKuliahTab;
