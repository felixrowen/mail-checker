import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { checkApi } from "@/api";
import storage from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  History,
  Loader2,
  Shield,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import type { ApiResponse, CheckResult } from "@/api/types";
import {
  SpfDetail,
  DkimDetail,
  DmarcDetail,
  MailEchoDetail,
} from "@/components/CheckDetails";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { data: historyResponse, isLoading } = useQuery<
    ApiResponse<CheckResult[]>,
    Error
  >({
    queryKey: ["checks", "history"],
    queryFn: checkApi.getCheckHistory,
    enabled: !!storage.getAuthToken(),
    retry: 2,
  });

  const handleRetest = (domain: string) => 
    navigate(`/?domain=${encodeURIComponent(domain)}`);

  const toggleCardDetails = (cardId: string) => 
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });

  const checkHistory = (historyResponse?.data || [])
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const renderEmptyState = () => (
    <Card>
      <CardContent className="py-12 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No History Available</h3>
        <p className="text-gray-500">
          Start checking domains to see your history here
        </p>
      </CardContent>
    </Card>
  );

  const renderCheckCard = (check: CheckResult) => {
    const isExpanded = expandedCards.has(check.id);
    
    return (
      <Card key={check.id}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="truncate">{check.domain}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleCardDetails(check.id)}
                className="flex items-center gap-2"
              >
                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isExpanded ? "Hide Details" : "Show Details"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRetest(check.domain)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Re-test
              </Button>
            </div>
          </CardTitle>
          <div className="text-sm text-gray-500">
            Last checked on {new Date(check.updatedAt).toLocaleString()}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <div className="space-y-4">
              <SpfDetail result={check.result.spf} />
              <DkimDetail result={check.result.dkim} />
              <DmarcDetail result={check.result.dmarc} />
              {check.result.mail_echo && (
                <MailEchoDetail
                  result={check.result.mail_echo}
                  domain={check.domain}
                />
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading history...</span>
        </div>
      </div>
    );
  }

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

        {checkHistory.length === 0 ? renderEmptyState() : (
          <div className="space-y-6">
            {checkHistory.map(renderCheckCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
