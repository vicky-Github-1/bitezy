import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crosshair, LoaderCircle, LogIn, LogOut, MapPin, Package, Search, UserCircle } from 'lucide-react'
import api from '../api'
import Logo from '../components/Logo'
import CartSummary from '../components/CartSummary'
import { clearAuth, getAuth, money } from '../utils'

const categories=['All','Pizza','Burger','Biryani','Chinese','Beverages','Desserts']

export default function MenuPage() {
  const navigate=useNavigate()
  const auth=getAuth()
  const [products,setProducts]=useState([])
  const [category,setCategory]=useState('All')
  const [search,setSearch]=useState('')
  const [address,setAddress]=useState(localStorage.getItem('bitezyAddress')||'Central, Home')
  const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem('bitezyCart')||'[]'))
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [locationLoading,setLocationLoading]=useState(false)
  const [locationError,setLocationError]=useState('')

  useEffect(()=>{
    api.get('/products').then(r=>setProducts(r.data))
      .catch(e=>setError(e.response?.data?.message||'Could not load menu'))
      .finally(()=>setLoading(false))
  },[])
  useEffect(()=>localStorage.setItem('bitezyCart',JSON.stringify(cart)),[cart])

  const shown=products.filter(p=>(category==='All'||p.category===category)&&p.name.toLowerCase().includes(search.toLowerCase()))
  const add=p=>setCart(c=>{const found=c.find(i=>i.id===p.id);return found?c.map(i=>i.id===p.id?{...i,quantity:i.quantity+1}:i):[...c,{...p,quantity:1}]})
  const qty=(id,diff)=>setCart(c=>c.map(i=>i.id===id?{...i,quantity:i.quantity+diff}:i).filter(i=>i.quantity>0))
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.quantity,0)
  const fee=subtotal>=499||subtotal===0?0:40
  const total=subtotal+fee

  function editAddress() {
    setLocationError('')
    if(!navigator.geolocation){
      setLocationError('Location services are not supported by this browser')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      position=>{
        const {latitude,longitude}=position.coords
        const location=`Current location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
        setAddress(location)
        localStorage.setItem('bitezyAddress',location)
        setLocationLoading(false)
      },
      error=>{
        setLocationError(error.code===1?'Location permission was denied':'Could not detect your location')
        setLocationLoading(false)
      },
      {enableHighAccuracy:true,timeout:10000,maxAge:300000}
    )
  }
  function logout(){clearAuth();navigate('/menu')}

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-20 bg-white border-b px-4 md:px-8 h-[72px] flex items-center gap-4">
        <Logo/>
        <button onClick={editAddress} title="Use my current location" className="flex items-center gap-2 text-sm md:ml-5 md:border-l md:pl-5 max-w-[240px]">
          {locationLoading?<LoaderCircle size={18} className="animate-spin text-[#ef4b24]"/>:<MapPin size={18} className="text-[#ef4b24] shrink-0"/>}
          <span className="text-left hidden sm:block"><span className="text-gray-400 block text-xs">Deliver to</span><b className="block truncate">{address}</b></span>
          <Crosshair size={16} className="sm:hidden text-[#ef4b24] shrink-0"/>
        </button>
        <div className="ml-auto flex items-center gap-2">
          {auth?.role==='CUSTOMER'&&<button onClick={()=>navigate('/orders')} className="px-3 py-2 text-sm font-semibold"><Package size={18} className="inline mr-1"/>Orders</button>}
          {auth?.token?<><button onClick={()=>navigate('/profile')} title="Profile" className="w-10 h-10 rounded-full bg-orange-50 text-[#ef4b24] flex items-center justify-center"><UserCircle size={19}/></button><button onClick={logout} title="Logout" className="w-10 h-10 rounded-full bg-orange-50 text-[#ef4b24] flex items-center justify-center"><LogOut size={18}/></button></>:(
            <button onClick={()=>navigate('/login',{state:{mode:'login'}})} className="rounded-xl border px-4 py-2 text-sm font-bold"><LogIn size={16} className="inline mr-1"/>Login</button>
          )}
        </div>
      </header>
      {locationError&&<div className="fixed z-30 left-1/2 -translate-x-1/2 top-20 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow">{locationError}</div>}
      <main className="max-w-[1380px] mx-auto px-4 md:px-8 py-6 grid lg:grid-cols-[1fr_330px] gap-6">
        <section>
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1"><Search className="absolute left-4 top-3 text-gray-400" size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your cravings..." className="w-full rounded-2xl border bg-white pl-12 pr-4 py-3 outline-none focus:border-[#ef4b24]"/></div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold ${category===c?'bg-[#ef4b24] text-white':'bg-white border text-gray-600'}`}>{c}</button>)}
          </div>
          {error&&<div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>}
          {loading?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i=><div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse"/>)}</div>:(
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {shown.map(p=>(
                <article key={p.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                  <img src={p.imageUrl||'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'} className="h-44 w-full object-cover" alt={p.name}/>
                  <div className="p-4">
                    <div className="flex justify-between gap-2"><h3 className="font-bold">{p.name}</h3><b className="text-[#ef4b24]">{money(p.price)}</b></div>
                    <p className="text-sm text-gray-500 mt-1 h-10 line-clamp-2">{p.description}</p>
                    <button disabled={!p.available} onClick={()=>add(p)} className="mt-3 w-full rounded-xl bg-[#fff1ec] text-[#ef4b24] py-2.5 font-bold disabled:opacity-40">{p.available?'Add to Cart':'Unavailable'}</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <CartSummary cart={cart} qty={qty} remove={id=>setCart(c=>c.filter(i=>i.id!==id))} subtotal={subtotal} fee={fee} total={total}/>
      </main>
    </div>
  )
}
