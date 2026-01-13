import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import './styles/App.css'
import AuthCallback from './components/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import PageLoader from './components/common/PageLoader'
import useAppBootstrap from './hooks/useAppBootstrap'

const LandingPage = lazy(() => import('./pages/home'))
const Home = lazy(() => import('./pages/home'))
const Login = lazy(() => import('./pages/login'))
const LoginWithWallet = lazy(() => import('./pages/loginSteps'))
const SignUpStep = lazy(() => import('./pages/SignUpStep'))
const SignUpStep2 = lazy(() => import('./pages/signUpStep2'))
const LoginScanStep = lazy(() => import('./pages/LoginScanStep'))
const Faq = lazy(() => import('./pages/FAQ'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const RawPreview = lazy(() => import('./pages/credential-raw'))
const Resume = lazy(() => import('./pages/resume'))
const ImportPage = lazy(() => import('./pages/importPage'))
const ResumeUploadPage = lazy(() => import('./pages/ResumeUploadPage'))
const PreviewPage = lazy(() => import('./pages/PreviewPage'))
const PreviewPageFromDrive = lazy(() => import('./pages/PreviewPageFromDrive'))
const MyResumes = lazy(() => import('./components/MyResumes'))
const RecommendationPage = lazy(() => import('./pages/RecommendationPage'))
const Error404 = lazy(() => import('./pages/error404'))

const App = () => {
  useAppBootstrap()

  return (
    <Router>
      <Suspense fallback={<PageLoader minHeight='60vh' message='Loading page...' />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path='/home' element={<Home />} />
            <Route path='/auth/callback' element={<AuthCallback />} />
            <Route path='/login' element={<Login />} />
            <Route path='/login/wallet' element={<LoginWithWallet />} />
            <Route path='/login/Wallet' element={<LoginWithWallet />} />
            <Route path='/signup' element={<SignUpStep />} />
            <Route path='/SignUp2' element={<SignUpStep2 />} />
            <Route path='/login-scan' element={<LoginScanStep />} />
            <Route path='/faq' element={<Faq />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/credential-raw/*' element={<RawPreview />} />
            <Route element={<ProtectedRoute />}>
              <Route path='/resume/new' element={<Resume />} />
              <Route path='/resume/import' element={<ImportPage />} />
              <Route path='/resume/upload' element={<ResumeUploadPage />} />
              <Route path='/resume/view' element={<PreviewPage />} />
              <Route path='/resume/view/:id' element={<PreviewPageFromDrive />} />
              <Route path='/myresumes' element={<MyResumes />} />
            </Route>
            <Route path='/resume/recommend/:id' element={<RecommendationPage />} />
            <Route path='*' element={<Error404 />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
