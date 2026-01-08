import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubCategory, setIsSubCategory] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isFeatured: false,
    isActive: true,
    parentCategory: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, category: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        parentCategory: isSubCategory ? parentCategoryId : null,
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, dataToSend);
        toast.success(`${isSubCategory ? 'Sub-category' : 'Category'} updated successfully`);
      } else {
        await createCategory(dataToSend);
        toast.success(`${isSubCategory ? 'Sub-category' : 'Category'} created successfully`);
      }
      
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(`Failed to save ${isSubCategory ? 'sub-category' : 'category'}`);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setIsSubCategory(false);
    setParentCategoryId(null);
    setFormData({
      name: '',
      description: '',
      order: 0,
      isFeatured: false,
      isActive: true,
      parentCategory: null,
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsSubCategory(!!category.parentCategory);
    setParentCategoryId(category.parentCategory || null);
    setFormData({
      name: category.name,
      description: category.description || '',
      order: category.order || 0,
      isFeatured: category.isFeatured || false,
      isActive: category.isActive !== false,
      parentCategory: category.parentCategory || null,
    });
    setModalOpen(true);
  };

  const handleAddSubCategory = (parentId) => {
    setIsSubCategory(true);
    setParentCategoryId(parentId);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      order: 0,
      isFeatured: false,
      isActive: true,
      parentCategory: parentId,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteDialog.category._id);
      toast.success('Category deleted successfully');
      setDeleteDialog({ isOpen: false, category: null });
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Separate parent categories and subcategories
const parentCategories = categories.filter(cat => !cat.parentCategory?._id); // parent has no parentCategory

const getSubCategories = (parentId) => {
  return categories.filter(cat => cat.parentCategory?._id === parentId);
};


  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage course categories and sub-categories
          </p>
        </div>
        <button
          onClick={() => {
            setIsSubCategory(false);
            setParentCategoryId(null);
            setEditingCategory(null);
            setFormData({
              name: '',
              description: '',
              order: 0,
              isFeatured: false,
              isActive: true,
              parentCategory: null,
            });
            setModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {parentCategories.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No categories yet. Create your first category!</p>
          </div>
        ) : (
          parentCategories.map((category) => {
            const subCategories = getSubCategories(category._id);
            const isExpanded = expandedCategories.has(category._id);

            return (
              <div key={category._id} className="card">
                {/* Parent Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {subCategories.length > 0 && (
                      <button
                        onClick={() => toggleExpand(category._id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        {category.isFeatured && (
                          <span className="badge badge-warning text-xs">Featured</span>
                        )}
                        {!category.isActive && (
                          <span className="badge badge-error text-xs">Inactive</span>
                        )}
                        {subCategories.length > 0 && (
                          <span className="badge badge-info text-xs">
                            {subCategories.length} sub{subCategories.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Order: {category.order}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddSubCategory(category._id)}
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                      title="Add Sub-category"
                    >
                      <FolderPlus className="h-4 w-4" />
                      Add Sub
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, category })}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Sub-categories */}
                {isExpanded && subCategories.length > 0 && (
                  <div className="mt-4 ml-8 space-y-2 border-l-2 border-gray-200 dark:border-dark-700 pl-4">
                    {subCategories.map((subCat) => (
                      <div
                        key={subCat._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{subCat.name}</h4>
                            {subCat.isFeatured && (
                              <span className="badge badge-warning text-xs">Featured</span>
                            )}
                            {!subCat.isActive && (
                              <span className="badge badge-error text-xs">Inactive</span>
                            )}
                          </div>
                          {subCat.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {subCat.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Order: {subCat.order}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(subCat)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, category: subCat })}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingCategory
            ? `Edit ${isSubCategory ? 'Sub-category' : 'Category'}`
            : `Add ${isSubCategory ? 'Sub-category' : 'Category'}`
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSubCategory && !editingCategory && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Creating sub-category under: <strong>
                  {parentCategories.find(c => c._id === parentCategoryId)?.name}
                </strong>
              </p>
            </div>
          )}

          <div>
            <label className="label">{isSubCategory ? 'Sub-category' : 'Category'} Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g., Web Development"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows="3"
              placeholder="Brief description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Display Order</label>
            <input
              type="number"
              min="0"
              className="input"
              placeholder="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first (0 = highest priority)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isFeatured" className="label mb-0 cursor-pointer">
                Featured {isSubCategory ? 'sub-category' : 'category'}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="label mb-0 cursor-pointer">
                Active (visible to users)
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.category?.parentCategory ? 'Sub-category' : 'Category'}`}
        message={`Are you sure you want to delete "${deleteDialog.category?.name}"? ${
          !deleteDialog.category?.parentCategory
            ? 'All sub-categories and courses under this category will also be affected.'
            : 'All courses under this sub-category will also be affected.'
        } This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

export default Categories;