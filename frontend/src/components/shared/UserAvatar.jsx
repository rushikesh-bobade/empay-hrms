/**
 * Shared avatar component — shows profile pic if available, otherwise initials.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function UserAvatar({ user, size = 'md', gradient, className = '' }) {
  const sizes = { xs: 'w-7 h-7 text-[0.55rem]', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-24 h-24 text-2xl' };
  const sizeClass = sizes[size] || sizes.md;
  const bg = gradient || 'linear-gradient(135deg, #4d8eff, #571bc1)';

  if (user?.profile_pic) {
    return (
      <img
        src={`${BASE_URL}${user.profile_pic}`}
        alt={user.full_name || 'Avatar'}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold ${className}`}
      style={{ background: bg, color: 'white' }}
    >
      {getInitials(user?.full_name)}
    </div>
  );
}

export { getInitials, BASE_URL };
