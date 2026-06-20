import React, { useMemo } from 'react';
import { Building, Award, Users, GraduationCap, Star, BookOpen, TrendingUp, CheckCircle, Calendar, Bell, ArrowRight, Briefcase, FileText, Activity, Layers } from 'lucide-react';
import MetricCard from './ui/MetricCard';
import WelcomeBanner from './ui/WelcomeBanner';

const DashboardTab = React.memo(function DashboardTab({
  user,
  faculties,
  studyPrograms,
  lecturers,
  students,
  activeSemester,
  kelasKuliahs,
  dosenPengampus,
  kelasMahasiswas = [],
  mataKuliahs = [],
  setActiveTab,
  mataKuliahMap = {},
  lecturerMap = {},
  studentMap = {},
  academicYearMap = {}
}) {
  const isMahasiswa = (user?.roles || []).some(r => r.name === 'mahasiswa');
  const isDosen = (user?.roles || []).some(r => r.name === 'dosen') && !isMahasiswa;

  // Compute student stats
  const studentMetrics = useMemo(() => {
    if (!isMahasiswa || !user) return null;
    const myMhs = students.find(m => m.user_id === user.id);
    if (!myMhs) return null;

    const studentEnrollments = kelasMahasiswas.filter(km => km.student_id === myMhs.id);

    const getGradeWeight = (letter) => {
      const char = (letter || '').toUpperCase().trim();
      switch (char) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        case 'E': return 0.0;
        default: return 0.0;
      }
    };

    let sksDiambilSemesterIni = 0;
    let sksLulusTotal = 0;
    let gradedSksSemester = 0;
    let weightedSumSemester = 0;
    let gradedSksTotal = 0;
    let weightedSumTotal = 0;
    const activeClasses = [];

    studentEnrollments.forEach(km => {
      const kk = kelasKuliahs.find(k => k.id === km.course_class_id);
      if (!kk) return;

      const mk = mataKuliahMap[kk.course_id];
      if (!mk) return;

      const sks = Number(mk.sks || 0);

      const isCurrentSemester = activeSemester && kk.academic_year_id === activeSemester.id;

      if (isCurrentSemester) {
        sksDiambilSemesterIni += sks;
        activeClasses.push(kk);
        if (km.letter_grade !== null && km.letter_grade !== undefined) {
          gradedSksSemester += sks;
          weightedSumSemester += sks * getGradeWeight(km.letter_grade);
        }
      }

      if (km.letter_grade !== null && km.letter_grade !== undefined) {
        gradedSksTotal += sks;
        weightedSumTotal += sks * getGradeWeight(km.letter_grade);
        if (km.letter_grade.toUpperCase().trim() !== 'E') {
          sksLulusTotal += sks;
        }
      }
    });

    const ips = gradedSksSemester > 0 ? (weightedSumSemester / gradedSksSemester).toFixed(2) : '0.00';
    const ipk = gradedSksTotal > 0 ? (weightedSumTotal / gradedSksTotal).toFixed(2) : '0.00';

    const daysIndo = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const todayName = daysIndo[new Date().getDay()];
    const todayClasses = activeClasses.filter(c => (c.day || '').toUpperCase().trim() === todayName);
    
    todayClasses.sort((a, b) => {
      const tA = a.start_time || '';
      const tB = b.start_time || '';
      return tA.localeCompare(tB);
    });

    return {
      ips,
      ipk,
      sksLulus: sksLulusTotal,
      sksDiambil: sksDiambilSemesterIni,
      todayClasses
    };
  }, [isMahasiswa, user, students, kelasMahasiswas, kelasKuliahs, mataKuliahMap, activeSemester]);

  // Compute dosen stats
  const dosenMetrics = useMemo(() => {
    if (!isDosen || !user) return null;
    const myDosen = lecturers.find(d => d.user_id === user.id);
    if (!myDosen) return null;

    // Total Kelas Diajar (active semester)
    const myTeachingAssignments = dosenPengampus.filter(dp => dp.lecturer_id === myDosen.id);
    const activeClasses = [];
    let totalSks = 0;
    
    myTeachingAssignments.forEach(dp => {
      const kk = kelasKuliahs.find(k => k.id === dp.course_class_id);
      if (kk && activeSemester && kk.academic_year_id === activeSemester.id) {
        activeClasses.push(kk);
        const mk = mataKuliahMap[kk.course_id];
        if (mk) totalSks += Number(mk.sks || 0);
      }
    });

    const activeClassIds = activeClasses.map(k => k.id);
    const uniqueStudentsInClass = new Set();
    kelasMahasiswas.forEach(km => {
      if (activeClassIds.includes(km.course_class_id)) {
        uniqueStudentsInClass.add(km.student_id);
      }
    });

    const advisees = students.filter(s => s.academic_advisor_id === myDosen.id);

    const daysIndo = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const todayName = daysIndo[new Date().getDay()];
    const todayClasses = activeClasses.filter(c => (c.day || '').toUpperCase().trim() === todayName);
    
    todayClasses.sort((a, b) => {
      const tA = a.start_time || '';
      const tB = b.start_time || '';
      return tA.localeCompare(tB);
    });

    return {
      totalKelas: activeClasses.length,
      totalSks,
      totalMahasiswaDiajar: uniqueStudentsInClass.size,
      totalMahasiswaBimbingan: advisees.length,
      todayClasses
    };
  }, [isDosen, user, lecturers, dosenPengampus, kelasKuliahs, mataKuliahMap, activeSemester, kelasMahasiswas, students]);

  // Determine which metrics cards to render
  const metrics = useMemo(() => {
    if (isMahasiswa && studentMetrics) {
      return [
        { title: 'Indeks Prestasi Kumulatif (IPK)', count: studentMetrics.ipk, icon: TrendingUp, colorClass: 'bg-monday-blue/10 text-monday-blue' },
        { title: 'Indeks Prestasi Semester (IPS)', count: studentMetrics.ips, icon: Star, colorClass: 'bg-violet-500/10 text-violet-600' },
        { title: 'Total SKS Lulus', count: `${studentMetrics.sksLulus} SKS`, icon: CheckCircle, colorClass: 'bg-emerald-500/10 text-emerald-600' },
        { title: 'SKS Diambil Semester Ini', count: `${studentMetrics.sksDiambil} SKS`, icon: BookOpen, colorClass: 'bg-amber-500/10 text-amber-600' },
      ];
    }
    if (isDosen && dosenMetrics) {
      return [
        { title: 'Kelas Diajar (Semester Ini)', count: dosenMetrics.totalKelas, icon: Building, colorClass: 'bg-monday-blue/10 text-monday-blue' },
        { title: 'Total SKS Diampu', count: `${dosenMetrics.totalSks} SKS`, icon: Award, colorClass: 'bg-violet-500/10 text-violet-600' },
        { title: 'Mahasiswa di Kelas', count: dosenMetrics.totalMahasiswaDiajar, icon: Users, colorClass: 'bg-emerald-500/10 text-emerald-600' },
        { title: 'Mahasiswa Bimbingan', count: dosenMetrics.totalMahasiswaBimbingan, icon: GraduationCap, colorClass: 'bg-amber-500/10 text-amber-600' },
      ];
    }
    return [
      { title: 'Total Fakultas', count: faculties.length, icon: Building, colorClass: 'bg-monday-blue/10 text-monday-blue' },
      { title: 'Program Studi', count: studyPrograms.length, icon: Award, colorClass: 'bg-violet-500/10 text-violet-600' },
      { title: 'Dosen Pengajar', count: lecturers.length, icon: Users, colorClass: 'bg-emerald-500/10 text-emerald-600' },
      { title: 'Mahasiswa Terdaftar', count: students.length, icon: GraduationCap, colorClass: 'bg-amber-500/10 text-amber-600' },
    ];
  }, [isMahasiswa, studentMetrics, isDosen, dosenMetrics, faculties, studyPrograms, lecturers, students]);

  // Dummy announcements data
  const announcements = [
    { id: 1, title: 'Batas Akhir Pembayaran UKT Semester Ini', date: 'Besok', type: 'Penting', color: 'bg-monday-red/10 text-monday-red border-monday-red/20' },
    { id: 2, title: 'Jadwal Pengisian KRS Telah Dibuka', date: '3 Hari Lagi', type: 'Akademik', color: 'bg-monday-blue/10 text-monday-blue border-monday-blue/20' },
    { id: 3, title: 'Batas Akhir Input Nilai KHS bagi Dosen', date: '1 Minggu Lagi', type: 'Dosen', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  ];

  const targetSKS = 144;
  const sksProgress = studentMetrics ? Math.min((studentMetrics.sksLulus / targetSKS) * 100, 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Metric Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((stat, idx) => (
          <MetricCard 
            key={idx}
            title={stat.title}
            count={stat.count}
            icon={stat.icon}
            colorClass={stat.colorClass}
          />
        ))}
      </div>

      {/* Welcome banner */}
      <WelcomeBanner 
        title={
          isMahasiswa 
            ? 'Selamat Datang di SIAKAD Suzuran Student Portal' 
            : isDosen
              ? 'Selamat Datang di SIAKAD Suzuran Lecturer Portal'
              : 'Selamat Datang di SIAKAD Suzuran Admin Portal'
        }
        description={
          isMahasiswa 
            ? 'Gunakan panel navigasi kiri untuk melihat jadwal kuliah mingguan Anda, melakukan registrasi kelas KRS, serta melihat hasil studi KHS di setiap semester.'
            : isDosen
              ? 'Gunakan portal dosen ini untuk memproses absensi, menjadwalkan ujian kelas, serta menginput nilai KHS mahasiswa.'
              : 'Gunakan panel navigasi kiri untuk mengelola data akademik universitas. Anda dapat mengaktifkan semester berjalan, menugaskan dosen, dan mendaftarkan mahasiswa ke kelas.'
        }
      />

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Information & Progress) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Active Semester widget */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider mb-4">Semester Aktif</h4>
            {activeSemester ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-monday-lime-green/20 border border-monday-lime-green/30 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                  <span className="text-2xl font-extrabold text-monday-black block relative z-10">{activeSemester.code}</span>
                  <span className="text-xs text-monday-gray font-bold uppercase mt-1 block relative z-10">{activeSemester.name}</span>
                </div>
                <p className="text-[11px] text-monday-gray font-semibold leading-relaxed">
                  Periode akademik sedang berlangsung. Segala aktivitas KRS dan input KHS terikat pada kalender semester ini.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-monday-red/10 border border-monday-red/20 text-center text-monday-red text-xs font-bold leading-normal">
                Belum ada semester aktif! Silakan pilih tab "Tahun Akademik" untuk mengaktifkan salah satu semester akademik.
              </div>
            )}
          </div>

          {/* SKS Progress (Mahasiswa Only) */}
          {isMahasiswa && studentMetrics && (
            <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Progress Kelulusan SKS</h4>
                <span className="text-xs font-extrabold text-monday-blue">{sksProgress}%</span>
              </div>
              <div className="w-full bg-monday-background rounded-full h-3 mt-4 overflow-hidden border border-monday-border">
                <div 
                  className="bg-monday-blue h-3 rounded-full relative" 
                  style={{ width: `${sksProgress}%` }}
                >
                  <div className="absolute top-0 left-0 bottom-0 right-0 overflow-hidden rounded-full">
                    <div className="w-full h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-monday-gray uppercase tracking-wider">
                <span>{studentMetrics.sksLulus} Lulus</span>
                <span>Target: 144 SKS</span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider mb-4">Akses Cepat</h4>
              <div className={`grid gap-3 ${!isMahasiswa && !isDosen ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {isMahasiswa ? (
                  <>
                    <button onClick={() => setActiveTab('kelas-mahasiswa')} className="flex flex-col items-center justify-center p-4 bg-monday-blue/10 rounded-2xl border border-monday-blue/20 hover:bg-monday-blue hover:text-white text-monday-blue transition-colors group">
                      <BookOpen size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center">Isi KRS & KHS</span>
                    </button>
                    <button onClick={() => setActiveTab('jadwal-kuliah')} className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-600 transition-colors group">
                      <Calendar size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center">Jadwal Kuliah</span>
                    </button>
                  </>
                ) : isDosen ? (
                  <>
                    <button onClick={() => setActiveTab('lecturer-portal')} className="flex flex-col items-center justify-center p-4 bg-monday-blue/10 rounded-2xl border border-monday-blue/20 hover:bg-monday-blue hover:text-white text-monday-blue transition-colors group">
                      <Briefcase size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center">Portal Dosen</span>
                    </button>
                    <button onClick={() => setActiveTab('lecturer-portal')} className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-600 transition-colors group">
                      <FileText size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center">Input KHS</span>
                    </button>
                  </>
                ) : (
                  <>
                    {[
                      { id: 'faculties', label: 'Fakultas', icon: Building, color: 'text-monday-blue', bg: 'bg-monday-blue/10', border: 'border-monday-blue/20', hover: 'hover:bg-monday-blue' },
                      { id: 'prodi', label: 'Prodi', icon: Award, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', hover: 'hover:bg-violet-500' },
                      { id: 'tahun-akademik', label: 'Semester', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hover: 'hover:bg-emerald-500' },
                      { id: 'dosen', label: 'Dosen', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hover: 'hover:bg-amber-500' },
                      { id: 'mahasiswa', label: 'Mahasiswa', icon: GraduationCap, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', hover: 'hover:bg-rose-500' },
                      { id: 'mata-kuliah', label: 'Matkul', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', hover: 'hover:bg-cyan-500' },
                      { id: 'kelas-kuliah', label: 'Kelas', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', hover: 'hover:bg-indigo-500' },
                      { id: 'lecturer-portal', label: 'Portal', icon: Briefcase, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20', hover: 'hover:bg-teal-500' },
                      { id: 'kelas-mahasiswa', label: 'KRS / KHS', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', hover: 'hover:bg-orange-500' },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-colors group ${item.bg} ${item.border} ${item.color} ${item.hover} hover:text-white`}>
                          <Icon size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight">{item.label}</span>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
        </div>

        {/* Center/Right Column (Schedules & Announcements) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Today's Schedule Card */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            {(isDosen && dosenMetrics) || (isMahasiswa && studentMetrics) ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-monday-gray" size={18} />
                    <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">
                      {isMahasiswa ? 'Jadwal Kuliah Hari Ini' : 'Jadwal Mengajar Hari Ini'}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-monday-blue bg-monday-blue/10 px-3 py-1.5 rounded-xl border border-monday-blue/20 shadow-sm">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                
                {(isMahasiswa ? studentMetrics.todayClasses : dosenMetrics.todayClasses).length > 0 ? (
                  <div className="space-y-3">
                    {(isMahasiswa ? studentMetrics.todayClasses : dosenMetrics.todayClasses).map(cls => {
                      const mk = mataKuliahMap[cls.course_id];
                      return (
                        <div key={cls.id} className="flex items-center justify-between p-4 bg-white border border-monday-border rounded-2xl hover:border-monday-blue hover:shadow-md transition-all duration-300 group">
                          <div className="flex items-center gap-4">
                            <div className="bg-monday-background group-hover:bg-monday-blue/10 p-3 rounded-2xl text-monday-gray group-hover:text-monday-blue transition-colors">
                              <BookOpen size={20} />
                            </div>
                            <div>
                              <span className="font-extrabold text-sm text-monday-black block">{mk ? mk.name : 'Unknown Course'}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-monday-gray uppercase bg-monday-background px-2 py-0.5 rounded-md border border-monday-border">
                                  Kelas {cls.class_code}
                                </span>
                                <span className="text-[11px] font-semibold text-monday-gray">{cls.room}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-sm text-monday-blue block">{cls.start_time.slice(0,5)}</span>
                            <span className="text-[10px] font-bold text-monday-gray uppercase">{cls.end_time.slice(0,5)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center">
                    <p className="text-monday-gray text-sm font-bold">
                      {isMahasiswa ? 'Hore! Anda tidak ada jadwal kuliah hari ini.' : 'Tidak ada jadwal mengajar hari ini.'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-monday-gray" size={18} />
                  <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Statistik Kelas & Pengampuan</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-monday-border hover:border-monday-blue transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-monday-blue/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
                    <span className="text-monday-gray text-[11px] block font-bold uppercase tracking-wider">Total Kelas Kuliah</span>
                    <span className="text-3xl font-extrabold text-monday-black block mt-2">{kelasKuliahs.length}</span>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-monday-border hover:border-violet-500 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-violet-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
                    <span className="text-monday-gray text-[11px] block font-bold uppercase tracking-wider">Total Penugasan Pengampu</span>
                    <span className="text-3xl font-extrabold text-monday-black block mt-2">{dosenPengampus.length}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Announcements Card */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="text-monday-gray" size={18} />
                <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Papan Pengumuman</h4>
              </div>
              <button className="text-[10px] font-bold text-monday-blue uppercase tracking-wider flex items-center gap-1 hover:underline">
                Lihat Semua <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-monday-border hover:shadow-md transition-shadow group cursor-pointer">
                  <div className={`px-2 py-1.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-widest text-center min-w-16 flex-shrink-0 ${ann.color}`}>
                    {ann.date}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-monday-black group-hover:text-monday-blue transition-colors leading-tight">
                      {ann.title}
                    </h5>
                    <p className="text-[11px] text-monday-gray font-semibold mt-1">Kategori: {ann.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default DashboardTab;
