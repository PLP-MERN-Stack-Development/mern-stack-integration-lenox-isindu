import { useAuth } from '../context/AuthContext';

const Layout = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const handleTabClick = (tab) => {
    onTabChange(tab);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><button onClick={() => handleTabClick('posts')} className={activeTab === 'posts' ? 'active' : ''}>Posts</button></li>
              <li><button onClick={() => handleTabClick('analytics')} className={activeTab === 'analytics' ? 'active' : ''}>Analytics</button></li>
              <li><button onClick={() => handleTabClick('settings')} className={activeTab === 'settings' ? 'active' : ''}>Settings</button></li>
            </ul>
          </div>
          <a className="btn btn-ghost text-xl gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-content font-bold">B</span>
            </div>
            BlogSpace
          </a>
        </div>
        
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <button 
                onClick={() => handleTabClick('posts')} 
                className={activeTab === 'posts' ? 'font-semibold text-primary' : ''}
              >
                Posts
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleTabClick('analytics')} 
                className={activeTab === 'analytics' ? 'font-semibold text-primary' : ''}
              >
                Analytics
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleTabClick('settings')} 
                className={activeTab === 'settings' ? 'font-semibold text-primary' : ''}
              >
                Settings
              </button>
            </li>
          </ul>
        </div>
        
        <div className="navbar-end">
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <span className="font-bold">{user.username?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a className="justify-between">
                    Profile
                  </a>
                </li>
                <li><button onClick={() => handleTabClick('settings')}>Settings</button></li>
                <li><button onClick={logout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <a className="btn btn-primary">Get Started</a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-base-300 text-base-content">
  <aside>
    <p>Copyright © 2025 - All right reserved by BlogSpace Ltd</p>
  </aside>
</footer>
    </div>
  );
};

export default Layout;