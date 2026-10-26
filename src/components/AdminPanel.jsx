import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ExperienciaList from './ExperienciaList';
import EducacionList from './EducacionList';
import ProjectList from './ProjectList';
import { useDemoGuard } from '../hooks/useDemoGuard';
import CatHeadLoader from './CatHeadLoader';
import { MysticInput, MysticButton, MysticDivider, MysticFormPanel } from './MysticUI';
import {
  createProject, updateProject, deleteProject,
  createExperience, updateExperience, deleteExperience,
  createEducation, updateEducation, deleteEducation,
  getMessages, deleteMessage
} from '../services/api';




//HUD class constants
const CX = {

  label: 'block text-[10px] font-medium tracking-[0.18em] uppercase text-indigo-200/90 mb-1.5 font-mono-hud flex items-center gap-1.5 before:content-["◊"] before:text-violet-400/70 before:text-[8px]',

  //Inputs
  input: [
    'w-full px-4 py-3',
    'bg-white/4 backdrop-blur-sm',
    'border border-white/8',
    'rounded-xl',
    'text-sm text-mystic-star font-sans-body',
    'placeholder:text-indigo-300/65 placeholder:font-light',
    'outline-none',
    'focus:ring-2 focus:ring-indigo-400/70 focus:border-indigo-300/80 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    'transition-all duration-400 ease-out',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  //Select
  select: [
    'w-full px-4 py-3',
    'bg-white/4 backdrop-blur-sm',
    'border border-white/8',
    'rounded-xl',
    'text-sm text-mystic-star font-sans-body',
    'outline-none cursor-pointer',
    'focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-300/70 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(99,102,241,0.20)]',
    'transition-all duration-300 ease-out',
  ].join(' '),

  //Heading de sección
  sectionHead: [
    'font-serif-display text-base font-semibold tracking-widest text-mystic-star',
    'border-b border-white/6 pb-2 mb-6',
    'flex items-center gap-2',
  ].join(' '),

  //Panel de formulario
  formPanel: [
    'relative overflow-hidden rounded-xl',
    'bg-white/3 backdrop-blur-md',
    'border border-white/6',
    'p-5 mb-6 space-y-4',
    'shadow-[0_8px_32px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(196,181,253,0.06)]',
  ].join(' '),

  //Botón principal
  btnSave: [
    'font-sans-body font-medium text-[10px] tracking-[0.20em] uppercase',
    'px-6 py-2.5 rounded-none',
    'border border-violet-400/30',
    'text-violet-100',
    'bg-gradient-to-br from-violet-900/50 to-indigo-900/40',
    'hover:from-violet-800/60 hover:to-indigo-800/50',
    'hover:border-violet-300/50',
    'hover:shadow-[0_0_24px_rgba(139,92,246,0.22),0_0_50px_rgba(139,92,246,0.08)]',
    'active:scale-[0.97] cursor-pointer',
    'transition-all duration-200 ease-out',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'inline-flex items-center justify-center gap-2',
  ].join(' '),

  //Botón guardado
  btnSaveGreen: [
    'font-sans-body font-medium text-[10px] tracking-[0.20em] uppercase',
    'px-6 py-2.5 rounded-none',
    'border border-emerald-500/28',
    'text-emerald-200/90',
    'bg-emerald-900/30',
    'hover:bg-emerald-800/40 hover:border-emerald-400/45',
    'hover:shadow-[0_0_20px_rgba(52,211,153,0.18)]',
    'active:scale-[0.97] cursor-pointer',
    'transition-all duration-200 ease-out',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'inline-flex items-center justify-center gap-2',
  ].join(' '),

  //Botón cancelar
  btnCancel: 'px-3 py-1.5 text-[10px] font-sans-body tracking-[0.15em] uppercase text-indigo-200/75 hover:text-indigo-100 active:scale-[0.96] cursor-pointer transition-all duration-150',

  //Botón agregar
  btnAdd: [
    'font-sans-body text-[10px] font-medium tracking-[0.20em] uppercase',
    'px-5 py-2 rounded-lg',
    'border border-indigo-400/30',
    'text-indigo-200',
    'bg-indigo-950/40 backdrop-blur-sm cursor-pointer',
    'hover:bg-indigo-900/40 hover:border-indigo-300/60 hover:text-white',
    'hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:scale-[1.02]',
    'active:scale-[0.97]',
    'transition-all duration-150 ease-out',
    'inline-flex items-center gap-1.5',
  ].join(' '),

  //Input de archivo
  fileInput: [
    'flex-1 text-xs font-mono-hud text-indigo-300/55',
    'file:mr-4 file:py-1.5 file:px-3',
    'file:border file:border-indigo-400/25 file:rounded-none',
    'file:bg-indigo-900/20 file:text-indigo-300/75 file:text-[10px] file:font-sans-body file:tracking-wider',
    'hover:file:bg-indigo-900/35 hover:file:text-indigo-200',
    'file:transition-all file:duration-400 file:cursor-pointer',
    'cursor-pointer',
  ].join(' '),

  //Nav activa
  navActive: [
    'flex items-center justify-center md:justify-start gap-2.5',
    'px-4 py-2.5 text-[10px] font-sans-body font-medium tracking-[0.18em] uppercase',
    'rounded-xl border border-violet-400/40 bg-gradient-to-r from-violet-900/40 to-indigo-900/30 backdrop-blur-md',
    'text-violet-100 shadow-[0_0_16px_rgba(139,92,246,0.25)]',
    'whitespace-nowrap cursor-pointer transition-all duration-200',
  ].join(' '),

  //Nav inactiva
  navInactive: [
    'flex items-center justify-center md:justify-start gap-2.5',
    'px-4 py-2.5 text-[10px] font-sans-body font-medium tracking-[0.18em] uppercase',
    'rounded-xl border border-transparent',
    'text-indigo-300/60 hover:text-indigo-100 hover:bg-white/5 hover:border-indigo-400/20',
    'whitespace-nowrap cursor-pointer active:scale-[0.98] transition-all duration-150',
  ].join(' '),
};

function PanelCorners() {
  return (
    <>
      <span className="tech-corner tl" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path d="M1 10 L1 1 L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </span>
      <span className="tech-corner tr" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path d="M8 1 L17 1 L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </span>
      <span className="tech-corner bl" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path d="M1 8 L1 17 L10 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </span>
      <span className="tech-corner br" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path d="M8 17 L17 17 L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </span>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className={CX.label}>{label}</label>
      {children}
    </div>
  );
}
// Selector de Mes / Año y Checkbox de Actualidad
function DatePickerFields({ fechaInicio, onChangeInicio, fechaFin, onChangeFin, checkboxLabel = 'Puesto actual (Actualidad)' }) {
  const parseParts = (str) => {
    if (!str) return { mes: '', anio: '' };
    const s = String(str).trim();
    const match = s.match(/([a-zA-Z]{3})[\s\/\-]+(\d{4})/);
    if (match) {
      const mesCap = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      return { mes: mesCap, anio: match[2] };
    }
    const matchYear = s.match(/(\d{4})/);
    if (matchYear) return { mes: '', anio: matchYear[1] };
    return { mes: '', anio: '' };
  };
  const inicioParts = parseParts(fechaInicio);
  const finParts = parseParts(fechaFin);
  const esActual = !fechaFin || String(fechaFin).toLowerCase().includes('actual');
  const handleInicioChange = (nuevoMes, nuevoAnio) => {
    if (!nuevoAnio) { onChangeInicio(''); return; }
    onChangeInicio(nuevoMes ? `${nuevoMes} ${nuevoAnio}` : `${nuevoAnio}`);
  };
  const handleFinChange = (nuevoMes, nuevoAnio) => {
    if (!nuevoAnio) { onChangeFin(''); return; }
    onChangeFin(nuevoMes ? `${nuevoMes} ${nuevoAnio}` : `${nuevoAnio}`);
  };
  const handleToggleActual = (checked) => {
    if (checked) {
      onChangeFin('Actualidad');
    } else {
      onChangeFin(new Date().getFullYear().toString());
    }
  };
  const currentYear = new Date().getFullYear();
  const anios = Array.from({ length: 16 }, (_, i) => currentYear + 1 - i);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fecha Inicio */}
      <Field label="FECHA DE INICIO">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={inicioParts.mes}
            onChange={(e) => handleInicioChange(e.target.value, inicioParts.anio || currentYear)}
            className={CX.select}
          >
            <option value="" className="bg-[#131127] text-white">Mes (opcional)</option>
            {meses.map(m => (
              <option key={m} value={m} className="bg-[#131127] text-white">{m}</option>
            ))}
          </select>
          <select
            value={inicioParts.anio}
            onChange={(e) => handleInicioChange(inicioParts.mes, e.target.value)}
            className={CX.select}
            required
          >
            <option value="" className="bg-[#131127] text-white">Año</option>
            {anios.map(y => (
              <option key={y} value={y} className="bg-[#131127] text-white">{y}</option>
            ))}
          </select>
        </div>
      </Field>
      {/* Fecha Fin */}
      <Field label="FECHA DE FIN">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={finParts.mes}
              onChange={(e) => handleFinChange(e.target.value, finParts.anio || currentYear)}
              disabled={esActual}
              className={`${CX.select} ${esActual ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value="" className="bg-[#131127] text-white">Mes (opcional)</option>
              {meses.map(m => (
                <option key={m} value={m} className="bg-[#131127] text-white">{m}</option>
              ))}
            </select>
            <select
              value={finParts.anio}
              onChange={(e) => handleFinChange(finParts.mes, e.target.value)}
              disabled={esActual}
              className={`${CX.select} ${esActual ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value="" className="bg-[#131127] text-white">Año</option>
              {anios.map(y => (
                <option key={y} value={y} className="bg-[#131127] text-white">{y}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-200/80 select-none pt-1">
            <input
              type="checkbox"
              checked={esActual}
              onChange={(e) => handleToggleActual(e.target.checked)}
              className="w-4 h-4 rounded bg-white/5 border border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
            />
            <span>{checkboxLabel}</span>
          </label>
        </div>
      </Field>
    </div>
  );
}


function CatSaveButton({ isLoading, label, variant = 'violet', className = '' }) {
  if (variant === 'mystic') {
    return (
      <button
        type="submit"
        disabled={isLoading}
        className={[
          'bg-gradient-to-br from-indigo-900/60 to-violet-900/60 backdrop-blur-md border border-indigo-400/40',
          'font-serif text-xs uppercase tracking-[0.2em] text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
          'rounded-xl px-7 py-2.5 w-auto md:w-fit cursor-pointer',
          'transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]',
          'hover:bg-gradient-to-br hover:from-indigo-800/70 hover:to-violet-800/70 hover:border-amber-300/60 hover:text-amber-100 hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-indigo-400/40 disabled:hover:shadow-none disabled:hover:text-indigo-100',
          'flex items-center justify-center gap-2',
          className
        ].join(' ')}
      >
        {isLoading ? (
          <>
            <span className="font-sans-body text-xs font-medium tracking-wider">Guardando...</span>
            <svg className="animate-spin w-4 h-4 text-amber-200 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </>
        ) : (
          <>
            <span>{label}</span>
            <span className="text-amber-200/90 text-[10px] drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">◊</span>
          </>
        )}
      </button>
    );
  }

  const base = [
    'font-mono font-bold text-xs tracking-widest',
    'px-5 py-2 rounded-none',
    'border transition-[color,border-color,background-color,box-shadow,transform] duration-200',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'flex items-center justify-center gap-2',
  ].join(' ');

  const variants = {
    violet: 'bg-violet-600/80 hover:bg-violet-500 text-white border-violet-500/50 hover:shadow-[0_0_16px_rgba(139,92,246,0.5)] hover:scale-[1.02]',
  };

  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <CatHeadLoader size="sm" />
          <span className="cat-btn-text">PROCESANDO</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}

export default function AdminPanel({ session, addToast, onGuestLogin, onDemoLogout }) {
  const token = session?.access_token;
  const [activeSubTab, setActiveSubTab] = useState('profile');

  //Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  //Profile 
  const [profileId, setProfileId] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [profileCvUrl, setProfileCvUrl] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  //Experiencia 
  const [isExpFormOpen, setIsExpFormOpen] = useState(false);
  const [expId, setExpId] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expDate, setExpDate] = useState('');
  const [expFechaFin, setExpFechaFin] = useState('');
  const [expTech, setExpTech] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expSaving, setExpSaving] = useState(false);

  //Educacion 
  const [isEduFormOpen, setIsEduFormOpen] = useState(false);
  const [eduId, setEduId] = useState('');
  const [eduInst, setEduInst] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduSiglas, setEduSiglas] = useState('');
  const [eduTipo, setEduTipo] = useState('Curso');
  const [eduFechaInicio, setEduFechaInicio] = useState('');
  const [eduFechaFin, setEduFechaFin] = useState('');
  const [eduDesc, setEduDesc] = useState('');
  const [eduSaving, setEduSaving] = useState(false);

  //Proyectos
  const [isProjFormOpen, setIsProjFormOpen] = useState(false);
  const [projId, setProjId] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Aplicaciones Web');
  const [projDesc, setProjDesc] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projImageUrl, setProjImageUrl] = useState('');
  const [projFile, setProjFile] = useState(null);
  const [projPreview, setProjPreview] = useState('');
  const [projSaving, setProjSaving] = useState(false);

  // Mensajes de contacto
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Claves de refresco dinámico para listas
  const [expRefreshKey, setExpRefreshKey] = useState(0);
  const [eduRefreshKey, setEduRefreshKey] = useState(0);
  const [projRefreshKey, setProjRefreshKey] = useState(0);

  useEffect(() => {
    if (session) fetchProfile();
  }, [session]);

  //Demo
  const { isDemoUser, demoIntercept } = useDemoGuard(session, addToast);

  //Auth 
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword.trim()
      });
      if (error) throw error;
      addToast('Sesión iniciada con éxito', 'success');
    } catch (err) {
      addToast(err.message || 'Credenciales incorrectas.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  //Logout
  const handleLogout = async () => {
    if (isDemoUser) {
      onDemoLogout?.();
    } else {
      await supabase.auth.signOut();
      addToast('Sesión cerrada correctamente', 'success');
    }
  };

  //Imagen upload
  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('imagenes-portfolio')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('imagenes-portfolio').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      addToast('No se pudo subir la imagen', 'error');
      throw err;
    }
  };

  //CRUD Perfil
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfileId(data.id);
        setProfileName(data.nombre || '');
        setProfileTitle(data.titulo || '');
        setProfileDesc(data.descripcion || '');
        setProfileImageUrl(data.avatar_url || '');
        setProfilePreview(data.avatar_url || '');
        setProfileCvUrl(data.cv_url || '');
      }
    } catch (err) {
      console.error('Error al cargar perfil en Admin:', err);
    }
  };

  const fetchMessages = async () => {
    if (!token) return;
    setMessagesLoading(true);
    try {
      const data = await getMessages(token);
      setMessages(data || []);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'messages' && session) {
      fetchMessages();
    }
  }, [activeSubTab, session]);

  const handleDeleteMsg = async (id) => {
    if (window.confirm('¿Eliminar este mensaje?')) {
      if (demoIntercept()) return;
      try {
        await deleteMessage(id, token);
        setMessages(prev => prev.filter(m => m.id !== id));
        addToast('Mensaje eliminado', 'success');
      } catch {
        addToast('Error al eliminar mensaje', 'error');
      }
    }
  };


  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (demoIntercept()) return;

    setProfileSaving(true);
    try {
      let finalImgUrl = profileImageUrl;
      if (profileFile) {
        finalImgUrl = await uploadImage(profileFile);
        setProfileImageUrl(finalImgUrl);
        setProfileFile(null);
      }

      const payload = {
        nombre: profileName.trim(),
        titulo: profileTitle.trim(),
        descripcion: profileDesc.trim(),
        avatar_url: finalImgUrl,
        cv_url: profileCvUrl.trim(),
        updated_at: new Date().toISOString()
      };

      let error;
      if (profileId) {
        const res = await supabase.from('perfil').update(payload).eq('id', profileId);
        error = res.error;
      } else {
        const res = await supabase.from('perfil').insert([payload]).select().single();
        if (res.data) setProfileId(res.data.id);
        error = res.error;
      }

      if (error) throw error;
      addToast('Perfil guardado exitosamente.', 'success');
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      addToast('Error al guardar el perfil.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };


  //CRUD Experiencias 
  const handleEditExperience = (exp) => {
    setExpId(exp.id);
    setExpCompany(exp.empresa);
    setExpRole(exp.cargo);
    setExpDate(exp.fecha_inicio);
    setExpFechaFin(exp.fecha_fin || '');
    setExpTech(exp.tecnologias || '');
    setExpDesc(exp.descripcion || '');
    setIsExpFormOpen(true);
  };
  const handleDeleteExperience = async (id) => {
    if (window.confirm('¿Eliminar esta experiencia?')) {
      //Demo 
      if (demoIntercept()) return;

      try {
        await deleteExperience(id, token);
        setExpRefreshKey(k => k + 1);
        addToast('Experiencia eliminada', 'success');
      } catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
    }
  };
  const handleExpSubmit = async (e) => {
    e.preventDefault(); setExpSaving(true);
    //Demo intercept 
    if (demoIntercept(() => { setIsExpFormOpen(false); resetExpForm(); })) {
      setExpSaving(false); return;
    }

    try {
      const data = {
        empresa: expCompany,
        cargo: expRole,
        fecha_inicio: expDate,
        fecha_fin: expFechaFin.trim() || null,
        tecnologias: expTech,
        descripcion: expDesc,
      };
      if (expId) {
        await updateExperience(expId, data, token);
        addToast('Experiencia actualizada correctamente', 'success');
      } else {
        await createExperience(data, token);
        addToast('Experiencia guardada exitosamente', 'success');
      }
      setExpRefreshKey(k => k + 1);
      setIsExpFormOpen(false); resetExpForm();
    } catch (err) { addToast(err.message || 'Error al guardar experiencia.', 'error'); }
    finally { setExpSaving(false); }
  };
  const resetExpForm = () => {
    setExpId(''); setExpCompany(''); setExpRole('');
    setExpDate(''); setExpFechaFin('');
    setExpTech(''); setExpDesc('');
  };

  //CRUD Educación 
  const handleEditEducation = (edu) => {
    setEduId(edu.id); setEduInst(edu.institucion); setEduDegree(edu.titulo);
    setEduSiglas(edu.siglas);
    setEduTipo(['Carrera', 'Formación Prof.', 'Curso'].includes(edu.color_badge) ? edu.color_badge : 'Curso');
    setEduFechaInicio(edu.fecha_inicio || ''); setEduFechaFin(edu.fecha_fin || '');
    setEduDesc(edu.descripcion || '');
    setIsEduFormOpen(true);
  };
  const handleDeleteEducation = async (id) => {
    if (window.confirm('¿Eliminar este título?')) {
      //Demo intercept 
      if (demoIntercept()) return;

      try {
        await deleteEducation(id, token);
        setEduRefreshKey(k => k + 1);
        addToast('Título eliminado', 'success');
      } catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
    }
  };
  const handleEduSubmit = async (e) => {
    e.preventDefault(); setEduSaving(true);
    //Demo intercept 
    if (demoIntercept(() => { setIsEduFormOpen(false); resetEduForm(); })) {
      setEduSaving(false); return;
    }

    try {
      const data = {
        institucion: eduInst,
        titulo: eduDegree,
        siglas: eduSiglas || eduDegree.substring(0, 2).toUpperCase(),
        color_badge: eduTipo,
        fecha_inicio: eduFechaInicio.trim() || null,
        fecha_fin: eduFechaFin.trim() || null,
        descripcion: eduDesc.trim() || null,
      };
      if (eduId) {
        await updateEducation(eduId, data, token);
        addToast('Educación actualizada correctamente', 'success');
      } else {
        await createEducation(data, token);
        addToast('Educación guardada exitosamente', 'success');
      }
      setEduRefreshKey(k => k + 1);
      setIsEduFormOpen(false); resetEduForm();
    } catch (err) { addToast(err.message || 'Error al guardar educación.', 'error'); }
    finally { setEduSaving(false); }
  };
  const resetEduForm = () => { setEduId(''); setEduInst(''); setEduDegree(''); setEduSiglas(''); setEduTipo('Curso'); setEduFechaInicio(''); setEduFechaFin(''); setEduDesc(''); };

  //CRUD Proyectos 
  const handleEditProject = (proj) => {
    setProjId(proj.id); setProjTitle(proj.title); setProjCategory(proj.category);
    setProjDesc(proj.description); setProjGithub(proj.github_url); setProjDemo(proj.demo_url);
    setProjTech(proj.raw_tech); setProjImageUrl(proj.image_url); setProjPreview(proj.image_url);
    setIsProjFormOpen(true);
  };
  const handleDeleteProject = async (id) => {
    if (window.confirm('¿Eliminar este proyecto?')) {
      //Demo intercept 
      if (demoIntercept()) return;

      try {
        await deleteProject(id, token);
        setProjRefreshKey(k => k + 1);
        addToast('Proyecto eliminado', 'success');
      } catch (err) { addToast(err.message || 'Error al eliminar proyecto', 'error'); }
    }
  };
  const handleProjFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProjPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleProjSubmit = async (e) => {
    e.preventDefault(); setProjSaving(true);
    //Demo intercept 
    if (demoIntercept(() => { setIsProjFormOpen(false); resetProjForm(); })) {
      setProjSaving(false); return;
    }

    try {
      let finalImgUrl = projImageUrl;
      if (projFile) {
        finalImgUrl = await uploadImage(projFile);
        setProjImageUrl(finalImgUrl); setProjFile(null);
      }
      const data = {
        title: projTitle?.trim() || 'Proyecto Sin Nombre',
        category: projCategory || 'Aplicaciones Web',
        description: projDesc?.trim() || 'Sin descripción',
        github_url: projGithub?.trim() || '',
        demo_url: projDemo?.trim() || '',
        tech_stack: projTech?.trim() || 'JS',
        image_url: finalImgUrl || ''
      };
      if (projId) {
        await updateProject(projId, data, token);
        addToast('Proyecto actualizado', 'success');
      } else {
        await createProject(data, token);
        addToast('Proyecto creado con éxito', 'success');
      }
      setProjRefreshKey(k => k + 1);
      setIsProjFormOpen(false); resetProjForm();
    } catch (err) { addToast(err.message || 'Error al guardar el proyecto.', 'error'); }
    finally { setProjSaving(false); }
  };
  const resetProjForm = () => {
    setProjId(''); setProjTitle(''); setProjCategory('Aplicaciones Web');
    setProjDesc(''); setProjGithub(''); setProjDemo('');
    setProjTech(''); setProjImageUrl(''); setProjPreview(''); setProjFile(null);
  };

  //LOGIN VIEW
  if (!session) {
    return (
      <div className="w-full flex items-center justify-center p-4 relative min-h-[50vh] animate-[fadeInTab_0.4s_ease-out_forwards]">
        <div className="w-full max-w-sm">

          {/* Título */}
          <div className="mb-8 text-center space-y-2">
            <div className="flex justify-center mb-4">
              <CatHeadLoader size="md" />
            </div>
            <h1 className="font-serif-display text-xl font-semibold tracking-[0.12em] text-mystic-star">
              Acceso Restringido
            </h1>
            <p className="text-[10px] font-mono-hud tracking-[0.25em] uppercase text-indigo-300/40">
              Panel de Administración
            </p>
          </div>

          {/* Panel */}
          <MysticFormPanel>
            <form onSubmit={handleLogin} className="space-y-4 relative z-10">

              <MysticInput
                label="Correo Electrónico"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@dominio.com"
                required
              />

              <MysticInput
                label="Contraseña"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="pt-1">
                <MysticButton
                  variant="solid"
                  type="submit"
                  fullWidth
                  disabled={loginLoading}
                  isLoading={loginLoading}
                  loadingText="Verificando"
                >
                  Iniciar Sesión
                </MysticButton>
              </div>
            </form>

            <MysticDivider label="◊" />

            {/* Modo invitado */}
            <div className="space-y-2">
              <MysticButton
                variant="ghost"
                fullWidth
                onClick={onGuestLogin}
                disabled={loginLoading}
              >
                Modo Invitado
              </MysticButton>
              <p className="text-center text-[9px] font-mono-hud tracking-widest text-indigo-300/30 uppercase">
                Solo lectura
              </p>
            </div>

            {/* Footer del panel */}
            <p className="text-center text-[9px] font-mono-hud text-violet-400/20 tracking-[0.2em] pt-2 border-t border-white/5">
              Sistema protegido
            </p>
          </MysticFormPanel>

        </div>
      </div>
    );
  }


  //Sidebar nav items
  const navItems = [
    { id: 'profile', label: 'Perfil', icon: '◊' },
    { id: 'messages', label: 'Mensajes', icon: '✉' },
    { id: 'experience', label: 'Experiencia', icon: '◊' },
    { id: 'education', label: 'Educación', icon: '◊' },
    { id: 'projects', label: 'Proyectos', icon: '◊' },
  ];


  const validTabs = ['profile', 'messages', 'experience', 'education', 'projects'];
  const currentTab = (isDemoUser && activeSubTab === 'overview') || !validTabs.includes(activeSubTab)
    ? 'profile'
    : activeSubTab;

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[60vh] gap-6 animate-[fadeInTab_0.4s_ease-out_forwards]">

      {/* Sidebar */}
      <aside className="w-full md:w-56 shrink-0 flex flex-col gap-1 bg-[#0B0914]/60 md:bg-transparent backdrop-blur-md p-3 md:p-0 rounded-xl border border-indigo-400/10 md:border-none">

        {/* Título desktop */}
        <div className="pb-3 border-b border-indigo-400/8 hidden md:block mb-3">
          <p className="text-[10px] text-indigo-300/40 truncate mt-1 tracking-wider" title={session.user.email}>
            {session.user.email}
          </p>
          {/* DEMO badge */}
          {isDemoUser && (
            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-none border border-indigo-500/25 bg-indigo-900/20">
              <span className="inline-block w-1.5 h-1.5 rounded-none bg-indigo-400 animate-pulse" />
              <span className="text-[9px] text-indigo-300/70 tracking-widest uppercase">Demo</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={currentTab === item.id ? CX.navActive : CX.navInactive}
            >
              <span className="text-indigo-400/60 text-[10px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-auto hidden md:flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest text-rose-400/80 hover:text-rose-300 rounded-xl border border-transparent hover:border-rose-500/20 hover:bg-rose-900/15 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all duration-300"
        >
          <span className="text-xs">◊</span> Cerrar sesión
        </button>
      </aside>

      {/* Content area */}
      <div className="flex-1 min-h-[50vh] overflow-y-auto custom-scrollbar px-1">


        {/* SUB-TAB: PERFIL */}
        {currentTab === 'profile' && (
          <div>
            <h2 className={CX.sectionHead}>
              <span className="text-indigo-400/60">◊</span> Perfil General
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Field label="NOMBRE MOSTRADO">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className={CX.input}
                  required
                />
              </Field>

              <Field label="TÍTULO PRINCIPAL">
                <input
                  type="text"
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  className={CX.input}
                  required
                />
              </Field>

              <Field label="DESCRIPCIÓN / BIO">
                <textarea
                  value={profileDesc}
                  onChange={(e) => setProfileDesc(e.target.value)}
                  className={`${CX.input} resize-none`}
                  rows={3}
                  placeholder="Breve reseña sobre vos..."
                />
              </Field>

              <Field label="ENLACE DE CV (OPCIONAL)">
                <input
                  type="url"
                  value={profileCvUrl}
                  onChange={(e) => setProfileCvUrl(e.target.value)}
                  className={CX.input}
                  placeholder="https://..."
                />
              </Field>

              <Field label="IMAGEN DE PERFIL">
                <div className="flex items-center gap-4 mt-1">
                  {profilePreview && (
                    <img
                      src={profilePreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-indigo-400/20 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                    />
                  )}
                  <label className="cursor-pointer px-4 py-2 text-[10px] font-sans-body tracking-[0.18em] uppercase rounded-none border border-indigo-400/25 text-indigo-200/80 bg-indigo-900/20 hover:bg-indigo-900/40 hover:border-indigo-300/40 hover:text-indigo-100 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                    Cambiar Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </Field>

              <CatSaveButton isLoading={profileSaving} label="Guardar Perfil" variant="mystic" className="mt-4" />
            </form>
          </div>
        )}

        {/* SUB-TAB: MENSAJES DE CONTACTO */}
        {currentTab === 'messages' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-indigo-400/8 pb-3">
              <h2 className={CX.sectionHead}>
                <span className="text-indigo-400/60">✉</span> Bandeja de Mensajes ({messages.length})
              </h2>
              <button
                onClick={fetchMessages}
                className="text-[10px] uppercase tracking-widest text-indigo-300/60 hover:text-indigo-100 flex items-center gap-1.5 cursor-pointer"
              >
                Actualizar ◊
              </button>
            </div>

            {messagesLoading ? (
              <div className="py-12 flex justify-center">
                <CatHeadLoader size="md" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-xs font-mono-hud text-indigo-300/40 tracking-widest">
                ◊ No hay mensajes recibidos aún ◊
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className="bg-white/4 border border-white/8 rounded-xl p-5 hover:border-violet-400/25 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-mystic-star text-sm">{msg.nombre}</h3>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-xs text-indigo-300/70 hover:text-amber-200 transition-colors"
                        >
                          {msg.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono-hud text-indigo-300/40">
                          {new Date(msg.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        <button
                          onClick={() => handleDeleteMsg(msg.id)}
                          className="text-rose-400/60 hover:text-rose-300 text-xs px-2 py-1 rounded transition-colors"
                          title="Eliminar mensaje"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-indigo-100/90 leading-relaxed font-sans-body whitespace-pre-line bg-black/20 p-3 rounded-lg border border-white/5">
                      {msg.mensaje}
                    </p>

                    <div className="mt-3 flex justify-end">
                      <a
                        href={`mailto:${msg.email}?subject=Respuesta a tu mensaje en mi Portfolio`}
                        className="text-[10px] uppercase tracking-widest font-mono-hud text-violet-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        Responder por mail →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* SUB-TAB: EXPERIENCIAS */}
        {currentTab === 'experience' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-indigo-400/8 pb-3">
              <h2 className={CX.sectionHead}>
                <span className="text-indigo-400/60">◊</span> Experiencia Laboral
              </h2>
              {!isExpFormOpen && (
                <button onClick={() => { resetExpForm(); setIsExpFormOpen(true); }} className={CX.btnAdd}>
                  + Añadir
                </button>
              )}
            </div>

            {isExpFormOpen && (
              <div className={CX.formPanel}>
                <h3 className="text-xs font-serif text-indigo-300/70 tracking-widest mb-3">
                  {expId ? 'Editar registro' : 'Nuevo registro'}
                </h3>
                <form onSubmit={handleExpSubmit} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="EMPRESA">
                      <input type="text" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} className={CX.input} required />
                    </Field>
                    <Field label="CARGO">
                      <input type="text" value={expRole} onChange={(e) => setExpRole(e.target.value)} className={CX.input} required />
                    </Field>
                  </div>
                  <DatePickerFields
                    fechaInicio={expDate}
                    onChangeInicio={setExpDate}
                    fechaFin={expFechaFin}
                    onChangeFin={setExpFechaFin}
                    checkboxLabel="Puesto actual (Actualidad)"
                  />
                  <Field label="DESCRIPCIÓN">
                    <textarea value={expDesc} onChange={(e) => setExpDesc(e.target.value)} rows="3" className={CX.input} />
                  </Field>
                  <Field label="TECNOLOGÍAS (separadas por comas)">
                    <input type="text" value={expTech} onChange={(e) => setExpTech(e.target.value)} placeholder="React, Supabase, Tailwind" className={CX.input} required />
                  </Field>

                  <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                    <button type="button" onClick={() => { setIsExpFormOpen(false); resetExpForm(); }} className={CX.btnCancel}>Cancelar</button>
                    <CatSaveButton isLoading={expSaving} label="Guardar" variant="mystic" />
                  </div>
                </form>
              </div>
            )}

            <ExperienciaList key={expRefreshKey} isAdmin={true} onEdit={handleEditExperience} onDelete={handleDeleteExperience} />
          </div>
        )}

        {/* SUB-TAB: EDUCACIÓN */}
        {currentTab === 'education' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-indigo-400/8 pb-3">
              <h2 className={CX.sectionHead}>
                <span className="text-indigo-400/60">◊</span> Educación
              </h2>
              {!isEduFormOpen && (
                <button onClick={() => { resetEduForm(); setIsEduFormOpen(true); }} className={CX.btnAdd}>
                  + Añadir
                </button>
              )}
            </div>

            {isEduFormOpen && (
              <div className={CX.formPanel}>
                <h3 className="text-xs font-serif text-indigo-300/70 tracking-widest mb-3">
                  {eduId ? 'Editar registro' : 'Nuevo registro'}
                </h3>
                <form onSubmit={handleEduSubmit} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="INSTITUCIÓN">
                      <input type="text" value={eduInst} onChange={(e) => setEduInst(e.target.value)} className={CX.input} required />
                    </Field>
                    <Field label="TÍTULO">
                      <input type="text" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} className={CX.input} required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="SIGLAS">
                      <input type="text" value={eduSiglas} onChange={(e) => setEduSiglas(e.target.value)} placeholder="Ej: UP, UTN" className={CX.input} />
                    </Field>
                    <Field label="TIPO DE FORMACIÓN">
                      <select value={eduTipo} onChange={(e) => setEduTipo(e.target.value)} className={CX.select} required>
                        <option value="Carrera">Carrera</option>
                        <option value="Formación Prof.">Formación Profesional</option>
                        <option value="Curso">Curso</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DatePickerFields
                      fechaInicio={eduFechaInicio}
                      onChangeInicio={setEduFechaInicio}
                      fechaFin={eduFechaFin}
                      onChangeFin={setEduFechaFin}
                      checkboxLabel="En curso (Actualidad)"
                    />

                  </div>
                  <Field label="DESCRIPCIÓN (Opcional)">
                    <textarea value={eduDesc} onChange={(e) => setEduDesc(e.target.value)} rows="3" className={CX.input} placeholder="Descripción de los estudios..." />
                  </Field>
                  <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                    <button type="button" onClick={() => { setIsEduFormOpen(false); resetEduForm(); }} className={CX.btnCancel}>Cancelar</button>
                    <CatSaveButton isLoading={eduSaving} label="Guardar" variant="mystic" />
                  </div>
                </form>
              </div>
            )}

            <EducacionList key={eduRefreshKey} isAdmin={true} onEdit={handleEditEducation} onDelete={handleDeleteEducation} />
          </div>
        )}

        {/* PROYECTOS */}
        {currentTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-indigo-400/8 pb-3">
              <h2 className={CX.sectionHead}>
                <span className="text-indigo-400/60">◊</span> Proyectos
              </h2>
              {!isProjFormOpen && (
                <button onClick={() => { resetProjForm(); setIsProjFormOpen(true); }} className={CX.btnAdd}>
                  + Añadir
                </button>
              )}
            </div>

            {isProjFormOpen && (
              <div className={CX.formPanel}>
                <h3 className="text-xs font-serif text-indigo-300/70 tracking-widest mb-3">
                  {projId ? 'Editar proyecto' : 'Nuevo proyecto'}
                </h3>
                <form onSubmit={handleProjSubmit} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="TÍTULO">
                      <input type="text" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} className={CX.input} required />
                    </Field>
                    <Field label="CATEGORÍA">
                      <select value={projCategory} onChange={(e) => setProjCategory(e.target.value)} className={CX.select} required>
                        <option value="Minijuegos">Minijuegos</option>
                        <option value="Android">Android</option>
                        <option value="Aplicaciones Web">Aplicaciones Web</option>
                        <option value="Aplicaciones de Escritorio">Aplicaciones de Escritorio</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="DESCRIPCIÓN">
                    <textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} rows="3" className={CX.input} required />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="ENLACE GITHUB">
                      <input type="url" value={projGithub} onChange={(e) => setProjGithub(e.target.value)} placeholder="https://github.com/..." className={CX.input} required />
                    </Field>
                    <Field label="ENLACE DEMO (OPCIONAL)">
                      <input type="url" value={projDemo} onChange={(e) => setProjDemo(e.target.value)} placeholder="https://..." className={CX.input} />
                    </Field>
                  </div>

                  <Field label="TECNOLOGÍAS (separadas por comas)">
                    <input type="text" value={projTech} onChange={(e) => setProjTech(e.target.value)} placeholder="HTML, CSS, JS" className={CX.input} required />
                  </Field>

                  <Field label="IMAGEN DE PORTADA">
                    <div className="flex items-center gap-4 mt-1">
                      {projPreview && (
                        <img
                          src={projPreview}
                          alt="Preview"
                          className="w-20 h-14 object-cover rounded-lg border border-indigo-400/20 shadow-[0_0_10px_rgba(99,102,241,0.12)]"
                        />
                      )}
                      <label className="cursor-pointer px-4 py-2 text-[10px] font-sans-body tracking-[0.18em] uppercase rounded-none border border-indigo-400/25 text-indigo-200/80 bg-indigo-900/20 hover:bg-indigo-900/40 hover:border-indigo-300/40 hover:text-indigo-100 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                        Cambiar Imagen
                        <input type="file" accept="image/*" onChange={handleProjFileChange} className="hidden" />
                      </label>
                    </div>
                  </Field>

                  <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                    <button type="button" onClick={() => { setIsProjFormOpen(false); resetProjForm(); }} className={CX.btnCancel}>Cancelar</button>
                    <CatSaveButton isLoading={projSaving} label="Guardar Proyecto" variant="mystic" />
                  </div>
                </form>
              </div>
            )}

            <ProjectList key={projRefreshKey} isAdmin={true} onEdit={handleEditProject} onDelete={handleDeleteProject} />
          </div>
        )}

      </div>
    </div>
  );
}

