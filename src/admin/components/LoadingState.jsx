import { LoaderCircle } from "lucide-react";

function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="admin-card flex min-h-[240px] items-center justify-center gap-3 px-8 py-14 text-sm font-medium text-gray-500">
      <LoaderCircle className="h-5 w-5 animate-spin text-teal-600" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingState;
