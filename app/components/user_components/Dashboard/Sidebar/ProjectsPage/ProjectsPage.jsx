"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/app/components/contexts/AuthContexts/AuthContexts";
import axiosInstane from "@/app/components/contexts/AxiosInstance/AxiosInstance";


const ProjectsPage = () => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [itemsPerPage] = useState(9);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null, projectTitle: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, project: null });
  const [createModal, setCreateModal] = useState({ isOpen: false, loading: false });
  const [editModal, setEditModal] = useState({ 
    isOpen: false, 
    project: null,
    formData: {
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      thumbnail_url: '',
      live_url: '',
      github_url: '',
      category: '',
      status: 'draft',
      featured: false
    },
    loading: false
  });

  // Categories for filter
  const categories = ['all', 'Web Development', 'Mobile App', 'UI/UX Design', 'Machine Learning', 'DevOps', 'Open Source'];
  const statuses = ['all', 'completed', 'in-progress', 'draft'];

  // Fetch all projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on search, category and status
  useEffect(() => {
    let filtered = [...projects];
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title?.toLowerCase().includes(term) || 
        project.short_description?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }
    
    setFilteredProjects(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [projects, searchTerm, selectedCategory, selectedStatus, itemsPerPage]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstane.get('/projects');
      
      if (response.data.success) {
        setProjects(response.data.data);
        setFilteredProjects(response.data.data);
        setTotalProjects(response.data.data.length);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete project
  const handleDelete = async () => {
    if (!deleteModal.projectId) return;

    try {
      const response = await axiosInstane.delete(`/projects/${deleteModal.projectId}`);
      
      if (response.data.success) {
        toast.success('Project deleted successfully');
        fetchProjects();
        setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' });
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  // View project details
  const handleViewProject = (project) => {
    setViewModal({ isOpen: true, project });
  };

  // Open create modal
  const handleCreateProject = () => {
    setCreateModal({ isOpen: true, loading: false });
  };

  // Open edit modal
  const handleEditProject = (project) => {
    setEditModal({
      isOpen: true,
      project,
      formData: {
        title: project.title || '',
        slug: project.slug || '',
        short_description: project.short_description || '',
        full_description: project.full_description || '',
        thumbnail_url: project.thumbnail_url || '',
        live_url: project.live_url || '',
        github_url: project.github_url || '',
        category: project.category || '',
        status: project.status || 'draft',
        featured: project.featured || false
      },
      loading: false
    });
  };

  // Handle create form input change
  const handleCreateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  };

  // Handle create submit
  const handleCreateSubmit = async () => {
    const { formData } = createModal;
    
    // Validation
    if (!formData?.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData?.short_description?.trim()) {
      toast.error('Short description is required');
      return;
    }

    if (!formData?.full_description?.trim()) {
      toast.error('Full description is required');
      return;
    }

    if (!formData?.thumbnail_url?.trim()) {
      toast.error('Thumbnail URL is required');
      return;
    }

    if (!formData?.live_url?.trim()) {
      toast.error('Live URL is required');
      return;
    }

    if (!formData?.github_url?.trim()) {
      toast.error('GitHub URL is required');
      return;
    }

    if (!formData?.category?.trim()) {
      toast.error('Category is required');
      return;
    }

    try {
      setCreateModal(prev => ({ ...prev, loading: true }));

      // Generate slug from title if not provided
      const slug = formData.slug || generateSlug(formData.title);

      const projectData = {
        ...formData,
        slug
      };

      const response = await axiosInstane.post('/projects', projectData);
      
      if (response.data.success) {
        toast.success('Project created successfully');
        fetchProjects();
        setCreateModal({ isOpen: false, formData: {}, loading: false });
      }
    } catch (error) {
      console.error('Create failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
      setCreateModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    const { project, formData } = editModal;
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.short_description.trim()) {
      toast.error('Short description is required');
      return;
    }

    if (!formData.full_description.trim()) {
      toast.error('Full description is required');
      return;
    }

    try {
      setEditModal(prev => ({ ...prev, loading: true }));

      // Generate slug from title if changed
      const slug = formData.title !== project.title ? generateSlug(formData.title) : formData.slug;

      const projectData = {
        ...formData,
        slug
      };

      const response = await axiosInstane.patch(`/projects/${project.id}`, projectData);
      
      if (response.data.success) {
        toast.success('Project updated successfully');
        fetchProjects();
        setEditModal({ 
          isOpen: false, 
          project: null,
          formData: {
            title: '', slug: '', short_description: '', full_description: '',
            thumbnail_url: '', live_url: '', github_url: '', category: '', status: 'draft', featured: false
          },
          loading: false 
        });
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
      setEditModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Get current page projects
  const getCurrentPageProjects = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get featured badge
  const getFeaturedBadge = (featured) => {
    return featured 
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Truncate text
  const truncateText = (text, length = 100) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Browse and manage all projects
            </p>
          </div>
          
          {/* Create Project Button - Only for admin */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleCreateProject}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProjects}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {projects.filter(p => p.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {projects.filter(p => p.featured).length}
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            // Loading Skeleton
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {getCurrentPageProjects().map((project) => (
                  <div
                    key={project.id}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 hover:border-green-500 dark:hover:border-green-500"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden">
                      {project.thumbnail_url ? (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">P</span>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {project.featured && (
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {project.title}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {truncateText(project.short_description, 80)}
                      </p>

                      {/* Category */}
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
                          {project.category}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit Button - Only for admin */}
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleEditProject(project)}
                            className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                            title="Edit Project"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {/* Delete Button - Only for admin */}
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => setDeleteModal({ 
                              isOpen: true, 
                              projectId: project.id, 
                              projectTitle: project.title 
                            })}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Delete Project"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Projects Found */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Start by creating a new project'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Project Modal */}
      {viewModal.isOpen && viewModal.project && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setViewModal({ isOpen: false, project: null })}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                 onClick={e => e.stopPropagation()}>
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Project Details
                  </h3>
                  <button
                    onClick={() => setViewModal({ isOpen: false, project: null })}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Project Details Content */}
                <div className="space-y-6">
                  {/* Thumbnail */}
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    {viewModal.project.thumbnail_url ? (
                      <img
                        src={viewModal.project.thumbnail_url}
                        alt={viewModal.project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                        <span className="text-white text-6xl font-bold">P</span>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {viewModal.project.featured && (
                        <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                          Featured
                        </span>
                      )}
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(viewModal.project.status)}`}>
                        {viewModal.project.status}
                      </span>
                    </div>
                  </div>

                  {/* Title and Category */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {viewModal.project.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm rounded-full">
                        {viewModal.project.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {viewModal.project.id}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{viewModal.project.short_description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Description</h4>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{viewModal.project.full_description}</p>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href={viewModal.project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    >
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                      </svg>
                      <span className="text-green-600 dark:text-green-400 font-medium">Live Preview</span>
                    </a>
                    <a
                      href={viewModal.project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">GitHub Repository</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setViewModal({ isOpen: false, project: null });
                      handleEditProject(viewModal.project);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                  >
                    Edit Project
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewModal({ isOpen: false, project: null })}
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => {
          if (!createModal.loading) {
            setCreateModal({ isOpen: false, formData: {}, loading: false });
          }
        }}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                 onClick={e => e.stopPropagation()}>
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Project
                  </h3>
                  <button
                    onClick={() => {
                      if (!createModal.loading) {
                        setCreateModal({ isOpen: false, formData: {}, loading: false });
                      }
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    disabled={createModal.loading}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Create Form */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={createModal.formData?.title || ''}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                      placeholder="Enter project title"
                    />
                  </div>

                  {/* Slug (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug (Optional - auto-generated from title)
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={createModal.formData?.slug || ''}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                      placeholder="custom-slug-or-auto-generated"
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Short Description *
                    </label>
                    <textarea
                      name="short_description"
                      value={createModal.formData?.short_description || ''}
                      onChange={handleCreateInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                      placeholder="Brief description of the project"
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Description *
                    </label>
                    <textarea
                      name="full_description"
                      value={createModal.formData?.full_description || ''}
                      onChange={handleCreateInputChange}
                      rows="5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                      placeholder="Detailed description of the project"
                    />
                  </div>

                  {/* Thumbnail URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thumbnail URL *
                    </label>
                    <input
                      type="url"
                      name="thumbnail_url"
                      value={createModal.formData?.thumbnail_url || ''}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Live URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Live URL *
                    </label>
                    <input
                      type="url"
                      name="live_url"
                      value={createModal.formData?.live_url || ''}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                      placeholder="https://your-project.com"
                    />
                  </div>

                  {/* GitHub URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GitHub URL *
                    </label>
                    <input
                      type="url"
                      name="github_url"
                      value={createModal.formData?.github_url || ''}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={createModal.formData?.category || ''}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                    >
                      <option value="">Select Category</option>
                      {categories.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={createModal.formData?.status || 'draft'}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={createModal.loading}
                    >
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={createModal.formData?.featured || false}
                      onChange={handleCreateInputChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      disabled={createModal.loading}
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Featured Project
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  disabled={createModal.loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createModal.loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!createModal.loading) {
                      setCreateModal({ isOpen: false, formData: {}, loading: false });
                    }
                  }}
                  disabled={createModal.loading}
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModal.isOpen && editModal.project && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => {
          if (!editModal.loading) {
            setEditModal({ 
              isOpen: false, 
              project: null,
              formData: {
                title: '', slug: '', short_description: '', full_description: '',
                thumbnail_url: '', live_url: '', github_url: '', category: '', status: 'draft', featured: false
              },
              loading: false 
            });
          }
        }}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                 onClick={e => e.stopPropagation()}>
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Project: {editModal.project.title}
                  </h3>
                  <button
                    onClick={() => {
                      if (!editModal.loading) {
                        setEditModal({ 
                          isOpen: false, 
                          project: null,
                          formData: {
                            title: '', slug: '', short_description: '', full_description: '',
                            thumbnail_url: '', live_url: '', github_url: '', category: '', status: 'draft', featured: false
                          },
                          loading: false 
                        });
                      }
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    disabled={editModal.loading}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Edit Form - Same as Create Form */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editModal.formData.title}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    />
                  </div>

                  {/* Slug (Read-only usually) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={editModal.formData.slug}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                      disabled={true}
                    />
                    <p className="text-xs text-gray-500 mt-1">Slug is auto-generated from title</p>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Short Description *
                    </label>
                    <textarea
                      name="short_description"
                      value={editModal.formData.short_description}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Description *
                    </label>
                    <textarea
                      name="full_description"
                      value={editModal.formData.full_description}
                      onChange={handleEditInputChange}
                      rows="5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    />
                  </div>

                  {/* Thumbnail URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thumbnail URL *
                    </label>
                    <input
                      type="url"
                      name="thumbnail_url"
                      value={editModal.formData.thumbnail_url}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    />
                  </div>

                  {/* Live URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Live URL *
                    </label>
                    <input
                      type="url"
                      name="live_url"
                      value={editModal.formData.live_url}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    />
                  </div>

                  {/* GitHub URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GitHub URL *
                    </label>
                    <input
                      type="url"
                      name="github_url"
                      value={editModal.formData.github_url}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={editModal.formData.category}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    >
                      {categories.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={editModal.formData.status}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={editModal.loading}
                    >
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={editModal.formData.featured}
                      onChange={handleEditInputChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      disabled={editModal.loading}
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Featured Project
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  disabled={editModal.loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editModal.loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editModal.loading) {
                      setEditModal({ 
                        isOpen: false, 
                        project: null,
                        formData: {
                          title: '', slug: '', short_description: '', full_description: '',
                          thumbnail_url: '', live_url: '', github_url: '', category: '', status: 'draft', featured: false
                        },
                        loading: false 
                      });
                    }
                  }}
                  disabled={editModal.loading}
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' })}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                 onClick={e => e.stopPropagation()}>
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete <span className="font-semibold">{deleteModal.projectTitle}</span>? 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' })}
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;