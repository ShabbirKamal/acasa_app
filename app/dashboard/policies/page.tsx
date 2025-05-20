import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { PoliciesTable } from "@/components/policies-table"

export default function PoliciesPage() {
  return (
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav activeItem="policies" />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Policies</h1>
              <p className="text-muted-foreground">Create and manage your policy documents</p>
            </div>
            {/* <div className="flex items-center gap-2">
              <Button asChild className="bg-acasa-blue hover:bg-acasa-darkBlue">
                <Link href="/dashboard/policies/create/isms-scope">
                  <Plus className="h-4 w-4 mr-2" />
                  New Policy
                </Link>
              </Button>
            </div> */}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Documents</CardTitle>
                <CardDescription>Manage your organization&apos;s policy documents</CardDescription>
              </CardHeader>
              <CardContent>
                <PoliciesTable />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  )
}

