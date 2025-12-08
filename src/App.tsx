import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from './redux/store'
import { fetchVCs } from './redux/slices/vc'
import { setAuth } from './redux/slices/auth'
import { refreshAccessToken } from './tools/auth'
import { getLocalStorage } from './tools/cookie'
import StorageService from './storage-singlton'
import Layout from './components/Layout'
import Login from './pages/login'
import Home from './pages/home'
import Resume from './pages/resume'
import ImportPage from './pages/importPage'
import ResumeUploadPage from './pages/ResumeUploadPage'
import Error404 from './pages/error404'
import LandingPage from './pages/allskillscoun-org'
import './styles/App.css'
import AuthCallback from './components/AuthCallback'
import LoginWithWallet from './pages/loginSteps'
import MyResumes from './components/MyResumes'
import PreviewPage from './pages/PreviewPage'
import SignUpStep from './pages/SignUpStep'
import LoginScanStep from './pages/LoginScanStep'
import Faq from './pages/FAQ'
import SignUpStep2 from './pages/signUpStep2'
import PreviewPageFromDrive from './pages/PreviewPageFromDrive'
import RawPreview from './pages/credential-raw'
import PrivacyPolicy from './pages/PrivacyPolicy'
import { getOrCreateAppInstanceDid } from '@cooperation/vc-storage'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const dispatch: AppDispatch = useDispatch()
  useEffect(() => {
    ;(async () => {
      await getOrCreateAppInstanceDid()
    })()
  }, [])

  useEffect(() => {
    const storageService = StorageService.getInstance()
    storageService.setTokenUpdateCallback((accessToken: string) => {
      dispatch(setAuth({ accessToken }))
    })
    const initializeAuth = async () => {
      const accessToken = getLocalStorage('auth')
      const refreshToken = getLocalStorage('refresh_token')
      if (refreshToken && !accessToken) {
        try {
          console.log(
            'Access token missing but refresh token found. Attempting to refresh...'
          )
          await refreshAccessToken(refreshToken, (token: string) => {
            dispatch(setAuth({ accessToken: token }))
          })
        } catch (error) {
          console.error('Failed to refresh token on app startup:', error)
        }
      }
    }

    initializeAuth()
    dispatch(fetchVCs())
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/auth/callback' element={<AuthCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/resume/new' element={<Resume />} />
            <Route path='/resume/import' element={<ImportPage />} />
            <Route path='/resume/upload' element={<ResumeUploadPage />} />
            <Route path='/resume/view' element={<PreviewPage />} />
            <Route path='/resume/view/:id' element={<PreviewPageFromDrive />} />
            <Route path='/myresumes' element={<MyResumes />} />
          </Route>
          <Route path='*' element={<Error404 />} />
        </Route>
        {/* Landing page outside of Layout */}
        <Route path='/login' element={<Login />} />
        <Route path='/login/Wallet' element={<LoginWithWallet />} />
        <Route path='/' element={<LandingPage />} />
        <Route path='/signup' element={<SignUpStep />} />
        <Route path='/login-scan' element={<LoginScanStep />} />
        <Route path='/faq' element={<Faq />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/SignUp2' element={<SignUpStep2 />} />
        <Route path='/credential-raw/*' element={<RawPreview />} />
      </Routes>
    </Router>
  )
}

export default App
