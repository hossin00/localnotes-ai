import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'localnotes-ai_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["AI writing suggestions", "Smart auto-complete", "100% local storage", "Markdown support"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#8b5cf6" color2="#7c3aed" emoji="🧠" name="LocalNotes AI" tagline="Smart local notepad with AI suggestions"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#8b5cf6" emoji="🧠" name="LocalNotes AI" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}