import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export type Clue = 'portrait' | 'model' | 'letter' | 'terminal'
type WorldProps = { active: boolean; paused: boolean; onInteract: (clue:Clue)=>void; onLock:(locked:boolean)=>void; onNear:(clue:Clue|null)=>void; discovered:boolean; breached:boolean }
const eyeHeight=1.66
const bounds: Array<[number,number,number,number]> = [
 [-7,-6.7,-15,10],[6.7,7,-15,10],[-7,7,9.6,10],[-7,7,-11,-10.7],
 [-1.1,1.1,-3.2,-1.7],[-4.4,-2.7,-3.8,-2.1],[2.0,3.4,-7.1,-6.0]
]
function canMove(x:number,z:number){const r=.29;return !bounds.some(([a,b,c,d])=>x>a-r&&x<b+r&&z>c-r&&z<d+r)}
function Controller({active,paused,onInteract,onLock,onNear}:WorldProps){
 const {camera,gl}=useThree()
 const keys=useRef(new Set<string>())
 const locked=useRef(false)
 const near=useRef<Clue|null>(null)
 const pitch=useRef(0),yaw=useRef(0)
 const interact=useRef(onInteract),setNear=useRef(onNear)
 interact.current=onInteract;setNear.current=onNear
 useEffect(()=>{camera.position.set(0,eyeHeight,6.1);camera.rotation.order='YXZ'},[camera])
 useEffect(()=>{
  const element=gl.domElement
  const change=()=>{locked.current=document.pointerLockElement===element;onLock(locked.current)}
  const move=(e:MouseEvent)=>{if(!locked.current||paused)return;yaw.current-=e.movementX*.0022;pitch.current=THREE.MathUtils.clamp(pitch.current-e.movementY*.0022,-1.28,1.28)}
  const down=(e:KeyboardEvent)=>{keys.current.add(e.code);if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if(e.code==='KeyE'&&!e.repeat&&locked.current&&near.current)interact.current(near.current)}
  const up=(e:KeyboardEvent)=>keys.current.delete(e.code)
  const blur=()=>keys.current.clear()
  document.addEventListener('pointerlockchange',change);document.addEventListener('mousemove',move);window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur)
  return ()=>{document.removeEventListener('pointerlockchange',change);document.removeEventListener('mousemove',move);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)}
 },[gl,onLock,paused])
 useEffect(()=>{if(paused&&document.pointerLockElement===gl.domElement)document.exitPointerLock()},[paused,gl])
 useFrame((_,delta)=>{
  camera.rotation.set(pitch.current,yaw.current,0,'YXZ')
  if(!active||paused||!locked.current)return
  const dt=Math.min(delta,.05)
  const forward=Number(keys.current.has('KeyW')||keys.current.has('ArrowUp'))-Number(keys.current.has('KeyS')||keys.current.has('ArrowDown'))
  const side=Number(keys.current.has('KeyD'))-Number(keys.current.has('KeyA'))
  const input=new THREE.Vector3(side,0,-forward)
  if(input.lengthSq()>0){
   input.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw.current).multiplyScalar(dt*(keys.current.has('ShiftLeft')?5.0:2.45))
   if(canMove(camera.position.x+input.x,camera.position.z))camera.position.x+=input.x
   if(canMove(camera.position.x,camera.position.z+input.z))camera.position.z+=input.z
  }
  const candidates:[Clue,THREE.Vector3][]=[['portrait',new THREE.Vector3(2.65,1.8,-6.5)],['model',new THREE.Vector3(0,1.1,-2.5)],['letter',new THREE.Vector3(0,1.6,-9.8)],['terminal',new THREE.Vector3(-3.1,1.5,-3.0)]]
  const dir=new THREE.Vector3();camera.getWorldDirection(dir)
  let best:Clue|null=null,score=-1
  for(const [id,p] of candidates){const v=p.clone().sub(camera.position),dist=v.length();const dot=v.normalize().dot(dir);if(dist<2.8&&dot>.87&&dot>score){best=id;score=dot}}
  if(near.current!==best){near.current=best;setNear.current(best)}
 })
 return null
}

