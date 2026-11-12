import React, { useMemo, useState } from "react";
import { Activity, Users, CalendarDays, Search, Plus, Pencil, Trash2, X, HeartPulse, LayoutDashboard, ClipboardList, Menu } from "lucide-react";

const initialPatients = [
  { id: "PT-1001", name: "Aarav Sharma", age: 34, gender: "Male", phone: "+91 98765 43210", email: "aarav@example.com", diagnosis: "Seasonal allergy", doctor: "Dr. Meera Rao", date: "2026-11-10", status: "Active", blood: "O+" },
  { id: "PT-1002", name: "Diya Reddy", age: 27, gender: "Female", phone: "+91 98765 12340", email: "diya@example.com", diagnosis: "Migraine", doctor: "Dr. Kiran Das", date: "2026-11-09", status: "Follow-up", blood: "B+" },
  { id: "PT-1003", name: "Kabir Patel", age: 52, gender: "Male", phone: "+91 91234 56780", email: "kabir@example.com", diagnosis: "Hypertension", doctor: "Dr. Meera Rao", date: "2026-11-08", status: "Active", blood: "A+" },
  { id: "PT-1004", name: "Ananya Iyer", age: 41, gender: "Female", phone: "+91 99887 66554", email: "ananya@example.com", diagnosis: "Annual check-up", doctor: "Dr. Nisha Paul", date: "2026-11-07", status: "Discharged", blood: "AB+" }
];

const blank = { name: "", age: "", gender: "Female", phone: "", email: "", diagnosis: "", doctor: "", date: new Date().toISOString().slice(0,10), status: "Active", blood: "" };

