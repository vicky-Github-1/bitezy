import { ChevronRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { money } from '../utils'

export default function CartSummary({cart,qty,remove,subtotal,fee,total}) {
  const navigate=useNavigate()
  return (
    <aside className="lg:sticky lg:top-[96px] h-fit bg-white border rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2"><ShoppingBag size={20}/>My Cart</h2>
        <span className="text-xs bg-orange-50 text-[#ef4b24] px-2 py-1 rounded-full">{cart.length} items</span>
      </div>
      {cart.length===0 ? (
        <div className="py-12 text-center text-gray-400"><ShoppingBag className="mx-auto mb-3" size={36}/>Your cart is empty</div>
      ) : (
        <div className="max-h-[280px] overflow-y-auto divide-y">
          {cart.map(item=>(
            <div key={item.id} className="py-3 flex gap-3">
              <img src={item.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover"/>
              <div className="flex-1">
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-[#ef4b24] text-sm">{money(item.price)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={()=>qty(item.id,-1)} className="w-6 h-6 border rounded"><Minus size={12}/></button>
                  <span className="text-sm">{item.quantity}</span>
                  <button onClick={()=>qty(item.id,1)} className="w-6 h-6 border rounded"><Plus size={12}/></button>
                </div>
              </div>
              <button onClick={()=>remove(item.id)} className="text-gray-300"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}
      <div className="border-t mt-3 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><b>{money(subtotal)}</b></div>
        <div className="flex justify-between text-gray-500"><span>Delivery fee</span><b>{fee?money(fee):'FREE'}</b></div>
        <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>{money(total)}</span></div>
      </div>
      <button disabled={!cart.length} onClick={()=>navigate('/checkout')} className="mt-4 w-full rounded-xl bg-[#ef4b24] text-white py-3 font-bold disabled:opacity-40">
        Go to Checkout <ChevronRight size={17} className="inline"/>
      </button>
    </aside>
  )
}
