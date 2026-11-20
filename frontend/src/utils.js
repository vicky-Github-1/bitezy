export const money=(value)=>`₹${Number(value||0).toLocaleString('en-IN')}`

export const getAuth=()=>JSON.parse(localStorage.getItem('bitezyAuth')||'null')

export const clearAuth=()=>localStorage.removeItem('bitezyAuth')
