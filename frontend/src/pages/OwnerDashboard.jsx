import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Package, Plus, UtensilsCrossed, X } from 'lucide-react'
import api from '../api'
import Logo from '../components/Logo'
import { clearAuth, money } from '../utils'

const categories=['Pizza','Burger','Biryani','Chinese','Beverages','Desserts']
const statuses=['PLACED','ACCEPTED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED']

export default function OwnerDashboard(){
  const navigate=useNavigate()
  const [tab,setTab]=useState('overview')
  const [stats,setStats]=useState({})
  const [products,setProducts]=useState([])
  const [orders,setOrders]=useState([])
  const [editing,setEditing]=useState(null)
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({name:'',description:'',price:'',category:'Pizza',imageUrl:'',available:true})

  async function load(){
    const [d,p,o]=await Promise.all([api.get('/owner/dashboard'),api.get('/products'),api.get('/owner/orders')])
    setStats(d.data);setProducts(p.data);setOrders(o.data)
  }
  useEffect(()=>{load()},[])
  function logout(){clearAuth();navigate('/login',{state:{mode:'login'}})}
  function open(product=null){
    setEditing(product?.id||null)
    setForm(product?{name:product.name,description:product.description,price:product.price,category:product.category,imageUrl:product.imageUrl,available:product.available}:{name:'',description:'',price:'',category:'Pizza',imageUrl:'',available:true})
    setModal(true)
  }
  async function save(e){
    e.preventDefault()
    await api[editing?'put':'post'](editing?`/owner/products/${editing}`:'/owner/products',form)
    setModal(false);load()
  }
  async function remove(id){if(confirm('Delete this food item?')){await api.delete(`/owner/products/${id}`);load()}}
  async function status(id,value){await api.put(`/owner/orders/${id}/status`,{status:value});load()}
  const links=[['overview','Overview',LayoutDashboard],['products','Food Management',UtensilsCrossed],['orders','Orders',Package]]

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex">
      <aside className="hidden md:flex w-60 bg-white border-r p-5 flex-col">
        <Logo/><nav className="mt-8 space-y-2">{links.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${tab===id?'bg-[#fff1ec] text-[#ef4b24]':'text-gray-500'}`}><Icon size={18}/>{label}</button>)}</nav>
        <button onClick={logout} className="mt-auto flex items-center gap-3 px-4 py-3 text-gray-500"><LogOut size={18}/>Logout</button>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="h-[72px] bg-white border-b px-5 flex items-center md:hidden"><Logo/><button onClick={logout} className="ml-auto"><LogOut size={18}/></button></header>
        <div className="md:hidden flex border-b bg-white">{links.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`flex-1 py-3 text-xs ${tab===id?'text-[#ef4b24] border-b-2 border-[#ef4b24]':''}`}>{label}</button>)}</div>
        <div className="p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-6">{tab==='overview'?'Dashboard':tab==='products'?'Food Management':'Orders'}</h1>
          {tab==='overview'&&<div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[
            ['Total Orders',stats.totalOrders||0,'text-gray-800'],['Pending Orders',stats.pendingOrders||0,'text-orange-500'],['Completed Orders',stats.completedOrders||0,'text-green-600'],['Total Revenue',money(stats.totalRevenue||0),'text-[#ef4b24]']
          ].map(([label,value,color])=><div key={label} className="bg-white border rounded-2xl p-5"><p className="text-sm text-gray-500">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></div>)}</div>}
          {tab==='products'&&<>
            <div className="flex justify-end mb-4"><button onClick={()=>open()} className="bg-[#ef4b24] text-white px-4 py-2.5 rounded-xl font-bold"><Plus size={17} className="inline mr-1"/>Add Food</button></div>
            <div className="bg-white border rounded-2xl overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr>{['Food','Category','Price','Available','Actions'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt=""/><b>{p.name}</b></div></td><td className="px-4 py-3">{p.category}</td><td className="px-4 py-3">{money(p.price)}</td><td className="px-4 py-3"><span className={p.available?'text-green-600':'text-red-500'}>{p.available?'Available':'Unavailable'}</span></td><td className="px-4 py-3"><button onClick={()=>open(p)} className="text-blue-600 mr-3">Edit</button><button onClick={()=>remove(p.id)} className="text-red-500">Delete</button></td></tr>)}</tbody></table></div>
          </>}
          {tab==='orders'&&<div className="bg-white border rounded-2xl overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr>{['Order','Customer','Items','Total','Payment','Status'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{orders.map(o=><tr key={o.id} className="border-t"><td className="px-4 py-3 font-bold">#{o.id}</td><td className="px-4 py-3"><b>{o.customerName}</b><p className="text-xs text-gray-400">{o.phoneNumber}</p></td><td className="px-4 py-3">{o.items.reduce((n,i)=>n+i.quantity,0)}</td><td className="px-4 py-3 font-bold">{money(o.totalAmount)}</td><td className="px-4 py-3 text-green-600">{o.paymentStatus}</td><td className="px-4 py-3"><select value={o.status} onChange={e=>status(o.id,e.target.value)} className="border rounded-lg px-2 py-2">{statuses.map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>}
        </div>
      </main>
      {modal&&<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><form onSubmit={save} className="w-full max-w-lg bg-white rounded-2xl p-6"><div className="flex justify-between"><h2 className="font-bold text-xl">{editing?'Edit Food':'Add Food'}</h2><button type="button" onClick={()=>setModal(false)}><X/></button></div><div className="mt-5 space-y-3"><input required placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-xl px-3 py-2.5"/><textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border rounded-xl px-3 py-2.5"/><div className="grid grid-cols-2 gap-3"><input required type="number" min="1" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="border rounded-xl px-3 py-2.5"/><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="border rounded-xl px-3 py-2.5">{categories.map(c=><option key={c}>{c}</option>)}</select></div><input placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} className="w-full border rounded-xl px-3 py-2.5"/><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})}/>Available</label></div><button className="mt-5 w-full bg-[#ef4b24] text-white py-3 rounded-xl font-bold">Save Food</button></form></div>}
    </div>
  )
}
