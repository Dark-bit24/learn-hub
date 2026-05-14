// ============================================
// ADMIN ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { 
  getPendingTeachers, 
  approveTeacher, 
  getAllResources,
  getAllUsers,
  deleteUser,
  createUser,
  deleteResourceAdmin
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// All routes are protected and restricted to admins
router.use(protect);
router.use(admin);

// GET /api/admin/pending-teachers → List pending teachers
router.get('/pending-teachers', getPendingTeachers);

// PUT /api/admin/approve-teacher/:id → Approve a teacher
router.put('/approve-teacher/:id', approveTeacher);

// GET /api/admin/resources → List all resources
router.get('/resources', getAllResources);

// DELETE /api/admin/resources/:id → Delete a resource
router.delete('/resources/:id', deleteResourceAdmin);

// GET /api/admin/users → List all users
router.get('/users', getAllUsers);

// POST /api/admin/users → Create a user
router.post('/users', createUser);

// DELETE /api/admin/users/:id → Delete a user
router.delete('/users/:id', deleteUser);

module.exports = router;
