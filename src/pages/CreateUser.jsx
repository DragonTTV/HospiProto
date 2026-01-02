import React, { useState } from 'react'
import supabase from './../client'
const CreateUser = () => {
    const [formData, setFormData] = useState({
        email:'',
        password: '',
        full_name: ''
    })
    console.log(formData)

    function handleChange(event){
        setFormData((preData)=>{
            return{
                ...preData,
                [event.target.name]: event.target.value
            }
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const {data, error} = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            email_confirm: true,
            user_metadata:{
                full_name: formData.full_name
            }
        })
    }

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <input
            type='text'
            placeholder='Name'
            name='full_name'
            onChange={handleChange}
            />
            <input 
            type='email'
            placeholder='Email'
            name='email'
            onChange={handleChange}
            />
            <input 
            type='password'
            placeholder='Password'
            name='password'
            onChange={handleChange}
            />
            <button>Add User</button>
        </form>
    </div>
  )
}

export default CreateUser