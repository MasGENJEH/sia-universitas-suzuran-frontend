import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Mail, Phone, Lock, Camera, CheckCircle2, AlertCircle, Eye, EyeOff, Save, Shield, Info, BookOpen, Users, Award } from 'lucide-react';

const ProfilDosenTab = React.memo(function ProfilDosenTab({
  user,
  lecturers,
  students = [],
  dosenPengampus = [],
  kelasKuliahs = [],
  mataKuliahs = [],
  tahunAkademiks = [],
  refreshUser,
  mataKuliahMap = {},
  academicYearMap = {},
  studentMap = {}
}) {
  const fileInputRef = useRef(null);

  // Find the dosen record associated with this user
  const myDosen = useMemo(() => {
    if (!user) return null;
    return lecturers.find(d => d.user_id === user.id) || null;
  }, [user, lecturers]);

  // Compute teaching stats
  const stats = useMemo(() => {
    if (!myDosen) return { totalClasses: 0, totalTeachingSks: 0, totalAdvisees: 0 };

    const teachingLinks = dosenPengampus.filter(dp => dp.lecturer_id === myDosen.id);
    let totalTeachingSks = 0;
    let totalClasses = 0;

    teachingLinks.forEach(dp => {
      const kk = kelasKuliahs.find(k => k.id === dp.course_class_id);
      if (kk) {
        totalClasses++;
        const mk = mataKuliahMap[kk.course_id];
        if (mk && mk.sks) {
          totalTeachingSks += Number(mk.sks);
        }
      }
    });

    const totalAdvisees = students.filter(m => m.academic_advisor_id === myDosen.id).length;

    return { totalClasses, totalTeachingSks, totalAdvisees };
  }, [myDosen, dosenPengampus, kelasKuliahs, mataKuliahs, students]);

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

  if (!myDosen) {
    return (
      <div className="flex flex-col gap-6 flex-1 rounded-3xl p-6 bg-white border border-monday-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 bg-monday-red/10 text-monday-red rounded-full">
            <Info size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-monday-black">Profil Dosen Tidak Ditemukan</h3>
            <p className="text-sm font-semibold text-monday-gray max-w-sm mt-1">
              Akun Anda belum terhubung dengan data dosen aktif. Silakan hubungi Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
    if (myDosen.photo) return myDosen.photo.startsWith('http') ? myDosen.photo : `/storage/${myDosen.photo}`;
    return null;
  }, [photoPreview, myDosen.photo]);

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Header section */}
      <div className="flex flex-col gap-[4px] pb-4 border-b border-monday-border">
        <p className="flex items-center gap-[8px]">
          <User className="size-6 text-monday-black" />
          <span className="font-extrabold text-2xl text-monday-black">
            Profil Saya
          </span>
        </p>
        <p className="font-semibold text-sm text-monday-gray">
          Kelola informasi biodata pengajar dan pengaturan akun pribadi Anda.
        </p>
      </div>

      {/* Profile Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Section: Photo and Status Card */}
        <div className="lg:col-span-1 bg-white border border-monday-border rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-r from-emerald-500/15 to-monday-blue/10" />

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
              className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-opacity-90 transition-all duration-200 border-2 border-white shadow-md cursor-pointer"
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

          <h3 className="font-extrabold text-xl text-monday-black mt-5 leading-tight drop-shadow-sm">{myDosen.name}</h3>
          <p className="font-bold text-sm text-emerald-600 mt-1">{myDosen.nidn}</p>

          <span className="mt-4 px-4 py-1 bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 rounded-full font-bold text-xs uppercase tracking-wider border-2 border-white shadow-sm">
            Dosen Aktif
          </span>

          {errors.photo && (
            <p className="text-xs text-monday-red font-semibold mt-2">{errors.photo[0]}</p>
          )}

          <div className="w-full border-t border-monday-border my-5" />

          {/* Teaching Stats Mini Cards */}
          <div className="w-full grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-gradient-to-br from-monday-blue/10 to-monday-blue/5 border border-monday-blue/15 p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-monday-blue mb-0.5">
                <BookOpen size={13} />
                <span className="font-extrabold text-lg">{stats.totalClasses}</span>
              </div>
              <p className="text-[10px] font-bold text-monday-gray">Kelas</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15 p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                <Award size={13} />
                <span className="font-extrabold text-lg">{stats.totalTeachingSks}</span>
              </div>
              <p className="text-[10px] font-bold text-monday-gray">SKS</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/15 p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-violet-600 mb-0.5">
                <Users size={13} />
                <span className="font-extrabold text-lg">{stats.totalAdvisees}</span>
              </div>
              <p className="text-[10px] font-bold text-monday-gray">PA</p>
            </div>
          </div>
        </div>

        {/* Right Section: Forms & Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Edit Profile Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <h4 className="font-extrabold text-lg text-monday-black border-b border-monday-border pb-3 flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" /> Pengaturan Akun & Kontak
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
                className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/30 rounded-full font-bold text-sm shadow-md shadow-emerald-600/15 transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                <Save size={16} />
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>

          {/* Academic Details (Read Only Pane) */}
          <div className="bg-white border border-monday-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h4 className="font-extrabold text-lg text-monday-black border-b border-monday-border pb-3 flex items-center gap-2">
              <Info size={18} className="text-emerald-600" /> Detail Biodata Dosen
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm font-semibold">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">NIDN</span>
                <span className="text-monday-black font-extrabold">{myDosen.nidn}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Nama Lengkap</span>
                <span className="text-monday-black font-extrabold">{myDosen.name}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Total Kelas Diajar</span>
                <span className="text-monday-black">{stats.totalClasses} Kelas</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Total SKS Diajar</span>
                <span className="text-monday-black">{stats.totalTeachingSks} SKS</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Mahasiswa Bimbingan PA</span>
                <span className="text-monday-black">{stats.totalAdvisees} Mahasiswa</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-monday-gray uppercase tracking-wider">Status Pengajar</span>
                <span className="text-emerald-700 font-bold">Aktif Mengajar</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mt-2 flex items-start gap-3 text-xs text-monday-gray font-semibold leading-relaxed">
              <Shield size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Informasi biodata di atas bersumber dari database administrasi akademik resmi universitas. Jika terdapat kesalahan data NIDN atau name, silakan hubungi bagian Administrasi Akademik (BAAK) di gedung Rektorat.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
});

export default ProfilDosenTab;
