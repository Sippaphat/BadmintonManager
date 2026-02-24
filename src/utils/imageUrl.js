/**
 * Safely resolves a photo object or string to a usable image URL.
 * Handles legacy database filenames (e.g. "1770876072924.jpg") by prefixing the Vite API URL.
 * @param {File|string|null} photo 
 * @returns {string|null}
 */
export const getImageUrl = (photo) => {
    if (!photo) return null;

    if (typeof photo !== 'string') {
        return URL.createObjectURL(photo);
    }

    // If it's already a full URL or base64 data wrapper
    if (photo.startsWith('http') || photo.startsWith('data:') || photo.startsWith('blob:') || photo.startsWith('//')) {
        return photo;
    }

    // Otherwise, it's a raw filename from an older database entry.
    // Prefix it with the API base and uploads path.
    let baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5001';
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    return `${baseUrl}/uploads/${photo}`;
};
