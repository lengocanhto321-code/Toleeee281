import os
import logging
import re
import uuid
from pathlib import Path
from typing import Optional, List, Tuple

from libs.datetime import get_utc_now
from libs.result import Result, Return, Error
from src.domain.models.nhan_vien import TaiLieuNhanVien, LOAI_TAI_LIEU

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    "images": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    "documents": [".pdf", ".doc", ".docx", ".xls", ".xlsx"],
    "all": [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
    ],
}

ALLOWED_MIME_TYPES = {
    "images": ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "documents": [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    "all": [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
}

LOAI_TAI_LIEU_VALID = list(LOAI_TAI_LIEU.keys())


def sanitize_filename(filename: str) -> str:
    filename = filename.strip()
    filename = re.sub(r"[^\w\s\-\.]", "", filename)
    filename = re.sub(r"[-\s]+", "-", filename)
    return filename


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text


class UploadService:
    def __init__(self, upload_dir: str):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def get_nhan_vien_folder(self, ho_ten: str, nhan_vien_id: str) -> Path:
        safe_name = slugify(ho_ten) if ho_ten else "unknown"
        folder_name = f"{safe_name}-{nhan_vien_id}"
        return self.upload_dir / folder_name

    def get_loai_tai_lieu_folder(
        self, nhan_vien_folder: Path, loai_tai_lieu: str
    ) -> Path:
        return nhan_vien_folder / loai_tai_lieu

    def validate_file(
        self,
        filename: str,
        content_type: str,
        file_size: int,
        allowed_types: Optional[List[str]] = None,
    ) -> Result[str, Error]:
        if allowed_types is None:
            allowed_types = ALLOWED_EXTENSIONS["all"]

        ext = Path(filename).suffix.lower()
        if ext not in allowed_types:
            return Return.err(
                Error(
                    code="invalid_file_type",
                    message=f"Loại file không hợp lệ: {ext}",
                    reason=f"Cho phép: {', '.join(allowed_types)}",
                )
            )

        if file_size > MAX_FILE_SIZE:
            return Return.err(
                Error(
                    code="file_too_large",
                    message=f"Kích thước file vượt quá {MAX_FILE_SIZE // (1024 * 1024)}MB",
                    reason=f"Kích thước hiện tại: {file_size / (1024 * 1024):.2f}MB",
                )
            )

        if content_type not in ALLOWED_MIME_TYPES["all"]:
            return Return.err(
                Error(
                    code="invalid_mime_type",
                    message=f"Định dạng MIME không hợp lệ: {content_type}",
                    reason="Loại file không được phép",
                )
            )

        return Return.ok(ext)

    async def save_file(
        self,
        file_content: bytes,
        ho_ten: str,
        nhan_vien_id: str,
        loai_tai_lieu: str,
        original_filename: str,
    ) -> Result[Tuple[str, str, int], Error]:
        if loai_tai_lieu not in LOAI_TAI_LIEU_VALID:
            return Return.err(
                Error(
                    code="invalid_loai_tai_lieu",
                    message=f"Loại tài liệu không hợp lệ: {loai_tai_lieu}",
                    reason=f"Cho phép: {', '.join(LOAI_TAI_LIEU_VALID)}",
                )
            )

        nhan_vien_folder = self.get_nhan_vien_folder(ho_ten, nhan_vien_id)
        loai_folder = self.get_loai_tai_lieu_folder(nhan_vien_folder, loai_tai_lieu)

        loai_folder.mkdir(parents=True, exist_ok=True)

        safe_original = sanitize_filename(original_filename)
        timestamp = get_utc_now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8].upper()
        file_ext = Path(safe_original).suffix.lower()
        new_filename = f"{Path(safe_original).stem}_{timestamp}_{unique_id}{file_ext}"

        file_path = loai_folder / new_filename

        try:
            with open(file_path, "wb") as f:
                f.write(file_content)
        except Exception as e:
            return Return.err(
                Error(
                    code="file_save_error",
                    message="Lỗi khi lưu file",
                    reason=str(e),
                )
            )

        relative_path = str(file_path.relative_to(self.upload_dir))

        return Return.ok((relative_path, new_filename, len(file_content)))

    async def delete_file(self, file_path: str) -> Result[bool, Error]:
        full_path = self.upload_dir / file_path

        if not full_path.exists():
            return Return.err(
                Error(
                    code="file_not_found",
                    message="File không tồn tại",
                    reason=str(full_path),
                )
            )

        try:
            full_path.unlink()

            parent = full_path.parent
            if parent != self.upload_dir and not any(parent.iterdir()):
                parent.rmdir()

            return Return.ok(True)
        except Exception as e:
            return Return.err(
                Error(
                    code="file_delete_error",
                    message="Lỗi khi xóa file",
                    reason=str(e),
                )
            )

    def get_file_url(self, file_path: str, base_url: str = "") -> str:
        if base_url:
            return f"{base_url.rstrip('/')}/uploads/{file_path}"
        return f"/uploads/{file_path}"
