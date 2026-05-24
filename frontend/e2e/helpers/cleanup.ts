import { APIRequestContext } from '@playwright/test'

export class CleanupHelper {
  constructor(private request: APIRequestContext) {}

  async loginAsAdmin() {
    await this.request.post('/api/v1/login', {
      data: { username: 'admin', password: 'Admin123!' },
    })
  }

  async deleteEmployee(name: string) {
    const searchRes = await this.request.get(`/api/v1/nhan-vien?search=${encodeURIComponent(name)}`)
    if (searchRes.ok()) {
      const body = await searchRes.json()
      const employees = body.data || body
      if (Array.isArray(employees)) {
        for (const emp of employees) {
          if (emp.ho_ten === name || emp.hoTen === name) {
            await this.request.delete(`/api/v1/nhan-vien/${emp.id || emp.ma_nhan_vien}`)
          }
        }
      }
    }
  }

  async deletePhongBan(name: string) {
    const res = await this.request.get(`/api/v1/phong-ban`)
    if (res.ok()) {
      const body = await res.json()
      const items = body.data || body
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.ten_phong_ban === name || item.ten === name) {
            await this.request.delete(`/api/v1/phong-ban/${item.id || item.ma_phong_ban}`)
          }
        }
      }
    }
  }

  async deleteChucVu(name: string) {
    const res = await this.request.get(`/api/v1/chuc-vu`)
    if (res.ok()) {
      const body = await res.json()
      const items = body.data || body
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.ten_chuc_vu === name || item.ten === name) {
            await this.request.delete(`/api/v1/chuc-vu/${item.id || item.ma_chuc_vu}`)
          }
        }
      }
    }
  }
}
