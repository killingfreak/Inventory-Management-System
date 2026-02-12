from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import AuditLog, User, UserRole
from schemas import AuditLogResponse
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
):
    """Get audit logs (Admin/Manager only)"""
    query = (
        select(AuditLog).offset(skip).limit(limit).order_by(AuditLog.timestamp.desc())
    )

    result = await db.execute(query)
    logs = result.scalars().all()

    return logs


@router.get("/item/{item_id}", response_model=List[AuditLogResponse])
async def get_item_audit_logs(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
):
    """Get audit logs for a specific inventory item (Admin/Manager only)"""
    query = (
        select(AuditLog)
        .where(AuditLog.item_id == item_id)
        .order_by(AuditLog.timestamp.desc())
    )

    result = await db.execute(query)
    logs = result.scalars().all()

    return logs
