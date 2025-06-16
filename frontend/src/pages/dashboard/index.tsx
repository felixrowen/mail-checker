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
  Shield,
  Loader2,
  Clock,
  Globe,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkApi } from "@/lib/api";
import type { CreateCheckInput, CheckResult, ApiResponse } from "@/lib/api";
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

const domainSchema = z.object({
  domain: z.string().min(1, "Domain is required").url("Must be a valid URL"),
});

type DomainFormData = z.infer<typeof domainSchema>;

function DashboardHeader() {
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
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
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
}

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { mutate: checkDomain, isPending } = useMutation<
    ApiResponse<CheckResult>,
    Error,
    CreateCheckInput
  >({
    mutationFn: checkApi.checkDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checks", "history"] });
      toast.success("Domain check completed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check domain");
    },
  });

  const { data: historyResponse, isLoading: isLoadingHistory } = useQuery<
    ApiResponse<CheckResult[]>,
    Error
  >({
    queryKey: ["checks", "history"],
    queryFn: checkApi.getCheckHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const checkHistory = historyResponse?.data || [];

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
    },
  });

  const onSubmit = (data: DomainFormData) => {
    checkDomain(data);
    form.reset();
  };

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Welcome to VeriMail</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Verify your domain's email configuration including SPF, DKIM,
              DMARC records, and mail server connectivity. Enter your domain
              below to get started.
            </p>
          </div>

          {/* Domain Input Form */}
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
                            placeholder="https://example.com"
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

          {/* Check History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Checks
              </CardTitle>
              <CardDescription>
                Your domain check history and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading history...</span>
                </div>
              ) : checkHistory.length === 0 ? (
                <div className="py-12 text-center">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                  <p className="text-gray-500">
                    Enter a domain name above and click "Check Domain" to see
                    mail configuration results
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {checkHistory.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{check.domain}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(check.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Dashboard; 