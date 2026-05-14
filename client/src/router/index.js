import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const routes = [
  { path: '/',           name: 'Home',           component: () => import('../views/HomeView.vue') },
  { path: '/login',      name: 'Login',          component: () => import('../views/LoginView.vue') },
  { path: '/register',   name: 'Register',       component: () => import('../views/RegisterView.vue') },
  { path: '/resources',  name: 'Resources',      component: () => import('../views/ResourceListView.vue') },
  { path: '/resources/:id', name: 'ResourceDetail', component: () => import('../views/ResourceDetailView.vue') },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('../views/UploadResourceView.vue'),
    meta: { requiresAuth: true } // Only logged-in users
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route guard - redirect to login if not authenticated
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Check auth
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login');
  }

  // Check admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/');
  }

  next();
});

export default router;
