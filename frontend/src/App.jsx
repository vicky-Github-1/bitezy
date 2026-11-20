import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './components/AuthPage'
import MenuPage from './pages/MenuPage'
import CheckoutPage from './pages/CheckoutPage'
import CustomerOrdersPage from './pages/CustomerOrdersPage'
import OwnerDashboard from './pages/OwnerDashboard'
import ProfilePage from './pages/ProfilePage'
import { getAuth } from './utils'

function Protected({role,redirect='/login',children}) {
  const auth=getAuth()
  const requested=window.location.pathname
  if(!auth?.token) return <Navigate to={redirect} replace state={{mode:'register',redirect:requested}}/>
  if(role && auth.role!==role) return <Navigate to={auth.role==='OWNER'?'/owner':'/menu'} replace/>
  return children
}

export default function App(){
  const auth=getAuth()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuPage/>}/>
        <Route path="/menu" element={<MenuPage/>}/>
        <Route path="/login" element={<AuthPage/>}/>
        <Route path="/checkout" element={<Protected role="CUSTOMER"><CheckoutPage/></Protected>}/>
        <Route path="/orders" element={<Protected role="CUSTOMER"><CustomerOrdersPage/></Protected>}/>
        <Route path="/profile" element={<Protected role="CUSTOMER"><ProfilePage/></Protected>}/>
        <Route path="/owner" element={<Protected role="OWNER"><OwnerDashboard/></Protected>}/>
        <Route path="*" element={<Navigate to={auth?.role==='OWNER'?'/owner':auth?'/menu':'/'} replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
