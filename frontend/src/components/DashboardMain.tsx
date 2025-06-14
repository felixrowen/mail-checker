import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Shield } from "lucide-react";

export function DashboardMain() {
  const [domain, setDomain] = useState("");

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to VeriMail
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Verify your domain's email configuration including SPF, DKIM, DMARC
            records, and mail server connectivity. Enter your domain below to
            get started.
          </p>
        </div>

        {/* Domain Input Form */}
        <Card className="bg-white shadow-sm border border-gray-200">
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
            <div className="flex gap-4">
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                Check Domain
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="py-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Results Yet
            </h3>
            <p className="text-gray-500">
              Enter a domain name above and click "Check Domain" to see mail
              configuration results
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
