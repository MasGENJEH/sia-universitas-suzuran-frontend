import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Keep these as static imports (always needed for layout)
import Sidebar from './Sidebar';
import Header from './Header';
import Login from './Login';

// Lazy-load all tab components for code splitting
const DashboardTab = React.lazy(() => import('./DashboardTab'));
const FakultasTab = React.lazy(() => import('./FakultasTab'));
const ProdiTab = React.lazy(() => import('./ProdiTab'));
const TahunAkademikTab = React.lazy(() => import('./TahunAkademikTab'));
const DosenTab = React.lazy(() => import('./DosenTab'));
const MahasiswaTab = React.lazy(() => import('./MahasiswaTab'));
const MataKuliahTab = React.lazy(() => import('./MataKuliahTab'));
const KelasKuliahTab = React.lazy(() => import('./KelasKuliahTab'));
const LecturerPortalTab = React.lazy(() => import('./LecturerPortalTab'));
const KelasMahasiswaTab = React.lazy(() => import('./KelasMahasiswaTab'));
const DynamicFormModal = React.lazy(() => import('./DynamicFormModal'));
const JadwalKuliahTab = React.lazy(() => import('./JadwalKuliahTab'));
const ProfilMahasiswaTab = React.lazy(() => import('./ProfilMahasiswaTab'));
const ProfilDosenTab = React.lazy(() => import('./ProfilDosenTab'));
const ProfilAdminTab = React.lazy(() => import('./ProfilAdminTab'));
const UserTab = React.lazy(() => import('./UserTab'));
const RoleTab = React.lazy(() => import('./RoleTab'));

// Reusable loading spinner for Suspense fallback
const TabLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <RefreshCw size={32} className="text-monday-blue animate-spin" />
    <p className="text-monday-gray text-sm font-semibold">Memuat komponen...</p>
  </div>
);

