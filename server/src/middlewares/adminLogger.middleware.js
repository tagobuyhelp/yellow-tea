import AdminLog from '../models/adminLog.model.js';

/**
 * Middleware to log admin actions
 * @param {string} actionType - Type of action being performed
 * @param {string} targetCollection - Collection being affected
 * @param {function} getTargetId - Function to extract target ID from request (optional)
 * @param {function} getDetails - Function to extract details from request (optional)
 */
export const logAdminAction = (actionType, targetCollection, getTargetId = null, getDetails = null) => {
    return async (req, res, next) => {
        // Store the original send function
        const originalSend = res.send;
        
        // Override the send function
        res.send = function(data) {
            // Restore the original send function
            res.send = originalSend;
            
            // Only log if the request was successful (status code < 400)
            if (res.statusCode < 400 && req.user && req.user.role && ['admin', 'super-admin'].includes(req.user.role)) {
                try {
                    // Extract target ID if function provided, otherwise try to get from params or body
                    const targetId = getTargetId 
                        ? getTargetId(req) 
                        : (req.params.id || req.body._id || null);
                    
                    // Extract details if function provided, otherwise use a default
                    const details = getDetails 
                        ? getDetails(req, res, data) 
                        : {
                            method: req.method,
                            path: req.path,
                            query: req.query,
                            body: req.method !== 'GET' ? req.body : undefined,
                            response: data ? JSON.parse(data) : undefined
                        };
                    
                    // Create log entry
                    AdminLog.createLog(
                        req.user.id,
                        actionType,
                        targetCollection,
                        targetId,
                        details,
                        req
                    ).catch(err => console.error('Error logging admin action:', err));
                } catch (error) {
                    console.error('Error in admin logger middleware:', error);
                }
            }
            
            // Call the original send function
            return originalSend.call(this, data);
        };
        
        next();
    };
};

/**
 * Helper function to create standard log middleware for CRUD operations
 */
export const createCrudLoggers = (entityName, collection) => {
    return {
        create: logAdminAction(
            `CREATE_${entityName.toUpperCase()}`,
            collection,
            null,
            (req, res, data) => ({
                method: 'POST',
                path: req.path,
                created: JSON.parse(data).data
            })
        ),
        
        update: logAdminAction(
            `UPDATE_${entityName.toUpperCase()}`,
            collection,
            req => req.params.id,
            (req) => ({
                method: 'PUT/PATCH',
                path: req.path,
                id: req.params.id,
                updates: req.body
            })
        ),
        
        delete: logAdminAction(
            `DELETE_${entityName.toUpperCase()}`,
            collection,
            req => req.params.id,
            (req) => ({
                method: 'DELETE',
                path: req.path,
                id: req.params.id
            })
        )
    };
};