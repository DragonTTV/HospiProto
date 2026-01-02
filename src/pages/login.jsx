import React from 'react'
import { useState } from 'react'
import supabase from '../client'

const Login = () => {
  
    const [formdata, setFormData] = useState({email: '', password: ''})
  
    console.log(formdata)

    function handleChange(event){
        setFormData((prevFormData)=>{
        return{
            ...prevFormData,
            [event.target.name]:event.target.value
            }
        })
    }

  async function handleLogin(e) {
    try{
        e.preventDefault()
    const {data, error} = await supabase.auth.signInWithPassword({
      email: formdata.email,
      password: formdata.password
    })
    if (error) throw error
    }catch(error){
        console.log(error)
    }
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input type='email' placeholder='abc@gmail.com' name='email' onChange={handleChange}/>   
        <input type='password' placeholder='****' name='password' onChange={handleChange}/> 
        <button>Login</button>
      </form>      
    </div>
    
  )
  
}

export default Login