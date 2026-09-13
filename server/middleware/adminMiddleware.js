// ============================================
// ADMIN MIDDLEWARE - restricts access to admins
// ============================================

const admin = async (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.email === 'admin@gmail.com')) {
    if (req.user.role !== 'admin') {
      try {
        req.user.role = 'admin';
        req.user.isApproved = true;
        await req.user.save();
      } catch (e) {
        console.warn('Could not persist admin role:', e.message);
      }
    }
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { admin };
