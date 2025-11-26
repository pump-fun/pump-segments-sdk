export interface SegmentDefinition {
  id: string;
  name: string;
  sql: string;
  scheduleMinutes: number;
  maxRows?: number;
  description?: string;
}

export const SEGMENTS: SegmentDefinition[] = [
  {
    id: "mobile-users-no-notifications",
    name: "Mobile Users Without Notifications",
    scheduleMinutes: 1440,
    sql: `
      WITH notif_data AS (
        SELECT 
          user_id,
          SUM(notifications_received) AS notifications
        FROM \`pump-data-production.analytics.daily_user_activity\`  
        WHERE metrics_date < CURRENT_DATE()
          AND metrics_date >= CURRENT_DATE() - 8
          AND was_on_mobile
          AND user_id NOT LIKE 'anon_%'
          AND user_id IS NOT NULL
        GROUP BY 1
      )
      SELECT user_id
      FROM notif_data
      WHERE notifications = 0
    `,
  }
];

export const getSegmentById = (id: string): SegmentDefinition | undefined =>
  SEGMENTS.find(s => s.id === id);