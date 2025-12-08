import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAuth } from '../redux/slices/auth'
import { handleRedirect } from '../tools/auth'

const AuthCallback = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    handleRedirect({
      navigate,
      onAuthSuccess: (accessToken: string) => {
        dispatch(setAuth({ accessToken }))
      }
    })
  }, [navigate, dispatch])

  return <div>Processing login...</div>
}

export default AuthCallback
