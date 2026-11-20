import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronRight, PackageCheck, ShoppingBag, UserCircle } from 'lucide-react'
import api from '../api'
import Logo from '../components/Logo'
import { money } from '../utils'

export default function CustomerOrdersPage(){
  const navigate=useNavigate()
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{
    api.get('/orders/my-orders')
      .then(r=>setOrders(Array.isArray(r.data)?r.data:[]))
      .catch(e=>setError(e.response?.data?.message||'Could not load orders'))
      .finally(()=>setLoading(false))
  },[])
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="h-[72px] bg-white border-b px-4 md:px-8 flex items-center">
        <Logo/>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={()=>navigate('/menu')} className="font-bold text-[#ef4b24]">Browse menu</button>
          <button onClick={()=>navigate('/profile')} title="Profile" className="w-10 h-10 rounded-full bg-orange-50 text-[#ef4b24] flex items-center justify-center"><UserCircle size={19}/></button>
        </div>
      </header>
      <main className="max-w-[1380px] mx-auto p-4 md:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#ef4b24]">Your purchases</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">My Orders</h1>
          </div>
          {!loading&&!error&&orders.length>0&&<span className="rounded-full bg-white border px-4 py-2 text-sm font-semibold text-gray-500">{orders.length} order{orders.length>1?'s':''}</span>}
        </div>
        {loading?<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(i=><div key={i} className="h-72 animate-pulse rounded-3xl border bg-gray-100"/>)}</div>:error?<div className="bg-red-50 text-red-600 border rounded-2xl p-5">{error}</div>:orders.length===0?<div className="rounded-3xl border bg-white p-12 text-center"><ShoppingBag className="mx-auto mb-3 text-gray-300" size={44}/><h2 className="text-lg font-bold">No orders yet</h2><p className="mt-1 text-sm text-gray-500">Browse the menu and place your first order.</p><button onClick={()=>navigate('/menu')} className="mt-5 rounded-xl bg-[#ef4b24] px-5 py-3 text-sm font-bold text-white">Browse Menu</button></div>:(
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{orders.map(o=>{
            const statusColors={
              PLACED:'bg-blue-50 text-blue-700',
              ACCEPTED:'bg-orange-50 text-orange-700',
              PREPARING:'bg-amber-50 text-amber-700',
              OUT_FOR_DELIVERY:'bg-violet-50 text-violet-700',
              DELIVERED:'bg-green-50 text-green-700',
              CANCELLED:'bg-red-50 text-red-700'
            }
            const items=o.items||[]
            const itemCount=items.reduce((count,item)=>count+(item.quantity||0),0)
            return (
              <article key={o.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between border-b bg-[#fffaf8] px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">ORDER</p>
                    <h2 className="font-bold text-gray-900">#{o.id}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusColors[o.status]||'bg-gray-100 text-gray-700'}`}>{o.status?.replaceAll('_',' ')}</span>
                </div>
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={15}/>{o.createdAt?new Date(o.createdAt).toLocaleString([],{dateStyle:'medium',timeStyle:'short'}):'Date unavailable'}
                  </div>
                  <div className="min-h-[105px] space-y-3">
                    {items.slice(0,3).map(item=>(
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.product?.imageUrl||'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120'} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover"/>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-800">{item.product?.name||'Food item'}</p>
                          <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold">{money(item.unitPrice*item.quantity)}</span>
                      </div>
                    ))}
                    {items.length>3&&<p className="text-xs font-semibold text-[#ef4b24]">+{items.length-3} more items</p>}
                  </div>
                  <div className="mt-5 border-t pt-4">
                    <div className="mb-3 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500"><PackageCheck size={14}/>{itemCount} item{itemCount!==1?'s':''}</span>
                      <span className="font-bold text-green-600">{o.paymentStatus}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div><p className="text-xs text-gray-400">Total paid</p><p className="text-xl font-bold text-[#ef4b24]">{money(o.totalAmount)}</p></div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1ec] text-[#ef4b24]"><ChevronRight size={18}/></span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}</div>
        )}
      </main>
    </div>
  )
}
