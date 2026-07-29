import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import SeoHead from '../components/SeoHead';
import {
  FileText, PlusCircle, Edit, Trash2, Eye, Bell, ShieldCheck,
  LogOut, Upload, CheckCircle, AlertCircle, RefreshCw, BarChart2,
  Image as ImageIcon, Layers, User, X
} from 'lucide-react';

export default function AdminDashboard({ authState, setAuthState }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    subscribersCount: 0,
    totalViews: 0
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'

  // Post Form State
  const [editId, setEditId] = useState(null);
  const [postType, setPostType] = useState('image_text'); // 'text_only' | 'image_only' | 'image_text'
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('/assets/default-cover.svg');
  const [category, setCategory] = useState('Daily Reflection');
  const [tags, setTags] = useState('Reflection, Spiritual');
  const [status, setStatus] = useState('published');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Setup Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [name, setName] = useState(authState?.user?.display_name || '');
  const [role, setRole] = useState(authState?.user?.role || '');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    setAvatarError('');

    // 5MB Limit Enforcement (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAvatarError('File too large! Maximum allowed profile picture size is 5MB.');
      return;
    }

    setIsUploading(true);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(',')[1];
        
        const payload = {
          imageBase64: base64String,
          filename: file.name,
          mimeType: file.type
        };

        const res = await fetch('/api/auth/update-dp', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if ((data.success || data.avatar_url || data.avatar) && (data.avatar_url || data.avatar)) {
          const publicUrl = data.avatar_url || data.avatar;
          setProfileAvatar(publicUrl);
        } else {
          setAvatarError(data.error || data.message || 'Failed to upload profile picture to Supabase Storage.');
        }
      } catch (err) {
        setAvatarError('Error uploading profile picture file.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setAvatarError('Error reading file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (!authState?.authenticated || !authState?.secretVerified) {
      navigate('/cms-access');
      return;
    }

    loadAdminData();

    if (authState?.user) {
      if (!hasInitialized.current) {
        setName(authState.user.display_name || authState.user.name || '');
        setRole(authState.user.role || authState.user.title || '');
        setProfileAvatar(authState.user.avatar_url || authState.user.avatar || '');
        hasInitialized.current = true;
      }
      
      if (!authState.user.display_name || authState.user.isFirstTime) {
        setShowProfileModal(true);
      }
    }
  }, [authState, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, postsRes] = await Promise.all([
        fetchJson('/admin/stats'),
        fetchJson('/admin/posts')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (postsRes.success) setPosts(postsRes.posts);
    } catch (err) {
      console.error('Error loading CMS dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingProfile(true);
    setAvatarError('');
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          display_name: name.trim(),
          role: role.trim(),
          avatar_url: profileAvatar.trim()
        })
      });

      const data = await response.json();

      if (response.ok && (data.success || data.user)) {
        const updatedUser = data.user || {
          ...authState?.user,
          display_name: name.trim(),
          role: role.trim(),
          avatar_url: profileAvatar.trim()
        };
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }));
        setShowProfileModal(false);
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
      } else {
        const errorMsg = data.error || data.message || 'Failed to update profile in database.';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err) {
      console.error('Failed to save profile setup:', err);
      const errorMsg = err.message || 'Error communicating with profile server.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSavingProfile(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setPostType('image_text');
    setTitle('');
    setSummary('');
    setContent('');
    setCoverImage('/assets/default-cover.svg');
    setCategory('Daily Reflection');
    setTags('Daily Reflection, Spiritual');
    setStatus('published');
    setActiveTab('list');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(',')[1];
        const payload = {
          imageBase64: base64String,
          filename: file.name,
          mimeType: file.type
        };

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setCoverImage(data.url);
          setMessage({ type: 'success', text: 'Cover image uploaded successfully!' });
        } else {
          setMessage({ type: 'error', text: data.message || 'Image upload failed.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Error uploading image.' });
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Error reading file.' });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (postType === 'text_only' && (!title.trim() || !content.trim())) {
      setMessage({ type: 'error', text: 'Title and content are required for Text Only posts.' });
      return;
    }
    if (postType === 'image_only' && !coverImage) {
      setMessage({ type: 'error', text: 'Image upload is required for Picture Only posts.' });
      return;
    }
    if (postType === 'image_text' && (!title.trim() || !content.trim() || !coverImage)) {
      setMessage({ type: 'error', text: 'Title, content, and image are required for Picture + Text posts.' });
      return;
    }

    try {
      const payload = {
        postType,
        title,
        summary,
        content,
        coverImage,
        category,
        tags: tags.split(',').map(t => t.trim()),
        status
      };

      let res;
      if (editId) {
        res = await fetchJson(`/admin/posts/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchJson('/admin/posts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.success) {
        setMessage({
          type: 'success',
          text: editId
            ? 'Post updated successfully!'
            : 'Post published & Web Push Notification broadcasted to subscribers!'
        });
        loadAdminData();
        resetForm();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save post.' });
    }
  };

  const handleEditClick = (post) => {
    setEditId(post._id);
    setPostType(post.postType || 'image_text');
    setTitle(post.title || '');
    setSummary(post.summary || '');
    setContent(post.content || '');
    setCoverImage(post.coverImage || '');
    setCategory(post.category || 'Daily Reflection');
    setTags(Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '');
    setStatus(post.status || 'published');
    setActiveTab('create');
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this daily reflection?')) return;
    try {
      const res = await fetchJson(`/admin/posts/${id}`, { method: 'DELETE' });
      if (res.success) {
        setMessage({ type: 'success', text: 'Post deleted successfully.' });
        loadAdminData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete post.' });
    }
  };

  const handleLogout = async () => {
    try {
      await fetchJson('/auth/logout', { method: 'POST' });
    } catch (e) { }
    setAuthState({ authenticated: false, secretVerified: false, user: null });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-stone-100 pb-16">
      <SeoHead title="CMS Dashboard — Nur &amp; Hikmah" />

      {/* MINIMAL THEME HEADER */}
      <header className="bg-[#161b22] text-white border-b border-[#30363d] py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-amiri font-bold text-xl flex items-center justify-center">
              ن
            </div>
            <div>
              <h1 className="font-amiri text-xl sm:text-2xl font-bold text-amber-400">
                Admin CMS Portal
              </h1>
              <div className="flex items-center space-x-4 mt-0.5">
                <p className="text-[12px] text-stone-300 font-medium tracking-wide">
                  {authState?.user?.name || 'Authorized Admin'}
                </p>
                <button 
                  onClick={() => setShowProfileModal(true)} 
                  className="ml-4 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-md"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium text-stone-300 hover:text-amber-400 px-3 py-2 transition-colors"
            >
              Public Feed ↗
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 bg-[#21262d] hover:bg-red-950/60 text-stone-300 hover:text-red-300 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#30363d] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* POPUP NOTIFICATION MODAL */}
        {message.text && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center space-y-4">
                {message.type === 'success' ? (
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-2">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                )}
                <h3 className={`text-xl font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {message.type === 'success' ? 'Success!' : 'Error'}
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed pb-4">
                  {message.text}
                </p>
                <button 
                  onClick={() => setMessage({ type: '', text: '' })}
                  className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-stone-200 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UI CLEANUP: STREAMLINED STATS GRID (3 CLEAN REAL DATA METRICS) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Total Reflections</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-100 font-sans">{stats.totalPosts}</span>
              <span className="text-xs text-stone-400">({stats.publishedPosts} published / {stats.draftPosts} draft)</span>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Total Article Views</span>
              <BarChart2 className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-stone-100 font-sans">
              {stats.totalViews}
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Active Push Subscribers</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-stone-100 font-sans">
              {stats.subscribersCount}
            </p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4 flex-wrap gap-4">
          <div className="flex items-center space-x-2 bg-[#161b22] p-1.5 rounded-xl border border-[#30363d] overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'list' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-300 hover:text-white'
                }`}
            >
              All Posts ({posts.length})
            </button>
            <button
              onClick={() => { resetForm(); setActiveTab('create'); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'create' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-300 hover:text-white'
                }`}
            >
              {editId ? 'Editing Post' : '+ Create New Post'}
            </button>
          </div>

          <button
            onClick={loadAdminData}
            className="inline-flex items-center space-x-1.5 text-xs text-stone-300 hover:text-amber-400 bg-[#161b22] px-3 py-2 rounded-xl border border-[#30363d]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* TAB 1: ALL POSTS */}
        {activeTab === 'list' && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-200">
                <thead className="bg-[#21262d] text-stone-300 text-xs uppercase tracking-wider border-b border-[#30363d]">
                  <tr>
                    <th className="px-6 py-4">Title &amp; Type</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-stone-400">
                        No articles posted yet. Click "+ Create New Post" to write your first reflection!
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post._id} className="hover:bg-[#21262d]/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-stone-100">
                          <div>
                            {post.title || 'Visual Reflection'}
                            <div className="text-[11px] font-normal text-stone-400 capitalize mt-0.5">
                              Format: {post.postType?.replace('_', ' ') || 'picture + text'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-stone-300">
                          {post.category}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${post.status === 'published'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                            {post.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-stone-300">
                          {post.views || 0}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => window.open(`/post/${post.slug}`, '_blank')}
                            className="p-1.5 text-stone-400 hover:text-amber-400"
                            title="View Post"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(post)}
                            className="p-1.5 text-blue-400 hover:text-blue-300"
                            title="Edit Post"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-1.5 text-red-400 hover:text-red-300"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CREATE / EDIT POST */}
        {activeTab === 'create' && (
          <div className="bg-[#161b22] border border-[#30363d] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">

            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <h2 className="font-amiri text-2xl font-bold text-stone-100">
                {editId ? 'Edit Reflection' : 'Create Reflection'}
              </h2>
              <button onClick={resetForm} className="text-xs text-stone-400 hover:text-red-400">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-6">

              {/* Content Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  Select Post Content Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPostType('text_only')}
                    className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${postType === 'text_only'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                        : 'bg-[#0d1117] text-stone-300 border-[#30363d] hover:border-amber-500/50'
                      }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>1. Text Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostType('image_only')}
                    className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${postType === 'image_only'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                        : 'bg-[#0d1117] text-stone-300 border-[#30363d] hover:border-amber-500/50'
                      }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>2. Picture Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostType('image_text')}
                    className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${postType === 'image_text'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                        : 'bg-[#0d1117] text-stone-300 border-[#30363d] hover:border-amber-500/50'
                      }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>3. Picture + Text</span>
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              {postType !== 'image_only' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Excellence in Character (Husn al-Khuluq)..."
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Daily Reflection">Daily Reflection</option>
                      <option value="Quranic Insights">Quranic Insights</option>
                      <option value="Hadith Commentary">Hadith Commentary</option>
                      <option value="Islamic History">Islamic History</option>
                      <option value="Fiqh & Character">Fiqh &amp; Character</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Summary */}
              {postType !== 'image_only' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Summary / Excerpt (Used for previews &amp; Web Push)
                  </label>
                  <textarea
                    rows="2"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Short description..."
                    className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Image Upload */}
              {postType !== 'text_only' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Upload Picture *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-xs text-stone-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-stone-950 hover:file:opacity-90 cursor-pointer"
                      />
                      {uploadingImage && <span className="text-xs text-amber-400 animate-pulse">Uploading...</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Preview:
                    </label>
                    <div className="h-16 w-32 rounded-lg overflow-hidden border border-[#30363d] bg-[#161b22]">
                      {coverImage && <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Editor */}
              {postType !== 'image_only' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    Rich-Text Content (Manual Writing) *
                  </label>
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
              )}

              {/* Tags & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Reflection, Character"
                    className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Publish Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-stone-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="published">Published (Broadcast Push Notification)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#30363d] flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-[#30363d] text-xs font-semibold text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{editId ? 'Update Post' : 'Publish Post & Broadcast Push'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

      {/* STEP 1: FIRST-VISIT PROFILE SETUP MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161b22] border border-[#30363d] max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative space-y-6">

            {!!authState?.user?.display_name && !authState?.user?.isFirstTime && (
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-[#0d1117]"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-amiri text-2xl font-bold text-stone-100">
                Profile Setup
              </h3>
              <p className="text-xs text-stone-400">
                Configure your administrator profile details
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Display / Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Imran Ahmad"
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Admin Title / Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Scholar & Editor"
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Profile Picture / Display Photo (DP)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Max Limit: 5MB</span>
                </label>

                <div className="flex items-center space-x-3 bg-[#0d1117] border border-[#30363d] p-3 rounded-xl">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-900 border border-amber-500/40 shrink-0 flex items-center justify-center">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="Profile DP" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <input
                      type="text"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      placeholder="Image URL or upload file..."
                      className="w-full px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />

                    <label className={`inline-flex items-center space-x-1.5 px-3 py-1.5 ${isUploading ? 'bg-stone-800 text-stone-400 cursor-not-allowed border-stone-700' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 cursor-pointer border-amber-500/30'} text-xs font-semibold rounded-lg transition-colors border`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? "⏳ Uploading..." : "↑ Upload Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {avatarError && (
                  <p className="text-red-400 text-[11px] mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{avatarError}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm py-3 rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Profile...' : 'Save Profile Details'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
