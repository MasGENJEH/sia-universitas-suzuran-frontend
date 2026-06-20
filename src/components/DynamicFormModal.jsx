import React from 'react';
import { X } from 'lucide-react';

export default function DynamicFormModal({
  currentUser,
  showModal,
  setShowModal,
  modalType,
  modalAction,
  selectedItem,
  formData,
  setFormData,
  formErrors,
  faculties,
  studyPrograms,
  tahunAkademiks,
  lecturers,
  students,
  mataKuliahs,
  kelasKuliahs,
  users,
  handleFormSubmit
}) {
  if (!showModal) return null;

  const calculateJamSelesai = (jamMulai, idMk) => {
    if (!jamMulai || !idMk) return '';
    const mk = mataKuliahs.find(m => String(m.id) === String(idMk));
    if (!mk) return '';
    const sks = Number(mk.sks) || 2;
    const durationMinutes = sks * 50;

    const parts = jamMulai.split(':');
    if (parts.length < 2) return '';
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return '';

    minutes += durationMinutes;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:00`;
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      
      // Auto-compute letter grade if updating numerical grade (final_score)
      if (field === 'final_score') {
        let letterGrade = null;
        if (val !== null && val !== '') {
          const score = Number(val);
          if (!isNaN(score)) {
            if (score >= 80 && score <= 100) letterGrade = 'A';
            else if (score >= 70 && score < 80) letterGrade = 'B';
            else if (score >= 55 && score < 70) letterGrade = 'C';
            else if (score >= 40 && score < 55) letterGrade = 'D';
            else if (score >= 0 && score < 40) letterGrade = 'E';
          }
        }
        updated.letter_grade = letterGrade;
      }
      
      return updated;
    });
  };

  const renderFormFields = () => {
    switch (modalType) {
      case 'faculties':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Kode Fakultas</label>
              <input 
                type="text" 
                value={formData.code || ''} 
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: FT"
              />
              {formErrors.code && <p className="text-xs text-monday-red font-bold">{formErrors.code[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Fakultas</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: FAKULTAS TEKNIK"
              />
              {formErrors.name && <p className="text-xs text-monday-red font-bold">{formErrors.name[0]}</p>}
            </div>
          </>
        );

      case 'prodi':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Fakultas Induk</label>
              <select 
                value={formData.faculty_id || ''} 
                onChange={(e) => handleInputChange('faculty_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Fakultas --</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {formErrors.faculty_id && <p className="text-xs text-monday-red font-bold">{formErrors.faculty_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Kode Prodi</label>
              <input 
                type="text" 
                value={formData.code || ''} 
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: IF"
              />
              {formErrors.code && <p className="text-xs text-monday-red font-bold">{formErrors.code[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Program Studi</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: TEKNIK INFORMATIKA"
              />
              {formErrors.name && <p className="text-xs text-monday-red font-bold">{formErrors.name[0]}</p>}
            </div>
          </>
        );

      case 'tahunAkademik':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Kode TA (Semester)</label>
              <input 
                type="text" 
                value={formData.code || ''} 
                onChange={(e) => handleInputChange('code', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: 20241"
              />
              {formErrors.code && <p className="text-xs text-monday-red font-bold">{formErrors.code[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama TA / Label</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: GANJIL 2024/2025"
              />
              {formErrors.name && <p className="text-xs text-monday-red font-bold">{formErrors.name[0]}</p>}
            </div>
            {modalAction === 'edit' && (
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="status-ta"
                  checked={formData.status || false} 
                  onChange={(e) => handleInputChange('status', e.target.checked)}
                  className="rounded border-monday-border text-monday-blue focus:ring-monday-blue"
                />
                <label htmlFor="status-ta" className="text-xs font-bold text-monday-gray uppercase tracking-wider cursor-pointer">
                  Aktifkan Semester Ini
                </label>
              </div>
            )}
          </>
        );

      case 'dosen':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">NIDN Dosen</label>
              <input 
                type="text" 
                value={formData.nidn || ''} 
                onChange={(e) => handleInputChange('nidn', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: 041234567"
              />
              {formErrors.nidn && <p className="text-xs text-monday-red font-bold">{formErrors.nidn[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Lengkap Dosen</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: Dr. Fachri, M.T."
              />
              {formErrors.name && <p className="text-xs text-monday-red font-bold">{formErrors.name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Tautkan Akun User</label>
              <select 
                value={formData.user_id || ''} 
                onChange={(e) => handleInputChange('user_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Akun User --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                ))}
              </select>
              {formErrors.user_id && <p className="text-xs text-monday-red font-bold">{formErrors.user_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Foto Dosen</label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                {formData._photoPreview ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-monday-blue/20 flex-shrink-0">
                    <img src={formData._photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : formData.photo && typeof formData.photo === 'string' ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-monday-blue/20 flex-shrink-0">
                    <img src={formData.photo.startsWith('http') ? formData.photo : `/storage/${formData.photo}`} alt="Current" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ) : null}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleInputChange('_photoFile', file);
                        const previewUrl = URL.createObjectURL(file);
                        handleInputChange('_photoPreview', previewUrl);
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-monday-blue/10 file:text-monday-blue hover:file:bg-monday-blue/20 file:cursor-pointer"
                  />
                  <p className="text-[11px] text-monday-gray font-medium mt-1">Format: JPEG, PNG, WEBP. Maks: 2MB.</p>
                </div>
              </div>
              {formErrors.photo && <p className="text-xs text-monday-red font-bold">{formErrors.photo[0]}</p>}
            </div>
          </>
        );

      case 'mahasiswa':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">NIM Mahasiswa</label>
              <input 
                type="text" 
                value={formData.nim || ''} 
                onChange={(e) => handleInputChange('nim', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: 41234567"
              />
              {formErrors.nim && <p className="text-xs text-monday-red font-bold">{formErrors.nim[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Lengkap Mahasiswa</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: Fachri Hanz"
              />
              {formErrors.name && <p className="text-xs text-monday-red font-bold">{formErrors.name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Program Studi</label>
              <select 
                value={formData.study_program_id || ''} 
                onChange={(e) => handleInputChange('study_program_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Program Studi --</option>
                {studyPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {formErrors.study_program_id && <p className="text-xs text-monday-red font-bold">{formErrors.study_program_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Dosen Wali Akademik</label>
              <select 
                value={formData.academic_advisor_id || ''} 
                onChange={(e) => handleInputChange('academic_advisor_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Dosen Wali --</option>
                {lecturers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {formErrors.academic_advisor_id && <p className="text-xs text-monday-red font-bold">{formErrors.academic_advisor_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Tautkan Akun User</label>
              <select 
                value={formData.user_id || ''} 
                onChange={(e) => handleInputChange('user_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Akun User --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                ))}
              </select>
              {formErrors.user_id && <p className="text-xs text-monday-red font-bold">{formErrors.user_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Tahun Masuk</label>
              <input 
                type="number" 
                min="1900"
                max="2100"
                value={formData.enrollment_year || ''} 
                onChange={(e) => handleInputChange('enrollment_year', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: 2026"
              />
              {formErrors.enrollment_year && <p className="text-xs text-monday-red font-bold">{formErrors.enrollment_year[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Status Mahasiswa</label>
              <select 
                value={formData.status || ''} 
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Status --</option>
                <option value="AKTIF">AKTIF</option>
                <option value="CUTI">CUTI</option>
                <option value="LULUS">LULUS</option>
                <option value="DO">DO</option>
              </select>
              {formErrors.status && <p className="text-xs text-monday-red font-bold">{formErrors.status[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Foto Mahasiswa</label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                {formData._photoPreview ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-monday-blue/20 flex-shrink-0">
                    <img src={formData._photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : formData.photo && typeof formData.photo === 'string' ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-monday-blue/20 flex-shrink-0">
                    <img src={formData.photo.startsWith('http') ? formData.photo : `/storage/${formData.photo}`} alt="Current" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ) : null}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleInputChange('_photoFile', file);
                        // Create preview URL
                        const previewUrl = URL.createObjectURL(file);
                        handleInputChange('_photoPreview', previewUrl);
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-monday-blue/10 file:text-monday-blue hover:file:bg-monday-blue/20 file:cursor-pointer"
                  />
                  <p className="text-[11px] text-monday-gray font-medium mt-1">Format: JPEG, PNG, WEBP. Maks: 2MB.</p>
                </div>
              </div>
              {formErrors.photo && <p className="text-xs text-monday-red font-bold">{formErrors.photo[0]}</p>}
            </div>
          </>
        );

      case 'mataKuliah':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Program Studi</label>
              <select 
                value={formData.study_program_id || ''} 
                onChange={(e) => handleInputChange('study_program_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Program Studi --</option>
                {studyPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {formErrors.study_program_id && <p className="text-xs text-monday-red font-bold">{formErrors.study_program_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Kode Mata Kuliah</label>
              <input 
                type="text" 
                value={formData.code || ''} 
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: MK001"
              />
              {formErrors.code && <p className="text-xs text-monday-red font-bold">{formErrors.code[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Mata Kuliah</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: ALGORITMA & PEMROGRAMAN"
              />
              {formErrors.name && <p className="text-xs text-monday-red font-bold">{formErrors.name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Bobot SKS</label>
              <input 
                type="number" 
                min="1"
                max="6"
                value={formData.sks || ''} 
                onChange={(e) => handleInputChange('sks', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: 3"
              />
              {formErrors.sks && <p className="text-xs text-monday-red font-bold">{formErrors.sks[0]}</p>}
            </div>
          </>
        );

      case 'kelasKuliah':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Mata Kuliah</label>
              <select 
                value={formData.course_id || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  const calculatedSelesai = calculateJamSelesai(formData.start_time, val);
                  setFormData(prev => ({
                    ...prev,
                    course_id: val,
                    end_time: calculatedSelesai
                  }));
                }}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Mata Kuliah --</option>
                {mataKuliahs.map(m => (
                  <option key={m.id} value={m.id}>{m.code} - {m.name} ({m.sks} SKS)</option>
                ))}
              </select>
              {formErrors.course_id && <p className="text-xs text-monday-red font-bold">{formErrors.course_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Tahun Akademik</label>
              <select 
                value={formData.academic_year_id || ''} 
                onChange={(e) => handleInputChange('academic_year_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih TA --</option>
                {tahunAkademiks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {formErrors.academic_year_id && <p className="text-xs text-monday-red font-bold">{formErrors.academic_year_id[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Kelas</label>
              <input 
                type="text" 
                value={formData.class_name || ''} 
                onChange={(e) => handleInputChange('class_name', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: A, B, ATAU REGULER"
              />
              {formErrors.class_name && <p className="text-xs text-monday-red font-bold">{formErrors.class_name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Hari</label>
              <select
                value={formData.day || ''}
                onChange={(e) => handleInputChange('day', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Hari --</option>
                <option value="SENIN">SENIN</option>
                <option value="SELASA">SELASA</option>
                <option value="RABU">RABU</option>
                <option value="KAMIS">KAMIS</option>
                <option value="JUMAT">JUMAT</option>
              </select>
              {formErrors.day && <p className="text-xs text-monday-red font-bold">{formErrors.day[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Jam Mulai</label>
              <input
                type="time"
                value={formData.start_time ? formData.start_time.substring(0, 5) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const calculatedSelesai = calculateJamSelesai(val, formData.course_id);
                  setFormData(prev => ({
                    ...prev,
                    start_time: val ? `${val}:00` : '',
                    end_time: calculatedSelesai
                  }));
                }}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              />
              {formErrors.start_time && <p className="text-xs text-monday-red font-bold">{formErrors.start_time[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Jam Selesai (Otomatis)</label>
              <input
                type="time"
                value={formData.end_time ? formData.end_time.substring(0, 5) : ''}
                disabled
                className="w-full px-4 py-2.5 bg-monday-background border border-monday-border rounded-xl text-sm font-semibold text-monday-gray cursor-not-allowed"
                placeholder="Akan terisi otomatis"
              />
              {formErrors.end_time && <p className="text-xs text-monday-red font-bold">{formErrors.end_time[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Ruangan</label>
              <input
                type="text"
                value={formData.room || ''}
                onChange={(e) => handleInputChange('room', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: LAB KOMPUTER 3 ATAU H.2"
              />
              {formErrors.room && <p className="text-xs text-monday-red font-bold">{formErrors.room[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Dosen Pengampu (Team Teaching)</label>
              <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto border border-monday-border rounded-xl p-3 bg-monday-background/50">
                {lecturers.map(d => {
                  const isChecked = (formData.dosen_ids || []).includes(d.id);
                  return (
                    <label key={d.id} className="flex items-center gap-2.5 text-sm font-semibold text-monday-black cursor-pointer hover:bg-monday-gray-background/20 p-1 rounded-lg transition-colors">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentIds = formData.dosen_ids || [];
                          let nextIds;
                          if (e.target.checked) {
                            nextIds = [...currentIds, d.id];
                          } else {
                            nextIds = currentIds.filter(id => id !== d.id);
                          }
                          handleInputChange('dosen_ids', nextIds);
                        }}
                        className="rounded text-monday-blue focus:ring-monday-blue border-monday-border"
                      />
                      <span>{d.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        );

      case 'dosenPengampu':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Kelas Kuliah</label>
              <input 
                type="text" 
                value={(() => {
                  const k = kelasKuliahs.find(cls => cls.id === formData.course_class_id);
                  const mk = k ? mataKuliahs.find(m => m.id === k.course_id) : null;
                  return k && mk ? `${mk.name} (Kelas ${k.class_name})` : '';
                })()} 
                disabled
                className="w-full px-4 py-2.5 bg-monday-background border border-monday-border rounded-xl text-sm font-semibold text-monday-gray cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Pilih Dosen Pengampu</label>
              <select 
                value={formData.lecturer_id || ''} 
                onChange={(e) => handleInputChange('lecturer_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
              >
                <option value="">-- Pilih Dosen --</option>
                {lecturers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} (NIDN: {d.nidn})</option>
                ))}
              </select>
              {formErrors.lecturer_id && <p className="text-xs text-monday-red font-bold">{formErrors.lecturer_id[0]}</p>}
            </div>
          </>
        );

      case 'kelasMahasiswa': {
        const isMahasiswa = (currentUser?.roles || []).some(r => r.name === 'mahasiswa');
        const myMahasiswa = isMahasiswa ? students.find(m => m.user_id === currentUser?.id) : null;

        return (
          <>
            {isMahasiswa ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Mahasiswa</label>
                <input 
                  type="text" 
                  value={myMahasiswa ? `${myMahasiswa.nim} - ${myMahasiswa.name}` : ''} 
                  disabled
                  className="w-full px-4 py-2.5 bg-monday-background border border-monday-border rounded-xl text-sm font-semibold text-monday-gray cursor-not-allowed"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Mahasiswa</label>
                <select 
                  value={formData.student_id || ''} 
                  onChange={(e) => handleInputChange('student_id', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                  disabled={modalAction === 'edit'}
                >
                  <option value="">-- Pilih Mahasiswa --</option>
                  {students.map(m => (
                    <option key={m.id} value={m.id}>{m.nim} - {m.name}</option>
                  ))}
                </select>
                {formErrors.student_id && <p className="text-xs text-monday-red font-bold">{formErrors.student_id[0]}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Kelas Kuliah</label>
              <select 
                value={formData.course_class_id || ''} 
                onChange={(e) => handleInputChange('course_class_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                disabled={modalAction === 'edit'}
              >
                <option value="">-- Pilih Kelas Kuliah --</option>
                {kelasKuliahs.map(k => {
                  const mk = mataKuliahs.find(m => m.id === k.course_id);
                  const ta = tahunAkademiks.find(t => t.id === k.academic_year_id);
                  return (
                    <option key={k.id} value={k.id}>
                      {mk ? mk.name : 'N/A'} (Kelas {k.class_name}) - {ta ? ta.name : 'N/A'}
                    </option>
                  );
                })}
              </select>
              {formErrors.course_class_id && <p className="text-xs text-monday-red font-bold">{formErrors.course_class_id[0]}</p>}
            </div>
            {modalAction === 'edit' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nilai Angka (KHS)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={formData.final_score === null || formData.final_score === undefined ? '' : formData.final_score} 
                  onChange={(e) => handleInputChange('final_score', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                  placeholder="Nilai Angka (0 - 100)"
                />
                {formErrors.final_score && <p className="text-xs text-monday-red font-bold">{formErrors.final_score[0]}</p>}
              </div>
            )}
          </>
        );
      }

      case 'users': {
        const allRoles = (() => {
          const rolesSet = new Set();
          users.forEach(u => {
            if (u.roles) u.roles.forEach(r => rolesSet.add(r.name));
          });
          return Array.from(rolesSet);
        })();

        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: Admin SUZURAN"
              />
              {formErrors.name && <p className="text-xs text-monday-red font-bold">{formErrors.name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Email</label>
              <input 
                type="email" 
                value={formData.email || ''} 
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder="Contoh: admin@kampus.ac.id"
              />
              {formErrors.email && <p className="text-xs text-monday-red font-bold">{formErrors.email[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Password {modalAction === 'edit' && '(Opsional)'}</label>
              <input 
                type="password" 
                value={formData.password || ''} 
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-monday-border rounded-xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black"
                placeholder={modalAction === 'edit' ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 8 karakter"}
              />
              {formErrors.password && <p className="text-xs text-monday-red font-bold">{formErrors.password[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-monday-gray uppercase tracking-wider block">Role / Hak Akses</label>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto border border-monday-border rounded-xl p-3 bg-monday-background/50">
                {allRoles.map(roleName => {
                  const isChecked = (formData.roles || []).includes(roleName);
                  return (
                    <label key={roleName} className="flex items-center gap-2.5 text-sm font-semibold text-monday-black cursor-pointer hover:bg-monday-gray-background/20 p-1 rounded-lg transition-colors">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentRoles = formData.roles || [];
                          let nextRoles;
                          if (e.target.checked) {
                            nextRoles = [...currentRoles, roleName];
                          } else {
                            nextRoles = currentRoles.filter(r => r !== roleName);
                          }
                          handleInputChange('roles', nextRoles);
                        }}
                        className="rounded text-monday-blue focus:ring-monday-blue border-monday-border"
                      />
                      <span className="capitalize">{roleName}</span>
                    </label>
                  );
                })}
              </div>
              {formErrors.roles && <p className="text-xs text-monday-red font-bold">{formErrors.roles[0]}</p>}
            </div>
          </>
        );
      }
 
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const act = modalAction === 'create' ? 'Tambah' : modalAction === 'edit' ? 'Ubah' : 'Atur';
    let typeName = modalType;
    if (modalType === 'tahunAkademik') typeName = 'Tahun Akademik';
    if (modalType === 'mataKuliah') typeName = 'Mata Kuliah';
    if (modalType === 'kelasKuliah') typeName = 'Kelas Kuliah';
    if (modalType === 'dosenPengampu') typeName = 'Tim Pengampu Dosen';
    if (modalType === 'kelasMahasiswa') typeName = 'Pendaftaran Kelas (KRS)';
    if (modalType === 'users') typeName = 'User';
    
    return `${act} Data ${typeName}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D32B2] backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-monday-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-monday-border">
          <h3 className="font-extrabold text-lg text-monday-black capitalize">{getModalTitle()}</h3>
          <button 
            onClick={() => setShowModal(false)}
            className="p-1 text-monday-gray hover:text-monday-black hover:bg-monday-gray-background rounded-lg transition-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {renderFormFields()}
          
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-monday-border">
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 bg-monday-background hover:bg-monday-border text-monday-black rounded-full font-bold text-sm transition-300"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-monday-blue text-white rounded-full font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-monday-blue/30 transition-all duration-300"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
