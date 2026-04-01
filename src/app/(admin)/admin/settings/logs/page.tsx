import { db } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/shared/Card";
import { formatDistanceToNow, format } from "date-fns";

export const dynamic = "force-dynamic";

async function getLogData() {
  const [
    recentActivities,
    notificationLogs,
    activityCounts,
  ] = await Promise.all([
    db.prospectActivity.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        prospect: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    db.notificationLog.findMany({
      take: 50,
      orderBy: { sentAt: "desc" },
    }),
    db.prospectActivity.groupBy({
      by: ["activityType"],
      _count: true,
    }),
  ]);

  return { recentActivities, notificationLogs, activityCounts };
}

const activityTypeLabels: Record<string, string> = {
  FORM_SUBMITTED: "Form Submitted",
  EMAIL_SENT: "Email Sent",
  SMS_SENT: "SMS Sent",
  SMS_RECEIVED: "SMS Received",
  CALL_LOGGED: "Call Logged",
  STAGE_CHANGED: "Stage Changed",
  PRE_WORK_STARTED: "Pre-work Started",
  PRE_WORK_SUBMITTED: "Pre-work Submitted",
  DOCUMENT_SIGNED: "Document Signed",
  DOCUMENT_DOWNLOADED: "Document Downloaded",
  NOTE_ADDED: "Note Added",
  SCORE_UPDATED: "Score Updated",
  LOGIN: "Login",
  PAGE_VIEW: "Page View",
  WORKFLOW_TRIGGERED: "Workflow Triggered",
};

const notificationTypeLabels: Record<string, string> = {
  NEW_INQUIRY: "New Inquiry",
  PRE_WORK_COMPLETED: "Pre-work Completed",
  DAILY_DIGEST: "Daily Digest",
  HIGH_SCORE_ALERT: "High Score Alert",
  WELCOME_EMAIL: "Welcome Email",
  PRE_WORK_REMINDER: "Pre-work Reminder",
};

export default async function LogsSettingsPage() {
  const { recentActivities, notificationLogs, activityCounts } = await getLogData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">System Logs</h1>
        <p className="mt-1 text-gray-600">
          View system activity and notification history
        </p>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-brand-navy">
            Activity Summary
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activityCounts
              .sort((a, b) => b._count - a._count)
              .slice(0, 8)
              .map((activity) => (
                <div
                  key={activity.activityType}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <p className="text-2xl font-bold text-brand-navy">
                    {activity._count}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {activityTypeLabels[activity.activityType] ||
                      activity.activityType}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-brand-navy">
            Recent Activity Log
          </h2>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Prospect
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(activity.createdAt), "MMM d, HH:mm")}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {activityTypeLabels[activity.activityType] ||
                          activity.activityType}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {activity.prospect.firstName} {activity.prospect.lastName}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-xs">
                        {activity.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No activity logs found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notification Logs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-brand-navy">
            Notification Log
          </h2>
        </CardHeader>
        <CardContent>
          {notificationLogs.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Recipient
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notificationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(log.sentAt), "MMM d, HH:mm")}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {notificationTypeLabels[log.type] || log.type}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {log.recipientEmail}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-xs">
                        {log.subject}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No notification logs found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
