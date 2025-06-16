import { useQuery } from "@tanstack/react-query";
import { checkApi } from "@/lib/api";
import type { CheckResult, ApiResponse, CheckResultDetail } from "@/lib/api";
import storage from "@/utils/storage.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Loader2,
  Shield,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ok":
    case "pass":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "error":
    case "fail":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "missing":
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ok":
    case "pass":
      return "bg-green-50 text-green-700 border-green-200";
    case "error":
    case "fail":
      return "bg-red-50 text-red-700 border-red-200";
    case "missing":
    case "warning":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const CheckDetail = ({ title, result }: { title: string; result: CheckResultDetail }) => (
  <div className="flex items-start justify-between p-3 border rounded-lg bg-white">
    <div className="flex items-start gap-3 flex-1">
      {getStatusIcon(result.status)}
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-gray-600 mt-1">{result.message}</div>
      </div>
    </div>
    <Badge variant="outline" className={`text-xs ${getStatusColor(result.status)}`}>
      {result.status}
    </Badge>
  </div>
);

const HistoryPage = () => {
  const { data: historyResponse, isLoading } = useQuery<
    ApiResponse<CheckResult[]>,
    Error
  >({
    queryKey: ["checks", "history"],
    queryFn: checkApi.getCheckHistory,
    enabled: !!storage.getAuthToken(),
    retry: 2,
  });

  const checkHistory = historyResponse?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <History className="w-8 h-8 text-blue-600" />
            Check History
          </h1>
          <p className="text-gray-600 mt-2">
            View all your domain check results and detailed analysis
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Loading history...</span>
          </div>
        ) : checkHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No History Available</h3>
              <p className="text-gray-500">
                Start checking domains to see your history here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {checkHistory.map((check) => (
              <Card key={check.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="truncate">{check.domain}</span>
                  </CardTitle>
                  <CardDescription>
                    Checked on {new Date(check.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CheckDetail
                      title="SPF Record"
                      result={check.result.spf}
                    />
                    <CheckDetail
                      title="DKIM Record"
                      result={check.result.dkim}
                    />
                    <CheckDetail
                      title="DMARC Record"
                      result={check.result.dmarc}
                    />
                    <CheckDetail
                      title="Mail Server"
                      result={check.result.mail_echo}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
