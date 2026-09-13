// ============================================
// GUEST SERVICE - handles guest ID and likes
// ============================================

const GUEST_ID_KEY = 'learnhub_guest_id';
const GUEST_LIKES_KEY = 'learnhub_guest_likes';

export function getOrCreateGuestId() {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function getGuestLikedResources() {
  try {
    const raw = localStorage.getItem(GUEST_LIKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isResourceLikedByGuest(resourceId) {
  const likes = getGuestLikedResources();
  return likes.includes(resourceId);
}

export function toggleGuestLikedResource(resourceId, isLiked) {
  const likes = getGuestLikedResources();
  let updated;
  if (isLiked) {
    updated = Array.from(new Set([...likes, resourceId]));
  } else {
    updated = likes.filter(id => id !== resourceId);
  }
  localStorage.setItem(GUEST_LIKES_KEY, JSON.stringify(updated));
  return updated;
}
