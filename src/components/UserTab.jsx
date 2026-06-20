import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Plus, Shield, User, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';

export default function UserTab({ users, searchQuery, setSearchQuery, openModal, handleDeleteItem }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    nameEmail: '',
    role: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Extract all unique roles from users to populate the role filter
  const allRoles = useMemo(() => {
    const rolesSet = new Set();
    users.forEach(u => {
      if (u.roles) {
        u.roles.forEach(r => rolesSet.add(r.name));
      }
    });
    return Array.from(rolesSet);
  }, [users]);

  const filteredItems = users.filter(u => {
    const matchesGlobal = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesNameEmail = filters.nameEmail === '' || 
                             u.name?.toLowerCase().includes(filters.nameEmail.toLowerCase()) || 
                             u.email?.toLowerCase().includes(filters.nameEmail.toLowerCase());
                             
    const matchesRole = filters.role === '' || 
                        (u.roles && u.roles.some(r => String(r.name) === String(filters.role)));
                        
    return matchesGlobal && matchesNameEmail && matchesRole;
  });

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm print:border-none print:shadow-none print:bg-white print:p-0">
      <PageHeader 
        title="Manajemen User"
        description="Kelola akun pengguna sistem dan hak akses mereka."
        icon={Users}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari secara global..."
        />
        <button 
          onClick={() => openModal('users', 'create')}
          className="px-4 py-2 bg-monday-blue text-white rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md hover:shadow-monday-blue/30 hover:-translate-y-0.5">
          <Plus size={18} />
          Tambah User
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-monday-border mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-monday-gray-background border-b border-monday-border text-xs text-monday-gray font-extrabold uppercase tracking-wider">
              <th className="p-4 w-12 text-center">No</th>
              <th className="p-4">Nama User</th>
              <th className="p-4 hidden md:table-cell">Email</th>
              <th className="p-4">Roles</th>
              <th className="p-4 hidden md:table-cell">Tanggal Dibuat</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
            <tr className="bg-monday-gray-background/30 border-b border-monday-border">
              <th className="py-2 px-4"></th>
              <th className="py-2 px-4">
                <input
                  type="text"
                  placeholder="Filter nama/email..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white transition-all"
                  value={filters.nameEmail}
                  onChange={e => setFilters({ ...filters, nameEmail: e.target.value })}
                />
              </th>
              <th className="py-2 px-4 hidden md:table-cell"></th>
              <th className="py-2 px-4">
                <select
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white transition-all"
                  value={filters.role}
                  onChange={e => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">Semua Role</option>
                  {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </th>
              <th className="py-2 px-4 hidden md:table-cell">
                <button 
                  onClick={() => setFilters({ nameEmail: '', role: '' })}
                  className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                  title="Reset Semua Filter"
                >
                  Reset Filter
                </button>
              </th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody className="text-sm font-semibold text-monday-black divide-y divide-monday-border">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((user, idx) => (
                <tr key={user.id} className="hover:bg-monday-gray-background/50 transition-colors">
                  <td className="p-4 text-center">{startIndex + idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-monday-blue/10 flex items-center justify-center text-monday-blue shrink-0">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{user.name}</span>
                        <span className="text-xs text-monday-gray md:hidden">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-monday-gray hidden md:table-cell">{user.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(r => (
                          <span key={r.id} className="px-2.5 py-1 bg-monday-blue/10 text-monday-blue text-[10px] font-bold rounded-lg uppercase tracking-wide">
                            {r.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-monday-gray">Tidak ada role</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-monday-gray text-xs font-medium hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const roles = user.roles ? user.roles.map(r => r.name) : [];
                          openModal('users', 'edit', { ...user, roles });
                        }}
                        className="p-1.5 text-monday-blue hover:bg-monday-blue/10 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('users', user.id)}
                        className="p-1.5 text-monday-red hover:bg-monday-red/10 rounded-lg transition-colors"
                        title="Hapus User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-monday-gray font-semibold">
                  Tidak ada user yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-monday-border mt-2">
          <p className="text-sm font-semibold text-monday-gray">
            Menampilkan <span className="text-monday-black font-bold">{totalItems === 0 ? 0 : startIndex + 1}</span> sampai <span className="text-monday-black font-bold">{endIndex}</span> dari <span className="text-monday-black font-bold">{totalItems}</span> user
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-monday-border rounded-xl text-monday-gray hover:text-monday-black hover:bg-monday-gray-background disabled:opacity-50 disabled:pointer-events-none transition-300"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-monday-gray font-bold text-xs">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-xl font-bold text-xs transition-300 ${currentPage === page
                      ? 'bg-monday-blue text-white shadow-md shadow-monday-blue/15'
                      : 'border border-monday-border text-monday-gray hover:text-monday-black hover:bg-monday-gray-background'
                      }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-monday-border rounded-xl text-monday-gray hover:text-monday-black hover:bg-monday-gray-background disabled:opacity-50 disabled:pointer-events-none transition-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
