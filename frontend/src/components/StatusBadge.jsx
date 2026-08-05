const STYLES = {
  pending: "bg-amber-100 text-amber-800 ring-amber-600/20",
  "in-progress": "bg-blue-100 text-blue-800 ring-blue-600/20",
  done: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
};

const LABELS = {
  pending: "Pending",
  "in-progress": "In Progress",
  done: "Done",
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || "bg-gray-100 text-gray-800 ring-gray-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {LABELS[status] || status}
    </span>
  );
}
