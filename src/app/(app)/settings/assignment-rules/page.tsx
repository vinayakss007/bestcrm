
"use server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getUsers, getAssignmentRules } from "@/lib/actions"
import { AssignmentRuleDialog } from "@/components/assignment-rule-dialog"
import { AssignmentRulesTable } from "@/components/assignment-rules-table"
import type { User, AssignmentRule } from "@/lib/types"

export default async function AssignmentRulesSettingsPage() {
  const [users, rules]: [User[], AssignmentRule[]] = await Promise.all([
      getUsers(),
      getAssignmentRules()
  ])

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Assignment Rules</CardTitle>
          <CardDescription>
            Automate lead and opportunity assignment to your team members.
          </CardDescription>
        </div>
        <AssignmentRuleDialog users={users} />
      </CardHeader>
      <CardContent>
        <AssignmentRulesTable rules={rules} users={users} />
      </CardContent>
    </Card>
  )
}
