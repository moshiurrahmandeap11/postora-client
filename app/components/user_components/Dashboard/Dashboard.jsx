"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiBell,
    FiEye,
    FiFileText,
    FiImage,
    FiMenu,
    FiMessageCircle,
    FiSettings,
    FiUsers
} from "react-icons/fi";
import axiosInstance from "../../contexts/AxiosInstance/AxiosInstance";
import Sidebar from "./Sidebar/Sidebar";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  
  // রিয়েল ডাটা স্টেট
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [media, setMedia] = useState([]);
  const [videos, setVideos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    monthlyGrowth: 0
  });

  // ইউজার ডাটা লোড
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("user");
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } else {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      router.push("/signin");
    }
  }, [router]);

  // সব ডাটা ফেচ করার ফাংশন
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // সমান্তরালে সব API কল
        const [
          usersRes,
          blogsRes,
          mediaRes,
          videosRes,
          messagesRes,
          analyticsRes
        ] = await Promise.allSettled([
          axiosInstance.get("/users"),
          axiosInstance.get("/blogs"),
          axiosInstance.get("/media"),
          axiosInstance.get("/videos"),
          axiosInstance.get("/messages"),
          axiosInstance.get("/analytics")
        ]);

        // ইউজার ডাটা
        if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
          setUsers(usersRes.value.data.data);
        }

        // ব্লগ ডাটা
        if (blogsRes.status === 'fulfilled' && blogsRes.value.data.success) {
          setBlogs(blogsRes.value.data.data);
        }

        // মিডিয়া ডাটা
        if (mediaRes.status === 'fulfilled' && mediaRes.value.data.success) {
          setMedia(mediaRes.value.data.data);
        }

        // ভিডিও ডাটা
        if (videosRes.status === 'fulfilled' && videosRes.value.data.success) {
          setVideos(videosRes.value.data.data);
        }

        // মেসেজ ডাটা
        if (messagesRes.status === 'fulfilled' && messagesRes.value.data.success) {
          setMessages(messagesRes.value.data.data);
        }

        // অ্যানালিটিক্স ডাটা
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
          setAnalytics(analyticsRes.value.data.data);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  // মেনু আইটেম ক্লিক হ্যান্ডলার
  const handleMenuItemClick = (item) => {
    setActiveItem(item.id);
  };

  // লোডিং স্টেট
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // এডমিন না হলে এক্সেস ডিনাই
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is admin dashboard. You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 bg-gray-50 dark:bg-gray-900 flex">
      
      {/* সাইডবার কম্পোনেন্ট */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onMenuItemClick={handleMenuItemClick}
      />

      {/* মূল কন্টেন্ট */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* টপ বার */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {activeItem} Dashboard
          </h1>
          
          <div className="flex-1 flex items-center justify-end space-x-4">
            {/* নোটিফিকেশন - রিয়েল আনরিড কাউন্ট */}
            <button className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <FiBell className="w-5 h-5" />
              {messages.filter(m => !m.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {messages.filter(m => !m.isRead).length}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* পেজ কন্টেন্ট - রিয়েল ডাটা প্রপস হিসেবে পাঠানো */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeItem === 'dashboard' && (
            <DashboardContent 
              user={user}
              users={users}
              blogs={blogs}
              media={media}
              videos={videos}
              messages={messages}
              analytics={analytics}
            />
          )}
          {activeItem === 'users' && (
            <UsersContent 
              users={users}
              onUserUpdate={setUsers}
            />
          )}
          {activeItem === 'blogs' && (
            <BlogsContent 
              blogs={blogs}
              onBlogUpdate={setBlogs}
            />
          )}
          {activeItem === 'media' && (
            <MediaContent 
              media={media}
              onMediaUpdate={setMedia}
            />
          )}
          {activeItem === 'videos' && (
            <VideosContent 
              videos={videos}
              onVideoUpdate={setVideos}
            />
          )}
          {activeItem === 'messages' && (
            <MessagesContent 
              messages={messages}
              onMessageUpdate={setMessages}
            />
          )}
          {activeItem === 'analytics' && (
            <AnalyticsContent 
              analytics={analytics}
              blogs={blogs}
              users={users}
            />
          )}
          {activeItem === 'settings' && (
            <SettingsContent 
              user={user}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// ==================== ড্যাশবোর্ড কন্টেন্ট ====================
const DashboardContent = ({ user, users, blogs, media, videos, messages, analytics }) => {
  
  // রিয়েল ডাটা থেকে ক্যালকুলেশন
  const stats = [
    { 
      label: 'Total Users', 
      value: users.length.toLocaleString(), 
      change: `+${calculateGrowth(users)}%`, 
      icon: FiUsers, 
      color: 'blue' 
    },
    { 
      label: 'Total Blogs', 
      value: blogs.length.toLocaleString(), 
      change: `+${calculateGrowth(blogs)}%`, 
      icon: FiFileText, 
      color: 'green' 
    },
    { 
      label: 'Total Views', 
      value: analytics.totalViews?.toLocaleString() || '0', 
      change: `+${analytics.monthlyGrowth || 0}%`, 
      icon: FiEye, 
      color: 'purple' 
    },
    { 
      label: 'Comments', 
      value: messages.filter(m => m.type === 'comment').length.toLocaleString(), 
      change: '+5%', 
      icon: FiMessageCircle, 
      color: 'orange' 
    },
  ];

  // রিসেন্ট অ্যাক্টিভিটি
  const recentActivities = [
    ...users.slice(0, 2).map(u => ({
      type: 'user',
      text: `New user registered: ${u.name}`,
      time: new Date(u.created_at).toLocaleDateString(),
      icon: 'user'
    })),
    ...blogs.slice(0, 2).map(b => ({
      type: 'blog',
      text: `New blog published: ${b.title}`,
      time: new Date(b.created_at).toLocaleDateString(),
      icon: 'blog'
    })),
    ...messages.slice(0, 2).map(m => ({
      type: 'message',
      text: m.subject || 'New message received',
      time: new Date(m.created_at).toLocaleDateString(),
      icon: 'message'
    }))
  ].slice(0, 4);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your platform today.
        </p>
      </div>
      
      {/* স্ট্যাটস কার্ড - রিয়েল ডাটা */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = {
            blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
            orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
          };
          
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colors[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* রিসেন্ট অ্যাক্টিভিটি ও কুইক অ্যাকশন */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        {/* কুইক অ্যাকশন - বয়লারপ্লেট */}
        <QuickActions />
      </div>
    </div>
  );
};

// ==================== ইউজার ম্যানেজমেন্ট ====================
const UsersContent = ({ users, onUserUpdate }) => {
  // TODO: API calls for user management
  // - fetchUsers()
  // - createUser()
  // - updateUser()
  // - deleteUser()
  // - toggleUserStatus()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Users Management</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Add New User
        </button>
      </div>
      
      {/* Users Table Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== ব্লগ ম্যানেজমেন্ট ====================
const BlogsContent = ({ blogs, onBlogUpdate }) => {
  // TODO: API calls for blog management
  // - fetchBlogs()
  // - createBlog()
  // - updateBlog()
  // - deleteBlog()
  // - toggleBlogStatus()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blogs Management</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Create New Blog
        </button>
      </div>
      
      {/* Blogs Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {blog.featured_image && (
              <img src={blog.featured_image} alt={blog.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{blog.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{blog.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">By {blog.author_name}</span>
                <div className="space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== মিডিয়া লাইব্রেরি ====================
const MediaContent = ({ media, onMediaUpdate }) => {
  // TODO: API calls for media management
  // - fetchMedia()
  // - uploadMedia()
  // - deleteMedia()
  // - updateMedia()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Media Library</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Upload Media
        </button>
      </div>
      
      {/* Media Grid Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group relative">
            {item.file_type === 'image' ? (
              <img src={item.url} alt={item.original_name} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FiFileText className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.original_name}</p>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button className="p-1 bg-white rounded-full text-gray-900">Edit</button>
              <button className="p-1 bg-white rounded-full text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== ভিডিও ম্যানেজমেন্ট ====================
const VideosContent = ({ videos, onVideoUpdate }) => {
  // TODO: API calls for video management
  // - fetchVideos()
  // - uploadVideo()
  // - deleteVideo()
  // - updateVideo()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Videos Management</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Upload Video
        </button>
      </div>
      
      {/* Videos Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative">
              <video src={video.url} className="w-full h-48 object-cover" controls />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{video.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{video.duration}</p>
              <div className="flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== মেসেজ ম্যানেজমেন্ট ====================
const MessagesContent = ({ messages, onMessageUpdate }) => {
  // TODO: API calls for message management
  // - fetchMessages()
  // - markAsRead()
  // - deleteMessage()
  // - replyToMessage()

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Messages</h2>
      
      {/* Messages List Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {messages.map((message) => (
          <div key={message.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!message.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{message.sender}</span>
                  {!message.isRead && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">New</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{message.subject}</p>
                <p className="text-xs text-gray-400">{message.time}</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">Reply</button>
                <button className="text-red-600 hover:text-red-900">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== অ্যানালিটিক্স ====================
const AnalyticsContent = ({ analytics, blogs, users }) => {
  // TODO: API calls for analytics
  // - fetchAnalytics()
  // - fetchChartData()
  // - exportReports()

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h2>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Views</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalViews?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Likes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalLikes?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Comments</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalComments?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Monthly Growth</p>
          <p className="text-3xl font-bold text-green-600">{analytics.monthlyGrowth || 0}%</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Traffic Overview</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-400">Chart will be displayed here</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-400">Chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== সেটিংস ====================
const SettingsContent = ({ user }) => {
  // TODO: API calls for settings
  // - updateProfile()
  // - changePassword()
  // - updatePreferences()
  // - backupData()

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {/* প্রোফাইল সেটিংস */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Settings</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" defaultValue={user?.name} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" defaultValue={user?.email} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Update Profile
            </button>
          </div>
        </div>

        {/* পাসওয়ার্ড পরিবর্তন */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Change Password
            </button>
          </div>
        </div>

        {/* প্রেফারেন্স */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Enable email notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Dark mode</span>
            </label>
            <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== কুইক অ্যাকশন কম্পোনেন্ট ====================
const QuickActions = () => {
  const actions = [
    { icon: FiFileText, label: 'New Blog', color: 'green' },
    { icon: FiUsers, label: 'Add User', color: 'blue' },
    { icon: FiImage, label: 'Upload Media', color: 'purple' },
    { icon: FiSettings, label: 'Settings', color: 'orange' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const colors = {
            green: 'text-green-600 dark:text-green-400',
            blue: 'text-blue-600 dark:text-blue-400',
            purple: 'text-purple-600 dark:text-purple-400',
            orange: 'text-orange-600 dark:text-orange-400',
          };
          
          return (
            <button key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Icon className={`w-5 h-5 mx-auto mb-2 ${colors[action.color]}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// হেল্পার ফাংশন
const calculateGrowth = (data) => {
  // TODO: Implement actual growth calculation
  return Math.floor(Math.random() * 15) + 1;
};

export default Dashboard;