export default function App() {
  const [activeTab, setActiveTabState] = useState(() => {
    return window.location.pathname.substring(1).split('/')[0] || 'dashboard';
  });

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(window.location.pathname.substring(1).split('/')[0] || 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setActiveTab = (tabId) => {
    window.history.pushState({}, '', '/' + tabId);
    setActiveTabState(tabId);
  };

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication States
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(!!token);

  // Database Data States
  const [faculties, setFaculties] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [mataKuliahs, setCourses] = useState([]);
  const [kelasKuliahs, setCourseClasses] = useState([]);
  const [kelasMahasiswas, setEnrollments] = useState([]);
  const [dosenPengampus, setClassInstructors] = useState([]);
  const [users, setUsers] = useState([]);

  // Active Semester Dosen View State
  const [selectedDosenForPortal, setSelectedDosenForPortal] = useState('');
  const [dosenActiveClasses, setDosenActiveClasses] = useState([]);
  const [dosenAdviseeStudents, setDosenAdviseeStudents] = useState([]);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [selectedClassForGrades, setSelectedClassForGrades] = useState(null);
  const [enrolledStudentsInClass, setEnrolledStudentsInClass] = useState([]);
  const [updatingGrades, setUpdatingGrades] = useState({});

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // e.g., 'faculties', 'prodi', etc.
  const [modalAction, setModalAction] = useState('create'); // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Custom Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null });

  // Active Semester Indicator Helper
  const activeSemester = academicYears.find(ta => ta.status) || null;

  // Debounced search: searchInput is immediate, searchQuery is debounced
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // --- LOOKUP MAPS (O(1) instead of O(n) Array.find) ---
  const mataKuliahMap = useMemo(() => {
    const map = {};
    mataKuliahs.forEach(mk => { map[mk.id] = mk; });
    return map;
  }, [mataKuliahs]);

  const lecturerMap = useMemo(() => {
    const map = {};
    lecturers.forEach(d => { map[d.id] = d; });
    return map;
  }, [lecturers]);

  const studentMap = useMemo(() => {
    const map = {};
    students.forEach(m => { map[m.id] = m; });
    return map;
  }, [students]);

  const studyProgramMap = useMemo(() => {
    const map = {};
    studyPrograms.forEach(p => { map[p.id] = p; });
    return map;
  }, [studyPrograms]);

  const academicYearMap = useMemo(() => {
    const map = {};
    academicYears.forEach(ta => { map[ta.id] = ta; });
    return map;
  }, [academicYears]);

  const facultyMap = useMemo(() => {
    const map = {};
    faculties.forEach(f => { map[f.id] = f; });
    return map;
  }, [faculties]);

  const userMap = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.id] = u; });
    return map;
  }, [users]);

  // Custom authenticated API fetch wrapper
  const apiFetch = async (url, options = {}) => {
    const currentToken = localStorage.getItem('token');
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      handleLogout();
      throw new Error('Session expired. Please log in again.');
    }

    return res;
  };

  // Shared JSON fetch helper
  const fetchJson = async (url) => {
    const res = await apiFetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.data ? data.data : data;
  };

  // Refresh current user data
  const refreshUser = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const res = await fetch('/api/user', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  // Login handler
  const handleLoginSuccess = (newToken, loggedInUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedInUser);

    // Select initial tab based on role
    const roles = loggedInUser.roles || [];
    const isAdmin = roles.some(r => r.name === 'admin');
    const isDosen = roles.some(r => r.name === 'dosen');
    const isMahasiswa = roles.some(r => r.name === 'mahasiswa');

    if (isAdmin) {
      setActiveTab('dashboard');
    } else if (isDosen) {
      setActiveTab('lecturer-portal');
    } else if (isMahasiswa) {
      setActiveTab('kelas-mahasiswa');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    const currentToken = localStorage.getItem('token');
    try {
      if (currentToken) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        });
      }
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      localStorage.removeItem('token');
      setToken('');
      setUser(null);
    }
  };

  // Check current session on mount
  useEffect(() => {
    const checkCurrentUser = async () => {
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        const res = await fetch('/api/user', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkCurrentUser();
  }, [token]);

  // --- ENTITY REFRESH MAP (targeted refetch instead of reloading all 10 endpoints) ---
  const entityRefreshMap = {
    faculties: { url: '/api/faculties', setter: setFaculties },
    prodi: { url: '/api/study-programs', setter: setStudyPrograms },
    tahunAkademik: { url: '/api/academic-years', setter: setAcademicYears },
    dosen: { url: '/api/lecturers', setter: setLecturers },
    mahasiswa: { url: '/api/students', setter: setStudents },
    mataKuliah: { url: '/api/courses', setter: setCourses },
    kelasKuliah: { url: '/api/course-classes', setter: setCourseClasses },
    kelasMahasiswa: { url: '/api/enrollments', setter: setEnrollments },
    dosenPengampu: { url: '/api/class-instructors', setter: setClassInstructors },
    users: { url: '/api/users', setter: setUsers },
  };

  // Refresh only 1 or more specific entity types (instead of all 10)
  const refreshEntity = async (...entityTypes) => {
    try {
      const promises = entityTypes.map(async (type) => {
        const entry = entityRefreshMap[type];
        if (entry) {
          const data = await fetchJson(entry.url);
          entry.setter(data);
        }
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error refreshing entity:", error);
    }
  };

  // Fetch all data helper (with role-based filtering)
  const fetchData = async () => {
    setLoading(true);
    try {
      const roles = user?.roles?.map(r => r.name) || [];
      const isAdmin = roles.includes('admin');

      // Base endpoints needed by all roles
      const endpoints = [
        { url: '/api/faculties', setter: setFaculties },
        { url: '/api/study-programs', setter: setStudyPrograms },
        { url: '/api/academic-years', setter: setAcademicYears },
        { url: '/api/lecturers', setter: setLecturers },
        { url: '/api/students', setter: setStudents },
        { url: '/api/courses', setter: setCourses },
        { url: '/api/course-classes', setter: setCourseClasses },
        { url: '/api/enrollments', setter: setEnrollments },
        { url: '/api/class-instructors', setter: setClassInstructors },
      ];

      // Only admin needs users list
      if (isAdmin) {
        endpoints.push({ url: '/api/users', setter: setUsers });
      }

      const results = await Promise.all(
        endpoints.map(ep => fetchJson(ep.url))
      );

      endpoints.forEach((ep, idx) => {
        ep.setter(results[idx]);
      });
    } catch (error) {
      console.error("Error fetching SIAKAD data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Auto-select Dosen for lecturer portal if logged in as dosen
  useEffect(() => {
    if (user && lecturers.length > 0) {
      const isDosen = (user.roles || []).some(r => r.name === 'dosen');
      if (isDosen) {
        const myDosen = lecturers.find(d => d.user_id === user.id);
        if (myDosen && String(selectedDosenForPortal) !== String(myDosen.id)) {
          setSelectedDosenForPortal(String(myDosen.id));
        }
      }
    }
  }, [user, lecturers]);


  // Fetch active classes and advisees for a selected Lecturer in the Lecturer Portal
  useEffect(() => {
    if (selectedDosenForPortal) {
      fetchLecturerPortalData(selectedDosenForPortal);
    } else {
      setDosenActiveClasses([]);
      setDosenAdviseeStudents([]);
      setSelectedClassForGrades(null);
      setEnrolledStudentsInClass([]);
    }
  }, [selectedDosenForPortal, kelasKuliahs, academicYears]);

  const fetchLecturerPortalData = async (dosenId) => {
    setLoadingPortal(true);
    try {
      const [resClasses, resAdvisees] = await Promise.all([
        apiFetch(`/api/lecturers/${dosenId}/kelas-kuliah-aktif`),
        apiFetch(`/api/lecturers/${dosenId}/mahasiswa-bimbingan`)
      ]);

      if (resClasses.ok) {
        const data = await resClasses.json();
        setDosenActiveClasses(data);
      }

      if (resAdvisees.ok) {
        const data = await resAdvisees.json();
        setDosenAdviseeStudents(data.data ? data.data : data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPortal(false);
    }
  };

  // Fetch enrolled students for a specific class in the portal
  const selectClassForPortalGrades = (kelas) => {
    setSelectedClassForGrades(kelas);
    const enrollments = kelasMahasiswas.filter(km => km.course_class_id === kelas.id);
    setEnrolledStudentsInClass(enrollments);

    const gradesMap = {};
    enrollments.forEach(enroll => {
      gradesMap[enroll.id] = {
        final_score: enroll.final_score !== null ? enroll.final_score : '',
        letter_grade: enroll.letter_grade || ''
      };
    });
    setUpdatingGrades(gradesMap);
  };

  // Save student grade in Lecturer Portal
  const saveStudentGrade = async (enrollId, silent = false) => {
    const gradeData = updatingGrades[enrollId];
    try {
      const originalEnrollment = kelasMahasiswas.find(km => km.id === enrollId);
      if (!originalEnrollment) return;

      const res = await apiFetch(`/api/enrollments/${enrollId}`, {
        method: 'PUT',
        body: JSON.stringify({
          student_id: originalEnrollment.student_id,
          course_class_id: originalEnrollment.course_class_id,
          final_score: gradeData.final_score === '' ? null : Number(gradeData.final_score),
          letter_grade: gradeData.letter_grade || null
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setEnrollments(prev => prev.map(km => km.id === enrollId ? updated : km));
        if (!silent) alert("Nilai mahasiswa berhasil diperbarui!");
        // Only refresh enrollments instead of all 10 endpoints
        refreshEntity('kelasMahasiswa');
        return { success: true };
      } else {
        const errors = await res.json();
        if (!silent) alert("Gagal memperbarui nilai: " + JSON.stringify(errors.errors || errors.message));
        return { success: false, message: JSON.stringify(errors.errors || errors.message) };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Terjadi kesalahan jaringan" };
    }
  };

  // Get correct API endpoint URL based on model type
  const getEndpointUrl = (type, id = null) => {
    let segment = `${type}s`;
    if (type === 'faculties') {
      segment = 'faculties';
    } else if (type === 'prodi') {
      segment = 'study-programs';
    } else if (type === 'tahunAkademik') {
      segment = 'academic-years';
    } else if (type === 'dosen') {
      segment = 'lecturers';
    } else if (type === 'mahasiswa') {
      segment = 'students';
    } else if (type === 'mataKuliah') {
      segment = 'courses';
    } else if (type === 'kelasKuliah') {
      segment = 'course-classes';
    } else if (type === 'dosenPengampu') {
      segment = 'class-instructors';
    } else if (type === 'kelasMahasiswa') {
      segment = 'enrollments';
    } else if (type === 'users') {
      segment = 'users';
    }
    return `/api/${segment}${id ? `/${id}` : ''}`;
  };

  // Map modalType to refreshEntity keys (including related entities)
  const getRefreshEntities = (type) => {
    switch (type) {
      case 'faculties': return ['faculties'];
      case 'prodi': return ['prodi'];
      case 'tahunAkademik': return ['tahunAkademik'];
      case 'dosen': return ['dosen'];
      case 'mahasiswa': return ['mahasiswa'];
      case 'mataKuliah': return ['mataKuliah'];
      case 'kelasKuliah': return ['kelasKuliah', 'dosenPengampu']; // KelasKuliah creates dosenPengampu too
      case 'dosenPengampu': return ['dosenPengampu'];
      case 'kelasMahasiswa': return ['kelasMahasiswa'];
      case 'users': return ['users'];
      default: return ['faculties', 'prodi', 'tahunAkademik', 'dosen', 'mahasiswa', 'mataKuliah', 'kelasKuliah', 'kelasMahasiswa', 'dosenPengampu', 'users'];
    }
  };

  // Form submit handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const url = getEndpointUrl(modalType, modalAction === 'edit' ? selectedItem.id : null);
    const method = modalAction === 'edit' ? 'PUT' : 'POST';

    try {
      let fetchOptions = {};

      // Use FormData for types with file upload support (mahasiswa, dosen)
      if (modalType === 'mahasiswa' || modalType === 'dosen') {
        const fd = new FormData();

        Object.entries(formData).forEach(([key, val]) => {
          // Skip internal preview/file keys and null values
          if (key === '_photoPreview' || key === '_photoFile') return;
          if (key === 'photo' && typeof val !== 'string') return; // Skip non-string photo
          if (val !== null && val !== undefined && val !== '') {
            fd.append(key, val);
          }
        });

        // Append the actual file if selected
        if (formData._photoFile) {
          fd.append('photo', formData._photoFile);
        }

        // Laravel requires POST + _method for FormData PUT
        if (method === 'PUT') {
          fd.append('_method', 'PUT');
        }

        fetchOptions = {
          method: 'POST', // Always POST for FormData (use _method for PUT)
          body: fd,
        };
      } else {
        fetchOptions = {
          method,
          body: JSON.stringify(formData),
        };
      }

      const res = await apiFetch(url, fetchOptions);

      const responseData = await res.json();

      if (res.ok) {
        // Cleanup preview URL
        if (formData._photoPreview) {
          URL.revokeObjectURL(formData._photoPreview);
        }
        setShowModal(false);
        setFormData({});
        // Targeted refresh instead of full fetchData()
        refreshEntity(...getRefreshEntities(modalType));
      } else {
        if (responseData.errors) {
          setFormErrors(responseData.errors);
        } else {
          alert("Error: " + responseData.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi server.");
    }
  };

  // Delete handler (triggers custom modal)
  const handleDeleteItem = (type, id) => {
    console.log("handleDeleteItem triggered: type =", type, ", id =", id);
    setDeleteTarget({ type, id });
    setShowDeleteModal(true);
  };

  // Actual API delete logic executed on custom modal confirmation
  const confirmDelete = async () => {
    const { type, id } = deleteTarget;
    console.log("confirmDelete executed for type =", type, ", id =", id);
    setShowDeleteModal(false);
    try {
      const res = await apiFetch(getEndpointUrl(type, id), {
        method: 'DELETE',
      });

      if (res.ok) {
        // Targeted refresh instead of full fetchData()
        refreshEntity(...getRefreshEntities(type));
      } else {
        let errMsg = "Constraint Error";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {
          errMsg = `Server error (${res.status})`;
        }
        alert("Gagal menghapus data: " + errMsg);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      setDeleteTarget({ type: null, id: null });
    }
  };

  // Open modal helper
  const openModal = (type, action, item = null) => {
    setModalType(type);
    setModalAction(action);
    setSelectedItem(item);
    setFormErrors({});

    const isUserMhs = (user?.roles || []).some(r => r.name === 'mahasiswa');
    const myMhsObj = isUserMhs ? students.find(m => m.user_id === user.id) : null;

    if (action === 'edit' && item) {
      if (type === 'kelasKuliah') {
        const linkedDosenIds = dosenPengampus
          .filter(dp => dp.course_class_id === item.id)
          .map(dp => dp.lecturer_id);
        setFormData({ ...item, dosen_ids: linkedDosenIds });
      } else {
        setFormData({ ...item });
      }
    } else if (type === 'dosenPengampu' && item) {
      setFormData({ course_class_id: item.id }); // Use correct property 'id' from kelasKuliah item
    } else {
      if (type === 'kelasMahasiswa' && myMhsObj) {
        setFormData({ student_id: myMhsObj.id });
      } else if (item) {
        setFormData({ ...item });
      } else {
        setFormData({});
      }
    }

    setShowModal(true);
  };

  // Switch academic year active status
  const toggleTahunAkademikStatus = async (ta) => {
    try {
      const res = await apiFetch(`/api/academic-years/${ta.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          code: ta.code,
          name: ta.name,
          status: true
        })
      });

      if (res.ok) {
        // Only refresh academic years instead of all 10 endpoints
        refreshEntity('tahunAkademik');
      } else {
        const err = await res.json();
        alert("Gagal mengaktifkan tahun akademik: " + err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-monday-background gap-4">
        <RefreshCw size={40} className="text-monday-blue animate-spin" />
        <p className="text-monday-gray text-sm font-bold">Menghubungkan ke server...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-monday-background text-monday-black font-sans">

      {/* Sidebar Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchInput}
        user={user}
        onLogout={handleLogout}
        isMinimized={isSidebarMinimized}
        setIsMinimized={setIsSidebarMinimized}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">

        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          activeSemester={activeSemester}
          loading={loading}
          fetchData={fetchData}
          user={user}
          onLogout={handleLogout}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* Content Body */}
        <div className="px-4 lg:px-8 pb-12 w-full space-y-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <RefreshCw size={40} className="text-monday-blue animate-spin" />
              <p className="text-monday-gray text-sm font-semibold">Memuat data dari server...</p>
            </div>
          ) : (
            <Suspense fallback={<TabLoadingFallback />}>
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <DashboardTab
                  user={user}
                  faculties={faculties}
                  studyPrograms={studyPrograms}
                  lecturers={lecturers}
                  students={students}
                  activeSemester={activeSemester}
                  kelasKuliahs={kelasKuliahs}
                  dosenPengampus={dosenPengampus}
                  kelasMahasiswas={kelasMahasiswas}
                  mataKuliahs={mataKuliahs}
                  setActiveTab={setActiveTab}
                  mataKuliahMap={mataKuliahMap}
                  lecturerMap={lecturerMap}
                  studentMap={studentMap}
                  academicYearMap={academicYearMap}
                />
              )}

              {/* FAKULTAS TAB */}
              {activeTab === 'faculties' && (
                <FakultasTab
                  faculties={faculties}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                />
              )}

              {/* PROGRAM STUDI TAB */}
              {activeTab === 'prodi' && (
                <ProdiTab
                  studyPrograms={studyPrograms}
                  faculties={faculties}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  facultyMap={facultyMap}
                />
              )}

              {/* TAHUN AKADEMIK TAB */}
              {activeTab === 'tahun-akademik' && (
                <TahunAkademikTab
                  tahunAkademiks={academicYears}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  toggleTahunAkademikStatus={toggleTahunAkademikStatus}
                />
              )}

              {/* DATA DOSEN TAB */}
              {activeTab === 'dosen' && (
                <DosenTab
                  lecturers={lecturers}
                  users={users}
                  students={students}
                  dosenPengampus={dosenPengampus}
                  kelasKuliahs={kelasKuliahs}
                  mataKuliahs={mataKuliahs}
                  tahunAkademiks={academicYears}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  mataKuliahMap={mataKuliahMap}
                  academicYearMap={academicYearMap}
                  userMap={userMap}
                  studentMap={studentMap}
                />
              )}

              {/* DATA MAHASISWA TAB */}
              {activeTab === 'mahasiswa' && (
                <MahasiswaTab
                  students={students}
                  studyPrograms={studyPrograms}
                  lecturers={lecturers}
                  faculties={faculties}
                  kelasMahasiswas={kelasMahasiswas}
                  kelasKuliahs={kelasKuliahs}
                  mataKuliahs={mataKuliahs}
                  tahunAkademiks={academicYears}
                  users={users}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  studyProgramMap={studyProgramMap}
                  lecturerMap={lecturerMap}
                  facultyMap={facultyMap}
                  userMap={userMap}
                  mataKuliahMap={mataKuliahMap}
                  academicYearMap={academicYearMap}
                />
              )}

              {/* MATA KULIAH TAB */}
              {activeTab === 'mata-kuliah' && (
                <MataKuliahTab
                  mataKuliahs={mataKuliahs}
                  studyPrograms={studyPrograms}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  studyProgramMap={studyProgramMap}
                />
              )}

              {/* KELAS KULIAH TAB */}
              {activeTab === 'kelas-kuliah' && (
                <KelasKuliahTab
                  kelasKuliahs={kelasKuliahs}
                  mataKuliahs={mataKuliahs}
                  tahunAkademiks={academicYears}
                  dosenPengampus={dosenPengampus}
                  lecturers={lecturers}
                  kelasMahasiswas={kelasMahasiswas}
                  students={students}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  mataKuliahMap={mataKuliahMap}
                  academicYearMap={academicYearMap}
                  lecturerMap={lecturerMap}
                  studentMap={studentMap}
                  handleAddStudentToClass={async (course_class_id, student_id) => {
                    try {
                      const res = await apiFetch('/api/enrollments', {
                        method: 'POST',
                        body: JSON.stringify({ course_class_id, student_id })
                      });
                      if (res.ok) {
                        refreshEntity('kelasMahasiswa');
                        return { success: true };
                      } else {
                        const error = await res.json();
                        return { success: false, message: error.message || 'Gagal menambahkan mahasiswa' };
                      }
                    } catch (e) {
                      return { success: false, message: 'Terjadi kesalahan jaringan' };
                    }
                  }}
                />
              )}

              {/* USER TAB (ADMIN) */}
              {activeTab === 'users' && (
                <UserTab
                  users={users}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                />
              )}

              {/* ROLE TAB (ADMIN) */}
              {activeTab === 'roles' && (
                <RoleTab />
              )}

              {/* PORTAL DOSEN TAB */}
              {activeTab.startsWith('lecturer-portal') && (
                <LecturerPortalTab
                  activeTab={activeTab}
                  user={user}
                  lecturers={lecturers}
                  mataKuliahs={mataKuliahs}
                  students={students}
                  kelasKuliahs={kelasKuliahs}
                  kelasMahasiswas={kelasMahasiswas}
                  dosenActiveClasses={dosenActiveClasses}
                  dosenAdviseeStudents={dosenAdviseeStudents}
                  studyPrograms={studyPrograms}
                  loadingPortal={loadingPortal}
                  selectedDosenForPortal={selectedDosenForPortal}
                  setSelectedDosenForPortal={setSelectedDosenForPortal}
                  selectedClassForGrades={selectedClassForGrades}
                  setSelectedClassForGrades={setSelectedClassForGrades}
                  enrolledStudentsInClass={enrolledStudentsInClass}
                  setEnrolledStudentsInClass={setEnrolledStudentsInClass}
                  updatingGrades={updatingGrades}
                  setUpdatingGrades={setUpdatingGrades}
                  fetchLecturerPortalData={fetchLecturerPortalData}
                  selectClassForPortalGrades={selectClassForPortalGrades}
                  saveStudentGrade={saveStudentGrade}
                  mataKuliahMap={mataKuliahMap}
                  studentMap={studentMap}
                  studyProgramMap={studyProgramMap}
                />
              )}

              {activeTab === 'kelas-mahasiswa' && (
                <KelasMahasiswaTab
                  user={user}
                  kelasMahasiswas={kelasMahasiswas}
                  students={students}
                  kelasKuliahs={kelasKuliahs}
                  mataKuliahs={mataKuliahs}
                  lecturers={lecturers}
                  dosenPengampus={dosenPengampus}
                  tahunAkademiks={academicYears}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchInput}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  mataKuliahMap={mataKuliahMap}
                  refreshUser={refreshUser}
                  academicYearMap={academicYearMap}
                  studentMap={studentMap}
                />
              )}

              {activeTab === 'jadwal-kuliah' && (
                <JadwalKuliahTab
                  user={user}
                  students={students}
                  kelasMahasiswas={kelasMahasiswas}
                  kelasKuliahs={kelasKuliahs}
                  mataKuliahs={mataKuliahs}
                  lecturers={lecturers}
                  dosenPengampus={dosenPengampus}
                  tahunAkademiks={academicYears}
                  mataKuliahMap={mataKuliahMap}
                  academicYearMap={academicYearMap}
                  lecturerMap={lecturerMap}
                  studentMap={studentMap}
                />
              )}

              {activeTab === 'profil-mahasiswa' && (
                <ProfilMahasiswaTab
                  user={user}
                  students={students}
                  studyPrograms={studyPrograms}
                  faculties={faculties}
                  lecturers={lecturers}
                  refreshUser={refreshUser}
                />
              )}

              {activeTab === 'profil-dosen' && (
                <ProfilDosenTab
                  user={user}
                  lecturers={lecturers}
                  students={students}
                  dosenPengampus={dosenPengampus}
                  kelasKuliahs={kelasKuliahs}
                  mataKuliahs={mataKuliahs}
                  tahunAkademiks={academicYears}
                  refreshUser={refreshUser}
                />
              )}

              {activeTab === 'profil-admin' && (
                <ProfilAdminTab
                  user={user}
                  faculties={faculties}
                  studyPrograms={studyPrograms}
                  lecturers={lecturers}
                  students={students}
                  mataKuliahs={mataKuliahs}
                  kelasKuliahs={kelasKuliahs}
                  users={users}
                  refreshUser={refreshUser}
                />
              )}
            </Suspense>
          )}
        </div>
      </main>

      {/* Dynamic Form Overlay Modal */}
      {showModal && (
        <Suspense fallback={null}>
          <DynamicFormModal
            currentUser={user}
            showModal={showModal}
            setShowModal={setShowModal}
            modalType={modalType}
            modalAction={modalAction}
            selectedItem={selectedItem}
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            faculties={faculties}
            studyPrograms={studyPrograms}
            tahunAkademiks={academicYears}
            lecturers={lecturers}
            students={students}
            mataKuliahs={mataKuliahs}
            kelasKuliahs={kelasKuliahs}
            users={users}
            handleFormSubmit={handleFormSubmit}
          />
        </Suspense>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-monday-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-monday-border max-w-md w-full flex flex-col gap-5 transform scale-100 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-monday-red/10 text-monday-red rounded-2xl shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-extrabold text-lg text-monday-black">
                  Konfirmasi Hapus Data
                </h3>
                <p className="text-sm font-semibold text-monday-gray leading-relaxed">
                  Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-monday-border">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget({ type: null, id: null });
                }}
                className="px-5 py-2.5 bg-monday-background border border-monday-border text-monday-black hover:bg-monday-gray-background rounded-full font-bold text-sm transition-all duration-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-monday-red text-white hover:bg-opacity-90 rounded-full font-bold text-sm shadow-md shadow-monday-red/20 transition-all duration-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


