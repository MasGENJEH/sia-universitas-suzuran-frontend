import React, { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, ArrowLeft, User, BookOpen, Award, Calendar, Clock, ShieldCheck, MapPin, Users, TrendingUp, Mail, Lock, LayoutGrid, Table } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';
import ActionButtons from './ui/ActionButtons';

const MahasiswaTab = React.memo(function MahasiswaTab({
  students,
  studyPrograms,
  lecturers,
  faculties,
  kelasMahasiswas,
  kelasKuliahs,
  mataKuliahs,
  tahunAkademiks,
  users = [],
  searchQuery,
  setSearchQuery,
  openModal,
  handleDeleteItem,
  studyProgramMap = {},
  lecturerMap = {},
  facultyMap = {},
  userMap = {},
  mataKuliahMap = {},
  academicYearMap = {}
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCountCard, setVisibleCountCard] = useState(12);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    nameNim: '',
    email: '',
    study_program_id: '',
    academic_advisor_id: '',
    status: ''
  });
  const itemsPerPage = 10;

  // Reset states when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCountCard(12);
  }, [searchQuery, filters]);

  // Reset showPassword when selectedMahasiswa changes
  useEffect(() => {
    setShowPassword(false);
  }, [selectedMahasiswa]);

  // Filter items based on search query and column filters
  const filteredItems = students.filter(m => {
    const prObj = studyProgramMap[m.study_program_id];
    const dosObj = lecturerMap[m.academic_advisor_id];
    const uObj = userMap[m.user_id];

    const matchesGlobal = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.nim.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNameNim = filters.nameNim === '' || 
                           m.name.toLowerCase().includes(filters.nameNim.toLowerCase()) || 
                           m.nim.toLowerCase().includes(filters.nameNim.toLowerCase());
                           
    const matchesEmail = filters.email === '' || 
                         (uObj && uObj.email.toLowerCase().includes(filters.email.toLowerCase()));
                         
    const matchesProdi = filters.study_program_id === '' || 
                         String(m.study_program_id) === String(filters.study_program_id);
                         
    const matchesDosen = filters.academic_advisor_id === '' || 
                         String(m.academic_advisor_id) === String(filters.academic_advisor_id);
                         
    const matchesStatus = filters.status === '' || 
                          String(m.status) === String(filters.status);

    return matchesGlobal && matchesNameNim && matchesEmail && matchesProdi && matchesDosen && matchesStatus;
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

  // Compute detail data for selected mahasiswa
  const detailData = useMemo(() => {
    if (!selectedMahasiswa) return null;

    const mhs = selectedMahasiswa;
    const prodiObj = studyProgramMap[mhs.study_program_id];
    const dosenObj = lecturerMap[mhs.academic_advisor_id];
    const fakObj = prodiObj ? facultyMap[prodiObj.faculty_id] : null;
    const userObj = userMap[mhs.user_id];

    // Get all enrollments for this student
    const enrollments = kelasMahasiswas.filter(km => km.student_id === mhs.id);

    // Calculate total SKS & unique semesters
    let totalSks = 0;
    let totalNilai = 0;
    let gradedCount = 0;
    const semesterSet = new Set();
    const courseDetails = [];

    enrollments.forEach(km => {
      const kk = kelasKuliahs.find(k => k.id === km.course_class_id);
      const mk = kk ? mataKuliahMap[kk.course_id] : null;
      const ta = kk ? academicYearMap[kk.academic_year_id] : null;

      if (mk && mk.sks) totalSks += Number(mk.sks);
      if (ta) semesterSet.add(ta.id);
      if (km.final_score !== null && km.final_score !== undefined) {
        totalNilai += Number(km.final_score);
        gradedCount++;
      }

      courseDetails.push({ km, kk, mk, ta });
    });

    const avgNilai = gradedCount > 0 ? (totalNilai / gradedCount).toFixed(1) : null;

    // Compute IPK-style (weighted GPA) - simplified: bobot * sks
    let totalBobot = 0;
    let totalSksBerbobot = 0;
    enrollments.forEach(km => {
      const kk = kelasKuliahs.find(k => k.id === km.course_class_id);
      const mk = kk ? mataKuliahMap[kk.course_id] : null;
      if (mk && mk.sks && km.letter_grade) {
        const bobotMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0 };
        const bobot = bobotMap[km.letter_grade] ?? 0;
        totalBobot += bobot * Number(mk.sks);
        totalSksBerbobot += Number(mk.sks);
      }
    });
    const ipk = totalSksBerbobot > 0 ? (totalBobot / totalSksBerbobot).toFixed(2) : null;

    return {
      mahasiswa: mhs,
      prodi: prodiObj,
      dosen: dosenObj,
      faculties: fakObj,
      user: userObj,
      totalSks,
      totalMk: enrollments.length,
      semesterCount: semesterSet.size,
      avgNilai,
      ipk,
      courseDetails,
    };
  }, [selectedMahasiswa, studyPrograms, lecturers, faculties, kelasMahasiswas, kelasKuliahs, mataKuliahs, tahunAkademiks, users]);

  // Status badge color helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'AKTIF': return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20';
      case 'CUTI': return 'bg-amber-500/15 text-amber-700 border-amber-500/20';
      case 'LULUS': return 'bg-monday-blue/15 text-monday-blue border-monday-blue/20';
      case 'DO': return 'bg-monday-red/15 text-monday-red border-monday-red/20';
      default: return 'bg-monday-background text-monday-gray border-monday-border';
    }
  };

  // Grade letter badge
  const getGradeBadgeClass = (grade) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20';
      case 'B': return 'bg-monday-blue/15 text-monday-blue border-monday-blue/20';
      case 'C': return 'bg-amber-500/15 text-amber-700 border-amber-500/20';
      case 'D': return 'bg-monday-gray/15 text-monday-gray border-monday-gray/20';
      case 'E': return 'bg-monday-red/15 text-monday-red border-monday-red/20';
      default: return 'bg-monday-background text-monday-gray border-monday-border';
    }
  };

  // Photo component with fallback
  const StudentPhoto = ({ mahasiswa, size = 'lg' }) => {
    const [imgError, setImgError] = useState(false);
    const sizeClasses = size === 'lg' ? 'w-28 h-28' : size === 'md' ? 'w-16 h-16' : 'w-10 h-10';
    const iconSize = size === 'lg' ? 48 : size === 'md' ? 24 : 16;
    const textSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-xl' : 'text-sm';

    const photoUrl = mahasiswa.photo ? (mahasiswa.photo.startsWith('http') ? mahasiswa.photo : `/storage/${mahasiswa.photo}`) : null;

    if (photoUrl && !imgError) {
      return (
        <div className={`${sizeClasses} rounded-2xl overflow-hidden border-2 border-monday-blue/20 shadow-lg shadow-monday-blue/10 flex-shrink-0 ${size === 'lg' ? 'border-4 border-white bg-white relative z-20 shadow-xl' : ''}`}>
          <img
            src={photoUrl}
            alt={mahasiswa.name}
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
  if (selectedMahasiswa && detailData) {
    return (
      <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-monday-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedMahasiswa(null)}
              className="p-2.5 bg-monday-background border border-monday-border text-monday-gray hover:text-monday-black hover:bg-monday-gray-background rounded-2xl transition-all duration-200"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col gap-[2px]">
              <p className="flex items-center gap-2">
                <span className="font-extrabold text-2xl text-monday-black">
                  Detail Mahasiswa
                </span>
              </p>
              <p className="font-semibold text-sm text-monday-gray">
                Informasi lengkap profil dan akademik mahasiswa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('mahasiswa', 'edit', selectedMahasiswa)}
              className="px-5 py-2.5 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2"
            >
              <Edit size={14} /> Edit Data
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-monday-border overflow-hidden relative">
          <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-r from-monday-blue/15 to-violet-500/10" />

          {/* Profile Info */}
          <div className="px-8 pb-8 mt-8 relative z-10 ">
            <div className="flex items-end gap-6 mb-6">
              <StudentPhoto mahasiswa={detailData.mahasiswa} size="lg" />
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-extrabold text-2xl text-monday-black drop-shadow-sm">{detailData.mahasiswa.name}</h2>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 border-white shadow-sm ${getStatusBadge(detailData.mahasiswa.status).replace(/border-[^\s]+/g, '')}`}>
                    {detailData.mahasiswa.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1.5 bg-monday-blue/10 rounded-xl flex items-center gap-1.5 border border-monday-blue/20">
                    <GraduationCap size={13} className="text-monday-blue" />
                    <span className="text-monday-gray text-xs font-semibold">NIM:</span>
                    <span className="font-bold text-monday-blue text-base leading-none">{detailData.mahasiswa.nim}</span>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Program Studi */}
              <div className="rounded-2xl bg-monday-background/60 border border-monday-border p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-2 bg-monday-blue/10 rounded-xl text-monday-blue flex-shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-monday-gray uppercase tracking-wider mb-0.5">Program Studi</p>
                  <p className="font-bold text-sm text-monday-black truncate">{detailData.prodi?.name || '-'}</p>
                  {detailData.prodi?.jenjang && (
                    <p className="text-xs text-monday-gray font-semibold">{detailData.prodi.jenjang}</p>
                  )}
                </div>
              </div>

              {/* Fakultas */}
              <div className="rounded-2xl bg-monday-background/60 border border-monday-border p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600 flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-monday-gray uppercase tracking-wider mb-0.5">Fakultas</p>
                  <p className="font-bold text-sm text-monday-black truncate">{detailData.faculties?.name || '-'}</p>
                </div>
              </div>

              {/* Tahun Masuk */}
              <div className="rounded-2xl bg-monday-background/60 border border-monday-border p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-monday-gray uppercase tracking-wider mb-0.5">Tahun Masuk</p>
                  <p className="font-bold text-sm text-monday-black">{detailData.mahasiswa.enrollment_year}</p>
                </div>
              </div>

              {/* Dosen PA */}
              <div className="rounded-2xl bg-monday-background/60 border border-monday-border p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 flex-shrink-0">
                  <Users size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-monday-gray uppercase tracking-wider mb-0.5">Dosen Wali (PA)</p>
                  <p className="font-bold text-sm text-monday-black truncate">{detailData.dosen?.name || '-'}</p>
                  {detailData.dosen?.nidn && (
                    <p className="text-xs text-monday-gray font-semibold">NIDN: {detailData.dosen.nidn}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-monday-blue/10 to-monday-blue/5 border border-monday-blue/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-monday-blue mb-1">
                  <BookOpen size={16} />
                  <span className="font-extrabold text-2xl">{detailData.totalMk}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Mata Kuliah</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                  <Award size={16} />
                  <span className="font-extrabold text-2xl">{detailData.totalSks}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Total SKS</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                  <Clock size={16} />
                  <span className="font-extrabold text-2xl">{detailData.semesterCount}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Semester Ditempuh</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
                  <TrendingUp size={16} />
                  <span className="font-extrabold text-2xl">{detailData.avgNilai ?? '-'}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Rata-rata Nilai</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-rose-600 mb-1">
                  <ShieldCheck size={16} />
                  <span className="font-extrabold text-2xl">{detailData.ipk ?? '-'}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">IPK</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course History Table */}
        {detailData.courseDetails.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-lg text-monday-black flex items-center gap-2">
              <BookOpen size={20} className="text-monday-blue" />
              Riwayat Mata Kuliah
            </h3>
            <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
                    <th className="py-3.5 px-5">No</th>
                    <th className="py-3.5 px-5">Mata Kuliah</th>
                    <th className="py-3.5 px-5">Kelas</th>
                    <th className="py-3.5 px-5">Semester</th>
                    <th className="py-3.5 px-5 text-center">SKS</th>
                    <th className="py-3.5 px-5 text-center">Nilai</th>
                    <th className="py-3.5 px-5 text-center">Huruf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monday-border text-sm text-monday-black">
                  {detailData.courseDetails.map((cd, index) => (
                    <tr key={cd.km.id} className="hover:bg-monday-gray-background/30 transition-colors">
                      <td className="py-3 px-5 text-monday-gray font-mono font-semibold text-xs">{index + 1}</td>
                      <td className="py-3 px-5">
                        {cd.mk ? (
                          <div>
                            <span className="font-bold text-monday-black">{cd.mk.name}</span>
                            <span className="ml-2 text-xs text-monday-gray font-semibold">{cd.mk.code}</span>
                          </div>
                        ) : <span className="italic text-monday-gray">-</span>}
                      </td>
                      <td className="py-3 px-5">
                        {cd.kk ? (
                          <span className="px-2 py-0.5 bg-monday-background border border-monday-border rounded-lg text-xs font-bold text-monday-gray">
                            {cd.kk.class_name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-5">
                        {cd.ta ? (
                          <span className="text-xs font-semibold text-monday-gray">{cd.ta.name}</span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-5 text-center font-bold">{cd.mk?.sks || '-'}</td>
                      <td className="py-3 px-5 text-center font-bold">
                        {cd.km.final_score !== null && cd.km.final_score !== undefined
                          ? cd.km.final_score
                          : <span className="text-monday-gray font-normal italic text-xs">N/A</span>}
                      </td>
                      <td className="py-3 px-5 text-center">
                        {cd.km.letter_grade ? (
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getGradeBadgeClass(cd.km.letter_grade)}`}>
                            {cd.km.letter_grade}
                          </span>
                        ) : (
                          <span className="text-monday-gray text-xs italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {detailData.courseDetails.length === 0 && (
          <div className="rounded-2xl border border-dashed border-monday-border bg-monday-background/30 py-12 flex flex-col items-center gap-2">
            <BookOpen size={32} className="text-monday-gray/40" />
            <p className="text-monday-gray font-semibold text-sm">Belum ada data mata kuliah yang diambil mahasiswa ini.</p>
          </div>
        )}
      </div>
    );
  }

  // ─── MAIN TABLE VIEW ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      <PageHeader 
        title="Manage Data Mahasiswa"
        description={`Kelola data mahasiswa, program studi, dan dosen wali akademik mereka. Total: ${students.length} mahasiswa terdaftar.`}
        icon={GraduationCap}
        actionLabel="Tambah Mahasiswa"
        actionIcon={Plus}
        onActionClick={() => openModal('mahasiswa', 'create')}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari mahasiswa..."
        />
        <div className="flex items-center gap-1.5 bg-monday-background p-1.5 rounded-xl border border-monday-border shrink-0">
          <button 
            onClick={() => setViewMode('table')} 
            className={`p-2 rounded-lg transition-300 flex items-center justify-center ${viewMode === 'table' ? 'bg-white shadow-sm text-monday-blue font-bold' : 'text-monday-gray hover:text-monday-black'}`}
            title="Mode Tabel"
          >
            <Table size={18} />
          </button>
          <button 
            onClick={() => setViewMode('card')} 
            className={`p-2 rounded-lg transition-300 flex items-center justify-center ${viewMode === 'card' ? 'bg-white shadow-sm text-monday-blue font-bold' : 'text-monday-gray hover:text-monday-black'}`}
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
                <th className="py-4 px-6">Mahasiswa</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Program Studi</th>
                <th className="py-4 px-6">Dosen Wali</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
              <tr className="bg-monday-background/50 border-b border-monday-border">
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6">
                  <input
                    type="text"
                    placeholder="Filter Nama/NIM..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black placeholder:text-monday-gray/50 bg-white"
                    value={filters.nameNim}
                    onChange={e => setFilters({ ...filters, nameNim: e.target.value })}
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
                  <select
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white"
                    value={filters.academic_advisor_id}
                    onChange={e => setFilters({ ...filters, academic_advisor_id: e.target.value })}
                  >
                    <option value="">Semua Dosen</option>
                    {lecturers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </th>
                <th className="py-2 px-6">
                  <select
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white"
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">Semua Status</option>
                    <option value="AKTIF">AKTIF</option>
                    <option value="CUTI">CUTI</option>
                    <option value="LULUS">LULUS</option>
                    <option value="DROP OUT">DROP OUT</option>
                  </select>
                </th>
                <th className="py-2 px-6">
                  <button 
                    onClick={() => setFilters({ nameNim: '', email: '', study_program_id: '', academic_advisor_id: '', status: '' })}
                    className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                    title="Reset Semua Filter"
                  >
                    Reset Filter
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-monday-border text-sm text-monday-black">
              {paginatedItems.map((m, index) => {
                const prObj = studyProgramMap[m.study_program_id];
                const dosObj = lecturerMap[m.academic_advisor_id];
                const uObj = userMap[m.user_id];

                return (
                  <tr key={m.id} className="hover:bg-monday-gray-background/30 transition-colors">
                    <td className="py-3.5 px-6 text-monday-gray font-mono font-semibold">{startIndex + index + 1}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <StudentPhoto mahasiswa={m} size="sm" />
                        <div>
                          <p className="font-bold text-monday-black">{m.name}</p>
                          <p className="text-xs font-bold text-monday-blue">{m.nim}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-monday-gray font-mono">
                      {uObj ? uObj.email : '-'}
                    </td>
                    <td className="py-3.5 px-6">
                      {prObj ? (
                        <span className="px-2.5 py-1 bg-monday-background border border-monday-border rounded-xl text-xs font-bold text-monday-gray">
                          {prObj.name}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-monday-gray">
                      {dosObj ? dosObj.name : '-'}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadge(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMahasiswa(m)}
                          className="px-3.5 py-1.5 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          Detail
                        </button>
                        <ActionButtons 
                          onEdit={() => openModal('mahasiswa', 'edit', m)}
                          onDelete={() => handleDeleteItem('mahasiswa', m.id)}
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
          {cardItemsToDisplay.map((m, index) => {
            const prObj = studyProgramMap[m.study_program_id];
            const dosObj = lecturerMap[m.academic_advisor_id];
            const uObj = userMap[m.user_id];

            return (
              <div key={m.id} className="group relative flex flex-col bg-white border border-monday-border rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-monday-blue/10 transition-all duration-300">
                {/* Banner Header */}
                <div className="h-16 bg-gradient-to-r from-monday-blue/10 to-violet-500/10 relative">
                  <div className="absolute top-4 right-4 z-20">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border shadow-sm ${getStatusBadge(m.status).replace(/border-[^\s]+/g, '')} border-white`}>
                      {m.status}
                    </span>
                  </div>
                </div>
                
                {/* Body Card */}
                <div className="flex flex-col p-5 gap-3 flex-1 relative -mt-10">
                  <div className="rounded-2xl bg-white p-1 border border-monday-border shadow-sm w-max mb-1 z-10">
                    <StudentPhoto mahasiswa={m} size="md" />
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-monday-black text-lg line-clamp-1" title={m.name}>{m.name}</h3>
                    <span className="font-bold text-monday-blue text-sm">{m.nim}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 mt-2">
                    <div className="flex items-start gap-2.5 text-monday-gray" title={prObj ? prObj.name : '-'}>
                      <GraduationCap size={16} className="text-monday-gray shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-monday-gray uppercase tracking-widest leading-none">Prodi</span>
                        <span className="text-xs font-semibold text-monday-black line-clamp-2">{prObj ? prObj.name : '-'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-monday-gray" title={dosObj ? dosObj.name : '-'}>
                      <Users size={16} className="text-monday-gray shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-monday-gray uppercase tracking-widest leading-none">Dosen Wali</span>
                        <span className="text-xs font-semibold text-monday-black line-clamp-1">{dosObj ? dosObj.name : '-'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-monday-gray" title={uObj ? uObj.email : '-'}>
                      <Mail size={16} className="text-monday-gray shrink-0" />
                      <span className="text-xs font-semibold text-monday-black truncate leading-none">{uObj ? uObj.email : '-'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Footer Card */}
                <div className="px-5 py-4 bg-monday-background/50 border-t border-monday-border flex items-center justify-between mt-auto">
                  <button
                    onClick={() => setSelectedMahasiswa(m)}
                    className="px-3.5 py-1.5 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5"
                  >
                    <Eye size={13} /> Detail
                  </button>
                  <ActionButtons 
                    onEdit={() => openModal('mahasiswa', 'edit', m)}
                    onDelete={() => handleDeleteItem('mahasiswa', m.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls (Table Mode Only) */}
      {viewMode === 'table' && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-monday-border mt-2">
          <p className="text-sm font-semibold text-monday-gray">
            Menampilkan <span className="text-monday-black font-bold">{totalItems === 0 ? 0 : startIndex + 1}</span> sampai <span className="text-monday-black font-bold">{endIndex}</span> dari <span className="text-monday-black font-bold">{totalItems}</span> mahasiswa
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
            className="px-6 py-2 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-full font-bold text-xs shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:shadow-monday-blue/30 transition-all duration-300 flex items-center gap-2"
          >
            Tampilkan Lebih Banyak
          </button>
        </div>
      )}
    </div>
  );
});

export default MahasiswaTab;
