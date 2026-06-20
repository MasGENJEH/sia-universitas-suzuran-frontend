import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Mail, Phone, Lock, Camera, CheckCircle2, AlertCircle, Eye, EyeOff, Save, Shield, Info, Settings, Database, Users, GraduationCap, BookOpen, Layers } from 'lucide-react';

export default function ProfilAdminTab({
  user,
  faculties = [],
  studyPrograms = [],
  lecturers = [],
  students = [],
  mataKuliahs = [],
  kelasKuliahs = [],
  users = [],
  refreshUser
}) {
  const fileInputRef = useRef(null);

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // File upload states
  const [photoFile, setFotoFile] = useState(null);
  const [photoPreview, setFotoPreview] = useState(null);
  const [imgError, setImgError] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form values
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // System overview stats
  const systemStats = useMemo(() => ({
    totalUsers: users.length,
    totalDosens: lecturers.length,
    totalMahasiswas: students.length,
    totalFakultas: faculties.length,
    totalProdis: studyPrograms.length,
    totalMataKuliahs: mataKuliahs.length,
    totalKelasKuliahs: kelasKuliahs.length,
    aktivMahasiswas: students.filter(m => m.status === 'AKTIF').length,
  }), [users, lecturers, students, faculties, studyPrograms, mataKuliahs, kelasKuliahs]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: ['Ukuran photo maksimal 2MB.'] }));
        return;
      }
      setFotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFotoPreview(previewUrl);
      setImgError(false);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.photo;
        return copy;
      });
    }
  };

  // Trigger file picker click
  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Profile Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrors({});

    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('email', email);
    fd.append('phone', phone);

    if (password) {
      fd.append('password', password);
      fd.append('password_confirmation', passwordConfirmation);
    }

    if (photoFile) {
      fd.append('photo', photoFile);
    }

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || 'Profil berhasil diperbarui!');
        setPassword('');
        setPasswordConfirmation('');
        setFotoFile(null);
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: [data.message || 'Gagal memperbarui profil.'] });
        }
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: ['Terjadi kesalahan koneksi server.'] });
    } finally {
      setSubmitting(false);
    }
  };

  // Profile Image URL Helper
  const displayPhoto = useMemo(() => {
    if (photoPreview) return photoPreview;
    // Only use user.photo if it looks like a real storage path (contains a /)
    if (user?.photo) return user.photo.startsWith('http') ? user.photo : `/storage/${user.photo}`;
    return null;
  }, [photoPreview, user?.photo]);

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Header section */}
      <div className="flex flex-col gap-[4px] pb-4 border-b border-monday-border">
        <p className="flex items-center gap-[8px]">
          <Settings className="size-6 text-monday-black" />
          <span className="font-extrabold text-2xl text-monday-black">
            Profil Administrator
          </span>
        </p>
        <p className="font-semibold text-sm text-monday-gray">
          Kelola pengaturan akun administrator dan lihat ringkasan sistem SIAKAD.
        </p>
      </div>

      {/* Profile Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Section: Photo and Role Card */}
        <div className="lg:col-span-1 bg-white border border-monday-border rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-r from-monday-blue/20 to-rose-500/10" />

          {/* Avatar Container */}
          <div className="relative mt-8 z-10">
            <div className="w-32 h-32 rounded-3xl border-4 border-white bg-monday-background overflow-hidden shadow-lg flex items-center justify-center text-monday-gray font-extrabold text-4xl">
              {displayPhoto && !imgError ? (
                <img
                  src={displayPhoto}
                  alt="Profil"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <User size={48} className="text-monday-gray/50" />
              )}
            </div>

            {/* Photo upload trigger icon */}
            <button
              type="button"
              onClick={triggerFilePicker}
              className="absolute -bottom-2 -right-2 p-2.5 bg-monday-blue text-white rounded-2xl hover:bg-opacity-90 transition-all duration-200 border-2 border-white shadow-md cursor-pointer"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <h3 className="font-extrabold text-xl text-monday-black mt-5 leading-tight drop-shadow-sm">{user?.name || 'Administrator'}</h3>
          <p className="font-bold text-sm text-monday-gray mt-1">{user?.email}</p>

          <span className="mt-4 px-4 py-1 bg-monday-blue/15 text-monday-blue border border-monday-blue/20 rounded-full font-bold text-xs uppercase tracking-wider border-2 border-white shadow-sm">
            Administrator
          </span>

          {errors.photo && (
            <p className="text-xs text-monday-red font-semibold mt-2">{errors.photo[0]}</p>
          )}

          <div className="w-full border-t border-monday-border my-5" />

          {/* System Stats Mini Cards */}
          <div className="w-full grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-gradient-to-br from-monday-blue/10 to-monday-blue/5 border border-monday-blue/15 p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-monday-blue mb-0.5">
                <Users size={13} />
                <span className="font-extrabold text-lg">{systemStats.totalDosens}</span>
              </div>
              <p className="text-[10px] font-bold text-monday-gray">Dosen</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15 p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                <GraduationCap size={13} />
                <span className="font-extrabold text-lg">{systemStats.aktivMahasiswas}</span>
              </div>
              <p className="text-[10px] font-bold text-monday-gray">Mhs Aktif</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/15 p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-violet-600 mb-0.5">
                <BookOpen size={13} />
                <span className="font-extrabold text-lg">{systemStats.totalMataKuliahs}</span>
              </div>
              <p className="text-[10px] font-bold text-monday-gray">Mata Kuliah</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/15 p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">
                <Layers size={13} />
                <span className="font-extrabold text-lg">{systemStats.totalKelasKuliahs}</span>
              </div>
              <p className="text-[10px] font-bold text-monday-gray">Kelas</p>
            </div>
          </div>
        </div>

        {/* Right Section: Forms & System Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Edit Profile Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <h4 className="font-extrabold text-lg text-monday-black border-b border-monday-border pb-3 flex items-center gap-2">
              <Shield size={18} className="text-monday-blue" /> Pengaturan Akun & Kontak
            </h4>

            {/* General Alert messages */}
            {successMsg && (
              <div className="p-4 bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 rounded-2xl flex items-center gap-3 text-sm font-semibold leading-relaxed animate-fade-in">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errors.general && (
              <div className="p-4 bg-monday-red/10 text-monday-red border border-monday-red/15 rounded-2xl flex items-center gap-3 text-sm font-semibold leading-relaxed animate-fade-in">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errors.general[0]}</span>
              </div>
            )}

            {/* Email and Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-monday-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={13} /> Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-4 py-2.5 bg-monday-background border border-monday-border focus:border-monday-black focus:outline-none rounded-2xl font-semibold text-sm text-monday-black transition-300"
                />
                {errors.email && (
                  <p className="text-xs text-monday-red font-semibold">{errors.email[0]}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-monday-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={13} /> Nomor Telepon / HP
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="px-4 py-2.5 bg-monday-background border border-monday-border focus:border-monday-black focus:outline-none rounded-2xl font-semibold text-sm text-monday-black transition-300"
                />
                {errors.phone && (
                  <p className="text-xs text-monday-red font-semibold">{errors.phone[0]}</p>
                )}
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-monday-border">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-monday-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} /> Password Baru (Opsional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak diubah"
                    autoComplete="new-password"
                    className="w-full pl-4 pr-10 py-2.5 bg-monday-background border border-monday-border focus:border-monday-black focus:outline-none rounded-2xl font-semibold text-sm text-monday-black transition-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-monday-gray hover:text-monday-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-monday-red font-semibold">{errors.password[0]}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-monday-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} /> Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConf ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Tulis ulang password baru"
                    autoComplete="new-password"
                    className="w-full pl-4 pr-10 py-2.5 bg-monday-background border border-monday-border focus:border-monday-black focus:outline-none rounded-2xl font-semibold text-sm text-monday-black transition-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConf(!showPasswordConf)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-monday-gray hover:text-monday-black cursor-pointer"
                  >
                    {showPasswordConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3 border-t border-monday-border">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-monday-blue text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-monday-blue/30 rounded-full font-bold text-sm shadow-md shadow-monday-blue/15 transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                <Save size={16} />
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>

          {/* System Overview (Read Only Pane) */}
          <div className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h4 className="font-extrabold text-lg text-monday-black border-b border-monday-border pb-3 flex items-center gap-2">
              <Database size={18} className="text-monday-blue" /> Ringkasan Sistem SIAKAD
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-monday-blue/10 to-monday-blue/5 border border-monday-blue/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-monday-blue mb-1">
                  <Users size={16} />
                  <span className="font-extrabold text-2xl">{systemStats.totalUsers}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Total User</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                  <GraduationCap size={16} />
                  <span className="font-extrabold text-2xl">{systemStats.totalMahasiswas}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Total Mahasiswa</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                  <BookOpen size={16} />
                  <span className="font-extrabold text-2xl">{systemStats.totalMataKuliahs}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Mata Kuliah</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/15 p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
                  <Layers size={16} />
                  <span className="font-extrabold text-2xl">{systemStats.totalKelasKuliahs}</span>
                </div>
                <p className="text-xs font-bold text-monday-gray">Kelas Kuliah</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm font-semibold mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Nama Akun</span>
                <span className="text-monday-black font-extrabold">{user?.name || '-'}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Role Akun</span>
                <span className="text-monday-blue font-extrabold uppercase">
                  {(user?.roles || []).map(r => r.name).join(', ') || 'Admin'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Total Fakultas</span>
                <span className="text-monday-black">{systemStats.totalFakultas} Fakultas</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Total Program Studi</span>
                <span className="text-monday-black">{systemStats.totalProdis} Prodi</span>
              </div>
            </div>

            <div className="p-4 bg-monday-blue/5 border border-monday-blue/10 rounded-2xl mt-2 flex items-start gap-3 text-xs text-monday-gray font-semibold leading-relaxed">
              <Shield size={18} className="text-monday-blue shrink-0 mt-0.5" />
              <p>
                Sebagai Administrator, Anda memiliki akses penuh terhadap seluruh data dan konfigurasi sistem SIAKAD. Pastikan untuk menjaga kerahasiaan akun dan melakukan pergantian password secara berkala.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
