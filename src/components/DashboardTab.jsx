import React, { useMemo } from 'react';
import { Building, Award, Users, GraduationCap, Star, BookOpen, TrendingUp, CheckCircle, Calendar, Bell, ArrowRight, Briefcase, FileText, Activity, Layers, MapPin, Clock } from 'lucide-react';
import MetricCard from './ui/MetricCard';
import WelcomeBanner from './ui/WelcomeBanner';
import DashboardMahasiswa from './DashboardMahasiswa';

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
  const isAdmin = !isMahasiswa && !isDosen;

  // Render komponen terpisah khusus Mahasiswa
  if (isMahasiswa) {
    return (
      <DashboardMahasiswa
        user={user}
        students={students}
        studyPrograms={studyPrograms}
        faculties={faculties}
        lecturers={lecturers}
        activeSemester={activeSemester}
        kelasKuliahs={kelasKuliahs}
        dosenPengampus={dosenPengampus}
        kelasMahasiswas={kelasMahasiswas}
        mataKuliahs={mataKuliahs}
        setActiveTab={setActiveTab}
        mataKuliahMap={mataKuliahMap}
        lecturerMap={lecturerMap}
        academicYearMap={academicYearMap}
      />
    );
  }

  // Kalkulasi statistik untuk Dosen
  const dosenMetrics = useMemo(() => {
    if (!isDosen || !user) return null;
    const myDosen = lecturers.find(d => d.user_id === user.id);
    if (!myDosen) return null;

    // Total Kelas Diajar (berdasarkan semester aktif)
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

  // Penentuan metrik berdasarkan peran (Admin atau Dosen)
  const metrics = useMemo(() => {
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
  }, [isDosen, dosenMetrics, faculties, studyPrograms, lecturers, students]);

  // Data pengumuman statis (ideal: fetch dari API)
  const announcements = [
    { id: 1, title: 'Batas Akhir Pembayaran UKT Semester Ini', date: 'Besok', type: 'Keuangan', color: 'bg-monday-red/10 text-monday-red border-monday-red/20' },
    { id: 2, title: 'Jadwal Pengisian KRS Telah Dibuka', date: '3 Hari Lagi', type: 'Akademik', color: 'bg-monday-blue/10 text-monday-blue border-monday-blue/20' },
    { id: 3, title: 'Batas Akhir Input Nilai KHS bagi Dosen', date: '1 Minggu Lagi', type: 'Dosen', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Widget Metrik Utama */}
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

      {/* Banner Ucapan Selamat Datang */}
      <WelcomeBanner 
        title={isDosen ? 'Selamat Datang di Portal Dosen SIAKAD' : 'Selamat Datang di Portal Admin SIAKAD'}
        description={
          isDosen
            ? 'Kelola jadwal mengajar, input nilai evaluasi mahasiswa, dan tinjau perkembangan akademik mahasiswa bimbingan Anda dari portal ini.'
            : 'Kelola data master akademik universitas. Pastikan status semester berjalan aktif untuk memungkinkan aktivitas KRS dan perkuliahan.'
        }
      />

      {/* Grid Utama Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Kolom Kiri: Informasi Semester & Navigasi Cepat */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Widget Semester Aktif */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm">
            <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider mb-4">Semester Aktif</h4>
            {activeSemester ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-monday-lime-green/20 border border-monday-lime-green/30 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                  <span className="text-2xl font-extrabold text-monday-black block relative z-10">{activeSemester.code}</span>
                  <span className="text-xs text-monday-gray font-bold uppercase mt-1 block relative z-10">{activeSemester.name}</span>
                </div>
                <p className="text-[11px] text-monday-gray font-semibold leading-relaxed">
                  Periode akademik sedang berlangsung. Segala aktivitas operasional akademik merujuk pada kalender semester ini.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-monday-red/10 border border-monday-red/20 text-center space-y-2">
                <span className="text-monday-red text-xs font-bold block">Tidak ada semester aktif!</span>
                <p className="text-[11px] text-monday-red/80 font-medium">Sistem akademik terkunci. Masuk ke menu "Semester" untuk mengaktifkan periode akademik.</p>
              </div>
            )}
          </div>

          {/* Navigasi Cepat (Quick Actions) */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm">
            <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider mb-4">Akses Cepat</h4>
            <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {isDosen ? (
                <>
                  <button onClick={() => setActiveTab('lecturer-portal')} className="flex flex-col items-center justify-center p-4 bg-monday-blue/10 rounded-2xl border border-monday-blue/20 hover:bg-monday-blue hover:text-white text-monday-blue transition-colors group cursor-pointer">
                    <Briefcase size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Kelas & Penilaian</span>
                  </button>
                  <button onClick={() => setActiveTab('profil-dosen')} className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-600 transition-colors group cursor-pointer">
                    <Users size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Profil Saya</span>
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
                    { id: 'user', label: 'Akun User', icon: Users, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20', hover: 'hover:bg-teal-500' },
                    { id: 'kelas-mahasiswa', label: 'KRS / KHS', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', hover: 'hover:bg-orange-500' },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-colors group cursor-pointer ${item.bg} ${item.border} ${item.color} ${item.hover} hover:text-white`}>
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

        {/* Kolom Kanan: Jadwal & Pengumuman */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Jadwal / Statistik Utama */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm">
            {isDosen && dosenMetrics ? (
              <>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-monday-border">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-monday-blue/10 text-monday-blue">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Jadwal Mengajar</h4>
                      <span className="text-sm font-extrabold text-monday-black block">Hari Ini</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-monday-blue bg-monday-blue/10 px-3 py-1.5 rounded-xl border border-monday-blue/20">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                {dosenMetrics.todayClasses.length > 0 ? (
                  <div className="space-y-3">
                    {dosenMetrics.todayClasses.map(cls => {
                      const mk = mataKuliahMap[cls.course_id];
                      return (
                        <div key={cls.id} className="p-4 rounded-2xl border border-monday-border bg-monday-background/50 hover:bg-white hover:border-monday-blue transition-all group">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-bold font-mono text-monday-gray uppercase">{mk ? mk.code : 'KODE'}</span>
                              <h3 className="font-bold text-sm text-monday-black block mt-0.5">{mk ? mk.name : 'Mata Kuliah'}</h3>
                            </div>
                            <span className="text-[10px] font-bold text-monday-blue uppercase bg-monday-blue/10 px-2 py-0.5 rounded border border-monday-blue/20">
                              Kelas {cls.class_code}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-monday-border/60 text-xs text-monday-gray">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-monday-black">
                              <Clock size={14} className="text-monday-blue" />
                              <span>{cls.start_time?.slice(0,5)} - {cls.end_time?.slice(0,5)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-monday-gray" />
                              <span className="truncate">{cls.room}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center space-y-2">
                    <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle size={20} />
                    </div>
                    <p className="text-sm font-bold text-monday-black">Tidak Ada Jadwal Mengajar Hari Ini</p>
                    <p className="text-xs text-monday-gray">Fokuskan waktu luang untuk evaluasi kurikulum atau penelitian.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-xl bg-monday-gray-background text-monday-gray">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Tinjauan Operasional</h4>
                    <span className="text-sm font-extrabold text-monday-black block">Status Perkuliahan Semester Ini</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-monday-border hover:border-monday-blue transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-monday-blue/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
                    <span className="text-monday-gray text-[11px] block font-bold uppercase tracking-wider">Total Kelas Dibuka</span>
                    <span className="text-3xl font-extrabold text-monday-black block mt-2">{kelasKuliahs.length}</span>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-monday-border hover:border-violet-500 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-violet-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
                    <span className="text-monday-gray text-[11px] block font-bold uppercase tracking-wider">Penugasan Dosen</span>
                    <span className="text-3xl font-extrabold text-monday-black block mt-2">{dosenPengampus.length}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Papan Pengumuman */}
          <div className="bg-white border border-monday-border p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="text-monday-gray" size={18} />
                <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Pengumuman Terkini</h4>
              </div>
              <button className="text-[10px] font-bold text-monday-blue uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer">
                Lihat Semua <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-monday-border hover:shadow-md transition-shadow group">
                  <div className={`px-2 py-1.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-widest text-center min-w-16 shrink-0 ${ann.color}`}>
                    {ann.date}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-monday-black group-hover:text-monday-blue transition-colors leading-tight">
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
