import { Apple } from 'lucide-react'

export default function Logo({light=false}) {
  return (
    <div className={`flex items-center gap-2 font-bold text-xl ${light?'text-white':'text-[#ef4b24]'}`}>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${light?'bg-white text-[#ef4b24]':'bg-[#ef4b24] text-white'}`}>
        <Apple size={20}/>
      </span>
      Bitezy
    </div>
  )
}
