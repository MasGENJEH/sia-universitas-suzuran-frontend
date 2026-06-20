import React, { useState, useMemo, useEffect } from 'react';
import { Briefcase, AlertTriangle, Search, Info, Users, GraduationCap, ChevronDown, ChevronUp, Calendar, Play, BookOpen, Clock, MapPin, Trash2, Edit2 } from 'lucide-react';
import PageHeader from './ui/PageHeader';
import SearchInput from './ui/SearchInput';

const LecturerPortalTab = React.memo(function LecturerPortalTab({
  activeTab,
  user,
  lecturers,
  mataKuliahs,
  students,
  kelasKuliahs,
  kelasMahasiswas,
  dosenActiveClasses,
  dosenAdviseeStudents = [],
  studyPrograms = [],
  loadingPortal,
  selectedDosenForPortal,
  setSelectedDosenForPortal,
  selectedClassForGrades,
  setSelectedClassForGrades,
  enrolledStudentsInClass,
  setEnrolledStudentsInClass,
  updatingGrades,
  setUpdatingGrades,
  fetchLecturerPortalData,
  selectClassForPortalGrades,
  saveStudentGrade,
  mataKuliahMap = {},
  studentMap = {},
  studyProgramMap = {}
}) {
  const [portalSubTab, setPortalSubTabState] = useState(() => {
    if (activeTab && activeTab.startsWith('lecturer-portal/')) {
      return activeTab.split('/')[1];
    }
    const parts = window.location.pathname.substring(1).split('/');
    return parts[1] || 'classes';
  });

  const [saveStatus, setSaveStatus] = useState({});

  useEffect(() => {
    if (activeTab && activeTab.startsWith('lecturer-portal/')) {
      setPortalSubTabState(activeTab.split('/')[1]);
    } else if (activeTab === 'lecturer-portal') {
      setPortalSubTabState('classes');
    }
  }, [activeTab]);

  const setPortalSubTab = (subTab) => {
    window.history.pushState({}, '', `/lecturer-portal/${subTab}`);
    setPortalSubTabState(subTab);
  };
  const [adviseeSearchQuery, setAdviseeSearchQuery] = useState('');
  const [gradeSearchQuery, setGradeSearchQuery] = useState('');

  // --- Attendance Feature States ---
  const [meetings, setMeetings] = useState([]); // array of course_class_meetings
  const [loadingRecap, setLoadingRecap] = useState(false);
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

  // --- Exams Feature States ---
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState({
    exam_type: 'UTS',
    tanggal: '',
    start_time: '',
    end_time: '',
    room: '',
    lecturer_id: '',
    method: 'offline',
    notes: ''
  });

  // Reset expanded state when class changes
  useEffect(() => {
    setExpandedMeetingId(null);
    setShowExamForm(false);
    setGradeSearchQuery('');
  }, [selectedClassForGrades]);

  useEffect(() => {
    if (portalSubTab === 'attendance' && selectedClassForGrades) {
      fetchRecapData(selectedClassForGrades.id);
    } else if (portalSubTab === 'exams' && selectedClassForGrades) {
      fetchExamsData(selectedClassForGrades.id);
    }
  }, [portalSubTab, selectedClassForGrades]);

  const fetchRecapData = async (classId) => {
    setLoadingRecap(true);
    try {
      const currentToken = localStorage.getItem('token');
      const res = await fetch(`/api/absensis?course_class_id=${classId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecap(false);
    }
  };

  const fetchExamsData = async (classId) => {
    setLoadingExams(true);
    try {
      const currentToken = localStorage.getItem('token');
      const res = await fetch(`/api/exams?course_class_id=${classId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleActivateMeeting = async (meetingId) => {
    // Optimistic update
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, is_active: true } : m));

    try {
      const currentToken = localStorage.getItem('token');
      const res = await fetch(`/api/absensis/activate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ course_class_meeting_id: meetingId })
      });
      if (!res.ok) {
        console.error("Failed to activate meeting");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAttendance = async (meetingId, studentId, status) => {
    // Optimistic update
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        const newAbsen = [...(m.absensis || [])];
        const idx = newAbsen.findIndex(a => a.student_id === studentId);
        if (idx > -1) {
          newAbsen[idx] = { ...newAbsen[idx], status };
        } else {
          newAbsen.push({ student_id: studentId, status });
        }
        return { ...m, absensis: newAbsen };
      }
      return m;
    }));
    
    try {
      const currentToken = localStorage.getItem('token');
      const res = await fetch(`/api/absensis`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          course_class_meeting_id: meetingId,
          student_id: studentId,
          status: status
        })
      });
      if (!res.ok) {
        console.error("Failed to update attendance");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    try {
      const currentToken = localStorage.getItem('token');
      const res = await fetch(`/api/exams`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          ...examForm,
          course_class_id: selectedClassForGrades.id
        })
      });
      if (res.ok) {
        fetchExamsData(selectedClassForGrades.id);
        setShowExamForm(false);
        setExamForm({ exam_type: 'UTS', tanggal: '', start_time: '', end_time: '', room: '', lecturer_id: '', method: 'offline', notes: '' });
      } else {
        const errData = await res.json();
        alert("Gagal menyimpan jadwal: " + JSON.stringify(errData.errors));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Hapus jadwal ujian ini?")) return;
    try {
      const currentToken = localStorage.getItem('token');
      const res = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        fetchExamsData(selectedClassForGrades.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenExamForm = () => {
    if (!showExamForm) {
      setExamForm({
        exam_type: 'UTS',
        tanggal: '',
        start_time: '',
        end_time: '',
        room: selectedClassForGrades?.room || '',
        lecturer_id: '',
        method: 'offline',
        notes: ''
      });
    }
    setShowExamForm(!showExamForm);
  };

  // --------------------------------

  return (
    <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm print:border-none print:shadow-none print:bg-white print:p-0">
      <PageHeader 
        title="Lecturer Portal"
        description="Simulasi portal login dosen pada semester aktif. Dosen dapat memantau kelas, jadwal ujian, dan absensi."
        icon={Briefcase}
      />

      {/* Select active lecturer or Dosen profile banner */}
      {user?.roles?.some(r => r.name === 'dosen') ? (
        <div className="p-5 rounded-2xl bg-white border border-monday-border flex flex-col md:flex-row items-center gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-monday-blue/10 p-3 rounded-2xl text-monday-blue">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-monday-gray uppercase tracking-wider">Dosen Pengampu Aktif</p>
              <h3 className="font-extrabold text-lg text-monday-black mt-0.5">
                {lecturers.find(d => d.user_id === user.id)?.name || user.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-monday-lime-green/20 border border-monday-lime-green/30 rounded-xl text-xs font-semibold text-monday-black md:ml-auto">
            <Info size={16} className="text-monday-black" />
            <span>Terhubung sebagai dosen pengampu aktif. Menampilkan seluruh penugasan kelas semester berjalan.</span>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-monday-background border border-monday-border flex flex-col md:flex-row items-center gap-4 print:hidden">
          <div className="space-y-1 w-full md:w-auto shrink-0">
            <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Simulasi Login Dosen</label>
            <select 
              value={selectedDosenForPortal}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDosenForPortal(val);
                fetchLecturerPortalData(val);
              }}
              className="w-80 px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black transition-300 mt-1"
            >
              <option value="">-- Pilih Dosen Pengampu --</option>
              {lecturers.map(d => (
                <option key={d.id} value={d.id}>{d.name} (NIDN: {d.nidn})</option>
              ))}
            </select>
          </div>

          {selectedDosenForPortal && (
            <div className="flex items-center gap-2 p-3 bg-monday-lime-green/20 border border-monday-lime-green/30 rounded-xl text-xs font-semibold text-monday-black md:ml-auto">
              <Info size={16} className="text-monday-black" />
              <span>Terhubung sebagai dosen pengampu aktif. Menampilkan seluruh penugasan kelas semester berjalan.</span>
            </div>
          )}
        </div>
      )}

      {selectedDosenForPortal && (
        <div className="flex border-b border-monday-border print:hidden -mt-2 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => setPortalSubTab('classes')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
              portalSubTab === 'classes'
                ? 'border-monday-blue text-monday-blue bg-monday-blue/5'
                : 'border-transparent text-monday-gray hover:text-monday-black hover:bg-monday-gray-background/20'
            }`}
          >
            <Briefcase size={16} />
            Kelas Diampu & Input Nilai
          </button>
          <button
            type="button"
            onClick={() => setPortalSubTab('advisees')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
              portalSubTab === 'advisees'
                ? 'border-monday-blue text-monday-blue bg-monday-blue/5'
                : 'border-transparent text-monday-gray hover:text-monday-black hover:bg-monday-gray-background/20'
            }`}
          >
            <GraduationCap size={16} />
            Mahasiswa Bimbingan Akademik
            {dosenAdviseeStudents?.length > 0 && (
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                portalSubTab === 'advisees' ? 'bg-monday-blue text-white' : 'bg-monday-gray-background text-monday-gray'
              }`}>
                {dosenAdviseeStudents.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setPortalSubTab('attendance')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
              portalSubTab === 'attendance'
                ? 'border-monday-blue text-monday-blue bg-monday-blue/5'
                : 'border-transparent text-monday-gray hover:text-monday-black hover:bg-monday-gray-background/20'
            }`}
          >
            <Calendar size={16} />
            Rekap & Input Absensi
          </button>
          <button
            type="button"
            onClick={() => setPortalSubTab('exams')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
              portalSubTab === 'exams'
                ? 'border-monday-blue text-monday-blue bg-monday-blue/5'
                : 'border-transparent text-monday-gray hover:text-monday-black hover:bg-monday-gray-background/20'
            }`}
          >
            <BookOpen size={16} />
            Jadwal Ujian
          </button>
        </div>
      )}

      {selectedDosenForPortal ? (
        loadingPortal ? (
          <div className="py-12 text-center text-monday-gray text-sm font-bold animate-pulse">
            Memuat data portal dosen...
          </div>
        ) : portalSubTab === 'classes' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            
            {/* Lecturer classes grid list */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Daftar Kelas Kuliah Diampu</h4>
              {dosenActiveClasses.length > 0 ? (
                <div className="space-y-3">
                  {dosenActiveClasses.map((item) => {
                    const isSelected = selectedClassForGrades?.id === item.id;
                    const mkObj = mataKuliahMap[item.course_id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectClassForPortalGrades(item)}
                        className={`w-full text-left p-4 rounded-2xl border transition-300 flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-monday-blue/10 border-monday-blue/30 text-monday-blue shadow-sm font-bold' 
                            : 'bg-white border-monday-border hover:bg-monday-gray-background/40 text-monday-black font-semibold'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-monday-background border border-monday-border rounded-md text-monday-gray font-mono">
                            {mkObj?.code || 'MK'}
                          </span>
                          <span className="text-xs font-extrabold">Kelas: {item.class_name}</span>
                        </div>
                        <span className="font-bold text-sm block leading-tight">{mkObj?.name || 'Nama Mata Kuliah'}</span>
                        <div className="flex items-center justify-between mt-1 text-[11px] font-semibold text-monday-gray">
                          <span>SKS: {mkObj?.sks || '-'} SKS</span>
                          <span>Ruangan: {item.room || '-'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                  Dosen ini belum ditugaskan mengampu kelas apapun pada semester aktif ini.
                </div>
              )}
            </div>

            {/* Student grade input list */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Lembar Input Nilai Kelas Kuliah</h4>
              {selectedClassForGrades ? (
                <div className="border border-monday-border rounded-2xl overflow-hidden bg-white shadow-sm space-y-4 p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-monday-border">
                    <div>
                      <span className="text-xs text-monday-gray font-bold uppercase block">Mata Kuliah</span>
                      <h5 className="font-extrabold text-base text-monday-black mt-0.5">
                        {mataKuliahMap[selectedClassForGrades.course_id]?.name} (Kelas {selectedClassForGrades.class_name})
                      </h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-monday-gray-background border border-monday-border text-monday-black rounded-lg font-bold text-xs">
                        Ruang: {selectedClassForGrades.room || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const filteredStudents = enrolledStudentsInClass.filter(enroll => {
                        const s = studentMap[enroll.student_id];
                        if (!s) return false;
                        const query = gradeSearchQuery.toLowerCase();
                        return s.name.toLowerCase().includes(query) || s.nim.toLowerCase().includes(query);
                      });

                      return (
                        <>
                          {enrolledStudentsInClass.length > 0 ? (
                            <>
                              <div className="relative mb-4">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-monday-gray" />
                                <input
                                  type="text"
                                  placeholder="Cari NIM atau Nama Mahasiswa..."
                                  value={gradeSearchQuery}
                                  onChange={(e) => setGradeSearchQuery(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 bg-monday-background border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue transition-colors"
                                />
                              </div>
                              {filteredStudents.length > 0 ? (
                                <div className="divide-y divide-monday-border">
                                  {filteredStudents.map((enroll) => {
                                    const studentData = studentMap[enroll.student_id];
                                    return (
                                      <div key={enroll.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                          <span className="text-xs font-mono text-monday-blue font-bold">{studentData?.nim}</span>
                                          <h5 className="font-bold text-sm text-monday-black">{studentData?.name}</h5>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-monday-gray block">Nilai Angka</label>
                                            <input 
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={updatingGrades[enroll.id]?.final_score !== undefined ? updatingGrades[enroll.id].final_score : ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                let letterGrade = '';
                                                if (val !== '') {
                                                  const score = parseFloat(val);
                                                  if (!isNaN(score)) {
                                                    if (score >= 80 && score <= 100) letterGrade = 'A';
                                                    else if (score >= 70 && score < 80) letterGrade = 'B';
                                                    else if (score >= 55 && score < 70) letterGrade = 'C';
                                                    else if (score >= 40 && score < 55) letterGrade = 'D';
                                                    else if (score >= 0 && score < 40) letterGrade = 'E';
                                                  }
                                                }
                                                setUpdatingGrades(prev => ({
                                                  ...prev,
                                                  [enroll.id]: { 
                                                    ...prev[enroll.id], 
                                                    final_score: val,
                                                    letter_grade: letterGrade
                                                  }
                                                }));
                                              }}
                                              onBlur={async () => {
                                                const currentVal = updatingGrades[enroll.id]?.final_score;
                                                const originalVal = enroll.final_score !== null ? String(enroll.final_score) : '';
                                                if (String(currentVal) !== originalVal) {
                                                  setSaveStatus(prev => ({ ...prev, [enroll.id]: 'saving' }));
                                                  const res = await saveStudentGrade(enroll.id, true);
                                                  if (res && res.success) {
                                                    setSaveStatus(prev => ({ ...prev, [enroll.id]: 'saved' }));
                                                    setTimeout(() => setSaveStatus(prev => ({ ...prev, [enroll.id]: null })), 2500);
                                                  } else {
                                                    setSaveStatus(prev => ({ ...prev, [enroll.id]: 'error' }));
                                                    setTimeout(() => setSaveStatus(prev => ({ ...prev, [enroll.id]: null })), 4000);
                                                  }
                                                }
                                              }}
                                              onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                  e.target.blur();
                                                }
                                              }}
                                              className="w-20 px-2 py-1 bg-white border border-monday-border rounded-lg text-center text-sm font-semibold focus:outline-none focus:border-monday-blue"
                                              placeholder="0-100"
                                            />
                                          </div>

                                          <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-monday-gray block">Huruf</label>
                                            <input 
                                              type="text"
                                              maxLength={2}
                                              value={updatingGrades[enroll.id]?.letter_grade || ''}
                                              disabled
                                              className="w-12 px-2 py-1 bg-monday-gray-background border border-monday-border rounded-lg text-center text-sm font-bold text-monday-gray cursor-not-allowed"
                                              placeholder="-"
                                            />
                                          </div>

                                          <div className="pt-5 w-20 flex justify-center">
                                            {saveStatus[enroll.id] === 'saving' ? (
                                              <span className="text-monday-gray text-xs font-bold animate-pulse">Menyimpan...</span>
                                            ) : saveStatus[enroll.id] === 'saved' ? (
                                              <span className="text-emerald-500 text-xs font-bold">Tersimpan</span>
                                            ) : saveStatus[enroll.id] === 'error' ? (
                                              <span className="text-monday-red text-xs font-bold">Gagal</span>
                                            ) : (
                                              <span className="text-monday-gray/30 text-xs font-semibold">Tersimpan</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="py-6 text-center text-xs text-monday-gray italic font-semibold">
                                  Mahasiswa tidak ditemukan.
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="py-10 text-center text-xs text-monday-gray font-semibold">
                              Belum ada mahasiswa terdaftar di kelas kuliah ini.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-monday-gray" />
                  Silakan pilih salah satu kelas kuliah di sebelah kiri untuk melihat daftar mahasiswa & mengisi nilai.
                </div>
              )}
            </div>

          </div>
        ) : portalSubTab === 'attendance' ? (
          // Attendance View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            {/* Lecturer classes grid list */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Daftar Kelas Kuliah Diampu</h4>
              {dosenActiveClasses.length > 0 ? (
                <div className="space-y-3">
                  {dosenActiveClasses.map((item) => {
                    const isSelected = selectedClassForGrades?.id === item.id;
                    const mkObj = mataKuliahMap[item.course_id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectClassForPortalGrades(item)}
                        className={`w-full text-left p-4 rounded-2xl border transition-300 flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-monday-blue/10 border-monday-blue/30 text-monday-blue shadow-sm font-bold' 
                            : 'bg-white border-monday-border hover:bg-monday-gray-background/40 text-monday-black font-semibold'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-monday-background border border-monday-border rounded-md text-monday-gray font-mono">
                            {mkObj?.code || 'MK'}
                          </span>
                          <span className="text-xs font-extrabold">Kelas: {item.class_name}</span>
                        </div>
                        <span className="font-bold text-sm block leading-tight">{mkObj?.name || 'Nama Mata Kuliah'}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                  Dosen ini belum ditugaskan mengampu kelas apapun pada semester aktif ini.
                </div>
              )}
            </div>

            {/* Attendance Accordion List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider block">Rekap & Input Absensi Kelas</h4>
                  {selectedClassForGrades && (
                    <span className="text-xs font-bold text-monday-blue">
                      {mataKuliahMap[selectedClassForGrades.course_id]?.name} (Kelas {selectedClassForGrades.class_name})
                    </span>
                  )}
                </div>
              </div>

              {selectedClassForGrades ? (
                loadingRecap ? (
                  <div className="py-12 text-center text-monday-gray text-xs font-bold animate-pulse border border-dashed border-monday-border rounded-2xl">
                    Memuat data absensi kelas...
                  </div>
                ) : meetings.length > 0 ? (
                  <div className="space-y-3">
                    {meetings.map((meeting, index) => {
                      const isExpanded = expandedMeetingId === meeting.id;
                      const isActive = meeting.is_active;
                      
                      return (
                        <div key={meeting.id} className="border border-monday-border rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                          <button 
                            onClick={() => setExpandedMeetingId(isExpanded ? null : meeting.id)}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-monday-gray-background/30 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 font-extrabold text-[10px] uppercase tracking-widest rounded-lg border ${isActive ? 'bg-monday-blue/10 text-monday-blue border-monday-blue/20' : 'bg-monday-gray-background text-monday-gray border-monday-border'}`}>
                                Pertemuan {index + 1}
                              </span>
                              <span className={`font-extrabold text-sm transition-colors ${isActive ? 'text-monday-black group-hover:text-monday-blue' : 'text-monday-gray'}`}>
                                {new Date(meeting.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              {!isActive && (
                                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">Belum Aktif</span>
                              )}
                            </div>
                            <div className={`text-monday-gray transition-transform duration-300 ${isExpanded ? 'rotate-180 text-monday-blue' : ''}`}>
                              <ChevronDown size={20} />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-0 border-t border-monday-border animate-fade-in bg-monday-background/30">
                              {!isActive ? (
                                <div className="p-8 text-center bg-white flex flex-col items-center gap-3">
                                  <p className="text-sm font-semibold text-monday-gray">Kelas pertemuan ini belum diaktifkan. Klik tombol di bawah untuk memulai sesi absensi.</p>
                                  <button
                                    onClick={() => handleActivateMeeting(meeting.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-monday-blue hover:bg-blue-600 transition-colors text-white rounded-xl text-xs font-extrabold shadow-sm"
                                  >
                                    <Play size={14} fill="currentColor" />
                                    Aktifkan Pertemuan
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="px-5 py-3 border-b border-monday-border bg-white flex items-center gap-2 text-[10px] font-bold text-monday-gray">
                                    <Info size={14} className="text-monday-blue" />
                                    Pilih status kehadiran untuk menyimpan secara otomatis.
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse bg-white">
                                      <thead>
                                        <tr className="bg-monday-gray-background/50 border-b border-monday-border text-[10px] font-extrabold uppercase tracking-wider text-monday-gray">
                                          <th className="py-3 px-4 w-12 text-center">No</th>
                                          <th className="py-3 px-4 w-32">NIM</th>
                                          <th className="py-3 px-4">Nama Mahasiswa</th>
                                          <th className="py-3 px-4 text-center">Status Kehadiran</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-monday-border text-xs text-monday-black">
                                        {enrolledStudentsInClass.length > 0 ? (
                                          enrolledStudentsInClass.map((enroll, idx) => {
                                            const studentData = studentMap[enroll.student_id];
                                            const record = (meeting.absensis || []).find(r => r.student_id === enroll.student_id);
                                            const currentStatus = record?.status || null; 

                                            return (
                                              <tr key={enroll.id} className="hover:bg-monday-gray-background/30 transition-colors">
                                                <td className="py-3 px-4 text-center font-mono font-semibold text-monday-gray">{idx + 1}</td>
                                                <td className="py-3 px-4 font-bold text-monday-blue font-mono">{studentData?.nim}</td>
                                                <td className="py-3 px-4 font-semibold">{studentData?.name}</td>
                                                <td className="py-3 px-4 text-center">
                                                  <div className="flex justify-center gap-1.5">
                                                    {['hadir', 'sakit', 'izin', 'alfa'].map(statusOption => {
                                                      const isStatusActive = currentStatus === statusOption;
                                                      let activeColors = '';
                                                      if (isStatusActive) {
                                                        if (statusOption === 'hadir') activeColors = 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm';
                                                        else if (statusOption === 'sakit') activeColors = 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm';
                                                        else if (statusOption === 'izin') activeColors = 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm';
                                                        else if (statusOption === 'alfa') activeColors = 'bg-red-100 text-red-800 border-red-300 shadow-sm';
                                                      } else {
                                                        activeColors = 'bg-white text-monday-gray border-monday-border hover:bg-monday-gray-background hover:text-monday-black';
                                                      }

                                                      return (
                                                        <button
                                                          key={statusOption}
                                                          onClick={() => handleUpdateAttendance(meeting.id, enroll.student_id, statusOption)}
                                                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer ${activeColors}`}
                                                        >
                                                          {statusOption}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })
                                        ) : (
                                          <tr>
                                            <td colSpan={4} className="py-8 text-center text-xs text-monday-gray font-semibold">
                                              Belum ada mahasiswa di kelas ini.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                    Belum ada data pertemuan untuk kelas ini yang ter-generate otomatis.
                  </div>
                )
              ) : (
                <div className="p-8 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-monday-gray" />
                  Silakan pilih salah satu kelas kuliah di sebelah kiri untuk mengelola absensi.
                </div>
              )}
            </div>
          </div>
        ) : portalSubTab === 'exams' ? (
          // Exams View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            {/* Lecturer classes grid list */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">Daftar Kelas Kuliah Diampu</h4>
              {dosenActiveClasses.length > 0 ? (
                <div className="space-y-3">
                  {dosenActiveClasses.map((item) => {
                    const isSelected = selectedClassForGrades?.id === item.id;
                    const mkObj = mataKuliahMap[item.course_id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectClassForPortalGrades(item)}
                        className={`w-full text-left p-4 rounded-2xl border transition-300 flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-monday-blue/10 border-monday-blue/30 text-monday-blue shadow-sm font-bold' 
                            : 'bg-white border-monday-border hover:bg-monday-gray-background/40 text-monday-black font-semibold'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-monday-background border border-monday-border rounded-md text-monday-gray font-mono">
                            {mkObj?.code || 'MK'}
                          </span>
                          <span className="text-xs font-extrabold">Kelas: {item.class_name}</span>
                        </div>
                        <span className="font-bold text-sm block leading-tight">{mkObj?.name || 'Nama Mata Kuliah'}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                  Dosen ini belum ditugaskan mengampu kelas apapun pada semester aktif ini.
                </div>
              )}
            </div>

            {/* Exams Management */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider block">Jadwal Ujian Kelas (UTS & UAS)</h4>
                  {selectedClassForGrades && (
                    <span className="text-xs font-bold text-monday-blue">
                      {mataKuliahMap[selectedClassForGrades.course_id]?.name} (Kelas {selectedClassForGrades.class_name})
                    </span>
                  )}
                </div>
                {selectedClassForGrades && (
                  <button 
                    onClick={handleOpenExamForm}
                    className="px-4 py-2 bg-monday-blue hover:bg-blue-600 transition-colors text-white rounded-xl text-xs font-extrabold shadow-sm"
                  >
                    {showExamForm ? 'Batal' : '+ Jadwalkan Ujian'}
                  </button>
                )}
              </div>

              {selectedClassForGrades ? (
                <>
                  {showExamForm && (
                    <div className="p-5 border border-monday-border rounded-2xl bg-white shadow-sm mb-4">
                      <h5 className="font-extrabold text-sm text-monday-black mb-4">Form Penjadwalan Ujian</h5>
                      <form onSubmit={handleSaveExam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-monday-gray">Jenis Ujian</label>
                          <select 
                            value={examForm.exam_type} 
                            onChange={e => setExamForm({...examForm, exam_type: e.target.value})}
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue"
                            required
                          >
                            <option value="UTS">UTS (Ujian Tengah Semester)</option>
                            <option value="UAS">UAS (Ujian Akhir Semester)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-monday-gray">Tanggal Ujian</label>
                          <input 
                            type="date" 
                            value={examForm.tanggal}
                            onChange={e => setExamForm({...examForm, tanggal: e.target.value})}
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-monday-gray">Jam Mulai</label>
                          <input 
                            type="time" 
                            value={examForm.start_time}
                            onChange={e => {
                              const newStartTime = e.target.value;
                              const sks = mataKuliahMap[selectedClassForGrades.course_id]?.sks || 0;
                              
                              let newEndTime = examForm.end_time;
                              if (newStartTime && sks > 0) {
                                const [hours, minutes] = newStartTime.split(':').map(Number);
                                const totalMinutes = hours * 60 + minutes + (sks * 50);
                                const endHours = Math.floor(totalMinutes / 60) % 24;
                                const endMinutes = totalMinutes % 60;
                                newEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                              }
                          
                              setExamForm({...examForm, start_time: newStartTime, end_time: newEndTime});
                            }}
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-monday-gray">Jam Selesai</label>
                          <input 
                            type="time" 
                            value={examForm.end_time}
                            onChange={e => setExamForm({...examForm, end_time: e.target.value})}
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-monday-gray">Metode Pelaksanaan</label>
                          <select 
                            value={examForm.method} 
                            onChange={e => setExamForm({...examForm, method: e.target.value})}
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue"
                            required
                          >
                            <option value="offline">Tatap Muka (Offline)</option>
                            <option value="online">Daring (Online)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-monday-gray">Ruangan</label>
                          <input 
                            type="text" 
                            value={examForm.room}
                            onChange={e => setExamForm({...examForm, room: e.target.value})}
                            placeholder="Contoh: R-301 atau Link Zoom"
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue"
                            required
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-monday-gray">Dosen Pengawas</label>
                          <select 
                            value={examForm.lecturer_id} 
                            onChange={e => setExamForm({...examForm, lecturer_id: e.target.value})}
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue"
                          >
                            <option value="">-- Pilih Dosen Pengawas (Opsional) --</option>
                            {lecturers.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-monday-gray">Catatan / Informasi Tambahan</label>
                          <textarea 
                            value={examForm.notes}
                            onChange={e => setExamForm({...examForm, notes: e.target.value})}
                            placeholder="Materi yang diujikan, aturan ujian, sifat ujian (Open/Closed book), dll."
                            className="w-full px-3 py-2 border border-monday-border rounded-xl text-sm font-semibold focus:outline-none focus:border-monday-blue h-20 resize-none"
                          ></textarea>
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-2">
                          <button 
                            type="submit"
                            className="px-6 py-2.5 bg-monday-blue hover:bg-blue-600 transition-colors text-white rounded-xl text-sm font-extrabold shadow-sm"
                          >
                            Simpan Jadwal Ujian
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {loadingExams ? (
                    <div className="py-12 text-center text-monday-gray text-xs font-bold animate-pulse border border-dashed border-monday-border rounded-2xl">
                      Memuat jadwal ujian...
                    </div>
                  ) : exams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exams.map(exam => (
                        <div key={exam.id} className="border border-monday-border bg-white rounded-2xl p-5 shadow-sm relative group overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-monday-blue"></div>
                          <div className="flex justify-between items-start mb-3 pl-2">
                            <span className="px-3 py-1 bg-monday-blue/10 text-monday-blue font-extrabold text-[10px] uppercase tracking-widest rounded-lg border border-monday-blue/20">
                              {exam.exam_type}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setExamForm({
                                    exam_type: exam.exam_type,
                                    tanggal: exam.tanggal,
                                    start_time: exam.start_time.substring(0,5),
                                    end_time: exam.end_time.substring(0,5),
                                    room: exam.room || '',
                                    lecturer_id: exam.lecturer_id || '',
                                    method: exam.method,
                                    notes: exam.notes || ''
                                  });
                                  setShowExamForm(true);
                                }}
                                className="text-monday-gray hover:text-monday-blue transition-colors p-1"
                                title="Edit Ujian"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteExam(exam.id)}
                                className="text-monday-gray hover:text-red-500 transition-colors p-1"
                                title="Hapus Ujian"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pl-2">
                            <div className="flex items-center gap-2 text-sm font-extrabold text-monday-black">
                              <Calendar size={16} className="text-monday-gray" />
                              {new Date(exam.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-monday-gray">
                              <Clock size={16} />
                              {exam.start_time.substring(0,5)} - {exam.end_time.substring(0,5)} WIB
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-monday-gray">
                              <MapPin size={16} />
                              {exam.room || '-'} ({exam.method === 'online' ? 'Daring' : 'Luring'})
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-monday-gray">
                              <Users size={16} />
                              Pengawas: {exam.lecturer?.name || 'Belum ditentukan'}
                            </div>
                            {exam.notes && (
                              <div className="pt-2 mt-2 border-t border-monday-border text-xs text-monday-gray">
                                <span className="font-bold">Info: </span>{exam.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                      Belum ada jadwal ujian yang dibuat untuk kelas ini.
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-monday-gray" />
                  Silakan pilih salah satu kelas kuliah di sebelah kiri untuk mengelola jadwal ujian.
                </div>
              )}
            </div>
          </div>
        ) : (
          // Advisees view
          <div className="space-y-4 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-monday-gray uppercase tracking-wider">
                  Daftar Mahasiswa Bimbingan Akademik (Perwalian)
                </h4>
                <p className="text-xs text-monday-gray font-semibold">
                  Berikut adalah daftar mahasiswa yang berada di bawah bimbingan akademik Anda.
                </p>
              </div>
              
              <div className="relative w-full md:w-72">
                <SearchInput 
                  value={adviseeSearchQuery}
                  onChange={(e) => setAdviseeSearchQuery(e.target.value)}
                  placeholder="Cari name atau NIM..."
                />
              </div>
            </div>

            {dosenAdviseeStudents && dosenAdviseeStudents.length > 0 ? (
              (() => {
                const query = adviseeSearchQuery.toLowerCase();
                const filtered = dosenAdviseeStudents.filter(m => 
                  m.name.toLowerCase().includes(query) ||
                  m.nim.toLowerCase().includes(query)
                );
                
                return filtered.length > 0 ? (
                  <div className="border border-monday-border rounded-2xl overflow-x-auto overflow-y-hidden bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-monday-gray-background border-b border-monday-border text-xs font-bold uppercase tracking-wider text-monday-gray">
                          <th className="py-4 px-6 w-16 text-center">No</th>
                          <th className="py-4 px-6 w-36">NIM</th>
                          <th className="py-4 px-6">Nama Lengkap</th>
                          <th className="py-4 px-6">Program Studi</th>
                          <th className="py-4 px-6 text-center">Angkatan</th>
                          <th className="py-4 px-6 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-monday-border text-sm text-monday-black">
                        {filtered.map((m, index) => {
                          const prObj = studyProgramMap[m.study_program_id];
                          const isAktif = m.status === 'AKTIF';
                          return (
                            <tr key={m.id} className="hover:bg-monday-gray-background/30 transition-colors">
                              <td className="py-3.5 px-6 text-center text-monday-gray font-mono font-semibold">{index + 1}</td>
                              <td className="py-3.5 px-6 font-bold text-monday-blue font-mono">{m.nim}</td>
                              <td className="py-3.5 px-6 font-semibold">{m.name}</td>
                              <td className="py-3.5 px-6">
                                {prObj ? (
                                  <span className="px-2.5 py-1 bg-monday-background border border-monday-border rounded-xl text-xs font-bold text-monday-gray">
                                    {prObj.name}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="py-3.5 px-6 text-center font-semibold text-monday-gray">
                                {m.enrollment_year || '-'}
                              </td>
                              <td className="py-3.5 px-6 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                  isAktif 
                                    ? 'bg-monday-lime-green/20 text-monday-black border border-monday-lime-green/30' 
                                    : 'bg-monday-gray-background text-monday-gray border border-monday-border'
                                }`}>
                                  {m.status || '-'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                    Tidak ada mahasiswa bimbingan yang cocok dengan pencarian "{adviseeSearchQuery}".
                  </div>
                );
              })()
            ) : (
              <div className="py-12 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal">
                Belum ada data mahasiswa bimbingan akademik (perwalian) untuk dosen ini.
              </div>
            )}
          </div>
        )
      ) : (
        <div className="p-8 bg-monday-background rounded-2xl border border-dashed border-monday-border text-center text-monday-gray text-xs font-bold leading-normal print:hidden">
          <AlertTriangle size={24} className="mx-auto mb-2 text-monday-gray" />
          Hubungkan/simulasikan login Dosen Pengampu terlebih dahulu melalui dropdown di atas.
        </div>
      )}

    </div>
  );
});

export default LecturerPortalTab;
