import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:3000/api",
    withCredentials:true
})

export async function register({email,username,password}) {
    const res = await api.post("/auth/register",{email,username,password})
    return res.data
}
export async function login({email,password}) {
    const res = await api.post("/auth/login",{email,password})
    return res.data
}
export async function getMe() {
    const res = await api.get("/auth/getme")
    return res.data
}