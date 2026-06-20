import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, ArrowLeft, User, BookOpen, Award, Calendar, Clock, MapPin, Mail, Lock, LayoutGrid, Table, ChevronDown } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';
import ActionButtons from './ui/ActionButtons';

const DosenTab = React.memo(function DosenTab({
  lecturers,
  users,
  students = [],
  dosenPengampus = [],
  kelasKuliahs = [],
  mataKuliahs = [],
  tahunAkademiks = [],
  searchQuery,
  setSearchQuery,
  openModal,
  handleDeleteItem,
  mataKuliahMap = {},
  academicYearMap = {},
  userMap = {},
  studentMap = {}
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCountCard, setVisibleCountCard] = useState(12);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    nameNidn: '',
    email: ''
  });
  const itemsPerPage = 10;

  // Reset states when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCountCard(12);
  }, [searchQuery, filters]);

  // Reset showPassword when selectedDosen changes
  useEffect(() => {
    setShowPassword(false);
  }, [selectedDosen]);

  // Filter items based on search query and column filters
  const filteredItems = lecturers.filter(d => {
    const uObj = userMap[d.user_id];
    
    const matchesGlobal = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.nidn.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesNameNidn = filters.nameNidn === '' || 
                            d.name.toLowerCase().includes(filters.nameNidn.toLowerCase()) || 
                            d.nidn.toLowerCase().includes(filters.nameNidn.toLowerCase());
                            
    const matchesEmail = filters.email === '' || 
                         (uObj && uObj.email.toLowerCase().includes(filters.email.toLowerCase()));

    return matchesGlobal && matchesNameNidn && matchesEmail;
  });

  // Pagination bounds & slice for Table
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Bounds & slice for Card Mode
  const cardItemsToDisplay = filteredItems.slice(0, visibleCountCard);

  // Helper for pagination window
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Compute detail data for selected dosen
  const detailData = useMemo(() => {
    if (!selectedDosen) return null;

    const dsn = selectedDosen;
    const userObj = userMap[dsn.user_id];

    // Get all advisee students (mahasiswa bimbingan PA)
    const advisees = students.filter(m => m.academic_advisor_id === dsn.id);

    // Get all classes taught by this dosen (dosen_pengampus)
    const teachingLinks = dosenPengampus.filter(dp => dp.lecturer_id === dsn.id);
    const classesTaught = [];
    let totalTeachingSks = 0;

    teachingLinks.forEach(dp => {
      const kk = kelasKuliahs.find(k => k.id === dp.course_class_id);
      if (kk) {
        const mk = mataKuliahMap[kk.course_id];
        const ta = academicYearMap[kk.academic_year_id];
        if (mk && mk.sks) {
          totalTeachingSks += Number(mk.sks);
        }
        classesTaught.push({ dp, kk, mk, ta });
      }
    });

    return {
      dosen: dsn,
      user: userObj,
      advisees,
      classesTaught,
      totalClasses: classesTaught.length,
      totalAdvisees: advisees.length,
      totalTeachingSks
    };
  }, [selectedDosen, users, students, dosenPengampus, kelasKuliahs, mataKuliahs, tahunAkademiks]);

  // Photo component with fallback
  const DosenPhoto = ({ dosen, size = 'lg' }) => {
    const [imgError, setImgError] = useState(false);
    const sizeClasses = size === 'lg' ? 'w-28 h-28' : size === 'md' ? 'w-16 h-16' : 'w-10 h-10';
    const iconSize = size === 'lg' ? 48 : size === 'md' ? 24 : 16;

    const photoUrl = dosen.photo ? (dosen.photo.startsWith('http') ? dosen.photo : `/storage/${dosen.photo}`) : null;

    if (photoUrl && !imgError) {
      return (
        <div className={`${sizeClasses} rounded-2xl overflow-hidden border-2 border-monday-blue/20 shadow-lg shadow-monday-blue/10 flex-shrink-0 ${size === 'lg' ? 'border-4 border-white bg-white relative z-20 shadow-xl' : ''}`}>
          <img
            src={photoUrl}
            alt={dosen.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      );
    }

    // Fallback: user icon with solid bg for lg size to block banner background
    return (
      <div className={`${sizeClasses} rounded-2xl ${size === 'lg' ? 'bg-white border-4 border-white relative z-20 shadow-xl' : 'bg-gradient-to-br from-monday-blue/20 via-monday-blue/10 to-indigo-500/10 border-2 border-monday-blue/20 shadow-lg shadow-monday-blue/10'} flex items-center justify-center flex-shrink-0`}>
        {size === 'lg' ? (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-monday-blue/10 to-indigo-500/5 flex items-center justify-center">
            <User size={iconSize} className="text-monday-blue/60" strokeWidth={1.5} />
          </div>
        ) : (
          <User size={iconSize} className="text-monday-blue/60" strokeWidth={1.5} />
        )}
      </div>
    );
  };

  // ─── DETAIL VIEW ───────────────────────────────────────────────────
  if (selectedDosen && detailData) {
    return (
      <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm animate-fade-in">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-monday-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedDosen(null)}
              className="p-2.5 bg-monday-background border border-monday-border text-monday-gray hover:text-monday-black hover:bg-monday-gray-background rounded-2xl transition-all duration-200"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col gap-[2px]">
              <p className="flex items-center gap-2">
                <span className="font-extrabold text-2xl text-monday-black">
                  Detail Dosen
                </span>
              </p>
              <p className="font-semibold text-sm text-monday-gray">
                Informasi lengkap profil, jadwal mengajar, dan bimbingan akademik.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('dosen', 'edit', selectedDosen)}
              className="px-5 py-2.5 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2"
            >
              <Edit size={14} /> Edit Data
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-monday-border overflow-hidden relative">
          <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-r from-monday-blue/15 to-violet-500/10 z-0" />

          {/* Profile Info */}
          <div className="px-8 pb-8 mt-8 relative z-10">
            <div className="flex items-end gap-6 mb-6">
              <DosenPhoto dosen={detailData.dosen} size="lg" />
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-extrabold text-2xl text-monday-black drop-shadow-sm">{detailData.dosen.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1.5 bg-monday-blue/10 rounded-xl flex items-center gap-1.5 border border-monday-blue/20">
                    <Users size={13} className="text-monday-blue" />
                    <span className="text-monday-gray text-xs font-semibold">NIDN:</span>
                    <span className="font-bold text-monday-blue text-base leading-none">{detailData.dosen.nidn}</span>
                  </span>

                  <span className="px-3 py-1.5 bg-monday-blue/10 text-monday-blue rounded-xl text-xs font-bold flex items-center gap-1.5 border border-monday-blue/20">
                    <Mail size={13} className="text-monday-blue" />
                    <span className="text-monday-gray font-normal">Email:</span>
                    <span className="font-mono text-monday-black select-all">{detailData.user?.email || '-'}</span>
                  </span>

                  <span className="px-3 py-1.5 bg-violet-500/10 text-violet-600 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-violet-500/20">
                    <Lock size={13} className="text-violet-600" />
                    <span className="text-monday-gray font-normal">Sandi:</span>
                    <span className="font-mono text-monday-black">{showPassword ? "password123" : "••••••••"}</span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-0.5 hover:bg-violet-500/25 rounded transition-colors text-violet-600 cursor-pointer"
                      title={showPassword ? "Sembunyikan Sandi" : "Tampilkan Sandi"}
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Akun User */}
              <div className="rounded-2xl bg-monday-background/60 border border-monday-border p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600 flex-shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-monday-gray uppercase tracking-wider mb-0.5">Akun User</p>
                  {detailData.user ? (
                    <>
                      <p className="font-bold text-sm text-monday-black truncate">{detailData.user.username}</p>
                      <p className="text-xs text-monday-gray font-semibold">{detailData.user.email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-monday-gray italic font-semibold">Belum ditautkan ke akun user</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="rounded-2xl bg-monday-background/60 border border-monday-border p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 flex-shrink-0">
                  <Award size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-monday-gray uppercase tracking-wider mb-0.5">Status Pengajar</p>
                  <p className="font-bold text-sm text-monday-black">Dosen Pengajar</p>
                  <p className="text-xs text-monday-gray font-semibold">Aktif Mengajar</p>
                </div>
              </div>
            </div>

            {/* Academic Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-monday-blue/10 to-monday-blue/5 border border-monday-blue/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-monday-blue mb-1">
                  <BookOpen size={16} />
                  <span className="font-extrabold text-2xl">{detailData.totalClasses}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Kelas Diajar</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                  <Award size={16} />
                  <span className="font-extrabold text-2xl">{detailData.totalTeachingSks}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Total SKS Diajar</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                  <Users size={16} />
                  <span className="font-extrabold text-2xl">{detailData.totalAdvisees}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Mahasiswa Bimbingan PA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Taught */}
        <div className="flex flex-col gap-3">
          <h3 className="font-extrabold text-lg text-monday-black flex items-center gap-2">
            <BookOpen size={20} className="text-monday-blue" />
            Daftar Kelas Kuliah Diajar
          </h3>
          {detailData.classesTaught.length > 0 ? (
            <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
                    <th className="py-3.5 px-5">No</th>
                    <th className="py-3.5 px-5">Mata Kuliah</th>
                    <th className="py-3.5 px-5">Kelas</th>
                    <th className="py-3.5 px-5">Tahun Akademik</th>
                    <th className="py-3.5 px-5">Jadwal & Ruangan</th>
                    <th className="py-3.5 px-5 text-center">SKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monday-border text-sm text-monday-black">
                  {detailData.classesTaught.map((ct, index) => (
                    <tr key={ct.dp.id} className="hover:bg-monday-gray-background/30 transition-colors">
                      <td className="py-3 px-5 text-monday-gray font-mono font-semibold text-xs">{index + 1}</td>
                      <td className="py-3 px-5">
                        {ct.mk ? (
                          <div>
                            <span className="font-bold text-monday-black">{ct.mk.name}</span>
                            <span className="ml-2 text-xs text-monday-gray font-semibold">{ct.mk.code}</span>
                          </div>
                        ) : <span className="italic text-monday-gray">-</span>}
                      </td>
                      <td className="py-3 px-5">
                        {ct.kk ? (
                          <span className="px-2 py-0.5 bg-monday-background border border-monday-border rounded-lg text-xs font-bold text-monday-gray">
                            {ct.kk.class_name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-5">
                        {ct.ta ? (
                          <span className="text-xs font-semibold text-monday-gray">{ct.ta.name}</span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-5 text-xs text-monday-gray font-semibold">
                        {ct.kk ? `${ct.kk.day}, ${ct.kk.start_time.substring(0, 5)} - ${ct.kk.end_time.substring(0, 5)} (${ct.kk.room})` : '-'}
                      </td>
                      <td className="py-3 px-5 text-center font-bold">{ct.mk?.sks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-monday-border bg-monday-background/30 py-10 flex flex-col items-center gap-2">
              <BookOpen size={32} className="text-monday-gray/40" />
              <p className="text-monday-gray font-semibold text-sm">Dosen ini belum ditugaskan mengajar kelas manapun.</p>
            </div>
          )}
        </div>

        {/* Advisees */}
        <div className="flex flex-col gap-3">
          <h3 className="font-extrabold text-lg text-monday-black flex items-center gap-2">
            <Users size={20} className="text-emerald-600" />
            Daftar Mahasiswa Bimbingan Akademik (PA)
          </h3>
          {detailData.advisees.length > 0 ? (
            <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
                    <th className="py-3.5 px-5">No</th>
                    <th className="py-3.5 px-5">NIM</th>
                    <th className="py-3.5 px-5">Nama Mahasiswa</th>
                    <th className="py-3.5 px-5">Tahun Masuk</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monday-border text-sm text-monday-black">
                  {detailData.advisees.map((mhs, index) => (
                    <tr key={mhs.id} className="hover:bg-monday-gray-background/30 transition-colors">
                      <td className="py-3 px-5 text-monday-gray font-mono font-semibold text-xs">{index + 1}</td>
                      <td className="py-3 px-5 font-bold text-monday-blue font-mono">{mhs.nim}</td>
                      <td className="py-3 px-5 font-semibold">{mhs.name}</td>
                      <td className="py-3 px-5 text-xs text-monday-gray font-semibold">{mhs.enrollment_year}</td>
                      <td className="py-3 px-5 text-center">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${mhs.status === 'AKTIF' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20' :
                            mhs.status === 'CUTI' ? 'bg-amber-500/15 text-amber-700 border-amber-500/20' :
                              mhs.status === 'LULUS' ? 'bg-monday-blue/15 text-monday-blue border-monday-blue/20' :
                                'bg-monday-red/15 text-monday-red border-monday-red/20'
                          }`}>
                          {mhs.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-monday-border bg-monday-background/30 py-10 flex flex-col items-center gap-2">
              <Users size={32} className="text-monday-gray/40" />
              <p className="text-monday-gray font-semibold text-sm">Dosen ini belum memiliki mahasiswa bimbingan akademik.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── MAIN LIST VIEW ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      <PageHeader 
        title="Manage Data Dosen"
        description={`Kelola data staf pengajar/dosen dan bimbingan akademik. Total: ${lecturers.length} dosen terdaftar.`}
        icon={Users}
        actionLabel="Tambah Dosen"
        actionIcon={Plus}
        onActionClick={() => openModal('dosen', 'create')}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari dosen..."
        />
        <div className="flex items-center gap-1.5 bg-monday-background p-1.5 rounded-xl border border-monday-border shrink-0">
          <button 
            onClick={() => setViewMode('table')} 
            className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${viewMode === 'table' ? 'bg-white shadow-sm text-emerald-600 font-bold' : 'text-monday-gray hover:text-monday-black'}`}
            title="Mode Tabel"
          >
            <Table size={18} />
          </button>
          <button 
            onClick={() => setViewMode('card')} 
            className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${viewMode === 'card' ? 'bg-white shadow-sm text-emerald-600 font-bold' : 'text-monday-gray hover:text-monday-black'}`}
            title="Mode Card"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
                <th className="py-4 px-6">No</th>
                <th className="py-4 px-6">Dosen</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6 text-center">Kelas Diampu</th>
                <th className="py-4 px-6 text-center">Mahasiswa Wali</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
              <tr className="bg-monday-background/50 border-b border-monday-border">
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6">
                  <input
                    type="text"
                    placeholder="Filter Dosen/NIDN..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black placeholder:text-monday-gray/50 bg-white"
                    value={filters.nameNidn}
                    onChange={e => setFilters({ ...filters, nameNidn: e.target.value })}
                  />
                </th>
                <th className="py-2 px-6">
                  <input
                    type="text"
                    placeholder="Filter Email..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black placeholder:text-monday-gray/50 bg-white"
                    value={filters.email}
                    onChange={e => setFilters({ ...filters, email: e.target.value })}
                  />
                </th>
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6">
                  <button 
                    onClick={() => setFilters({ nameNidn: '', email: '' })}
                    className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                    title="Reset Filter"
                  >
                    Reset
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-monday-border text-sm text-monday-black">
              {paginatedItems.map((d, index) => {
                const uObj = userMap[d.user_id];
                const classCount = dosenPengampus.filter(dp => dp.lecturer_id === d.id).length;
                const adviseeCount = students.filter(m => m.academic_advisor_id === d.id).length;

                return (
                  <tr key={d.id} className="hover:bg-monday-gray-background/30 transition-colors">
                    <td className="py-3.5 px-6 text-monday-gray font-mono font-semibold">{startIndex + index + 1}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <DosenPhoto dosen={d} size="sm" />
                        <div>
                          <p className="font-bold text-monday-black">{d.name}</p>
                          <p className="text-xs font-bold text-monday-blue">{d.nidn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-monday-gray font-mono">
                      {uObj ? uObj.email : '-'}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="px-2.5 py-1 bg-monday-blue/10 text-monday-blue border border-monday-blue/15 rounded-lg text-xs font-bold font-mono">
                        {classCount} Kelas
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 rounded-lg text-xs font-bold font-mono">
                        {adviseeCount} Mahasiswa
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDosen(d)}
                          className="px-3.5 py-1.5 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          Detail
                        </button>
                        <ActionButtons 
                          onEdit={() => openModal('dosen', 'edit', d)}
                          onDelete={() => handleDeleteItem('dosen', d.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cardItemsToDisplay.map((d, index) => {
            const uObj = userMap[d.user_id];
            const classCount = dosenPengampus.filter(dp => dp.lecturer_id === d.id).length;
            const adviseeCount = students.filter(m => m.academic_advisor_id === d.id).length;

            return (
              <div key={d.id} className="group relative flex flex-col bg-white border border-monday-border rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/10 transition-all duration-300">
                {/* Banner Header */}
                <div className="h-16 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 relative">
                  <div className="absolute top-3 right-3 flex flex-col gap-1 z-20 items-end">
                    <span className="px-2 py-0.5 bg-white border border-emerald-500/20 shadow-sm text-[10px] font-bold text-emerald-700 rounded-full flex items-center gap-1">
                      <BookOpen size={10} /> {classCount} Kelas
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-monday-blue/20 shadow-sm text-[10px] font-bold text-monday-blue rounded-full flex items-center gap-1">
                      <Users size={10} /> {adviseeCount} PA
                    </span>
                  </div>
                </div>
                
                {/* Body Card */}
                <div className="flex flex-col p-5 gap-3 flex-1 relative -mt-10">
                  <div className="rounded-2xl bg-white p-1 border border-monday-border shadow-sm w-max mb-1 z-10">
                    <DosenPhoto dosen={d} size="md" />
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-monday-black text-lg line-clamp-2 leading-tight" title={d.name}>{d.name}</h3>
                    <span className="font-bold text-emerald-600 text-sm mt-0.5">{d.nidn}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-monday-border/50">
                    <div className="flex items-center gap-2.5 text-monday-gray" title={uObj ? uObj.email : '-'}>
                      <Mail size={14} className="text-monday-gray shrink-0" />
                      <span className="text-xs font-semibold text-monday-black truncate leading-none">{uObj ? uObj.email : '-'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Footer Card */}
                <div className="px-5 py-4 bg-monday-background/50 border-t border-monday-border flex items-center justify-between mt-auto">
                  <button
                    onClick={() => setSelectedDosen(d)}
                    className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5"
                  >
                    <Eye size={13} /> Detail
                  </button>
                  <ActionButtons 
                    onEdit={() => openModal('dosen', 'edit', d)}
                    onDelete={() => handleDeleteItem('dosen', d.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {/* Pagination Controls (Table Mode Only) */}
      {viewMode === 'table' && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-monday-border mt-2">
          <p className="text-sm font-semibold text-monday-gray">
            Menampilkan <span className="text-monday-black font-bold">{totalItems === 0 ? 0 : startIndex + 1}</span> sampai <span className="text-monday-black font-bold">{endIndex}</span> dari <span className="text-monday-black font-bold">{totalItems}</span> dosen
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

      {/* Load More Button (Card Mode Only) */}
      {viewMode === 'card' && visibleCountCard < filteredItems.length && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setVisibleCountCard(prev => prev + 12)}
            className="px-6 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-full font-bold text-xs shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:shadow-emerald-600/30 transition-all duration-300 flex items-center gap-2"
          >
            Tampilkan Lebih Banyak <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
});

export default DosenTab;
