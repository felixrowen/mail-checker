import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Lightbulb,
  Loader2,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { checkApi } from "@/api";
import type {
  SpfResult,
  DkimResult,
  DmarcResult,
  MailEchoResult,
  Feedback,
  ApiResponse,
  MailEchoResponse,
} from "@/api/types";

const STATUS_CONFIG = {
  valid: { icon: CheckCircle, color: "text-green-600 border-green-300 bg-green-50" },
  missing: { icon: XCircle, color: "text-red-600 border-red-300 bg-red-50" },
  error: { icon: XCircle, color: "text-red-600 border-red-300 bg-red-50" },
  warning: { icon: AlertCircle, color: "text-yellow-600 border-yellow-300 bg-yellow-50" },
  ok: { icon: CheckCircle, color: "text-green-600 border-green-300 bg-green-50" },
} as const;

const getStatusConfig = (status: string) => 
  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || 
  { icon: AlertCircle, color: "text-gray-600 border-gray-300 bg-gray-50" };

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  } catch {
    toast.error("Failed to copy to clipboard");
  }
};

const FeedbackAlert = ({ feedback }: { feedback: Feedback }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
    <div className="flex items-start gap-2">
      <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium text-amber-800 text-sm">{feedback.error}</div>
        <div className="text-amber-700 text-xs mt-1">{feedback.fix}</div>
      </div>
    </div>
  </div>
);

interface BaseDetailProps {
  title: string;
  defaultOpen?: boolean;
  feedback?: Feedback;
  status: string;
  message: string;
  hasExpandableContent: boolean;
  children?: React.ReactNode;
}

