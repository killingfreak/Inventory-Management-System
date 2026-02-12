from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Optional
import json

from database import get_db
from models import InventoryItem, User, UserRole, AuditLog
from schemas import (
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
    PaginatedResponse,
)
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/inventory", tags=["Inventory"])


async def log_audit(
    db: AsyncSession,
    action: str,
    item_id: Optional[int],
    user_id: int,
    changes: Optional[dict] = None,
):
    """Helper function to create audit logs"""
    audit_log = AuditLog(
        action=action,
        item_id=item_id,
        user_id=user_id,
        changes=json.dumps(changes) if changes else None,
    )
    db.add(audit_log)
    await db.flush()


@router.get("/", response_model=List[InventoryItemResponse])
async def get_inventory_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all inventory items with optional filtering and pagination"""
    query = select(InventoryItem)

    # Apply search filter
    if search:
        query = query.where(
            or_(
                InventoryItem.name.ilike(f"%{search}%"),
                InventoryItem.sku.ilike(f"%{search}%"),
                InventoryItem.description.ilike(f"%{search}%"),
            )
        )

    # Apply category filter
    if category:
        query = query.where(InventoryItem.category == category)

    # Apply pagination
    query = query.offset(skip).limit(limit).order_by(InventoryItem.created_at.desc())

    result = await db.execute(query)
    items = result.scalars().all()

    return items


@router.get("/stats")
async def get_inventory_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get inventory statistics"""
    # Total items
    total_items_result = await db.execute(select(func.count(InventoryItem.id)))
    total_items = total_items_result.scalar()

    # Total value
    total_value_result = await db.execute(
        select(func.sum(InventoryItem.quantity * InventoryItem.unit_price))
    )
    total_value = total_value_result.scalar() or 0

    # Low stock items (quantity < 10)
    low_stock_result = await db.execute(
        select(func.count(InventoryItem.id)).where(InventoryItem.quantity < 10)
    )
    low_stock = low_stock_result.scalar()

    # Categories count
    categories_result = await db.execute(
        select(func.count(func.distinct(InventoryItem.category)))
    )
    categories_count = categories_result.scalar()

    return {
        "total_items": total_items,
        "total_value": round(total_value, 2),
        "low_stock_items": low_stock,
        "categories_count": categories_count,
    }


@router.get("/{item_id}", response_model=InventoryItemResponse)
async def get_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific inventory item by ID"""
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item with id {item_id} not found",
        )

    return item


@router.post(
    "/", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED
)
async def create_inventory_item(
    item: InventoryItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
):
    """Create a new inventory item (Admin/Manager only)"""
    # Check if SKU already exists
    result = await db.execute(
        select(InventoryItem).where(InventoryItem.sku == item.sku)
    )
    existing_item = result.scalar_one_or_none()

    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Item with SKU '{item.sku}' already exists",
        )

    # Create new item
    db_item = InventoryItem(**item.model_dump(), created_by=current_user.id)

    db.add(db_item)
    await db.flush()
    await db.refresh(db_item)

    # Log audit
    await log_audit(
        db=db,
        action="CREATE",
        item_id=db_item.id,
        user_id=current_user.id,
        changes=item.model_dump(),
    )

    await db.commit()
    await db.refresh(db_item)

    return db_item


@router.put("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: int,
    item_update: InventoryItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
):
    """Update an existing inventory item (Admin/Manager only)"""
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    db_item = result.scalar_one_or_none()

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item with id {item_id} not found",
        )

    # Track changes
    changes = {}
    update_data = item_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if value is not None:
            old_value = getattr(db_item, field)
            if old_value != value:
                changes[field] = {"old": old_value, "new": value}
                setattr(db_item, field, value)

    if changes:
        await db.flush()

        # Log audit
        await log_audit(
            db=db,
            action="UPDATE",
            item_id=item_id,
            user_id=current_user.id,
            changes=changes,
        )

    await db.commit()
    await db.refresh(db_item)

    return db_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Delete an inventory item (Admin only)"""
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    db_item = result.scalar_one_or_none()

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item with id {item_id} not found",
        )

    # Log audit before deletion
    await log_audit(
        db=db,
        action="DELETE",
        item_id=item_id,
        user_id=current_user.id,
        changes={"deleted_item": db_item.name},
    )

    await db.delete(db_item)
    await db.commit()

    return None
