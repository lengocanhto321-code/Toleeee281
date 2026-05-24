"use client"

import { useMemo, useState } from "react"
import { Building2, Landmark, Users, ChevronRight, ChevronDown, X, Network, LayoutGrid, List } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePhongBanAll } from "@/hooks/phong-ban"
import { useNhanVienList } from "@/hooks/nhan-vien"

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

type ViewMode = "tree" | "type" | "list"

function TreeNode({ node, level = 0, expanded, onToggle }: {
  node: PhongBanNode
  level?: number
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  const isInactive = node.trang_thai === false
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.id)

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer hover:bg-slate-100 ${
          isInactive ? "opacity-50" : ""
        }`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {hasChildren ? (
          <button className="p-0.5 hover:bg-slate-200 rounded">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isInactive
              ? "bg-slate-200 text-slate-500"
              : node.loai === "hanh_chinh"
              ? "bg-blue-100 text-blue-600"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          {node.loai === "hanh_chinh" ? (
            <Landmark className="h-4 w-4" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isInactive ? "text-slate-500" : "text-slate-900"}`}>
            {node.ten_phong_ban}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{node.ma_phong_ban}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {node.nhanVienCount}
            </span>
          </div>
        </div>
        {isInactive && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-slate-100">
            Không hoạt động
          </Badge>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} expanded={expanded} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

function TypeGroupView({ phongBans }: { phongBans: PhongBanNode[] }) {
  const hanhChinh = phongBans.filter((pb) => pb.loai === "hanh_chinh" && pb.trang_thai !== false)
  const chuyenMon = phongBans.filter((pb) => pb.loai === "chuyen_mon" && pb.trang_thai !== false)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded bg-blue-400" />
          <h4 className="font-semibold text-sm">Hành chính ({hanhChinh.length})</h4>
        </div>
        <div className="space-y-1">
          {hanhChinh.map((pb) => (
            <div
              key={pb.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Landmark className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{pb.ten_phong_ban}</p>
                <p className="text-[11px] text-muted-foreground">{pb.ma_phong_ban}</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {pb.nhanVienCount} NV
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded bg-amber-400" />
          <h4 className="font-semibold text-sm">Chuyên môn ({chuyenMon.length})</h4>
        </div>
        <div className="space-y-1">
          {chuyenMon.map((pb) => (
            <div
              key={pb.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <Building2 className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{pb.ten_phong_ban}</p>
                <p className="text-[11px] text-muted-foreground">{pb.ma_phong_ban}</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {pb.nhanVienCount} NV
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ListView({ phongBans }: { phongBans: PhongBanNode[] }) {
  const sorted = [...phongBans].sort((a, b) => b.nhanVienCount - a.nhanVienCount)

  return (
    <div className="space-y-1">
      {sorted.map((pb) => (
        <div
          key={pb.id}
          className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors ${
            pb.trang_thai === false ? "opacity-50" : ""
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              pb.loai === "hanh_chinh" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
            }`}
          >
            {pb.loai === "hanh_chinh" ? (
              <Landmark className="h-4 w-4" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">{pb.ten_phong_ban}</p>
            <p className="text-[11px] text-muted-foreground">
              {pb.ma_phong_ban}
              {pb.cha_id && " • Có phòng ban con"}
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {pb.nhanVienCount} NV
          </Badge>
        </div>
      ))}
    </div>
  )
}

interface PhongBanCoCauDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhongBanCoCauDialog({ open, onOpenChange }: PhongBanCoCauDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("tree")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { data: phongBansData = [] } = usePhongBanAll()
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

  const tree = useMemo(() => buildTree(phongBansData, nhanVienCounts), [phongBansData, nhanVienCounts])

  const stats = useMemo(() => {
    const total = phongBansData.length
    const hanhChinh = phongBansData.filter((pb) => pb.loai === "hanh_chinh").length
    const chuyenMon = phongBansData.filter((pb) => pb.loai === "chuyen_mon").length
    const active = phongBansData.filter((pb) => pb.trang_thai !== false).length
    return { total, hanhChinh, chuyenMon, active }
  }, [phongBansData])

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (nodes: PhongBanNode[]) => {
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          allIds.add(node.id)
          collectIds(node.children)
        }
      })
    }
    collectIds(tree)
    setExpanded(allIds)
  }

  const collapseAll = () => {
    setExpanded(new Set())
  }

  if (phongBansData.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent size="full" className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Cơ cấu phòng ban
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-600">Chưa có phòng ban</h3>
            <p className="text-sm text-muted-foreground mt-1">Hãy tạo phòng ban đầu tiên để xem cơ cấu</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl" style={{ maxHeight: '85vh' }} className="flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Cơ cấu phòng ban
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{stats.total} phòng ban</span>
              <span>•</span>
              <span>{stats.active} hoạt động</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-blue-400" />
              <span className="text-muted-foreground">Hành chính ({stats.hanhChinh})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-amber-400" />
              <span className="text-muted-foreground">Chuyên môn ({stats.chuyenMon})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "tree" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setViewMode("tree")}
            >
              <Network className="h-3.5 w-3.5" />
              Tree
            </Button>
            <Button
              variant={viewMode === "type" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setViewMode("type")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Theo loại
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" />
              Danh sách
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {viewMode === "tree" && (
            <>
              <div className="flex items-center gap-2 px-3 pb-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={expandAll}>
                  Mở rộng tất cả
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={collapseAll}>
                  Thu gọn
                </Button>
              </div>
              <div>
                {tree.map((node) => (
                  <TreeNode key={node.id} node={node} expanded={expanded} onToggle={toggleExpanded} />
                ))}
              </div>
            </>
          )}
          {viewMode === "type" && <TypeGroupView phongBans={tree} />}
          {viewMode === "list" && <ListView phongBans={tree} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