const BaseDetail = ({
  title,
  defaultOpen = false,
  feedback,
  status,
  message,
  hasExpandableContent,
  children,
}: BaseDetailProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { icon: StatusIcon, color } = getStatusConfig(status);

  return (
    <div className="border rounded-lg bg-white">
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3 flex-1">
          <StatusIcon className="h-4 w-4" />
          <div className="flex-1">
            <div className="font-medium text-sm">{title}</div>
            <div className="text-xs text-gray-600 mt-1">{message}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${color}`}>
            {status.toUpperCase()}
          </Badge>
          {hasExpandableContent && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      </div>

      {feedback && <FeedbackAlert feedback={feedback} />}

      {hasExpandableContent && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <Separator />
              {children}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

const CopyButton = ({ text }: { text: string }) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-6 px-2"
    onClick={() => copyToClipboard(text)}
  >
    <Copy className="h-3 w-3" />
  </Button>
);

const RecordDisplay = ({ title, record }: { title: string; record: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-gray-700">{title}:</div>
      <CopyButton text={record} />
    </div>
    <div className="text-xs font-mono bg-gray-50 p-2 rounded border break-all">
      {record}
    </div>
  </div>
);

export const SpfDetail = ({
  result,
  defaultOpen = false,
}: {
  result: SpfResult;
  defaultOpen?: boolean;
}) => (
  <BaseDetail
    title="SPF Record"
    defaultOpen={defaultOpen}
    feedback={result.feedback}
    status={result.status}
    message={result.message}
    hasExpandableContent={!!(result.record || result.lookups?.length)}
  >
    <RecordDisplay title="Record" record={result.record} />

    {result.lookups?.length > 0 && (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          Lookups Count: {result.lookup_count}
        </div>
        <div className="space-y-1">
          {result.lookups.map((lookup, index) => (
            <div key={index} className="text-xs bg-blue-50 p-2 rounded border">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{lookup.type}</Badge>
                <span className="font-mono">{lookup.domain}</span>
              </div>
              <div className="text-gray-600 mt-1 font-mono">{lookup.mechanism}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </BaseDetail>
);

export const DkimDetail = ({
  result,
  defaultOpen = false,
}: {
  result: DkimResult;
  defaultOpen?: boolean;
}) => (
  <BaseDetail
    title="DKIM Record"
    defaultOpen={defaultOpen}
    feedback={result.feedback}
    status={result.status}
    message={result.message}
    hasExpandableContent={!!result.records?.length}
  >
    {result.records?.length > 0 && (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">
          DKIM Records ({result.records.length}):
        </div>
        {result.records.map((record, index) => (
          <div key={index} className="space-y-2 border-l-2 border-blue-200 pl-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{record.selector}</Badge>
                <span className="text-sm text-gray-600">selector</span>
              </div>
              <CopyButton text={record.record} />
            </div>
            <div className="text-xs font-mono bg-gray-50 p-2 rounded border break-all">
              {record.record}
            </div>
          </div>
        ))}
      </div>
    )}
  </BaseDetail>
);

const extractRecord = (message: string, prefix: string) =>
  message.split(prefix)[1]?.trim();

export const DmarcDetail = ({
  result,
  defaultOpen = false,
}: {
  result: DmarcResult;
  defaultOpen?: boolean;
}) => {
  const record = extractRecord(result.message, "DMARC record found:");

  return (
    <BaseDetail
      title="DMARC Record"
      defaultOpen={defaultOpen}
      feedback={result.feedback}
      status={result.status}
      message={result.message}
      hasExpandableContent={!!record}
    >
      {record && <RecordDisplay title="Record" record={record} />}
    </BaseDetail>
  );
};

export const MailEchoDetail = ({
  result,
  defaultOpen = false,
  domain,
}: {
  result: MailEchoResult;
  defaultOpen?: boolean;
  domain?: string;
}) => {
  const [smtpResult, setSmtpResult] = useState<MailEchoResult | null>(null);

  const { mutate: testMailServer, isPending } = useMutation<
    ApiResponse<MailEchoResponse>,
    Error,
    { domain: string }
  >({
    mutationFn: ({ domain }) => checkApi.checkMailEcho({ domain }),
    onSuccess: (data) => {
      setSmtpResult(data.data.mail_echo);
      toast.success("Mail server test completed!");
    },
    onError: (error) => toast.error(error.message || "Failed to test mail server"),
  });

  const handleTestMailServer = () => domain && testMailServer({ domain });

  if (!result) return null;

  const mxRecords = result.message ? extractRecord(result.message, "MX records found:") : null;
  const { icon: StatusIcon, color } = getStatusConfig(smtpResult?.status || "");

  return (
    <BaseDetail
      title="Mail Server"
      defaultOpen={defaultOpen}
      feedback={result.feedback}
      status={result.status || "unknown"}
      message={result.message || "No mail server information available"}
      hasExpandableContent={!!(mxRecords || smtpResult)}
    >
      {mxRecords && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">MX Records:</div>
            {domain && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestMailServer}
                disabled={isPending}
                className="h-8 px-3"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Server className="h-3 w-3 mr-2" />
                    Test Mail Server
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {mxRecords.split(", ").map((mx, index) => (
              <div key={index} className="text-xs font-mono bg-blue-50 p-2 rounded border flex items-center justify-between">
                <span>{mx}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1"
                  onClick={() => copyToClipboard(mx)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {smtpResult && (
        <div className="space-y-3 mt-4 pt-3 border-t">
          <div className="text-sm font-medium text-gray-700">SMTP Test Result:</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              <Badge variant="outline" className={`text-xs ${color}`}>
                {smtpResult.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">{smtpResult.message}</span>
            </div>
            {smtpResult.echo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Server Response:</div>
                  <CopyButton text={smtpResult.echo} />
                </div>
                <div className="text-xs font-mono bg-green-50 p-2 rounded border break-all whitespace-pre-wrap">
                  {smtpResult.echo}
                </div>
              </div>
            )}
            {smtpResult.feedback && <FeedbackAlert feedback={smtpResult.feedback} />}
          </div>
        </div>
      )}
    </BaseDetail>
  );
};
