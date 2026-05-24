#!/usr/bin/env python3
"""
Script khởi tạo tài khoản Admin đầu tiên cho hệ thống HR Management.

Script này sẽ:
1. Kiểm tra xem tài khoản admin đã tồn tại chưa
2. Thu thập thông tin từ người dùng
3. Validate mật khẩu với yêu cầu bảo mật
4. Tạo tài khoản admin với mật khẩu đã hash

Usage:
    python -m scripts.init_admin
    hoặc
    cd backend && python scripts/init_admin.py
"""

import asyncio
import sys
import getpass
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import bcrypt
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from src.domain.models.tai_khoan import TaiKhoan
from src.repository.user_repository import UserRepository
from src.service.unit_of_work import UnitOfWork


# Colors for terminal output
class Colors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def print_header(text: str):
    """Print formatted header."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def print_success(text: str):
    """Print success message."""
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")


def print_error(text: str):
    """Print error message."""
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_warning(text: str):
    """Print warning message."""
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")


def print_info(text: str):
    """Print info message."""
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength.

    Requirements:
    - At least 8 characters
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains number or special character
    """
    if len(password) < 8:
        return False, "Mật khẩu phải có ít nhất 8 ký tự"

    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)

    if not has_upper:
        return False, "Mật khẩu phải chứa ít nhất một chữ hoa"
    if not has_lower:
        return False, "Mật khẩu phải chứa ít nhất một chữ thường"
    if not (has_digit or has_special):
        return False, "Mật khẩu phải chứa ít nhất một số hoặc ký tự đặc biệt"

    return True, "OK"


def validate_email(email: str) -> bool:
    """Basic email validation."""
    if not email:
        return True  # Email is optional
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_username(username: str) -> tuple[bool, str]:
    """Validate username format."""
    if not username:
        return False, "Tên đăng nhập không được để trống"
    if len(username) < 3:
        return False, "Tên đăng nhập phải có ít nhất 3 ký tự"
    if len(username) > 50:
        return False, "Tên đăng nhập không được quá 50 ký tự"
    if not username.replace('_', '').replace('-', '').isalnum():
        return False, "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch nối và gạch dưới"

    return True, "OK"


async def create_admin_account(
    user_repository: UserRepository,
    username: str,
    password: str,
    email: str | None = None
) -> TaiKhoan:
    """Create admin account with hashed password."""
    # Hash password using bcrypt (same method as AuthService)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)

    admin = TaiKhoan(
        ten_dang_nhap=username,
        mat_khau_hash=hashed.decode("utf-8"),
        vai_tro="admin",
        email=email,
        trang_thai=True
    )

    return await user_repository.create(admin)


async def get_db_uri() -> str:
    """Get database URI from config."""
    try:
        from config import config
        return config.DB_URI
    except Exception as e:
        print_error(f"Không thể đọc cấu hình database: {e}")
        print_info("Hãy đảm bảo file env.yaml tồn tại và có thông tin DB_URI")
        sys.exit(1)


async def prompt_for_admin_details(existing_admins: list[TaiKhoan]) -> dict:
    """Prompt user for admin account details."""
    if existing_admins:
        admins_str = ", ".join([a.ten_dang_nhap for a in existing_admins])
        print_warning(f"Tài khoản admin đã tồn tại: {admins_str}")
        response = input("Bạn có muốn tạo thêm tài khoản admin không? (y/N): ").strip().lower()
        if response != 'y':
            print_info("Hủy thao tác.")
            sys.exit(0)

    print("\n--- Thông tin tài khoản Admin ---\n")

    # Username
    while True:
        username = input("Tên đăng nhập: ").strip()
        is_valid, message = validate_username(username)
        if is_valid:
            break
        print_error(message)

    # Email
    while True:
        email = input("Email (không bắt buộc - nhấn Enter để bỏ qua): ").strip() or None
        if email is None or validate_email(email):
            break
        print_error("Email không hợp lệ")

    # Password
    while True:
        password = getpass.getpass("Mật khẩu: ")
        is_valid, message = validate_password(password)
        if is_valid:
            break
        print_error(message)

    # Confirm password
    while True:
        confirm_password = getpass.getpass("Xác nhận mật khẩu: ")
        if password == confirm_password:
            break
        print_error("Mật khẩu xác nhận không khớp")

    return {
        "username": username,
        "password": password,
        "email": email
    }


async def main():
    """Main function to initialize admin account."""
    print_header("KHỞI TẠO TÀI KHOẢN ADMIN")

    print_info("Script này sẽ tạo tài khoản Admin cho hệ thống HR Management")
    print_warning("Hãy đảm bảo bạn đã chạy migration và database đang hoạt động\n")

    # Get database URI
    db_uri = await get_db_uri()
    print_success(f"Kết nối database: {db_uri.split('@')[1] if '@' in db_uri else 'localhost'}")

    # Create engine and session factory
    engine = create_async_engine(db_uri, pool_size=5, max_overflow=0)
    session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)

    # Create UnitOfWork
    uow = UnitOfWork(session_factory)

    try:
        async with uow:
            # Check existing admin
            print_info("Kiểm tra tài khoản admin đã tồn tại...")
            existing_admins = await uow.user_repository.find_admins()

            # Prompt for details
            details = await prompt_for_admin_details(existing_admins)

            # Check if username exists
            print_info("Kiểm tra tên đăng nhập...")
            if await uow.user_repository.username_exists(details["username"]):
                print_error(f"Tên đăng nhập '{details['username']}' đã tồn tại!")
                sys.exit(1)

            # Check if email exists
            if details["email"]:
                print_info("Kiểm tra email...")
                if await uow.user_repository.email_exists(details["email"]):
                    print_error(f"Email '{details['email']}' đã được sử dụng!")
                    sys.exit(1)

            # Create admin account
            print_info("Đang tạo tài khoản admin...")
            admin = await create_admin_account(
                user_repository=uow.user_repository,
                username=details["username"],
                password=details["password"],
                email=details["email"]
            )

            # Commit transaction
            await uow.commit()

            print_success("Tài khoản admin đã được tạo thành công!")
            print(f"\n{Colors.BOLD}Thông tin tài khoản:{Colors.ENDC}")
            print(f"  • ID: {admin.id}")
            print(f"  • Tên đăng nhập: {admin.ten_dang_nhap}")
            print(f"  • Email: {admin.email or 'Không có'}")
            print(f"  • Vai trò: {admin.vai_tro}")
            print(f"  • Trạng thái: {'Hoạt động' if admin.trang_thai else 'Khóa'}")
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}Bạn có thể đăng nhập ngay bây giờ!{Colors.ENDC}\n")

    except Exception as e:
        print_error(f"Có lỗi xảy ra: {e}")
        import traceback
        print(f"\n{traceback.format_exc()}")
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print_warning("\n\nĐã hủy bởi người dùng.")
        sys.exit(0)
