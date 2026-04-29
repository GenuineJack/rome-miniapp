import { ReactNode } from "react";

export type EmptyStateProps = {
  emoji?: string;
  title: string;
  body?: string;
  action?: ReactNode;
};

export function EmptyState({
  emoji = "✦",
  title,
  body,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-emoji" aria-hidden="true">
        {emoji}
      </span>
      <p className="empty-state-title">{title}</p>
      {body && <p className="empty-state-body">{body}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
