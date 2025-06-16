import { Loader2 } from "lucide-react";

export const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="flex items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  </div>
);
