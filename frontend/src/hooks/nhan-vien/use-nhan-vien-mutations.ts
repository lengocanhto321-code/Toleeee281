import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import { toastSuccess, toastError } from "@/lib/utils";
import { nhanVienQueryKeys } from "./use-nhan-vien-query";
import type { NhanVien } from "@/types/nhan-vien.types";

export function useCreateNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NhanVien) =>
      apiGateway.post<NhanVien>(ApiEndpoints.NHAN_VIEN_CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      toastSuccess("Thêm nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Thêm nhân viên thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useUpdateNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NhanVien> }) =>
      apiGateway.put<NhanVien>(ApiEndpoints.NHAN_VIEN_UPDATE(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      toastSuccess("Cập nhật nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Cập nhật thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useDeleteNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.delete<void>(ApiEndpoints.NHAN_VIEN_DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.list() });
      toastSuccess("Xóa nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Xóa thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useRestoreNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.post<NhanVien>(ApiEndpoints.NHAN_VIEN_RESTORE(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      toastSuccess("Khôi phục nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Khôi phục thất bại";
      toastError("Lỗi", message);
    },
  });
}

export interface ImportResult {
  total: number
  success: number
  failed: number
  errors: { row: number; ho_ten: string; error: string }[]
}

export interface BatchPhanBoResult {
  success_count: number
  failed_ids: string[]
}

export interface TransferResult {
  nhan_vien_id: string
  phong_ban_cu: { id: string; ten_phong_ban: string } | null
  phong_ban_moi: { id: string; ten_phong_ban: string }
  chuc_vu_cu: { id: string; ten_chuc_vu: string } | null
  chuc_vu_moi: { id: string; ten_chuc_vu: string }
  ngay_dieu_chuyen: string
  cong_tac_moi_id: string
  lich_su_chuc_vu_id: string | null
}

export interface TransferOptions {
  phong_ban_hien_tai: { id: string; ten_phong_ban: string } | null
  chuc_vu_hien_tai: { id: string; ten_chuc_vu: string } | null
  phong_ban_kha_dung: { id: string; ten_phong_ban: string }[]
  chuc_vu_kha_dung: { id: string; ten_chuc_vu: string; loai: string }[]
  loai_nhan_vien: string
}

export function useBatchPhanBo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nhan_vien_ids, phong_ban_id }: { nhan_vien_ids: string[]; phong_ban_id: string }) =>
      apiGateway.post<BatchPhanBoResult>(ApiEndpoints.NHAN_VIEN_BATCH_PHAN_BO, { nhan_vien_ids, phong_ban_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "string"
          ? error
          : (error as { message?: string })?.message ||
            JSON.stringify(error) ||
            "Phân bổ thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useBatchPhanBoChucVu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nhan_vien_ids, chuc_vu_id }: { nhan_vien_ids: string[]; chuc_vu_id: string }) =>
      apiGateway.post<BatchPhanBoResult>(ApiEndpoints.NHAN_VIEN_BATCH_PHAN_BO_CHUC_VU, { nhan_vien_ids, chuc_vu_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "string"
          ? error
          : (error as { message?: string })?.message ||
            JSON.stringify(error) ||
            "Phân bổ chức vụ thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useBatchBoNhiem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nhan_vien_ids: string[]; chuc_vu_id: string; ngay_bo_nhiem: string; so_quyet_dinh?: string }) =>
      apiGateway.post<BatchPhanBoResult>(ApiEndpoints.NHAN_VIEN_BATCH_BO_NHIEM, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Bổ nhiệm thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useDieuChuyenNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      nhan_vien_id: string;
      phong_ban_id_moi: string;
      chuc_vu_id_moi: string;
      ngay_dieu_chuyen: string;
      ly_do?: string;
      so_quyet_dinh?: string;
      ghi_chu?: string;
    }) =>
      apiGateway.post<TransferResult>(ApiEndpoints.NHAN_VIEN_DIEU_CHUYEN, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      toastSuccess("Điều chuyển nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Điều chuyển thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useImportNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: Record<string, unknown>[]) =>
      apiGateway.post<ImportResult>(ApiEndpoints.NHAN_VIEN_IMPORT, { rows }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      if (result.failed === 0) {
        toastSuccess(`Import thành công ${result.success} nhân viên`);
      } else {
        toastSuccess(`Import: ${result.success} thành công, ${result.failed} thất bại`);
      }
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Import thất bại";
      toastError("Lỗi", message);
    },
  });
}

interface ResetPasswordResult {
  ten_dang_nhap: string
  mat_khau_moi: string
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.post<ResetPasswordResult>(ApiEndpoints.ADMIN_RESET_PASSWORD(id)),
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Đặt lại mật khẩu thất bại"
      toastError("Lỗi", message)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      apiGateway.post(ApiEndpoints.AUTH_CHANGE_PASSWORD, data),
    onSuccess: () => {
      toastSuccess("Đổi mật khẩu thành công")
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Đổi mật khẩu thất bại"
      toastError("Lỗi", message)
    },
  })
}
