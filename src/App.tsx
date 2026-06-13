import { useState } from 'react';
import { StickyNote, Plus, Trash2, Search, Sparkles, Loader } from 'lucide-react';
import { ai } from './utils/ai';
const C='#8b5cf6';
interface Note { id:string; title:string; body:string; color:string; createdAt:number; }
const COLORS=['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
const SK='ln_notes_v1';
const ld=():Note[]=>{try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch{return[]}};

export default function App() {
  const [notes,setNotes]=useState<Note[]>(ld);
  const [view,setView]=useState<'list'|'edit'>('list');
  const [cur,setCur]=useState<Note|null>(null);
  const [search,setSearch]=useState('');
  const [aiLoad,setAiL]=useState('');
  const [aiSugg,setAiS]=useState('');

  const sv=(items:Note[])=>{setNotes(items);localStorage.setItem(SK,JSON.stringify(items))};

  const runAI=async(type:string)=>{
    if(!cur?.body.trim()||aiLoad)return;
    setAiL(type);setAiS('');
    const prompt=type==='improve'?'Improve this note: '+cur.body.slice(0,500):type==='summarize'?'Summarize in 2 sentences: '+cur.body.slice(0,500):'Continue writing from: '+cur.body.slice(0,400);
    const sys=type==='summarize'?'Summarize concisely in 2 sentences.':'Return only the improved or continued text.';
    const r=await ai(prompt,sys);
    setAiS(r);setAiL('');
  };

  const saveNote=()=>{
    if(!cur)return;
    const u=notes.find(n=>n.id===cur.id)?notes.map(n=>n.id===cur.id?{...cur,body:cur.body}:n):[cur,...notes];
    sv(u);setView('list');
  };

  const filtered=notes.filter(n=>!search||n.title.toLowerCase().includes(search.toLowerCase())||n.body.toLowerCase().includes(search.toLowerCase()));
  const inp={width:'100%',background:'transparent',border:'none',outline:'none',color:'white',fontFamily:'Inter'};

  if(view==='edit'&&cur) return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${cur.color}20`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>setView('list')} style={{color:cur.color,background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontFamily:'Inter'}}>← Back</button>
        <div style={{display:'flex',gap:'6px'}}>
          {COLORS.map(c=><button key={c} onClick={()=>setCur({...cur,color:c})} style={{width:'20px',height:'20px',borderRadius:'50%',background:c,border:`2px solid ${cur.color===c?'white':c+'60'}`,cursor:'pointer'}}/>)}
        </div>
        <button onClick={saveNote} style={{padding:'7px 16px',borderRadius:'8px',background:cur.color,border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>Save</button>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'20px'}}>
        <input value={cur.title} onChange={e=>setCur({...cur,title:e.target.value})} placeholder="Note title..."
          style={{...inp,fontSize:'22px',fontWeight:'700',paddingBottom:'10px',marginBottom:'14px',borderBottom:`1px solid ${cur.color}30`,width:'100%',display:'block'}}/>
        <textarea value={cur.body} onChange={e=>setCur({...cur,body:e.target.value})} placeholder="Start writing..."
          rows={14} style={{...inp,resize:'none',lineHeight:'1.8',fontSize:'15px',width:'100%'}} autoFocus/>
        <div style={{background:'#0e0c1f',border:`1px solid ${cur.color}20`,borderRadius:'12px',padding:'14px',marginTop:'12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'10px'}}>
            <Sparkles size={12} style={{color:cur.color}}/>
            <span style={{fontSize:'11px',fontWeight:'700',color:cur.color,textTransform:'uppercase',letterSpacing:'0.08em'}}>AI ASSIST</span>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {[{k:'improve',l:'Improve'},{k:'summarize',l:'Summarize'},{k:'continue',l:'Continue'}].map(({k,l})=>(
              <button key={k} onClick={()=>runAI(k)} disabled={!cur.body.trim()||!!aiLoad}
                style={{padding:'5px 12px',borderRadius:'20px',border:`1px solid ${aiLoad===k?cur.color:cur.color+'30'}`,background:aiLoad===k?cur.color+'15':'transparent',color:aiLoad===k?cur.color:cur.color+'60',fontSize:'12px',cursor:'pointer',fontFamily:'Inter',display:'flex',alignItems:'center',gap:'5px',opacity:!cur.body.trim()?0.4:1}}>
                {aiLoad===k?<Loader size={10} style={{animation:'spin 1s linear infinite'}}/>:null}{l}
              </button>
            ))}
          </div>
          {aiSugg&&<div style={{marginTop:'10px',padding:'12px',borderRadius:'10px',background:`${cur.color}10`,border:`1px solid ${cur.color}25`}}>
            <p style={{fontSize:'13px',color:'#d4d4d4',lineHeight:'1.7',whiteSpace:'pre-wrap',marginBottom:'10px'}}>{aiSugg}</p>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>{setCur({...cur,body:aiSugg});setAiS('');}} style={{padding:'5px 12px',borderRadius:'7px',background:cur.color,border:'none',color:'white',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>Apply</button>
              <button onClick={()=>setAiS('')} style={{padding:'5px 10px',borderRadius:'7px',background:'transparent',border:`1px solid ${cur.color}30`,color:cur.color+'80',fontSize:'12px',cursor:'pointer',fontFamily:'Inter'}}>Dismiss</button>
            </div>
          </div>}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:`1px solid ${C}20`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`linear-gradient(135deg,${C},#7c3aed)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${C}30`}}><StickyNote size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>LocalNotes AI</div>
          <div style={{fontSize:'11px',color:`${C}60`,marginTop:'2px'}}>{notes.length} notes</div></div>
        </div>
        <button onClick={()=>{const n:Note={id:crypto.randomUUID(),title:'',body:'',color:C,createdAt:Date.now()};setCur(n);setView('edit');}}
          style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'9px',background:C,border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:`0 4px 12px ${C}30`}}>
          <Plus size={13}/> New
        </button>
      </header>
      <div style={{padding:'12px 20px',borderBottom:`1px solid ${C}15`}}>
        <div style={{position:'relative'}}>
          <Search size={13} style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',color:`${C}60`}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes..."
            style={{width:'100%',background:`${C}08`,border:`1px solid ${C}20`,borderRadius:'10px',padding:'9px 12px 9px 34px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter'}}/>
        </div>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'14px 20px'}}>
        {filtered.length===0?(<div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'52px',marginBottom:'16px'}}>🧠</div>
          <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>{notes.length===0?'Start noting':'No matches'}</h3>
          <p style={{color:`${C}60`,fontSize:'14px',maxWidth:'240px',margin:'0 auto 24px',lineHeight:'1.6'}}>{notes.length===0?'AI-powered notes that live entirely on your device.':''}</p>
          {notes.length===0&&<button onClick={()=>{const n:Note={id:crypto.randomUUID(),title:'',body:'',color:C,createdAt:Date.now()};setCur(n);setView('edit');}} style={{padding:'12px 24px',borderRadius:'10px',background:C,border:'none',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>Create first note</button>}
        </div>):(
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
            {[...filtered].sort((a,b)=>b.createdAt-a.createdAt).map(n=>(
              <div key={n.id} style={{background:`${n.color}08`,border:`1px solid ${n.color}25`,borderRadius:'12px',padding:'14px',cursor:'pointer',minHeight:'100px'}} onClick={()=>{setCur(n);setView('edit');}}>
                <div style={{color:'white',fontSize:'13px',fontWeight:'500',marginBottom:'5px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.title||'Untitled'}</div>
                <div style={{color:`${n.color}90`,fontSize:'12px',lineHeight:'1.5',display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{n.body}</div>
                <button onClick={e=>{e.stopPropagation();sv(notes.filter(x=>x.id!==n.id));}} style={{marginTop:'8px',padding:'3px',background:'none',border:'none',cursor:'pointer',color:`${n.color}40`}}><Trash2 size={11}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}