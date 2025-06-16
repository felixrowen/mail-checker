import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Search,
  Loader2,
  Globe,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkApi } from "@/lib/api";
import type {
  CreateCheckInput,
  CheckResult,
  ApiResponse,
  CheckResultDetail,
} from "@/lib/api";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import storage from "@/utils/storage.ts";
import { useRouter } from "@/hooks/use-router";
import { useState } from "react";

const domainSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

type DomainFormData = z.infer<typeof domainSchema>;

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

const CheckDetail = ({
  title,
  result,
}: {
  title: string;
  result: CheckResultDetail;
}) => (
  <div className="flex items-start justify-between p-3 border rounded-lg bg-white">
    <div className="flex items-start gap-3 flex-1">
      {getStatusIcon(result.status)}
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-gray-600 mt-1">{result.message}</div>
      </div>
    </div>
    <Badge
      variant="outline"
      className={`text-xs ${getStatusColor(result.status)}`}
    >
      {result.status}
    </Badge>
  </div>
);

const DashboardHeader = () => {
  const currentUser = storage.getCurrentUser();
  const router = useRouter();

  const handleLogout = () => {
    storage.clearAllToken();
    storage.clearCurrentUser();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-gray-100" />
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {currentUser?.email.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentUser?.email.split("@")[0] || "User"}
                </p>
                <p className="text-xs leading-none text-gray-500">
                  {currentUser?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [lastCheckResult, setLastCheckResult] = useState<CheckResult | null>(
    null
  );

  const { mutate: checkDomain, isPending } = useMutation<
    ApiResponse<CheckResult>,
    Error,
    CreateCheckInput
  >({
    mutationFn: checkApi.checkDomain,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["checks", "history"] });
      setLastCheckResult(data.data);
      toast.success("Domain check completed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check domain");
    },
  });

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
    },
  });

  const onSubmit = (data: DomainFormData) => {
    const domainWithProtocol = data.domain.startsWith("https://") 
      ? data.domain 
      : `https://${data.domain}`;
    checkDomain({ domain: domainWithProtocol });
    form.reset();
  };

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Welcome to VeriMail</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Verify your domain's email configuration including SPF, DKIM,
              DMARC records, and mail server connectivity. Enter your domain
              below to get started.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Domain Check
              </CardTitle>
              <CardDescription>
                Enter the domain you want to check for mail configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex gap-4"
                >
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="www.example.com"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Domain"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {lastCheckResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="truncate">{lastCheckResult.domain}</span>
                </CardTitle>
                <CardDescription>
                  Checked on{" "}
                  {new Date(lastCheckResult.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckDetail
                    title="SPF Record"
                    result={lastCheckResult.result.spf}
                  />
                  <CheckDetail
                    title="DKIM Record"
                    result={lastCheckResult.result.dkim}
                  />
                  <CheckDetail
                    title="DMARC Record"
                    result={lastCheckResult.result.dmarc}
                  />
                  <CheckDetail
                    title="Mail Server"
                    result={lastCheckResult.result.mail_echo}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default Dashboard;
