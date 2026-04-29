"use client"

import { useMemo } from "react"
import { Building2, Landmark, Users, ChevronRight } from "lucide-react"
import { usePhongBanAll } from "@/hooks/phong-ban"
import { useNhanVienList } from "@/hooks/nhan-vien"
import { Badge } from "@/components/ui/badge"

interface PhongBanNode {
  id: string
  ten_phong_ban: string
  ma_phong_ban: string
  loai: "hanh_chinh" | "chuyen_mon"
  trang_thai: boolean | null
  cha_id: string | null
  children: PhongBanNode[]
  nhanVienCount: number
}

function buildTree(phongBans: any[], nhanVienCounts: Record<string, number>): PhongBanNode[] {
  const nodeMap = new Map<string, PhongBanNode>()
  
  phongBans.forEach((pb) => {
    nodeMap.set(pb.id, {
      id: pb.id,
      ten_phong_ban: pb.ten_phong_ban,
      ma_phong_ban: pb.ma_phong_ban,
      loai: pb.loai,
      trang_thai: pb.trang_thai,
      cha_id: pb.cha_id || null,
      children: [],
      nhanVienCount: nhanVienCounts[pb.id] || 0,
    })
  })

  const roots: PhongBanNode[] = []
  nodeMap.forEach((node) => {
    if (node.cha_id && nodeMap.has(node.cha_id)) {
      nodeMap.get(node.cha_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function OrgNode({ node, level = 0 }: { node: PhongBanNode; level?: number }) {
  const isInactive = node.trang_thai === false

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl border p-4 mb-3 transition-all ${
          isInactive
            ? "border-slate-200 bg-slate-50 opacity-60"
            : node.loai === "hanh_chinh"
            ? "border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50"
            : "border-amber-200 bg-amber-50/50 hover:bg-amber-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isInactive
                ? "bg-slate-200 text-slate-500"
                : node.loai === "hanh_chinh"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {node.loai === "hanh_chinh" ? (
              <Landmark className="h-6 w-6" />
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold truncate ${isInactive ? "text-slate-500" : "text-slate-900"}`}>
                {node.ten_phong_ban}
              </h4>
              {isInactive && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-slate-100">
                  Không hoạt động
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground">{node.ma_phong_ban}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {node.nhanVienCount} nhân viên
              </span>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="ml-8 pl-4 border-l-2 border-dashed border-slate-200">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

interface PhongBanCoCauViewProps {
  onClose?: () => void
}

export function PhongBanCoCauView({ onClose }: PhongBanCoCauViewProps) {
  const { data: phongBans = [] } = usePhongBanAll()
  const { data: nhanViensResult } = useNhanVienList({ page: 1, page_size: 100 })
  const nhanViens = nhanViensResult?.data || []

  const nhanVienCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    nhanViens.forEach((nv: any) => {
      if (nv.phong_ban_id) {
        counts[nv.phong_ban_id] = (counts[nv.phong_ban_id] || 0) + 1
      }
    })
    return counts
  }, [nhanViens])

  const tree = useMemo(() => buildTree(phongBans, nhanVienCounts), [phongBans, nhanVienCounts])

  const stats = useMemo(() => {
    const total = phongBans.length
    const withParent = phongBans.filter((pb) => pb.cha_id).length
    const roots = total - withParent
    const hanhChinh = phongBans.filter((pb) => pb.loai === "hanh_chinh").length
    const chuyenMon = phongBans.filter((pb) => pb.loai === "chuyen_mon").length
    return { total, roots, hanhChinh, chuyenMon }
  }, [phongBans])

  if (phongBans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-semibold text-slate-600">Chưa có phòng ban</h3>
        <p className="text-sm text-muted-foreground mt-1">Hãy tạo phòng ban đầu tiên để xem cơ cấu</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-indigo-400" />
          <span className="text-muted-foreground">Hành chính ({stats.hanhChinh})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-400" />
          <span className="text-muted-foreground">Chuyên môn ({stats.chuyenMon})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full border-2 border-dashed border-slate-400" />
          <span className="text-muted-foreground">Phân cấp</span>
        </div>
      </div>

      <div className="border rounded-xl p-4 bg-slate-50/50 max-h-[400px] overflow-y-auto">
        {tree.map((node) => (
          <OrgNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  )
}
