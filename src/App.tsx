import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { Dashboard } from './pages/Dashboard'
import { Submit } from './pages/Submit'
import { SubmitSuccess } from './pages/SubmitSuccess'
import { ArticleDetail } from './pages/ArticleDetail'
import { ArticleSearch } from './pages/ArticleSearch'
import { ReviewDashboard } from './pages/ReviewDashboard'
import { Review } from './pages/Review'
import { ReviewSuccess } from './pages/ReviewSuccess'
import { Profile } from './pages/Profile'
import { Login } from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminHome } from './pages/admin/AdminHome'
import { ContentModeration } from './pages/admin/ContentModeration'
import { UserManagement } from './pages/admin/UserManagement'
import { Analytics } from './pages/admin/Analytics'
import { Settings } from './pages/admin/Settings'
import { AdminLogin } from './pages/admin/AdminLogin'
import { RolesAndPermissions } from './pages/RolesAndPermissions'
import { AboutPage } from './pages/about/AboutPage'
import { TeamPage } from './pages/about/TeamPage'
import { WhitepaperPage } from './pages/about/WhitepaperPage'
import { ContactPage } from './pages/about/ContactPage'
import { HelmetProvider } from 'react-helmet-async'
import { AuthorDashboard } from './pages/AuthorDashboard'
import { SubmitRevision } from './pages/SubmitRevision'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { CookiePolicy } from './pages/CookiePolicy'
import { PrivacyCenter } from './pages/PrivacyCenter'
import { CookieConsentBanner } from './components/gdpr/CookieConsentBanner'
import './App.css'

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <NavBar />
            <main className="container mx-auto px-4 pt-1 pb-8">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/articles/search" element={<ArticleSearch />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/info" element={<AboutPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about/team" element={<TeamPage />} />
                <Route path="/about/whitepaper" element={<WhitepaperPage />} />
                <Route path="/about/contact" element={<ContactPage />} />
                <Route path="/articles/:id" element={<ArticleDetail />} />
                
                {/* GDPR routes - publicly accessible */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/privacy-center" element={<PrivacyCenter />} />
                <Route path="/legal" element={
                  <div className="max-w-4xl mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6 text-center">Legal Information</h1>
                    <p className="text-gray-600 mb-8 text-center">
                      This page contains important legal information about Researka, including our terms of service, copyright policies, and other legal notices.
                    </p>
                    
                    <section className="mb-8">
                      <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
                      <p className="text-gray-700 mb-4">
                        By using Researka, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-gray-700 mb-2">Last updated: March 15, 2025</p>
                        <p className="text-gray-700">
                          This is a placeholder for the full Terms of Service document. The complete terms will be provided here.
                        </p>
                      </div>
                    </section>
                    
                    <section className="mb-8">
                      <h2 className="text-2xl font-semibold mb-4">Copyright Policy</h2>
                      <p className="text-gray-700 mb-4">
                        Researka respects the intellectual property rights of others and expects its users to do the same.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-gray-700">
                          This is a placeholder for the full Copyright Policy document. The complete policy will be provided here.
                        </p>
                      </div>
                    </section>
                    
                    <section>
                      <h2 className="text-2xl font-semibold mb-4">Other Legal Notices</h2>
                      <ul className="list-disc pl-5 text-gray-700">
                        <li className="mb-2">Disclaimer of Warranties</li>
                        <li className="mb-2">Limitation of Liability</li>
                        <li className="mb-2">Governing Law</li>
                        <li className="mb-2">Dispute Resolution</li>
                      </ul>
                    </section>
                  </div>
                } />
                
                {/* Redirect route for the old review path */}
                <Route 
                  path="/articles/review" 
                  element={
                    <Navigate to="/review-dashboard" replace />
                  } 
                />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/submit" 
                  element={
                    <ProtectedRoute requiredRole="author">
                      <Submit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/submit/success" 
                  element={
                    <ProtectedRoute requiredRole="author">
                      <SubmitSuccess />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/submit/revision/:id" 
                  element={
                    <ProtectedRoute requiredRole="author">
                      <SubmitRevision />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/review-dashboard" 
                  element={
                    <ProtectedRoute>
                      <ReviewDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/author-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="author">
                      <AuthorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/review/:reviewId" 
                  element={
                    <ProtectedRoute>
                      <Review />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/review/success" 
                  element={
                    <ProtectedRoute>
                      <ReviewSuccess />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/roles" 
                  element={
                    <ProtectedRoute>
                      <RolesAndPermissions />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/governance" 
                  element={
                    <ProtectedRoute requiredRole="editor">
                      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-4">Governance Dashboard</h1>
                        <p className="text-gray-700 mb-4">
                          This page is only accessible to editors and administrators.
                        </p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin routes - using specialized AdminRoute component */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminHome />} />
                  <Route path="content" element={<ContentModeration />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Catch-all route for 404 */}
                <Route 
                  path="*" 
                  element={
                    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                      <p className="text-gray-700 mb-4">
                        The page you are looking for does not exist.
                      </p>
                    </div>
                  } 
                />
              </Routes>
            </main>
            <footer className="mt-12 py-6 border-t">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p> {new Date().getFullYear()} Researka - Decentralizing Academic Research</p>
              </div>
            </footer>
          </div>
          <CookieConsentBanner 
            privacyPolicyUrl="/privacy-policy"
            cookiePolicyUrl="/cookie-policy"
          />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