function Box({position,size,color,emissive}: {position:[number,number,number],size:[number,number,number],color:string,emissive?:string}){
 return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} emissive={emissive||'#000000'} emissiveIntensity={emissive?.7:0} roughness={.86}/></mesh>
}
function StreetFloor(){
 const tex=useTexture('/scene/street-reference.jpg')
 tex.colorSpace=THREE.SRGBColorSpace
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.055,-1]} receiveShadow><planeGeometry args={[17,26]}/><meshStandardMaterial map={tex} color={'#c6b7b0'} roughness={1}/></mesh>
}
function MuralWall(){
 const tex=useTexture('/scene/entry-wall.jpg');tex.colorSpace=THREE.SRGBColorSpace
 const art=useTexture('/art/uncovered.jpg');art.colorSpace=THREE.SRGBColorSpace
 return <group>
  {/* Page two: the original painting is the actual exterior entry facade. */}
  <mesh position={[0,3.4,-10.35]} receiveShadow><planeGeometry args={[5.5,6.8]}/><meshBasicMaterial map={tex} toneMapped={false}/></mesh>
  <Box position={[-4.9,3.1,-10.46]} size={[4.25,6.3,.24]} color="#101423"/>
  <Box position={[4.9,3.1,-10.46]} size={[4.25,6.3,.24]} color="#101423"/>
  <Box position={[0,6.82,-10.44]} size={[13.7,.22,.35]} color="#0b0b13"/>
  {/* A separate original painting remains available as an inspectable clue. */}
  <group position={[2.65,1.95,-6.5]} rotation={[0,-.26,0]}>
   <mesh><boxGeometry args={[1.8,2.55,.12]}/><meshStandardMaterial color="#0c0e16"/></mesh>
   <mesh position={[0,0,.07]}><planeGeometry args={[1.68,2.4]}/><meshBasicMaterial map={art} toneMapped={false}/></mesh>
   <mesh position={[0,-1.29,.09]}><boxGeometry args={[1.9,.045,.12]}/><meshBasicMaterial color="#ff375e"/></mesh>
  </group>
  <Text position={[0,6.35,-10.12]} fontSize={.25} color="#f2b6a8">THE INVITATION / ENTRY 00</Text>
 </group>
}
function RedCable({discovered}:{discovered:boolean}){
 const main=useMemo(()=>new THREE.CatmullRomCurve3([[0,.04,8],[.2,.05,5],[-.6,.06,2],[-1.8,.07,-.8],[-2.4,.08,-3.2],[-1.0,.07,-5.2],[1.2,.06,-6.3],[2.5,.5,-6.45],[2.65,1.6,-6.5]].map(p=>new THREE.Vector3(...p))),[])
 const branch=useMemo(()=>new THREE.CatmullRomCurve3([[-2.4,.08,-3.2],[-3.0,.25,-3],[-3.1,1.5,-3]].map(p=>new THREE.Vector3(...p))),[])
 return <group>
  <mesh><tubeGeometry args={[main,160,.024,8,false]}/><meshStandardMaterial color="#ff254b" emissive="#e90034" emissiveIntensity={2.2}/></mesh>
  {discovered&&<mesh><tubeGeometry args={[branch,60,.024,8,false]}/><meshStandardMaterial color="#ff6a83" emissive="#ff204a" emissiveIntensity={2.5}/></mesh>}
 </group>
}
function Street({discovered,breached}:{discovered:boolean;breached:boolean}){
 return <group>
  <StreetFloor/>
  <MuralWall/>
  {/* Open sky and side buildings create an exterior street rather than a room. */}
  {[-1,1].map(side=><group key={side}>
   <Box position={[side*7.6,4.5,-2]} size={[1.7,9,26]} color="#0d1422"/>
   {[-8,-3,2,7].map(z=><group key={z}>
    <Box position={[side*6.55,.24,z]} size={[.6,.48,1.2]} color="#1c2530"/>
    <Box position={[side*6.75,2.8,z]} size={[.12,4.8,.12]} color="#242a3a"/>
    <mesh position={[side*6.65,4.7,z]}><sphereGeometry args={[.2,10,8]}/><meshBasicMaterial color="#f1a96b"/></mesh>
    <pointLight position={[side*6.2,4.6,z]} color="#fba36a" intensity={2.8} distance={7}/>
   </group>)}
   <Box position={[side*6.62,.02,-1]} size={[.12,.04,22]} color="#e4b98b"/>
  </group>)}
  {/* Street markings, sidewalk edges and glowing graphic accents. */}
  {Array.from({length:9},(_,i)=><Box key={i} position={[-1.9,.015,7-i*2]} size={[.1,.018,.8]} color="#f5d7a5"/>)}
  <Box position={[0,.55,-2.5]} size={[2.2,1.1,1.5]} color="#1b1b28"/>
  <Box position={[0,1.13,-2.5]} size={[2.35,.08,1.65]} color="#334451"/>
  <Float speed={1.2} floatIntensity={.06}><mesh position={[0,1.6,-2.5]}><icosahedronGeometry args={[.48,0]}/><meshStandardMaterial color="#f03d65" emissive="#e3215e" emissiveIntensity={1} wireframe/></mesh></Float>
  <group position={[-3.1,1.55,-3]} rotation={[0,Math.PI/2,0]}>
   <mesh><boxGeometry args={[1.55,1.25,.16]}/><meshStandardMaterial color="#09111b" metalness={.6} roughness={.3}/></mesh>
   <mesh position={[0,0,.09]}><planeGeometry args={[1.4,1.1]}/><meshBasicMaterial color={breached?'#126b68':'#2a1234'}/></mesh>
   <Text position={[0,.2,.1]} fontSize={.13} color="#d9ffff">ACCESS NODE 01</Text>
   <Text position={[0,-.1,.1]} fontSize={.11} color={breached?'#98fff2':'#ff6587'}>{breached?'ACCESS GRANTED':'BREACH REQUIRED'}</Text>
   <Text position={[0,-.37,.1]} fontSize={.08} color="#f2d6df">[ E ] CONNECT</Text>
  </group>
  <pointLight position={[-3,2,-3]} color={breached?'#2afde0':'#f12d63'} intensity={7} distance={5}/>
  <mesh position={[0,1.6,-9.8]}><boxGeometry args={[1.65,2.8,.16]}/><meshStandardMaterial color="#26172c"/></mesh>
  <Text position={[0,2.25,-9.68]} fontSize={.17} color="#ff577a">SECTOR 01 / IDENTITY</Text>
  <Text position={[0,1.75,-9.68]} fontSize={.1} color="#e3d6f3">FOLLOW THE CABLE</Text>
  <ambientLight intensity={.35} color="#728cae"/>
  <hemisphereLight args={['#28345c','#24131a',.6]}/>
  <pointLight position={[2,5,-5]} color="#ec3a6d" intensity={14} distance={14}/>
  <pointLight position={[-5,6,3]} color="#05d8d1" intensity={9} distance={13}/>
  <RedCable discovered={discovered||breached}/>
 </group>
}
export default function World(props:WorldProps){
 return <Canvas shadows camera={{fov:75,near:.08,far:90,position:[0,eyeHeight,6.1]}} dpr={[1,1.65]} gl={{antialias:true}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=.9}}>
  <color attach="background" args={['#080c1b']}/><fog attach="fog" args={['#090d1b',16,42]}/>
  <Street discovered={props.discovered} breached={props.breached}/>
  <Controller {...props}/>
 </Canvas>
}
