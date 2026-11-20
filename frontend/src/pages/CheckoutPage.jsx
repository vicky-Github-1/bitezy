import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import api from '../api'
import Logo from '../components/Logo'
import { getAuth, money } from '../utils'

export default function CheckoutPage(){
  const navigate=useNavigate()
  const auth=getAuth()
  const cart=JSON.parse(localStorage.getItem('bitezyCart')||'[]')
  const savedProfile=JSON.parse(localStorage.getItem('bitezyProfile')||'{}')
  const [form,setForm]=useState({
    customerName:savedProfile.fullName||auth?.fullName||'',
    deliveryAddress:savedProfile.address||localStorage.getItem('bitezyAddress')||'',
    phoneNumber:savedProfile.phone||''
  })
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.quantity,0)
  const fee=subtotal>=499||!subtotal?0:40
  const total=subtotal+fee

  if(!cart.length)return <Navigate to="/menu" replace/>

  async function pay(e){
    e.preventDefault();setLoading(true);setError('')
    try{
      const items=cart.map(i=>({productId:i.id,quantity:i.quantity}))
      const {data:order}=await api.post('/orders',{...form,items})
      const {data:payment}=await api.post('/payment/create-order',{orderId:order.id})
      if(payment.mock){
        await api.post('/payment/verify',{orderId:String(order.id),razorpayOrderId:payment.razorpayOrderId,razorpayPaymentId:'mock_pay_'+Date.now(),razorpaySignature:'mock-development-payment'})
      }else{
        if(!window.Razorpay){
          await new Promise((resolve,reject)=>{
            const script=document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
            if(!script){
              const added=document.createElement('script')
              added.src='https://checkout.razorpay.com/v1/checkout.js'
              added.onload=resolve
              added.onerror=()=>reject(new Error('Razorpay Checkout could not load'))
              document.head.appendChild(added)
            }else{
              script.addEventListener('load',resolve,{once:true})
              script.addEventListener('error',()=>reject(new Error('Razorpay Checkout could not load')),{once:true})
            }
          })
        }
        await new Promise((resolve,reject)=>{
          if(!window.Razorpay)return reject(new Error('Razorpay Checkout could not load'))
          const checkout=new window.Razorpay({
            key:payment.keyId,
            amount:payment.amount,
            currency:'INR',
            name:'Bitezy',
            order_id:payment.razorpayOrderId,
            handler:resolve,
            modal:{ondismiss:()=>reject(new Error('Payment cancelled'))},
            prefill:{name:form.customerName,contact:form.phoneNumber}
          })
          checkout.open()
        }).then(r=>api.post('/payment/verify',{orderId:String(order.id),razorpayOrderId:r.razorpay_order_id,razorpayPaymentId:r.razorpay_payment_id,razorpaySignature:r.razorpay_signature}))
      }
      localStorage.removeItem('bitezyCart')
      navigate('/orders')
    }catch(e){setError(e.response?.data?.message||e.message||'Payment could not be completed')}
    finally{setLoading(false)}
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="h-[72px] bg-white border-b px-4 md:px-8 flex items-center"><Logo/><button onClick={()=>navigate('/menu')} className="ml-auto text-sm font-bold">Back to menu</button></header>
      <main className="max-w-5xl mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_340px] gap-6">
        <form onSubmit={pay} className="bg-white border rounded-2xl p-5 md:p-7">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          <label className="block mb-4 text-sm font-semibold">Customer name<input required value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} className="mt-1 w-full border rounded-xl px-3 py-3"/></label>
          <label className="block mb-4 text-sm font-semibold">Delivery address<textarea required rows="3" value={form.deliveryAddress} onChange={e=>setForm({...form,deliveryAddress:e.target.value})} className="mt-1 w-full border rounded-xl px-3 py-3"/></label>
          <label className="block mb-5 text-sm font-semibold">Phone number<input required inputMode="numeric" pattern="[0-9]{7,15}" minLength="7" maxLength="15" value={form.phoneNumber} onChange={e=>setForm({...form,phoneNumber:e.target.value.replace(/[^0-9]/g,'')})} className="mt-1 w-full border rounded-xl px-3 py-3"/></label>
          {error&&<div className="mb-4 rounded-xl bg-red-50 text-red-600 px-4 py-3">{error}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-[#ef4b24] text-white py-3 font-bold flex justify-center items-center gap-2"><CreditCard size={18}/>{loading?'Processing...':'Pay '+money(total)}</button>
        </form>
        <aside className="bg-white border rounded-2xl p-5 h-fit">
          <h2 className="font-bold mb-4">Order summary</h2>
          {cart.map(i=><div key={i.id} className="flex justify-between py-2 text-sm"><span>{i.quantity} × {i.name}</span><b>{money(i.price*i.quantity)}</b></div>)}
          <div className="border-t mt-3 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <div className="flex justify-between"><span>Delivery</span><b>{fee?money(fee):'FREE'}</b></div>
            <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>{money(total)}</span></div>
          </div>
        </aside>
      </main>
    </div>
  )
}
