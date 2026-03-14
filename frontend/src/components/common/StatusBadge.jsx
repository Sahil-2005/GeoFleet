const statusConfig = {
  PENDING:    { label: 'Pending',    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  ASSIGNED:   { label: 'Assigned',   color: 'bg-blue-500/20   text-blue-400   border-blue-500/30' },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  DELIVERED:  { label: 'Delivered',  color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-500/20   text-red-400    border-red-500/30' },
  AVAILABLE:  { label: 'Available',  color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  ON_TRIP:    { label: 'On Trip',    color: 'bg-blue-500/20   text-blue-400   border-blue-500/30' },
  OFFLINE:    { label: 'Offline',    color: 'bg-gray-500/20  text-gray-400   border-gray-500/30' },
  FAILED:     { label: 'Failed',     color: 'bg-red-500/20   text-red-400    border-red-500/30' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
