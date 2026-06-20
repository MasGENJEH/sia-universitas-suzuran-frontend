import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit, Trash2, ChevronDown, Eye, LayoutGrid, Table, Clock, MapPin, Users } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';
import ActionButtons from './ui/ActionButtons';

const KelasKuliahTab = React.memo(function KelasKuliahTab({
  kelasKuliahs,
  mataKuliahs,
  tahunAkademiks,
  dosenPengampus,
  lecturers,
  kelasMahasiswas = [],
  students = [],
  searchQuery,
  setSearchQuery,
  openModal,
  handleDeleteItem,
  mataKuliahMap = {},
  academicYearMap = {},
  lecturerMap = {},
  studentMap = {},
  handleAddStudentToClass
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    course_id: '',
    class_name: '',
    academic_year_id: ''
  });

  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Reset limit to 10 when searching
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, filters]);

  const filteredItems = kelasKuliahs.filter(k => {
    const mk = mataKuliahMap[k.course_id];
    const mkName = mk ? mk.name.toLowerCase() : '';
    const mkCode = mk ? mk.code.toLowerCase() : '';

    const matchesGlobal = k.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mkName.includes(searchQuery.toLowerCase()) ||
      mkCode.includes(searchQuery.toLowerCase());

    const matchesCourse = filters.course_id === '' || String(k.course_id) === String(filters.course_id);
    const matchesClassName = filters.class_name === '' || k.class_name.toLowerCase().includes(filters.class_name.toLowerCase());
    const matchesYear = filters.academic_year_id === '' || String(k.academic_year_id) === String(filters.academic_year_id);

    return matchesGlobal && matchesCourse && matchesClassName && matchesYear;
  });

  const itemsToDisplay = filteredItems.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      <PageHeader
        title="Manage Kelas Kuliah & Team Teaching"
        description={`Kelola kelas perkuliahan aktif, penugasan dosen tunggal, atau team teaching pengampu. Total: ${kelasKuliahs.length} kelas terdaftar.`}
        icon={Layers}
        actionLabel="Tambah Kelas Kuliah"
        actionIcon={Plus}
        onActionClick={() => openModal('kelasKuliah', 'create')}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kelas..."
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
                <th className="py-4 px-6">Mata Kuliah</th>
                <th className="py-4 px-6">Nama Kelas</th>
                <th className="py-4 px-6">Tahun Akademik</th>
                <th className="py-4 px-6">Jadwal & Ruangan</th>
                <th className="py-4 px-6">Dosen Pengampu</th>
                <th className="py-4 px-6">Peserta</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
              <tr className="bg-monday-background/50 border-b border-monday-border">
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6">
                  <select
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white"
                    value={filters.course_id}
                    onChange={e => setFilters({ ...filters, course_id: e.target.value })}
                  >
                    <option value="">Semua Mata Kuliah</option>
                    {mataKuliahs.map(mk => <option key={mk.id} value={mk.id}>{mk.code} - {mk.name}</option>)}
                  </select>
                </th>
                <th className="py-2 px-6">
                  <input
                    type="text"
                    placeholder="Filter Kelas..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black placeholder:text-monday-gray/50 bg-white"
                    value={filters.class_name}
                    onChange={e => setFilters({ ...filters, class_name: e.target.value })}
                  />
                </th>
                <th className="py-2 px-6">
                  <select
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-monday-border focus:outline-none focus:border-monday-blue font-normal normal-case tracking-normal text-monday-black bg-white"
                    value={filters.academic_year_id}
                    onChange={e => setFilters({ ...filters, academic_year_id: e.target.value })}
                  >
                    <option value="">Semua Tahun</option>
                    {tahunAkademiks.map(t => <option key={t.id} value={t.id}>{t.code}</option>)}
                  </select>
                </th>
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6"></th>
                <th className="py-2 px-6">
                  <button
                    onClick={() => setFilters({ course_id: '', class_name: '', academic_year_id: '' })}
                    className="w-full px-2.5 py-1.5 text-[11px] font-bold text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-lg transition-all flex items-center justify-center gap-1 normal-case tracking-normal"
                    title="Reset Filter"
                  >
                    Reset
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-monday-border text-sm text-monday-black">
              {itemsToDisplay.map((k, index) => {
                const mkObj = mataKuliahMap[k.course_id];
                const taObj = academicYearMap[k.academic_year_id];

                // Get assigned lecturers for this class
                const activeLecturerLinks = dosenPengampus.filter(dp => dp.course_class_id === k.id);
                const linkedDosenNames = activeLecturerLinks.map(dp => {
                  const d = lecturerMap[dp.lecturer_id];
                  return d ? d.name : null;
                }).filter(Boolean);

                // Get student count for this class
                const studentCount = kelasMahasiswas.filter(km => km.course_class_id === k.id).length;

                return (
                  <tr key={k.id} className="hover:bg-monday-gray-background/30 transition-colors">
                    <td className="py-3.5 px-6 text-monday-gray font-mono font-semibold">{index + 1}</td>
                    <td className="py-3.5 px-6">
                      {mkObj ? (
                        <div>
                          <span className="font-bold text-monday-blue">{mkObj.code}</span>
                          <span className="ml-2 font-semibold">{mkObj.name}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3.5 px-6 font-bold">{k.class_name}</td>
                    <td className="py-3.5 px-6">
                      {taObj ? (
                        <span className="px-2 py-0.5 bg-monday-background border border-monday-border rounded-lg text-xs font-bold text-monday-gray">
                          {taObj.code}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="text-xs text-monday-gray font-semibold">
                        <span className="font-bold text-monday-black block">{k.day}</span>
                        <span>{k.start_time.substring(0, 5)} - {k.end_time.substring(0, 5)} ({k.room})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {linkedDosenNames.length > 0 ? (
                          linkedDosenNames.map((name, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-[11px] font-bold">
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="text-monday-red text-xs font-bold italic">Belum Ada Pengampu</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-1 bg-monday-blue/10 rounded-full text-xs font-bold text-monday-blue font-mono">
                        {studentCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClassForDetail(k)}
                          title="Lihat Detail & Mahasiswa"
                          className="p-1.5 text-monday-gray hover:text-monday-blue hover:bg-monday-blue/10 rounded-xl transition-300"
                        >
                          <Eye size={16} />
                        </button>
                        <ActionButtons
                          onEdit={() => openModal('kelasKuliah', 'edit', k)}
                          onDelete={() => handleDeleteItem('kelasKuliah', k.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {itemsToDisplay.map((k, index) => {
            const mkObj = mataKuliahMap[k.course_id];
            const taObj = academicYearMap[k.academic_year_id];

            const activeLecturerLinks = dosenPengampus.filter(dp => dp.course_class_id === k.id);
            const linkedDosenNames = activeLecturerLinks.map(dp => {
              const d = lecturerMap[dp.lecturer_id];
              return d ? d.name : null;
            }).filter(Boolean);

            const studentCount = kelasMahasiswas.filter(km => km.course_class_id === k.id).length;

            return (
              <div key={k.id} className="group relative flex flex-col bg-white border border-monday-border rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-monday-blue/10 transition-all duration-300">
                {/* Header Card */}
                <div className="px-5 py-4 border-b border-monday-border bg-gradient-to-br from-monday-blue/5 to-transparent flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="px-2.5 py-1 bg-white border border-monday-blue/20 text-monday-blue font-bold text-[10px] uppercase tracking-wider rounded-lg w-max">
                      {mkObj ? mkObj.code : '-'}
                    </span>
                    <h3 className="font-extrabold text-monday-black text-lg line-clamp-2 leading-tight">
                      {mkObj ? mkObj.name : 'Unknown Course'}
                    </h3>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1 mt-0.5">
                    <span className="flex items-center justify-center min-w-[40px] h-10 px-2.5 rounded-2xl bg-white border border-monday-border font-extrabold text-monday-black shadow-sm text-base">
                      {k.class_name}
                    </span>
                  </div>
                </div>

                {/* Body Card */}
                <div className="flex flex-col p-5 gap-4 flex-1">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-monday-gray">
                      <div className="p-1.5 bg-monday-background rounded-lg text-monday-black shrink-0">
                        <Clock size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Jadwal</span>
                        <span className="text-sm font-semibold text-monday-black">{k.day}, {k.start_time.substring(0, 5)} - {k.end_time.substring(0, 5)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-monday-gray">
                      <div className="p-1.5 bg-monday-background rounded-lg text-monday-black shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ruangan</span>
                        <span className="text-sm font-semibold text-monday-black">{k.room}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-monday-gray">
                      <div className="p-1.5 bg-monday-background rounded-lg text-monday-black shrink-0 mt-0.5">
                        <Users size={16} />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Dosen Pengampu</span>
                        <div className="flex flex-wrap gap-1.5">
                          {linkedDosenNames.length > 0 ? (
                            linkedDosenNames.map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-[11px] font-bold">
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-monday-red text-xs font-bold italic">Belum Ada Pengampu</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="px-5 py-4 bg-monday-background/50 border-t border-monday-border flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-monday-blue/10 border border-monday-blue/20 rounded-full text-xs font-bold text-monday-blue font-mono flex items-center gap-1.5">
                      <Users size={12} /> {studentCount} Peserta
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedClassForDetail(k)}
                      title="Lihat Detail & Mahasiswa"
                      className="p-1.5 text-monday-gray hover:text-monday-blue hover:bg-monday-blue/10 rounded-xl transition-300"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openModal('kelasKuliah', 'edit', k)}
                      title="Edit Kelas"
                      className="p-1.5 text-monday-gray hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-300"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem('kelasKuliah', k.id)}
                      title="Hapus Kelas"
                      className="p-1.5 text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-xl transition-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
      {/* Detail Modal */}
      {selectedClassForDetail && (() => {
        const mkObj = mataKuliahMap[selectedClassForDetail.course_id];
        const taObj = academicYearMap[selectedClassForDetail.academic_year_id];

        // Dosen Pengampu
        const activeLecturerLinks = dosenPengampus.filter(dp => dp.course_class_id === selectedClassForDetail.id);
        const linkedDosenNames = activeLecturerLinks.map(dp => {
          const d = lecturerMap[dp.lecturer_id];
          return d ? d.name : null;
        }).filter(Boolean);

        // Enrolled Students
        const enrollments = kelasMahasiswas.filter(km => km.course_class_id === selectedClassForDetail.id);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-monday-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-monday-border max-w-3xl w-full flex flex-col gap-6 transform scale-100 transition-all duration-300 max-h-[85vh]">

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-monday-border">
                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold text-xl text-monday-black">
                    Detail Kelas & Daftar Mahasiswa
                  </h3>
                  <p className="text-sm font-semibold text-monday-gray">
                    Informasi kelas kuliah dan list mahasiswa yang mengambil kelas ini.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedClassForDetail(null)}
                    className="px-4 py-2 bg-monday-background border border-monday-border hover:bg-monday-gray-background text-monday-black rounded-full font-bold text-xs transition-300"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              {/* Class Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-monday-background p-5 rounded-2xl border border-monday-border text-sm">
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-monday-gray">
                    Mata Kuliah: <span className="text-monday-black font-extrabold block mt-0.5">{mkObj ? `${mkObj.code} - ${mkObj.name}` : '-'}</span>
                  </p>
                  <p className="font-semibold text-monday-gray">
                    Nama Kelas: <span className="text-monday-black font-extrabold block mt-0.5">{selectedClassForDetail.class_name}</span>
                  </p>
                  <p className="font-semibold text-monday-gray">
                    Tahun Akademik: <span className="text-monday-black font-extrabold block mt-0.5">{taObj ? taObj.name : '-'}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-monday-gray">
                    Jadwal Kuliah: <span className="text-monday-black font-extrabold block mt-0.5">{selectedClassForDetail.day}, {selectedClassForDetail.start_time.substring(0, 5)} - {selectedClassForDetail.end_time.substring(0, 5)}</span>
                  </p>
                  <p className="font-semibold text-monday-gray">
                    Ruangan: <span className="text-monday-black font-extrabold block mt-0.5">{selectedClassForDetail.room}</span>
                  </p>
                  <p className="font-semibold text-monday-gray">
                    Dosen Pengampu: <span className="text-monday-black font-extrabold block mt-0.5">{linkedDosenNames.length > 0 ? linkedDosenNames.join(', ') : 'Belum Ada Dosen'}</span>
                  </p>
                </div>
              </div>

              {/* Enrolled Students Table */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-monday-black uppercase tracking-wider">
                    Mahasiswa Terdaftar ({enrollments.length})
                  </h4>
                  <div className="relative w-64">
                    <div className="flex items-center border border-monday-border rounded-full bg-white px-3 py-1.5 focus-within:border-monday-blue focus-within:ring-2 focus-within:ring-monday-blue/20 transition-all">
                      <Search size={14} className="text-monday-gray shrink-0 mr-2" />
                      <input
                        type="text"
                        placeholder="Cari Mahasiswa Untuk Tambah"
                        className="w-full text-xs font-semibold focus:outline-none bg-transparent"
                        value={studentSearchQuery}
                        onChange={(e) => {
                          setStudentSearchQuery(e.target.value);
                          setIsStudentDropdownOpen(true);
                        }}
                        onFocus={() => setIsStudentDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsStudentDropdownOpen(false), 200)}
                      />
                    </div>
                    {isStudentDropdownOpen && studentSearchQuery.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-monday-border rounded-xl shadow-xl max-h-48 overflow-y-auto z-[110]">
                        {students.filter(s =>
                          (s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                            s.nim.toLowerCase().includes(studentSearchQuery.toLowerCase())) &&
                          !enrollments.some(en => en.student_id === s.id)
                        ).slice(0, 5).map(s => (
                          <div
                            key={s.id}
                            className="px-3 py-2 hover:bg-monday-gray-background cursor-pointer text-xs font-semibold border-b border-monday-border last:border-0 flex justify-between items-center"
                            onClick={async () => {
                              if (!handleAddStudentToClass || isAddingStudent) return;
                              setIsAddingStudent(true);
                              const result = await handleAddStudentToClass(selectedClassForDetail.id, s.id);
                              if (result.success) {
                                setStudentSearchQuery('');
                                setIsStudentDropdownOpen(false);
                              } else {
                                alert(result.message);
                              }
                              setIsAddingStudent(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="text-monday-blue font-bold font-mono">{s.nim}</span>
                              <span className="text-monday-black truncate max-w-[150px]">{s.name}</span>
                            </div>
                            <Plus size={14} className="text-monday-gray" />
                          </div>
                        ))}
                        {students.filter(s =>
                          (s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                            s.nim.toLowerCase().includes(studentSearchQuery.toLowerCase())) &&
                          !enrollments.some(en => en.student_id === s.id)
                        ).length === 0 && (
                            <div className="px-3 py-3 text-center text-xs text-monday-gray italic">
                              Tidak ditemukan / sudah terdaftar
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-monday-border rounded-xl overflow-x-auto overflow-y-auto bg-white max-h-[300px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray sticky top-0 z-10">
                        <th className="py-3 px-5">No</th>
                        <th className="py-3 px-5">NIM</th>
                        <th className="py-3 px-5">Nama Mahasiswa</th>
                        <th className="py-3 px-5 text-right">Nilai Akhir</th>
                        <th className="py-3 px-5 text-right">Nilai Huruf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-monday-border text-sm text-monday-black">
                      {enrollments.length > 0 ? (
                        enrollments.map((en, index) => {
                          const mhs = studentMap[en.student_id];
                          return (
                            <tr key={en.id} className="hover:bg-monday-gray-background/30 transition-colors">
                              <td className="py-2.5 px-5 text-monday-gray font-mono font-semibold">{index + 1}</td>
                              <td className="py-2.5 px-5 font-bold text-monday-blue font-mono">{mhs ? mhs.nim : '-'}</td>
                              <td className="py-2.5 px-5 font-semibold">{mhs ? mhs.name : 'Tidak Diketahui'}</td>
                              <td className="py-2.5 px-5 text-right font-bold text-monday-black">{en.final_score || '0'}</td>
                              <td className="py-2.5 px-5 text-right">
                                {en.letter_grade ? (
                                  <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${en.letter_grade === 'A' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20' :
                                    en.letter_grade === 'B' ? 'bg-monday-blue/15 text-monday-blue border-monday-blue/20' :
                                      en.letter_grade === 'C' ? 'bg-amber-500/15 text-amber-700 border-amber-500/20' :
                                        en.letter_grade === 'D' ? 'bg-monday-red/15 text-monday-red border-monday-red/20' :
                                          en.letter_grade === 'E' ? 'bg-monday-red/15 text-monday-red border-monday-red/20' :
                                            'bg-monday-background text-monday-gray border-monday-border'
                                    }`}>
                                    {en.letter_grade}
                                  </span>
                                ) : (
                                  <span className="text-monday-gray text-xs italic">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-monday-gray font-bold italic">
                            Belum ada mahasiswa yang terdaftar di kelas ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
});

export default KelasKuliahTab;
