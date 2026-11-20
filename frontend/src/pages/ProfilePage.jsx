import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crosshair, MapPin, UserCircle } from 'lucide-react'
import Logo from '../components/Logo'
import { getAuth } from '../utils'

export default function ProfilePage(){
  const navigate=useNavigate()
  const auth=getAuth()
  const savedProfile=JSON.parse(localStorage.getItem('bitezyProfile')||'{}')
  const [form,setForm]=useState({
    fullName:savedProfile.fullName||auth?.fullName||'',
    email:savedProfile.email||auth?.email||'',
    phone:savedProfile.phone||'',
    address:savedProfile.address||localStorage.getItem('bitezyAddress')||''
  })
  const [locationLoading,setLocationLoading]=useState(false)
  const [message,setMessage]=useState('')

  function detectLocation(){
    setMessage('')
    if(!navigator.geolocation){
      setMessage('Location services are not supported by this browser')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      position=>{
        const {latitude,longitude}=position.coords
        const location=`Current location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
        setForm(current=>({...current,address:location}))
        setLocationLoading(false)
      },
      error=>{
        setMessage(error.code===1?'Location permission was denied':'Could not detect your location')
        setLocationLoading(false)
      },
      {enableHighAccuracy:true,timeout:10000,maxAge:300000}
    )
  }

  function save(e){
    e.preventDefault()
    localStorage.setItem('bitezyProfile',JSON.stringify(form))
    localStorage.setItem('bitezyAddress',form.address)
    setMessage('Profile saved successfully')
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="h-[72px] bg-white border-b px-4 md:px-8 flex items-center">
        <Logo/>
        <button onClick={()=>navigate('/menu')} className="ml-auto text-sm font-bold text-[#ef4b24]">Back to menu</button>
      </header>
      <main className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="bg-white border rounded-3xl p-5 md:p-8 shadow-sm">
          <div className="flex items-center gap-4 border-b pb-5">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ef4b24] flex items-center justify-center"><UserCircle size={34}/></div>
            <div><h1 className="text-2xl font-bold">My Profile</h1><p className="text-sm text-gray-500">{auth?.email}</p></div>
          </div>
          <form onSubmit={save} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Full name<input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} className="mt-1 w-full border rounded-xl px-3 py-3"/></label>
            <label className="block text-sm font-semibold text-gray-700">Email<input type="email" value={form.email} readOnly className="mt-1 w-full border rounded-xl px-3 py-3 bg-gray-50"/></label>
            <label className="block text-sm font-semibold text-gray-700">Phone number<input inputMode="numeric" pattern="[0-9]{7,15}" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/[^0-9]/g,'')})} className="mt-1 w-full border rounded-xl px-3 py-3"/></label>
            <label className="block text-sm font-semibold text-gray-700">Delivery address
              <textarea rows="3" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="mt-1 w-full border rounded-xl px-3 py-3"/>
            </label>
            <button type="button" onClick={detectLocation} disabled={locationLoading} className="w-full rounded-xl border border-[#ef4b24] text-[#ef4b24] py-3 font-bold flex justify-center items-center gap-2">
              {locationLoading?<Crosshair className="animate-pulse" size={18}/>:<MapPin size={18}/>}
              {locationLoading?'Detecting location...':'Use my current location'}
            </button>
            {message&&<div className={`rounded-xl px-4 py-3 text-sm ${message.includes('successfully')?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>{message}</div>}
            <button className="w-full rounded-xl bg-[#ef4b24] text-white py-3 font-bold">Save Profile</button>
          </form>
        </div>
      </main>
    </div>
  )
}
