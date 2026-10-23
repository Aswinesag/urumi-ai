
from sqlalchemy import select
from apps.gateway.database import SessionLocal
from apps.gateway.models import AuditLog


def main():
    with SessionLocal() as db:
        logs = db.scalars(
            select(AuditLog)
            .order_by(AuditLog.id.desc())
            .limit(10)
        ).all()

        for entry in logs:
            print(
                f"id={entry.id} "
                f"upstream={entry.upstream_name} "
                f"tool={entry.tool_name} "
                f"outcome={entry.outcome} "
                f"request_id={entry.request_id}"
            )


if __name__ == "__main__":
    main()