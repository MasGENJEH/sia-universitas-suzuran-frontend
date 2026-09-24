import React, { useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  User, 
  ChevronRight, 
  FileText, 
  ArrowUpRight, 
  MapPin, 
  AlertCircle,
  BookCheck,
  CalendarDays,
  Info
} from 'lucide-react';

export default function DashboardMahasiswa({
  user,
  students = [],
  studyPrograms = [],
  faculties = [],
  lecturers = [],
  activeSemester,
  kelasKuliahs = [],
  dosenPengampus = [],
  kelasMahasiswas = [],
  mataKuliahs = [],
  setActiveTab,
  mataKuliahMap = {},
  lecturerMap = {},
  academicYearMap = {}
}) {
  // Find current student record
  const myMahasiswa = useMemo(() => {
    if (!user) return null;
    return students.find(m => m.user_id === user.id) || null;
  }, [user, students]);

  // Find academic references
  const prodiObj = useMemo(() => {
    if (!myMahasiswa) return null;
    return studyPrograms.find(p => p.id === myMahasiswa.study_program_id) || null;
  }, [myMahasiswa, studyPrograms]);

  const fakultasObj = useMemo(() => {
    if (!prodiObj) return null;
    return faculties.find(f => f.id === prodiObj.faculty_id) || null;
  }, [prodiObj, faculties]);

  const dosenPaObj = useMemo(() => {
    if (!myMahasiswa) return null;
    return lecturers.find(d => d.id === myMahasiswa.academic_advisor_id) || null;
  }, [myMahasiswa, lecturers]);

  // Calculate comprehensive academic metrics
  const metrics = useMemo(() => {
    if (!myMahasiswa) return null;

    const studentEnrollments = kelasMahasiswas.filter(km => km.student_id === myMahasiswa.id);

    const getGradeWeight = (letter) => {
      const char = (letter || '').toUpperCase().trim();
      switch (char) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        case 'E': return 0.0;
        default: return null;
      }
    };

    let sksDiambilSemesterIni = 0;
    let sksLulusTotal = 0;
    let gradedSksSemester = 0;
    let weightedSumSemester = 0;
    let gradedSksTotal = 0;
    let weightedSumTotal = 0;
    const currentSemesterEnrollments = [];
    const allEnrolledClasses = [];

    studentEnrollments.forEach(km => {
      const kk = kelasKuliahs.find(k => k.id === km.course_class_id);
      if (!kk) return;

      const mk = mataKuliahMap[kk.course_id];
      if (!mk) return;

      const sks = Number(mk.sks || 0);
      const isCurrentSemester = activeSemester && kk.academic_year_id === activeSemester.id;
      const weight = getGradeWeight(km.letter_grade);

      // Find lecturer for this class
      const dp = dosenPengampus.find(d => d.course_class_id === kk.id);
      const dosen = dp ? lecturerMap[dp.lecturer_id] : null;

      const enrollmentDetail = {
        enrollmentId: km.id,
        classId: kk.id,
        courseCode: mk.code,
        courseName: mk.name,
        sks,
        classCode: kk.class_code,
        room: kk.room,
        day: kk.day,
        startTime: kk.start_time,
        endTime: kk.end_time,
        dosenName: dosen ? dosen.name : 'Dosen Pengampu',
        letterGrade: km.letter_grade,
        numericGrade: km.numeric_grade,
        isCurrentSemester,
        academicYearId: kk.academic_year_id
      };

      allEnrolledClasses.push(enrollmentDetail);

      if (isCurrentSemester) {
        sksDiambilSemesterIni += sks;
        currentSemesterEnrollments.push(enrollmentDetail);
        if (weight !== null) {
          gradedSksSemester += sks;
          weightedSumSemester += sks * weight;
        }
      }

      if (weight !== null) {
        gradedSksTotal += sks;
        weightedSumTotal += sks * weight;
        if (km.letter_grade.toUpperCase().trim() !== 'E') {
          sksLulusTotal += sks;
        }
      }
    });

    const ips = gradedSksSemester > 0 ? (weightedSumSemester / gradedSksSemester).toFixed(2) : '0.00';
    const ipk = gradedSksTotal > 0 ? (weightedSumTotal / gradedSksTotal).toFixed(2) : '0.00';

    // Predikat Akademik
    const ipkNumber = parseFloat(ipk);
    let predikat = 'Cukup';
    if (ipkNumber >= 3.51) predikat = 'Dengan Pujian (Cum Laude)';
    else if (ipkNumber >= 3.00) predikat = 'Sangat Memuaskan';
    else if (ipkNumber >= 2.75) predikat = 'Memuaskan';
    else if (ipkNumber > 0) predikat = 'Cukup';
    else predikat = 'Belum Ada Nilai';

    // Filter today's classes
    const daysIndo = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const now = new Date();
    const todayName = daysIndo[now.getDay()];
    const todayClasses = currentSemesterEnrollments.filter(c => (c.day || '').toUpperCase().trim() === todayName);
    
    todayClasses.sort((a, b) => {
      const tA = a.startTime || '';
      const tB = b.endTime || '';
      return tA.localeCompare(tB);
    });

    // Upcoming classes for the rest of week if today is empty
    const dayOrder = { 'SENIN': 1, 'SELASA': 2, 'RABU': 3, 'KAMIS': 4, 'JUMAT': 5, 'SABTU': 6, 'MINGGU': 7 };
    const upcomingClasses = [...currentSemesterEnrollments].sort((a, b) => {
      const oA = dayOrder[(a.day || '').toUpperCase().trim()] || 99;
      const oB = dayOrder[(b.day || '').toUpperCase().trim()] || 99;
      if (oA !== oB) return oA - oB;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    return {
      ips,
      ipk,
      predikat,
      sksLulus: sksLulusTotal,
      sksDiambil: sksDiambilSemesterIni,
      targetSks: 144,
      todayName,
      todayClasses,
      upcomingClasses,
      currentSemesterEnrollments,
      totalMatkulSemesterIni: currentSemesterEnrollments.length
    };
  }, [myMahasiswa, kelasMahasiswas, kelasKuliahs, mataKuliahMap, activeSemester, dosenPengampus, lecturerMap]);

  // Photo URL helper
  const photoUrl = useMemo(() => {
    if (!myMahasiswa?.photo) return null;
    return myMahasiswa.photo.startsWith('http') ? myMahasiswa.photo : `/storage/${myMahasiswa.photo}`;
  }, [myMahasiswa?.photo]);

  // Determine Class Time Status (Selesai, Sedang Berlangsung, Akan Datang)
  const getClassTimeStatus = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTotalMins = currentHours * 60 + currentMins;

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const startTotalMins = sH * 60 + (sM || 0);
    const endTotalMins = eH * 60 + (eM || 0);

    if (currentTotalMins < startTotalMins) {
      return { label: 'Akan Datang', color: 'bg-blue-500/10 text-monday-blue border-blue-200' };
    } else if (currentTotalMins >= startTotalMins && currentTotalMins <= endTotalMins) {
      return { label: 'Sedang Berlangsung', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 animate-pulse' };
    } else {
      return { label: 'Selesai', color: 'bg-gray-100 text-monday-gray border-gray-200' };
    }
  };

  if (!myMahasiswa) {
    return (
      <div className="bg-white border border-monday-border rounded-3xl p-8 text-center max-w-xl mx-auto my-12">
        <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-monday-black">Data Mahasiswa Belum Terhubung</h3>
        <p className="text-sm text-monday-gray mt-2 leading-relaxed">
          Akun login Anda ({user?.email}) belum terasosiasi dengan data Mahasiswa di sistem akademik. Silakan hubungi Administrator atau Bagian Akademik Fakultas.
        </p>
      </div>
    );
  }

  const sksProgress = metrics ? Math.min((metrics.sksLulus / metrics.targetSks) * 100, 100).toFixed(1) : 0;
  const sisaSks = metrics ? Math.max(metrics.targetSks - metrics.sksLulus, 0) : 144;

  return (
    <div className="space-y-6">
      
      {/* 1. Identity & Academic Context Header */}
      <section 
        aria-label="Profil Akademik Mahasiswa"
        className="bg-white border border-monday-border rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & Main Info */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={`Foto ${myMahasiswa.name}`} 
                  className="size-20 rounded-2xl object-cover border-2 border-monday-border shadow-sm"
                />
              ) : (
                <div className="size-20 rounded-2xl bg-monday-blue text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                  {myMahasiswa.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${myMahasiswa.status === 'AKTIF' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-200">
                  Status: {myMahasiswa.status || 'AKTIF'}
                </span>
                {activeSemester && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-monday-blue/10 text-monday-blue border border-monday-blue/20">
                    Semester {activeSemester.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-monday-black tracking-tight">
                {myMahasiswa.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-monday-gray font-medium">
                <span className="font-mono font-bold text-monday-black">NIM: {myMahasiswa.nim}</span>
                <span>•</span>
                <span>{prodiObj ? prodiObj.name : 'Program Studi'}</span>
                {fakultasObj && (
                  <>
                    <span>•</span>
                    <span>{fakultasObj.name}</span>
                  </>
                )}
                <span>•</span>
                <span>Angkatan {myMahasiswa.enrollment_year || '-'}</span>
              </div>
            </div>
          </div>

          {/* Dosen PA Card & Quick Profile Link */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {dosenPaObj && (
              <div className="p-3.5 rounded-2xl bg-monday-background border border-monday-border text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-monday-gray">Dosen Pembimbing Akademik</p>
                <p className="text-xs font-bold text-monday-black mt-0.5">{dosenPaObj.name}</p>
                <p className="text-[11px] text-monday-gray font-mono">NIDN: {dosenPaObj.nidn || '-'}</p>
              </div>
            )}

            <button
              onClick={() => setActiveTab('profil-mahasiswa')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-monday-blue text-white text-xs font-bold hover:bg-opacity-90 transition shadow-sm cursor-pointer"
            >
              <User size={16} />
              <span>Profil Saya</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. Key Academic Performance Metrics (Evidence over Claims) */}
      <section aria-label="Statistik Akademik" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* IPK Kumulatif */}
        <div className="bg-white border border-monday-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-monday-gray">IPK Kumulatif</span>
            <div className="p-2 rounded-xl bg-monday-blue/10 text-monday-blue">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-monday-black font-mono">{metrics?.ipk || '0.00'}</span>
            <span className="text-xs text-monday-gray font-semibold">/ 4.00</span>
          </div>
          <p className="text-xs font-bold text-monday-blue mt-2 truncate">
            {metrics?.predikat}
          </p>
        </div>

        {/* IPS Semester Aktif */}
        <div className="bg-white border border-monday-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-monday-gray">IPS Semester Ini</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Award size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-monday-black font-mono">{metrics?.ips || '0.00'}</span>
            <span className="text-xs text-monday-gray font-semibold">/ 4.00</span>
          </div>
          <p className="text-xs text-monday-gray font-semibold mt-2">
            Berdasarkan nilai yang telah dirilis
          </p>
        </div>

        {/* SKS Lulus & Progress Kelulusan */}
        <div className="bg-white border border-monday-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-monday-gray">Total SKS Lulus</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-monday-black font-mono">{metrics?.sksLulus || 0}</span>
            <span className="text-xs text-monday-gray font-semibold">/ {metrics?.targetSks} SKS</span>
          </div>
          <div className="w-full bg-monday-background rounded-full h-2 mt-3 overflow-hidden border border-monday-border">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${sksProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-monday-gray font-semibold mt-2">
            Tersisa {sisaSks} SKS menuju syarat kelulusan
          </p>
        </div>

        {/* SKS Semester Berjalan */}
        <div className="bg-white border border-monday-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-monday-gray">Beban SKS Semester Ini</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-monday-black font-mono">{metrics?.sksDiambil || 0}</span>
            <span className="text-xs text-monday-gray font-semibold">SKS</span>
          </div>
          <p className="text-xs text-monday-gray font-semibold mt-2">
            {metrics?.totalMatkulSemesterIni || 0} mata kuliah terdaftar aktif
          </p>
        </div>

      </section>

      {/* 3. Main Grid: Today's Schedule & Enrolled Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Today's Schedule & Quick Actions */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Today's Schedule Box */}
          <section aria-label="Jadwal Hari Ini" className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-monday-border mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-monday-blue/10 text-monday-blue">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-monday-gray">Jadwal Kuliah</h2>
                  <p className="text-sm font-extrabold text-monday-black">Hari Ini ({metrics?.todayName})</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('jadwal-kuliah')}
                className="text-[11px] font-bold text-monday-blue hover:underline flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua <ArrowUpRight size={14} />
              </button>
            </div>

            {metrics?.todayClasses && metrics.todayClasses.length > 0 ? (
              <div className="space-y-3">
                {metrics.todayClasses.map((cls, idx) => {
                  const status = getClassTimeStatus(cls.startTime, cls.endTime);
                  return (
                    <div 
                      key={cls.classId || idx}
                      className="p-4 rounded-2xl border border-monday-border bg-monday-background/50 hover:border-monday-blue hover:bg-white transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold font-mono text-monday-gray uppercase">{cls.courseCode}</span>
                          <h3 className="text-sm font-bold text-monday-black leading-snug">{cls.courseName}</h3>
                        </div>
                        {status && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-monday-gray pt-2 border-t border-monday-border/60">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-monday-black">
                          <Clock size={14} className="text-monday-blue" />
                          <span>{cls.startTime?.slice(0, 5)} - {cls.endTime?.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={14} className="text-monday-gray shrink-0" />
                          <span className="truncate">{cls.room || 'Ruang Kuliah'}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-monday-gray flex items-center justify-between pt-1">
                        <span className="truncate">Dosen: <strong className="text-monday-black">{cls.dosenName}</strong></span>
                        <span className="font-bold text-monday-blue shrink-0">Kelas {cls.classCode}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-monday-background border border-dashed border-monday-border text-center space-y-3">
                <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-monday-black">Tidak Ada Jadwal Kuliah Hari Ini</p>
                  <p className="text-xs text-monday-gray mt-1">
                    Gunakan waktu luang untuk mengulang materi atau menyelesaikan tugas mandiri.
                  </p>
                </div>

                {metrics?.upcomingClasses && metrics.upcomingClasses.length > 0 && (
                  <div className="pt-3 border-t border-monday-border text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-monday-gray mb-2">Jadwal Kuliah Terdekat:</p>
                    <div className="p-3 rounded-xl bg-white border border-monday-border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-monday-black">{metrics.upcomingClasses[0].courseName}</span>
                        <span className="font-bold text-monday-blue">{metrics.upcomingClasses[0].day}</span>
                      </div>
                      <p className="text-[11px] text-monday-gray">
                        {metrics.upcomingClasses[0].startTime?.slice(0, 5)} WIB • {metrics.upcomingClasses[0].room}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Quick Action Navigation */}
          <section aria-label="Akses Cepat" className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-monday-gray">Navigasi Cepat Mahasiswa</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('kelas-mahasiswa')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-monday-blue/10 border border-monday-blue/20 text-monday-blue hover:bg-monday-blue hover:text-white transition group cursor-pointer text-center"
              >
                <BookCheck size={22} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">KRS & KHS</span>
                <span className="text-[10px] opacity-80 mt-0.5">Rencana & Hasil Studi</span>
              </button>

              <button
                onClick={() => setActiveTab('jadwal-kuliah')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 hover:bg-purple-600 hover:text-white transition group cursor-pointer text-center"
              >
                <CalendarDays size={22} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Jadwal Kuliah</span>
                <span className="text-[10px] opacity-80 mt-0.5">Mingguan & Absensi</span>
              </button>
            </div>
          </section>

        </div>

        {/* Right Column: Enrolled Courses Table & Academic Calendar */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Enrolled Courses (KRS Overview) */}
          <section aria-label="Mata Kuliah Terdaftar" className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-monday-border mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-monday-gray">KRS Semester Berjalan</h2>
                <p className="text-sm font-extrabold text-monday-black">Mata Kuliah Yang Diambil ({metrics?.totalMatkulSemesterIni || 0} Matkul • {metrics?.sksDiambil || 0} SKS)</p>
              </div>
              <button
                onClick={() => setActiveTab('kelas-mahasiswa')}
                className="text-xs font-bold text-monday-blue bg-monday-blue/10 px-3.5 py-2 rounded-xl border border-monday-blue/20 hover:bg-monday-blue hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} />
                <span>Buka Detail KRS/KHS</span>
              </button>
            </div>

            {metrics?.currentSemesterEnrollments && metrics.currentSemesterEnrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-monday-border text-[11px] font-bold uppercase text-monday-gray">
                      <th className="pb-3 px-3">Mata Kuliah</th>
                      <th className="pb-3 px-3 text-center">SKS</th>
                      <th className="pb-3 px-3">Dosen Pengampu</th>
                      <th className="pb-3 px-3">Jadwal & Ruang</th>
                      <th className="pb-3 px-3 text-center">Status Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-monday-border/60 text-xs">
                    {metrics.currentSemesterEnrollments.map((enr, idx) => (
                      <tr key={enr.enrollmentId || idx} className="hover:bg-monday-background/40 transition">
                        <td className="py-3 px-3">
                          <span className="font-bold text-monday-black block">{enr.courseName}</span>
                          <span className="font-mono text-[11px] text-monday-gray font-semibold">{enr.courseCode} • Kelas {enr.classCode}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-monday-black font-mono">
                          {enr.sks}
                        </td>
                        <td className="py-3 px-3 text-monday-gray font-medium">
                          {enr.dosenName}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-monday-black block">{enr.day || '-'}, {enr.startTime?.slice(0, 5)} - {enr.endTime?.slice(0, 5)}</span>
                          <span className="text-[11px] text-monday-gray">{enr.room || '-'}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {enr.letterGrade ? (
                            <span className="inline-flex items-center justify-center font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-200">
                              {enr.letterGrade}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-monday-gray bg-monday-background px-2 py-0.5 rounded border border-monday-border">
                              Berjalan
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-monday-background border border-dashed border-monday-border space-y-3">
                <BookOpen size={28} className="text-monday-gray mx-auto" />
                <div>
                  <p className="text-sm font-bold text-monday-black">Belum Ada KRS Terdaftar di Semester Ini</p>
                  <p className="text-xs text-monday-gray mt-1">
                    Silakan masuk ke menu KRS untuk memilih kelas mata kuliah pada semester aktif.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('kelas-mahasiswa')}
                  className="px-4 py-2 rounded-xl bg-monday-blue text-white text-xs font-bold hover:bg-opacity-90 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <BookCheck size={14} />
                  <span>Isi Rencana Studi (KRS) Sekarang</span>
                </button>
              </div>
            )}
          </section>

          {/* Academic Announcements & Important Deadlines */}
          <section aria-label="Kalender dan Pengumuman Akademik" className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-monday-border mb-4">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-monday-blue" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-monday-gray">Agenda & Kalender Akademik</h2>
              </div>
              <span className="text-[11px] font-semibold text-monday-gray">Universitas Suzuran</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-monday-background border border-monday-border space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-monday-blue">Pengisian & Revisi KRS</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-200">Aktif</span>
                </div>
                <p className="text-xs text-monday-gray pt-1">
                  Konsultasikan mata kuliah pilihan dengan Dosen PA sebelum batas akhir KRS ditutup.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-monday-background border border-monday-border space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-monday-black">Batas Akhir Pembayaran UKT</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-200">Penting</span>
                </div>
                <p className="text-xs text-monday-gray pt-1">
                  Pastikan bukti pembayaran telah divalidasi bagian keuangan untuk menghindari suspend KRS.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-monday-background border border-monday-border space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-monday-black">Periode Ujian Tengah Semester (UTS)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-monday-gray border border-gray-200">Mendatang</span>
                </div>
                <p className="text-xs text-monday-gray pt-1">
                  Syarat mengikuti UTS adalah kehadiran minimal 75% pada perkuliahan tatap muka.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-monday-background border border-monday-border space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-monday-black">Batas Unggah Nilai Akhir KHS</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-monday-gray border border-gray-200">Akhir Semester</span>
                </div>
                <p className="text-xs text-monday-gray pt-1">
                  Hasil studi KHS akan otomatis terbit di portal setelah seluruh nilai mata kuliah difinalisasi.
                </p>
              </div>

            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
