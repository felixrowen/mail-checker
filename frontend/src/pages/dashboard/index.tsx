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
  Info,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkApi } from "@/api";
import type {
  CreateCheckInput,
  CheckResult,
  ApiResponse,
} from "@/api/types";
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
import storage from "@/lib/storage";
import { useRouter } from "@/hooks/use-router";
import { useState } from "react";
import {
  SpfDetail,
  DkimDetail,
  DmarcDetail,
  MailEchoDetail,
} from "@/components/CheckDetails";

const domainSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

type DomainFormData = z.infer<typeof domainSchema>;

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
        <div className="max-w-5xl mx-auto space-y-8">
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
                <CardDescription className="flex items-center gap-2">
                  <span>
                    Checked on{" "}
                    {new Date(lastCheckResult.createdAt).toLocaleString()}
                  </span>
                  <Info className="h-3 w-3 text-gray-400" />
                  <span className="text-xs">
                    Click arrows to expand details
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SpfDetail result={lastCheckResult.result.spf} defaultOpen={true} />
                  <DkimDetail result={lastCheckResult.result.dkim} defaultOpen={true} />
                  <DmarcDetail result={lastCheckResult.result.dmarc} defaultOpen={true} />
                  <MailEchoDetail result={lastCheckResult.result.mail_echo} defaultOpen={true} />
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
