import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api'
import Logo from './Logo'

export default function AuthPage() {
  const navigate=useNavigate()
  const location=useLocation()
  const [mode,setMode]=useState(location.state?.mode||'register')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const googleButtonRef=useRef(null)
  const [form,setForm]=useState({fullName:'',email:'',password:'',confirmPassword:'',role:'CUSTOMER',secretPin:''})
  const change=e=>setForm({...form,[e.target.name]:e.target.value})

  useEffect(()=>{
    if(mode!== 'login') return
    const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID
    if(!clientId) return

    const renderGoogleButton=()=>{
      if(!window.google?.accounts?.id || !googleButtonRef.current) return false
      window.google.accounts.id.initialize({
        client_id:clientId,
        callback:async (response)=>{
          setLoading(true);setError('')
          try {
            const {data}=await api.post('/auth/google',{credential:response.credential})
            localStorage.setItem('bitezyAuth',JSON.stringify(data))
            navigate(data.role==='OWNER'?'/owner':(location.state?.redirect||'/menu'))
          } catch(e) {
            setError(e.response?.data?.message||'Google login failed')
          } finally {
            setLoading(false)
          }
        }
      })
      googleButtonRef.current.innerHTML=''
      window.google.accounts.id.renderButton(googleButtonRef.current,{
        theme:'outline',
        size:'large',
        shape:'pill',
        text:'continue_with',
        width:googleButtonRef.current.offsetWidth||320
      })
      return true
    }

    if(renderGoogleButton()) return
    let attempts=0
    const timer=window.setInterval(()=>{
      attempts++
      if(renderGoogleButton() || attempts>=20) window.clearInterval(timer)
    },250)
    return ()=>window.clearInterval(timer)
  },[mode,location.state?.redirect,navigate])

  async function submit(e) {
    e.preventDefault()
    setLoading(true);setError('')
    try {
      const path=mode==='login'?'/auth/login':'/auth/register'
      const body=mode==='login'?{email:form.email,password:form.password}:form
      const {data}=await api.post(path,body)
      localStorage.setItem('bitezyAuth',JSON.stringify(data))
      if(data.role==='OWNER') navigate('/owner')
      else navigate(location.state?.redirect||'/menu')
    } catch(e) {
      setError(e.response?.data?.message||'Unable to continue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7f3] flex items-center justify-center p-4">
      <div className="w-full max-w-[980px] bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-between p-10 text-white bg-[#ef4b24]" style={{backgroundImage:'linear-gradient(135deg,#ef4b24,#ff7649)'}}>
          <Logo light/><div><h1 className="text-4xl font-bold">Your cravings.<br/>Delivered.</h1><p className="mt-4 text-orange-100">Fresh favorites, delivered to your door.</p></div>
          <p className="text-sm opacity-80">© 2026 Bitezy</p>
        </div>
        <form onSubmit={submit} className="p-7 md:p-10">
          <div className="md:hidden mb-8"><Logo/></div>
          <h2 className="text-2xl font-bold">{mode==='login'?'Welcome back':'Create your account'}</h2>
          <p className="text-gray-500 mt-1 mb-6">{location.state?.redirect?'Register or login to complete your payment':'Join Bitezy or sign in to continue'}</p>
          {mode==='register'&&<>
            <Input label="Full name" name="fullName" value={form.fullName} onChange={change}/>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="text-sm font-semibold text-gray-700">Role
                <select name="role" value={form.role} onChange={change} className="mt-1 w-full border rounded-xl px-3 py-2.5">
                  <option>CUSTOMER</option><option>OWNER</option>
                </select>
              </label>
              {form.role==='OWNER'&&<Input label="Owner PIN" name="secretPin" value={form.secretPin} onChange={change} type="password"/>}
            </div>
          </>}
          <Input label="Email" name="email" type="email" value={form.email} onChange={change}/>
          <Input label="Password" name="password" type="password" value={form.password} onChange={change}/>
          {mode==='register'&&<Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={change}/>}
          {error&&<div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-[#ef4b24] py-3 text-white font-bold disabled:opacity-60">
            {loading?'Please wait...':mode==='login'?'Login':'Register'}
          </button>
          {mode==='login'&&(
            <div className="mt-4">
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div ref={googleButtonRef} className="w-full flex justify-center min-h-[44px]"/>
              ) : (
                <div className="rounded-xl border px-4 py-3 text-sm text-center text-gray-500">Google login is not configured</div>
              )}
            </div>
          )}
          <p className="text-center text-sm mt-5 text-gray-500">
            {mode==='login'?'New to Bitezy?':'Already have an account?'}
            <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')} className="ml-1 text-[#ef4b24] font-bold">{mode==='login'?'Register':'Login'}</button>
          </p>
        </form>
      </div>
    </div>
  )
}

function Input({label,...props}) {
  return <label className="block mb-4 text-sm font-semibold text-gray-700">{label}<input required {...props} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#ef4b24]"/></label>
}
