export interface SendNotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  caseId?: string;
  expertReviewId?: string;
}
