import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, FileText, Map, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import World, {type Clue} from './World'

type Overlay = 'invite'|'controls'|'portrait'|'model'|'letter'|'terminal'|'board'|'portfolio'|'about'|'pause'|null
const FILES=[
 {title:'THE SUBJECT',label:'About Me',subtitle:'The Reflection',art:'/art/reflection.jpg',desc:'Who built this house? Discover the artist and designer behind the work.'},
 {title:'THE ARCHIVE',label:'Résumé',subtitle:'The Archive',art:'/art/spinning-round.jpg',desc:'Education, experience, technical skills and a downloadable résumé.'},
 {title:'THE DWELLING',label:'Residential',subtitle:'The Dwelling',art:'/art/itsy-bitsy-spider.jpg',desc:'Concept, research, spatial planning, drawings and residential design.'},
 {title:'THE EXPERIMENT',label:'Aura',subtitle:'The Experiment',art:'/art/arcade.jpg',desc:'Inclusive assistive-technology retail design and project development.'},
 {title:'THE IGNITION',label:'Napoleon',subtitle:'The Ignition',art:'/art/matchbox.jpg',desc:'Volcanic-inspired product design, materials and technical development.'}
]
const initialProgress=()=>{try{return localStorage.getItem('invitation-first-clue')==='yes'}catch{return false}}
export default function App(){
 const [overlay,setOverlay]=useState<Overlay>('invite')
 const [entered,setEntered]=useState(false)
 const [locked,setLocked]=useState(false)
 const [near,setNear]=useState<Clue|null>(null)
 const [discovered,setDiscovered]=useState(initialProgress)
 const [mute,setMute]=useState(true)
 const [breached,setBreached]=useState(()=>{try{return localStorage.getItem('invitation-breached')==='yes'}catch{return false}})
 const [sequence,setSequence]=useState<number[]>([])
 const [breachMessage,setBreachMessage]=useState('')
 const [selected,setSelected]=useState(0)
 const [message,setMessage]=useState('')
 const open=useCallback((target:Overlay)=>{if(document.pointerLockElement)document.exitPointerLock();setOverlay(target)},[])
 const clue=useCallback((id:Clue)=>{
  if(id==='portrait'){setDiscovered(true);try{localStorage.setItem('invitation-first-clue','yes')}catch{};setMessage('The crimson cable pulses. An identity fragment has been recovered.');}
  else if(id==='terminal'){setSequence([]);setBreachMessage('INPUT THE ACCESS SEQUENCE: ← ↑ → ↓');}
  else if(id==='model')setMessage('A miniature house. Its doors lead somewhere familiar.')
  else setMessage('The final door is waiting. The rest of the house is not yet built.')
  open(id)
 },[open])
 const submitStep=(step:number)=>{const next=[...sequence,step];const target=[0,1,2,3];if(next.some((n,i)=>n!==target[i])){setSequence([]);setBreachMessage('ACCESS DENIED — RETRY THE SEQUENCE');return;}setSequence(next);if(next.length===4){setBreached(true);try{localStorage.setItem('invitation-breached','yes')}catch{};setBreachMessage('ACCESS GRANTED — THE NETWORK IS YOURS');}else setBreachMessage('SIGNAL ACCEPTED — CONTINUE');}
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   if(e.code==='Escape'&&entered&&overlay===null)open('pause')
   if(e.code==='Tab'&&entered){e.preventDefault();open(overlay==='board'?null:'board')}
  }
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)
 },[entered,overlay,open])
 const resume=()=>{if(!entered){setOverlay('invite');return;}setOverlay(null);document.querySelector('canvas')?.requestPointerLock?.()}
 const start=()=>{setEntered(true);setOverlay('controls')}
 const reset=()=>{setBreached(false);setSequence([]);try{localStorage.removeItem('invitation-breached')}catch{};setDiscovered(false);try{localStorage.removeItem('invitation-first-clue')}catch{};setOverlay('invite');setEntered(false)}
 return <div className="app">
  <World active={entered} paused={overlay!==null} onLock={setLocked} onNear={setNear} onInteract={clue} discovered={discovered} breached={breached}/>
  <div className="grain" aria-hidden="true"/>
  {entered&&overlay===null&&<>
    <div className="hud-top"><span>THE INVITATION</span><span>SECTOR 00 / STREET ENTRY</span></div>
    <div className="crosshair" aria-hidden="true">+</div>
    {locked&&near&&<div className="interact"><kbd>E</kbd> {near==='portrait'?'EXAMINE THE PAINTING':near==='model'?'INSPECT THE MODEL':near==='terminal'?'HACK ACCESS NODE':'READ THE LETTER'}</div>}
    {!locked&&<button className="relock" onClick={resume}>CLICK TO RESUME EXPLORATION</button>}
    <div className="hud-bottom"><span className="breach-status">NODE 01: {breached?'BREACHED':'LOCKED'}</span><button onClick={()=>open('board')}>[ TAB ] EVIDENCE</button><button onClick={()=>open('portfolio')}>VIEW PORTFOLIO</button><button onClick={()=>open('pause')}>MENU</button></div>
   </>}
  {overlay==='invite'&&<main className="home-screen" aria-label="The Invitation game home screen">
    <img className="home-art" src="/scene/home-original.jpg" alt="Original colourful physical artwork used as the game home screen"/>
    <div className="home-shade" aria-hidden="true"/>
    <button className="home-star" onClick={start} aria-label="Start the game"><svg viewBox="0 0 160 160" aria-hidden="true"><path d="M80 5 L99 55 L151 57 L111 89 L125 145 L80 116 L35 145 L49 89 L9 57 L61 55 Z" fill="#f4e5b2" stroke="#e63e43" strokeWidth="7" strokeLinejoin="round"/><path d="M80 18 L95 63 L140 65 L104 91 L115 130 L80 106 L45 130 L56 91 L20 65 L65 63 Z" fill="#16101b" stroke="#f4e5b2" strokeWidth="2"/></svg><span>START</span></button>
    <button className="home-about" onClick={()=>open('about')} aria-label="About Me — click the illustrated woman"><svg viewBox="0 0 130 245" aria-hidden="true"><path d="M52 13 Q64 0 78 15 L91 36 L91 58 L84 76 L97 99 L103 137 L95 155 L104 194 L111 234 L32 234 L42 185 L35 142 L44 107 L38 83 L44 62 L39 37 Z" fill="#e22b430d" stroke="#ff244b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/></svg><span>ABOUT ME</span></button>
    <div className="home-hint">SELECT START TO ENTER THE STREET <span>✦</span> SELECT THE FIGURE TO MEET THE DESIGNER</div>
   </main>}
  {overlay!==null&&overlay!=='invite'&&<div className="veil"><div className="panel">
    {overlay==='controls'&&<div className="center-content"><div className="eyebrow">BEFORE YOU ENTER</div><h2>THE STREET / ENTRY POINT</h2><p>You are outside on the road. Follow the crimson cable toward the artwork-covered wall. Find the access terminal and breach the network.</p><div className="controls"><span>W A S D</span><span>MOVE</span><span>MOUSE</span><span>LOOK</span><span>SHIFT</span><span>SPRINT</span><span>E</span><span>EXAMINE</span><span>TAB</span><span>EVIDENCE BOARD</span><span>ESC</span><span>RELEASE CURSOR</span></div><button className="primary" onClick={resume}>ENTER THE STREET <ArrowRight size={16}/></button></div>}
    {overlay==='terminal'&&<><div className="eyebrow">SECURITY INTERFACE / NODE 01</div><h2>BREACH THE NETWORK</h2><p>Enter the four directional inputs in the indicated order to unlock the signal. This is a prototype hacking interaction; future versions can add timing and sound.</p><div className="cyber-sequence">← ↑ → ↓</div><div className="cyber-steps">{[0,1,2,3].map(i=><span key={i} className={sequence.length>i?'filled':''}>{sequence.length>i?'◆':'◇'}</span>)}</div><div className="cyber-inputs">{['←','↑','→','↓'].map((symbol,i)=><button key={i} disabled={breached} onClick={()=>submitStep(i)}>{symbol}</button>)}</div><p className="note">{breachMessage||'AWAITING INPUT'}</p><button className="secondary" onClick={resume}>{entered?'RETURN TO STREET':'BACK TO HOME SCREEN'}</button></>}
    {overlay==='portrait'&&<><div className="eyebrow">EVIDENCE DISCOVERED / 001</div><h2>THE FIRST CLUE</h2><div className="inspection"><img src="/art/uncovered.jpg" alt="Original physical artwork, Uncovered"/><div><p>{message}</p><p>The artwork is embedded in the streetscape. The five portfolio files are accessible from the network.</p><div className="note">FILE 001 UNLOCKED<br/>THE SUBJECT / ABOUT ME</div><button className="primary" onClick={()=>open('about')}>OPEN EVIDENCE FILE <FileText size={16}/></button></div></div><button className="secondary" onClick={resume}><ArrowLeft size={15}/> RETURN TO STREET</button></>}
    {overlay==='model'&&<><div className="eyebrow">ARCHITECTURAL EVIDENCE</div><h2>THE MODEL</h2><p>{message}</p><p>A study of space, memory and the impossible. The complete Residential chapter will be added in a later build.</p><button className="primary" onClick={()=>{setSelected(2);open('portfolio')}}>VIEW RESIDENTIAL FILE <ArrowRight size={16}/></button><button className="secondary" onClick={resume}>{entered?'RETURN TO STREET':'BACK TO HOME SCREEN'}</button></>}
    {overlay==='letter'&&<><div className="eyebrow">A NOTE LEFT BEHIND</div><h2>THE UNFINISHED HOUSE</h2><p>“If you are reading this, you have already begun to understand. The house does not contain the work. It is the work.”</p><p>The next room is a placeholder in this first prototype.</p><button className="primary" onClick={resume}>CONTINUE EXPLORING</button></>}
    {overlay==='board'&&<><div className="panel-heading"><div><div className="eyebrow">CASE RECORD / 01</div><h2>THE SIGNAL NETWORK</h2></div><button className="icon-button" aria-label="Close evidence board" onClick={resume}><X/></button></div><div className="board"><svg className="board-lines" viewBox="0 0 700 360" preserveAspectRatio="none" aria-hidden="true"><path d="M350 180 L110 70 M350 180 L580 75 M350 180 L100 285 M350 180 L350 295 M350 180 L595 280" fill="none" stroke="#a92f3c" strokeWidth="2" strokeDasharray="5 5"/><path d="M350 180 L110 70" fill="none" stroke={discovered?'#eb4250':'#513039'} strokeWidth={discovered?'4':'2'}/></svg><div className="pin center">THE CORE</div>{FILES.map((f,i)=><button key={f.title} className={'pin pin-'+i+(i===0&&discovered?' found':'')} onClick={()=>{setSelected(i);open('portfolio')}}><small>0{i+1} / {i===0&&discovered?'DISCOVERED':'UNDISCOVERED'}</small><strong>{f.label.toUpperCase()}</strong></button>)}</div><p className="small">The red signal links recovered identity fragments. All five portfolio files remain accessible through View Portfolio.</p><button className="secondary" onClick={resume}>{entered?'RETURN TO STREET':'BACK TO HOME SCREEN'}</button></>}
    {overlay==='about'&&<><div className="eyebrow">FILE 001 / THE SUBJECT</div><h2>ABOUT THE DESIGNER</h2><div className="inspection"><img src="/art/reflection.jpg" alt="Original figurative artwork"/><div><p>The house is an exploration of art, interiors, and the stories that spaces can tell.</p><p className="note">REPLACE THIS TEXT with your actual biography, design philosophy, interests and professional introduction.</p><button className="primary" onClick={()=>{setSelected(0);open('portfolio')}}>VIEW PORTFOLIO FILE</button></div></div><button className="secondary" onClick={resume}>{entered?'RETURN TO STREET':'BACK TO HOME SCREEN'}</button></>}
    {overlay==='portfolio'&&<><div className="panel-heading"><div><div className="eyebrow">THE COMPLETE CASE / DIRECT ACCESS</div><h2>PORTFOLIO FILES</h2></div><button className="icon-button" aria-label="Close portfolio" onClick={resume}><X/></button></div><div className="file-tabs">{FILES.map((f,i)=><button className={selected===i?'active':''} key={f.label} onClick={()=>setSelected(i)}>{String(i+1).padStart(2,'0')} {f.label}</button>)}</div><div className="inspection portfolio-file"><img src={FILES[selected].art} alt={`Original artwork associated with ${FILES[selected].label}`}/><div><div className="eyebrow">FILE 00{selected+1} / {FILES[selected].subtitle.toUpperCase()}</div><h3>{FILES[selected].title}</h3><p>{FILES[selected].desc}</p><p className="note">PLACEHOLDER — Add your actual project renders, floor plans, technical drawings, descriptions and PDF downloads here. No professional details have been invented.</p></div></div><button className="secondary" onClick={resume}>{entered?'RETURN TO STREET':'BACK TO HOME SCREEN'}</button></>}
    {overlay==='pause'&&<div className="center-content"><div className="eyebrow">CONNECTION SUSPENDED</div><h2>PAUSED</h2><div className="menu-buttons"><button className="primary" onClick={resume}>RESUME EXPLORATION</button><button className="secondary" onClick={()=>open('board')}><Map size={15}/> EVIDENCE BOARD</button><button className="secondary" onClick={()=>open('portfolio')}><Eye size={15}/> VIEW PORTFOLIO</button><button className="secondary" onClick={()=>setMute(!mute)}>{mute?<VolumeX size={15}/>:<Volume2 size={15}/>} AUDIO {mute?'OFF':'ON (NO TRACK LOADED)'}</button><button className="secondary" onClick={reset}><RotateCcw size={15}/> RESTART</button></div></div>}
   </div></div>}
 </div>
}