export default function App() {
  const [patients, setPatients] = useState(() => {
    try { return JSON.parse(localStorage.getItem("caredesk-patients")) || initialPatients; }
    catch { return initialPatients; }
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [activePage, setActivePage] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);

  const save = (next) => { setPatients(next); localStorage.setItem("caredesk-patients", JSON.stringify(next)); };
  const visible = useMemo(() => patients.filter(p => {
    const match = [p.name,p.id,p.phone,p.diagnosis,p.doctor].join(" ").toLowerCase().includes(query.toLowerCase());
    return match && (filter === "All" || p.status === filter);
  }), [patients, query, filter]);

  function openAdd() { setEditing(null); setForm(blank); setModal(true); }
  function openEdit(p) { setEditing(p.id); setForm({ ...p }); setModal(true); }
  function submit(e) {
    e.preventDefault();
    const data = { ...form, age: Number(form.age), id: editing || `PT-${String(Date.now()).slice(-6)}` };
    save(editing ? patients.map(p => p.id === editing ? data : p) : [data, ...patients]);
    setModal(false);
  }
  function remove(id) {
    if (window.confirm("Delete this patient record?")) save(patients.filter(p => p.id !== id));
  }
  const active = patients.filter(p => p.status === "Active").length;
  const followups = patients.filter(p => p.status === "Follow-up").length;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "show" : ""}`}>
      <div className="brand"><span className="brand-mark"><HeartPulse size={22}/></span><span>CareDesk<small>HEALTHCARE PORTAL</small></span></div>
      <div className="nav-label">WORKSPACE</div>
      {["Overview","Patients"].map((item,i)=><button key={item} className={`nav-item ${activePage===item?"selected":""}`} onClick={()=>{setActivePage(item);setMobileNav(false);}}>{i===0?<LayoutDashboard size={18}/>:<ClipboardList size={18}/>} {item}</button>)}
      <div className="sidebar-bottom"><div className="secure-dot"></div><div><b>Demo workspace</b><small>Local sample data only</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="mobile-menu icon-btn" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button>
        <div><div className="eyebrow">CLINIC MANAGEMENT</div><h1>{activePage === "Overview" ? "Overview" : "Patient records"}</h1></div>
        <div className="top-actions"><span className="today"><CalendarDays size={16}/> {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span><div className="avatar">CD</div></div>
      </header>

      {activePage === "Overview" && <section className="content">
        <div className="welcome"><div><p className="eyebrow light">YOUR CLINIC AT A GLANCE</p><h2>Good care starts with<br/>organized records.</h2><p>Manage patient information from one simple workspace.</p></div><div className="welcome-art"><HeartPulse size={86} strokeWidth={1.2}/></div></div>
        <div className="stats">
          <Stat icon={<Users/>} label="Total patients" value={patients.length} note="All registered records"/>
          <Stat icon={<Activity/>} label="Active patients" value={active} note="Currently under care"/>
          <Stat icon={<CalendarDays/>} label="Follow-ups" value={followups} note="Need another visit"/>
        </div>
        <div className="section-head"><div><h3>Recently added patients</h3><p>Latest records in your workspace</p></div><button className="text-btn" onClick={()=>setActivePage("Patients")}>View all patients →</button></div>
        <PatientTable patients={patients.slice(0,4)} onEdit={openEdit} onDelete={remove}/>
      </section>}

      {activePage === "Patients" && <section className="content">
        <div className="section-head patient-heading"><div><h2>Patient directory</h2><p>Search, review and manage patient records.</p></div><button className="primary-btn" onClick={openAdd}><Plus size={18}/> Add patient</button></div>
        <div className="toolbar"><div className="searchbox"><Search size={18}/><input placeholder="Search name, ID, diagnosis or doctor..." value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Active</option><option>Follow-up</option><option>Discharged</option></select></div>
        <div className="table-wrap"><PatientTable patients={visible} onEdit={openEdit} onDelete={remove}/>{visible.length===0&&<div className="empty">No patient records match your search.</div>}</div>
        <p className="table-foot">Showing {visible.length} of {patients.length} patient records</p>
      </section>}
      <footer>CareDesk demo · Use fictional data only · Not for clinical or emergency use</footer>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head"><div><p className="eyebrow">PATIENT INFORMATION</p><h2>{editing?"Edit patient":"Add new patient"}</h2></div><button type="button" className="icon-btn" onClick={()=>setModal(false)}><X/></button></div>
        <div className="form-grid">
          <Field label="Full name" required><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Patient name"/></Field>
          <Field label="Age" required><input required type="number" min="0" max="120" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="Age"/></Field>
          <Field label="Gender"><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></Field>
          <Field label="Blood group"><select value={form.blood} onChange={e=>setForm({...form,blood:e.target.value})}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Phone"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91..."/></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="name@example.com"/></Field>
          <Field label="Diagnosis / reason"><input value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} placeholder="Reason for visit"/></Field>
          <Field label="Assigned doctor"><input value={form.doctor} onChange={e=>setForm({...form,doctor:e.target.value})} placeholder="Doctor name"/></Field>
          <Field label="Visit date"><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Field>
          <Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Follow-up</option><option>Discharged</option></select></Field>
        </div>
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setModal(false)}>Cancel</button><button className="primary-btn" type="submit">{editing?"Save changes":"Save patient"}</button></div>
      </form>
    </div>}
  </div>;
}

function Stat({icon,label,value,note}) { return <div className="stat-card"><div className="stat-top"><span className="stat-icon">{icon}</span><span className="stat-note">LIVE</span></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-sub">{note}</div></div>; }
function Field({label,required,children}) { return <label className="field"><span>{label}{required&&" *"}</span>{children}</label>; }
function PatientTable({patients,onEdit,onDelete}) {
  return <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Patient ID</th><th>Diagnosis</th><th>Doctor</th><th>Visit date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    {patients.map(p=><tr key={p.id}><td><div className="patient-cell"><div className="patient-avatar">{p.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div><div><b>{p.name}</b><small>{p.age} yrs · {p.gender}</small></div></div></td><td className="id-cell">{p.id}</td><td>{p.diagnosis||"—"}</td><td>{p.doctor||"—"}</td><td>{p.date||"—"}</td><td><span className={`status ${p.status.toLowerCase().replace("-","")}`}>{p.status}</span></td><td><div className="actions"><button title="Edit" onClick={()=>onEdit(p)}><Pencil size={16}/></button><button title="Delete" onClick={()=>onDelete(p.id)}><Trash2 size={16}/></button></div></td></tr>)}
  </tbody></table></div>;
}