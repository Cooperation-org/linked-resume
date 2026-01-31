import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from './redux/store'
import { fetchVCs } from './redux/slices/vc'
import { setAuth } from './redux/slices/auth'
import { authService } from './services/authService'
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
import RecommendationPage from './pages/RecommendationPage'
import VerificationPage from './pages/VerificationPage'

const App = () => {
  const dispatch: AppDispatch = useDispatch()
  useEffect(() => {
    ;(async () => {
      await getOrCreateAppInstanceDid()
    })()
  }, [])

  useEffect(() => {
    // Setup StorageService token update callback
    const storageService = StorageService.getInstance()
    storageService.setTokenUpdateCallback((accessToken: string) => {
      dispatch(setAuth({ accessToken }))
    })

    // Subscribe to AuthService token updates
    const unsubscribe = authService.onTokenUpdate((token) => {
      dispatch(setAuth({ accessToken: token }))
    })

    // Initialize auth on app load
    const initializeAuth = async () => {
      // Try to get valid token (will refresh if needed)
      const token = await authService.getValidAccessToken()
      dispatch(setAuth({ accessToken: token }))
    }

    initializeAuth()
    dispatch(fetchVCs())

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
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
            <Route path='/myresumes' element={<MyResumes />} />
          </Route>
          {/* Public routes - accessible without authentication */}
          <Route path='/resume/view/:id' element={<PreviewPageFromDrive />} />
          <Route path='/resume/recommend/:id' element={<RecommendationPage />} />
          <Route path='/verify/:id' element={<VerificationPage />} />
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
