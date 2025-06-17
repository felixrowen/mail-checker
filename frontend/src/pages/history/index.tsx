import { useQuery } from "@tanstack/react-query";
import { checkApi } from "@/api";
import storage from "@/lib/storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  History,
  Loader2,
  Shield,
  Globe,
  Info,
} from "lucide-react";
import type { ApiResponse, CheckResult } from "@/api/types";
import {
  SpfDetail,
  DkimDetail,
  DmarcDetail,
  MailEchoDetail,
} from "@/components/CheckDetails";

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
                  <CardDescription className="flex items-center gap-2">
                    <span>
                      Checked on {new Date(check.createdAt).toLocaleString()}
                    </span>
                    <Info className="h-3 w-3 text-gray-400" />
                    <span className="text-xs">
                      Click arrows to expand details
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <SpfDetail result={check.result.spf} />
                    <DkimDetail result={check.result.dkim} />
                    <DmarcDetail result={check.result.dmarc} />
                    <MailEchoDetail result={check.result.mail_echo} />
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
