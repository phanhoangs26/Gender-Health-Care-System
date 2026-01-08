// src/utils/apiUtils.js
import api from '../api/axios';

const DEFAULT_PAGINATION = {
  currentPage: 0,
  pageSize: 10,
  total: 0,
  hasMore: true
};

/**
 * Fetches paginated data from an API endpoint
 * @param {string} endpoint - The API endpoint to fetch from
 * @param {Object} options - Configuration options
 * @param {number} options.page - Page number (0-based)
 * @param {string} [options.sort] - Field to sort by
 * @param {string} [options.order='desc'] - Sort order ('asc' or 'desc')
 * @param {Object} [additionalParams={}] - Additional query parameters
 * @returns {Promise<{data: Array, totalItems: number, totalPages: number, currentPage: number}>}
 */
/**
 * Fetches paginated data from an API endpoint with flexible sorting parameters
 * @param {string} endpoint - The API endpoint to fetch from
 * @param {string} dataName - Name of the data property in the response
 * @param {Object} options - Configuration options
 * @param {number} [options.page=0] - Page number (0-based)
 * @param {string} [options.sort] - Field to sort by (alternative to sortField)
 * @param {string} [options.sortField] - Field to sort by (alternative to sort)
 * @param {string} [options.order='desc'] - Sort order ('asc' or 'desc')
 * @param {string} [options.sortOrder] - Sort order ('asc' or 'desc', alternative to order)
 * @param {Object} [additionalParams={}] - Additional query parameters
 * @returns {Promise<{data: Array, totalItems: number, totalPages: number, currentPage: number}>}
 */
export const fetchPaginatedData = async (
  endpoint, 
  dataName,
  { 
    page = 0, 
    sort, 
    sortField,
    order = 'desc',
    sortOrder,
    ...restOptions 
  } = {},
  additionalParams = {}
) => {
  try {
    // Use sortField/sortOrder if provided, otherwise fall back to sort/order
    const effectiveSortField = sortField || sort;
    const effectiveSortOrder = (sortOrder || order).toLowerCase();
    
    const params = {
      page,
      // Only include sort parameters if a sort field is provided
      ...(effectiveSortField && {
        sortField: effectiveSortField,
        sortOrder: effectiveSortOrder,
        // Also include legacy sort/order parameters for backward compatibility
        sort: effectiveSortField,
        order: effectiveSortOrder
      }),
      ...restOptions,
      ...additionalParams
    };

    const response = await api.get(endpoint, { params });
    
    console.log('API Response:', response.data);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        totalItems: response.data.length,
        totalPages: 1,
        currentPage: 0
      };
    }

    // Standard response structure
    const data = dataName ? (response.data[dataName] || []) : (response.data.data || response.data.items || []);
    return {
      data: data,
      totalItems: response.data.totalItems || data.length,
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.currentPage || page
    };
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Handles pagination state updates
 * @param {Object} options - Options for pagination
 * @param {Function} options.setData - State setter for data
 * @param {Function} options.setLoading - State setter for loading
 * @param {Function} options.setLoadingMore - State setter for loading more
 * @param {Function} options.setPagination - State setter for pagination
 * @param {Function} options.fetchFunction - Function to fetch data
 * @param {number} options.page - Page number to fetch
 * @param {Object} [additionalParams] - Additional parameters for the fetch
 */
export const handlePagination = async ({
  setData,
  setLoading,
  setLoadingMore,
  setPagination = () => {},
  fetchFunction,
  page,
  ...additionalParams
}) => {
  try {
    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const result = await fetchFunction(page, additionalParams);
    if (result.data.length === 0) {
      return;
    }
    setData(prevData => 
      page === 0 ? result.data : [...prevData, ...result.data]
    );

    setPagination((prev = DEFAULT_PAGINATION) => ({
      ...prev,
      totalItems: result.totalItems || 0,
      totalPages: result.totalPages || 1,
      currentPage: result.currentPage || page,
      hasMore: result.currentPage < (result.totalPages || 1) - 1
    }));
  } catch (error) {
    console.error('Error in pagination:', error);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};