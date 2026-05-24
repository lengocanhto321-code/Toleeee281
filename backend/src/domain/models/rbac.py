from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    is_system = Column(Boolean, nullable=False, default=False)
    priority = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    permissions = relationship(
        "Permission", secondary="role_permissions", back_populates="roles"
    )
    users = relationship("TaiKhoan", secondary="user_roles", back_populates="roles")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    resource = Column(String(50), nullable=False)
    action = Column(String(20), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    roles = relationship(
        "Role", secondary="role_permissions", back_populates="permissions"
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    role_id = Column(
        String(32), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    permission_id = Column(
        String(32), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False
    )

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    user_id = Column(
        String(32), ForeignKey("tai_khoan.id", ondelete="CASCADE"), nullable=False
    )
    role_id = Column(
        String(32), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
