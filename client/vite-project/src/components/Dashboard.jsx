import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import PostForm from './PostForm';
import Layout from './Layout';
import PasswordChangeForm from './PasswordChangeForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [blog, setBlog] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchBlogAndPosts();
  }, []);

  const fetchBlogAndPosts = async () => {
    try {
      const postsResponse = await API.get('/posts');
      if (postsResponse.data?.posts) {
        setPosts(postsResponse.data.posts);
        setBlog(postsResponse.data.blog);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await API.delete(`/posts/${postId}`);
      fetchBlogAndPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteAccount = async () => {
  if (!window.confirm('Are you absolutely sure? This will permanently delete your account and all posts!')) return;
  
  try {
    await API.delete('/auth/account'); 
    logout();
    window.location.href = '/';
  } catch (error) {
    alert('Failed to delete account: ' + (error.response?.data?.error || error.message));
  }
};

  const handleEditPost = (post) => {
    //  edit implementation 
    const newTitle = prompt('Enter new title:', post.title);
    const newContent = prompt('Enter new content:', post.content);
    
    if (newTitle && newContent) {
      const updatedPosts = posts.map(p => 
        p._id === post._id 
          ? { ...p, title: newTitle, content: newContent }
          : p
      );
      setPosts(updatedPosts);
      alert('Post updated! (Backend integration coming soon)');
    }
  };

  if (loading) {
    return (
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {/*  Only show on Posts tab */}
      {activeTab === 'posts' && (
        <div className="hero bg-base-200 rounded-3xl mb-8 p-8">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold">Welcome to Your Blog</h1>
              <p className="py-6 text-xl">
                Share your stories with the world. Create, publish, and grow your audience.
              </p>
              <button 
                onClick={() => setShowPostForm(true)}
                className="btn btn-primary btn-lg gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {/* Stats  */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <div className="stat bg-base-100 rounded-2xl shadow-lg">
              <div className="stat-figure text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="stat-title">Total Posts</div>
              <div className="stat-value text-primary">{posts.length}</div>
              <div className="stat-desc">Your published content</div>
            </div>
            
            <div className="stat bg-base-100 rounded-2xl shadow-lg">
              <div className="stat-figure text-secondary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="stat-title">Your Blog</div>
              <div className="stat-value text-secondary">{blog?.name?.split(' ')[0] || 'Blog'}</div>
              <div className="stat-desc">{blog?.subdomain}.blogspace.com</div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Your Posts</h2>
              <button 
                onClick={() => setShowPostForm(true)}
                className="btn btn-primary gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16 bg-base-100 rounded-3xl shadow-lg">
                <div className="text-8xl mb-4"></div>
                <h3 className="text-2xl font-bold mb-4">No posts yet</h3>
                <p className="text-lg opacity-70 mb-6">Start your blogging journey by creating your first post</p>
                <button 
                  onClick={() => setShowPostForm(true)}
                  className="btn btn-primary btn-lg gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div key={post._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    {/* Image Section */}
                    <figure className="px-4 pt-4">
                      {post.featuredImage ? (
                        <img 
                          src={post.featuredImage} 
                          alt={post.title}
                          className="rounded-2xl h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="rounded-2xl h-48 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-4xl"></span>
                        </div>
                      )}
                    </figure>
                    
                    {/* Content Section */}
                    <div className="card-body p-4">
                      <h3 className="card-title line-clamp-2">{post.title}</h3>
                      <p className="opacity-70 line-clamp-3">{post.content}</p>
                      
                      <div className="flex justify-between items-center mt-4 text-sm opacity-60">
                        <div className="flex items-center gap-2">
                          <div className="avatar">
                            <div className="w-6 rounded-full bg-primary text-primary-content flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {post.author?.username?.charAt(0) || user?.username?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <span>{post.author?.username || user?.username}</span>
                        </div>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="card-actions justify-end mt-4">
                        <button 
                          onClick={() => handleEditPost(post)}
                          className="btn btn-sm btn-outline btn-primary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deletePost(post._id)}
                          className="btn btn-sm btn-outline btn-error"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-base-100 rounded-3xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Blog Analytics</h2>
            
            {/* Simple Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="stat bg-base-200 rounded-2xl">
                <div className="stat-figure text-primary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="stat-title">Total Posts</div>
                <div className="stat-value text-primary">{posts.length}</div>
                <div className="stat-desc">All time publications</div>
              </div>
              
              <div className="stat bg-base-200 rounded-2xl">
                <div className="stat-figure text-secondary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="stat-title">Your Blog</div>
                <div className="stat-value text-secondary">{blog?.name?.split(' ')[0] || 'Blog'}</div>
                <div className="stat-desc">{blog?.subdomain}.blogspace.com</div>
              </div>
            </div>

            {/* Weekly Trajectory */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Weekly Activity</h3>
              <div className="bg-base-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">Posting Trend</h4>
                    <p className="text-sm opacity-70">This week vs last week</p>
                  </div>
                  <div className={`badge ${posts.length > 0 ? 'badge-success' : 'badge-warning'}`}>
                    {posts.length > 0 ? 'Active' : 'No Posts'}
                  </div>
                </div>
                
                {/* trend visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span className="font-semibold">{posts.length} posts</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={posts.length} 
                    max="10"
                  ></progress>
                  
                  <div className="flex justify-between text-sm mt-4">
                    <span>Last Week</span>
                    <span className="font-semibold">0 posts</span>
                  </div>
                  <progress 
                    className="progress progress-secondary w-full" 
                    value="0" 
                    max="10"
                  ></progress>
                </div>
                
                <div className="mt-4 text-center">
                  {posts.length > 0 ? (
                    <div className="text-success font-semibold">
                      ↗ You're posting regularly!
                    </div>
                  ) : (
                    <div className="text-warning">
                      Start writing to see your activity trend
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
  <div className="bg-base-100 rounded-3xl shadow-lg p-8">
    <h2 className="text-3xl font-bold mb-6">Account Settings</h2>
    
    <div className="space-y-8 max-w-2xl">
      {/* Password Change */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Change Password</h3>
        <PasswordChangeForm />
      </div>

      <div className="divider"></div>

      {/* User information */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Profile Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Username</span>
            </label>
            <div className="p-3 bg-base-200 rounded-lg border border-base-300">
              <span className="font-medium">{user?.username}</span>
            </div>
            <label className="label">
              <span className="label-text-alt text-warning">Username cannot be changed</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <div className="p-3 bg-base-200 rounded-lg border border-base-300">
              <span className="font-medium">{user?.email}</span>
            </div>
            <label className="label">
              <span className="label-text-alt text-warning">Email cannot be changed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="divider"></div>
      
      <div className="bg-error/10 border border-error/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-error mb-4">warning! </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Delete Account</h4>
              <p className="text-sm opacity-70">Permanently delete your account, blog, and all posts</p>
            </div>
            <button 
              onClick={() => document.getElementById('delete_modal').showModal()}
              className="btn btn-error btn-outline"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Delete Account  */}
    <dialog id="delete_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Delete Your Account?</h3>
        <p className="py-4">This action cannot be undone. All your posts and data will be permanently deleted.</p>
        <div className="modal-action">
          <form method="dialog" className="space-x-2">
            <button className="btn btn-ghost">Cancel</button>
            <button 
              onClick={deleteAccount}
              className="btn btn-error"
            >
              Yes, Delete My Account
            </button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
)}
      {/* Post Form  */}
      {showPostForm && (
        <PostForm 
          onClose={() => setShowPostForm(false)}
          onPostCreated={fetchBlogAndPosts}
        />
      )}
    </Layout>
  );
};

export default Dashboard;