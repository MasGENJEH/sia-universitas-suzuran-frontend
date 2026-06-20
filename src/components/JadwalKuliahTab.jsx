import React, { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Users, Info, Smile, Eye, X, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

const JadwalKuliahTab = React.memo(function JadwalKuliahTab({
  user,
  students,
  kelasMahasiswas,
  kelasKuliahs,
  mataKuliahs,
  lecturers = [],
  dosenPengampus = [],
  tahunAkademiks = [],
  mataKuliahMap = {},
  academicYearMap = {},
  lecturerMap = {},
  studentMap = {}
}) {
  const isMahasiswa = (user?.roles || []).some(r => r.name === 'mahasiswa');

  // Find current student record
  const myMahasiswa = useMemo(() => {
    if (!isMahasiswa || !user) return null;
    return students.find(m => m.user_id === user.id) || null;
  }, [isMahasiswa, user, students]);

  // Find active academic year
  const activeSemester = useMemo(() => {
    return tahunAkademiks.find(ta => ta.status) || null;
  }, [tahunAkademiks]);

  // HARI order map for sorting
  const HARI_ORDER = {
    'SENIN': 1,
    'SELASA': 2,
    'RABU': 3,
    'KAMIS': 4,
    'JUMAT': 5,
    'SABTU': 6,
    'MINGGU': 7
  };

  // Day accordion feature states
  const [expandedDays, setExpandedDays] = useState(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']);

  const toggleDay = (dayName) => {
    setExpandedDays(prev => 
      prev.includes(dayName) ? prev.filter(d => d !== dayName) : [...prev, dayName]
    );
  };

  // Absensi feature states
  const [selectedAbsensiClass, setSelectedAbsensiClass] = useState(null);
  const [absensiData, setAbsensiData] = useState([]);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);

  const handleViewAbsensi = async (cls) => {
    setSelectedAbsensiClass(cls);
    setLoadingAbsensi(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/absensis?course_class_id=${cls.id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAbsensiData(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAbsensi(false);
    }
  };

  // Group and format schedule items
  const scheduleData = useMemo(() => {
    if (!myMahasiswa || !activeSemester) return { days: {}, totalSks: 0, totalClasses: 0 };

    // Get all enrollments for this student
    const studentEnrollments = kelasMahasiswas.filter(km => km.student_id === myMahasiswa.id);

    let totalSks = 0;
    let totalClasses = 0;
    const daysGroup = {
      'SENIN': [],
      'SELASA': [],
      'RABU': [],
      'KAMIS': [],
      'JUMAT': [],
      'SABTU': [],
      'MINGGU': []
    };

    studentEnrollments.forEach(km => {
      // Find class details
      const kk = kelasKuliahs.find(k => k.id === km.course_class_id);
      if (!kk) return;

      // Filter by active semester
      if (kk.academic_year_id !== activeSemester.id) return;

      // Find course details
      const mk = mataKuliahMap[kk.course_id];
      if (!mk) return;

      totalSks += Number(mk.sks || 0);
      totalClasses++;

      // Find lecturers
      const teachingLinks = dosenPengampus.filter(dp => dp.course_class_id === kk.id);
      const classLecturers = teachingLinks
        .map(dp => lecturerMap[dp.lecturer_id])
        .filter(Boolean);

      const dayName = (kk.day || '').toUpperCase().trim();

      if (daysGroup[dayName]) {
        daysGroup[dayName].push({
          id: kk.id,
          class_code: kk.class_code,
          class_name: kk.class_name,
          start_time: kk.start_time,
          end_time: kk.end_time,
          room: kk.room,
          mata_kuliah: mk,
          lecturers: classLecturers
        });
      }
    });

    // Sort classes inside each day by start time
    Object.keys(daysGroup).forEach(day => {
      daysGroup[day].sort((a, b) => {
        const timeA = a.start_time || '00:00:00';
        const timeB = b.start_time || '00:00:00';
        return timeA.localeCompare(timeB);
      });
    });

    return {
      days: daysGroup,
      totalSks,
      totalClasses
    };
  }, [myMahasiswa, activeSemester, kelasMahasiswas, kelasKuliahs, mataKuliahs, lecturers, dosenPengampus]);

  if (!isMahasiswa) {
    return (
      <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
        <div className="flex items-center gap-4 pb-4 border-b border-monday-border">
          <div className="p-3 bg-monday-blue/10 text-monday-blue rounded-2xl">
            <Info size={24} />
          </div>
          <div>
            <h2 className="font-extrabold text-2xl text-monday-black">Jadwal Kuliah</h2>
            <p className="font-semibold text-sm text-monday-gray">Fitur ini hanya dapat diakses oleh Mahasiswa.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!myMahasiswa) {
    return (
      <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 bg-monday-red/10 text-monday-red rounded-full">
            <Info size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-monday-black">Profil Mahasiswa Tidak Ditemukan</h3>
            <p className="text-sm font-semibold text-monday-gray max-w-sm mt-1">
              Akun Anda belum terhubung dengan data mahasiswa aktif. Silakan hubungi Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeSemester) {
    return (
      <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 bg-monday-yellow/10 text-monday-yellow rounded-full">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-monday-black">Tidak Ada Semester Aktif</h3>
            <p className="text-sm font-semibold text-monday-gray max-w-sm mt-1">
              Saat ini tidak ada tahun akademik atau semester aktif di sistem. Silakan hubungi Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Define days array for rendering order
  const orderOfDays = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
      {/* Header and Semester info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-monday-border gap-4">
        <div className="flex flex-col gap-[4px]">
          <p className="flex items-center gap-[8px]">
            <Calendar className="size-6 text-monday-black" />
            <span className="font-extrabold text-2xl text-monday-black">
              Jadwal Kuliah Saya
            </span>
          </p>
          <p className="font-semibold text-sm text-monday-gray">
            Jadwal kelas kuliah Anda untuk semester aktif saat ini.
          </p>
        </div>

        {/* Semester Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-monday-blue/10 border border-monday-blue/15 rounded-2xl md:self-center self-start">
          <Clock size={16} className="text-monday-blue" />
          <span className="text-xs font-bold text-monday-blue">
            Semester Aktif: {activeSemester.name}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-monday-border bg-gradient-to-br from-monday-blue/5 to-transparent flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-monday-gray uppercase tracking-wider">Total Beban SKS</span>
            <span className="block font-extrabold text-2xl text-monday-black mt-1">{scheduleData.totalSks} SKS</span>
          </div>
          <div className="p-3 bg-monday-blue/10 text-monday-blue rounded-xl">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-monday-border bg-gradient-to-br from-emerald-500/5 to-transparent flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-monday-gray uppercase tracking-wider">Total Kelas Kuliah</span>
            <span className="block font-extrabold text-2xl text-monday-black mt-1">{scheduleData.totalClasses} Kelas</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Calendar size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-monday-border bg-gradient-to-br from-amber-500/5 to-transparent flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-bold text-monday-gray uppercase tracking-wider">Hari Kuliah Efektif</span>
            <span className="block font-extrabold text-2xl text-monday-black mt-1">
              {orderOfDays.filter(day => scheduleData.days[day]?.length > 0).length} Hari
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Weekly Schedule Timeline */}
      <div className="space-y-6 mt-4">
        {orderOfDays.map(dayName => {
          const classes = scheduleData.days[dayName] || [];
          const hasClasses = classes.length > 0;
          const isDayExpanded = expandedDays.includes(dayName);

          return (
            <div key={dayName} className="flex flex-col gap-3">
              {/* Day Header */}
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => toggleDay(dayName)}
              >
                <div className={`p-1 rounded-md transition-all duration-300 ${isDayExpanded ? 'text-monday-blue bg-monday-blue/10 rotate-180' : 'text-monday-gray group-hover:bg-monday-gray-background group-hover:text-monday-black'}`}>
                  <ChevronDown size={16} />
                </div>
                <h3 className="font-extrabold text-base text-monday-black tracking-wider uppercase group-hover:text-monday-blue transition-colors">
                  {dayName}
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${hasClasses
                    ? 'bg-monday-blue/10 text-monday-blue border-monday-blue/15'
                    : 'bg-monday-gray-background text-monday-gray border-monday-border'
                  }`}>
                  {classes.length} Kelas
                </span>
                <div className="flex-1 h-px bg-monday-border" />
              </div>

              {/* Day Classes Grid/List */}
              <div className={`transition-all duration-300 overflow-hidden ${isDayExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
                {hasClasses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {classes.map(cls => (
                    <div
                      key={cls.id}
                      className="flex flex-col justify-between p-5 bg-white border border-monday-border rounded-2xl hover:border-monday-blue hover:shadow-md hover:shadow-monday-blue/5 transition-all duration-300 border-l-4 border-l-monday-blue"
                    >
                      <div>
                        {/* Course Name and Class Code */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-base text-monday-black leading-snug">
                              {cls.mata_kuliah.name}
                            </span>
                            <span className="text-xs font-bold text-monday-gray mt-0.5">
                              {cls.mata_kuliah.code} • {cls.class_name}
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-monday-background border border-monday-border text-[10px] font-extrabold text-monday-gray rounded-lg whitespace-nowrap">
                            {cls.mata_kuliah.sks} SKS
                          </span>
                        </div>

                        {/* Schedule Info */}
                        <div className="space-y-2 mt-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-monday-black">
                            <Clock size={14} className="text-monday-blue" />
                            <span>
                              {cls.start_time.substring(0, 5)} - {cls.end_time.substring(0, 5)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-monday-gray">
                            <MapPin size={14} className="text-monday-gray" />
                            <span>Ruang {cls.room}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lecturers */}
                      <div className="border-t border-monday-border pt-3 mt-4 flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <Users size={14} className="text-monday-gray mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider mb-0.5">Dosen Pengampu</span>
                            {cls.lecturers.length > 0 ? (
                              cls.lecturers.map(doc => (
                                <span key={doc.id} className="text-xs font-bold text-monday-black leading-relaxed">
                                  {doc.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-semibold text-monday-gray italic">
                                Belum ditentukan
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewAbsensi(cls)}
                          className="p-2 bg-monday-blue/10 text-monday-blue hover:bg-monday-blue hover:text-white rounded-xl transition-all duration-200"
                          title="Cek Kehadiran"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty Day Card */
                <div className="flex items-center gap-3 p-4 bg-monday-gray-background/30 border border-dashed border-monday-border rounded-2xl text-monday-gray text-xs font-bold">
                  <Smile size={16} className="text-monday-gray/60" />
                  <span>Tidak ada jadwal kuliah day ini. Waktunya istirahat atau belajar mandiri!</span>
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Absensi Modal */}
      {selectedAbsensiClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-monday-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-monday-border overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-monday-border bg-monday-background/30">
              <div>
                <h3 className="font-extrabold text-xl text-monday-black">Kehadiran Kelas</h3>
                <p className="text-sm font-semibold text-monday-gray mt-1">
                  {selectedAbsensiClass.mata_kuliah.name} (Kelas {selectedAbsensiClass.class_name})
                </p>
              </div>
              <button 
                onClick={() => setSelectedAbsensiClass(null)}
                className="p-2.5 bg-white border border-monday-border text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-2xl transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingAbsensi ? (
                <div className="py-12 text-center text-monday-gray text-sm font-bold animate-pulse">
                  Memuat data kehadiran...
                </div>
              ) : absensiData.length > 0 ? (
                <div className="space-y-4">
                  {absensiData.map((meeting, idx) => {
                    // Find the current student's record
                    const myRecord = (meeting.absensis || []).find(r => r.student_id === myMahasiswa.id);
                    const status = myRecord?.status;

                    let statusBadge = (
                      <span className="px-3 py-1 bg-monday-gray-background text-monday-gray border border-monday-border rounded-lg text-[10px] font-extrabold uppercase">
                        Belum Diisi
                      </span>
                    );

                    if (status === 'hadir') {
                      statusBadge = <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1.5"><CheckCircle2 size={12} /> Hadir</span>;
                    } else if (status === 'sakit') {
                      statusBadge = <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1.5"><AlertCircle size={12} /> Sakit</span>;
                    } else if (status === 'izin') {
                      statusBadge = <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1.5"><AlertCircle size={12} /> Izin</span>;
                    } else if (status === 'alfa') {
                      statusBadge = <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1.5"><AlertCircle size={12} /> Alfa</span>;
                    }

                    return (
                      <div key={meeting.id} className="flex items-center justify-between p-4 border border-monday-border rounded-2xl bg-white hover:bg-monday-gray-background/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-monday-blue/10 text-monday-blue flex items-center justify-center font-extrabold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-monday-black">Pertemuan {idx + 1}</p>
                            <p className="text-xs font-semibold text-monday-gray mt-0.5">
                              {new Date(meeting.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div>
                          {statusBadge}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-sm font-bold flex flex-col items-center gap-2">
                  <Info size={24} className="text-monday-gray/50" />
                  Belum ada data kehadiran untuk kelas ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default JadwalKuliahTab;
