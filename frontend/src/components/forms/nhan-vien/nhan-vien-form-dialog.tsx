"use client"

import React, { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  UserIcon,
  CreditCardIcon,
  BriefcaseIcon,
  FileTextIcon,
  PartyPopperIcon,
  MoreHorizontalIcon,
  UserCircleIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BadgeCheckIcon,
  SchoolIcon,
  BuildingIcon,
  UsersIcon,
  AwardIcon,
  FlagIcon,
  FileSignatureIcon,
  BanknoteIcon,
  ClockIcon,
  HeartHandshakeIcon,
  StickyNoteIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  LandmarkIcon,
} from "lucide-react"
import { z } from "zod"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { formatDateVN } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { NhanVien } from "@/types/nhan-vien.types"
import {
  nhanVienPersonalSchema,
  nhanVienIdentitySchema,
  nhanVienWorkSchema,
  nhanVienContractSchema,
  nhanVienPartySchema,
  nhanVienFullSchema,
  type NhanVienFullInput,
} from "@/schemas/employee.schema"
import { useChucVuList, LOAI_MAPPING } from "@/hooks/chuc-vu/use-chuc-vu-query"
import { usePhongBanAll } from "@/hooks/phong-ban/use-phong-ban-query"
import { Combobox } from "@/components/ui/combobox"

export interface NhanVienFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingNhanVien?: NhanVien | null
  isPending: boolean
  onSubmit: (data: NhanVienFullInput, editId?: string) => void
}

const LOAI_NHAN_VIEN = [
  { value: "giao_vien", label: "Giáo viên", icon: SchoolIcon, color: "text-emerald-600" },
  { value: "nhan_vien", label: "Nhân viên", icon: UsersIcon, color: "text-blue-600" },
  { value: "can_bo", label: "Cán bộ", icon: BadgeCheckIcon, color: "text-purple-600" },
] as const

const GIOI_TINH = [
  { value: "Nam", label: "Nam", icon: "👨" },
  { value: "Nữ", label: "Nữ", icon: "👩" },
  { value: "Khác", label: "Khác", icon: "🧑" },
] as const

const TINH_TRANG_HON_NHAN = [
  { value: "doc_than", label: "Độc thân" },
  { value: "da_ket_hon", label: "Đã kết hôn" },
  { value: "ly_di", label: "Ly dị" },
  { value: "goa_vo", label: "Góa vợ/chồng" },
] as const

const MON_DAY = [
  { value: "Toán", label: "Toán" },
  { value: "Ngữ văn", label: "Ngữ văn" },
  { value: "Vật lý", label: "Vật lý" },
  { value: "Hóa học", label: "Hóa học" },
  { value: "Sinh học", label: "Sinh học" },
  { value: "Lịch sử", label: "Lịch sử" },
  { value: "Địa lý", label: "Địa lý" },
  { value: "Tiếng Anh", label: "Tiếng Anh" },
  { value: "Tiếng Pháp", label: "Tiếng Pháp" },
  { value: "Tiếng Trung", label: "Tiếng Trung" },
  { value: "Tiếng Nga", label: "Tiếng Nga" },
  { value: "Tiếng Hàn", label: "Tiếng Hàn" },
  { value: "Tiếng Nhật", label: "Tiếng Nhật" },
  { value: "Thể dục", label: "Thể dục" },
  { value: "Âm nhạc", label: "Âm nhạc" },
  { value: "Mỹ thuật", label: "Mỹ thuật" },
  { value: "Tin học", label: "Tin học" },
  { value: "GDCD", label: "Giáo dục công dân" },
  { value: "Công nghệ", label: "Công nghệ" },
  { value: "GDQP", label: "Giáo dục quốc phòng" },
  { value: "Khoa học tự nhiên", label: "Khoa học tự nhiên" },
  { value: "Khoa học xã hội", label: "Khoa học xã hội" },
  { value: "Lịch sử - Địa lý", label: "Lịch sử - Địa lý" },
  { value: "Hoạt động trải nghiệm", label: "Hoạt động trải nghiệm" },
  { value: "Tin học ứng dụng", label: "Tin học ứng dụng" },
  { value: "Công nghệ thông tin", label: "Công nghệ thông tin" },
  { value: "Giáo dục địa phương", label: "Giáo dục địa phương" },
  { value: "Kỹ thuật", label: "Kỹ thuật" },
] as const

const CAP_HOC = [
  { value: "mam_non", label: "Mầm non" },
  { value: "tieu_hoc", label: "Tiểu học" },
  { value: "thcs", label: "THCS" },
  { value: "thpt", label: "THPT" },
  { value: "gdtx", label: "GDTX" },
] as const

const LOAI_HOP_DONG = [
  { value: "vien_chuc", label: "Viên chức" },
  { value: "hop_dong", label: "Hợp đồng" },
  { value: "thu_viec", label: "Thử việc" },
] as const

const HANG_CHUC_DANH = [
  { value: "A1", label: "Hạng I (A1)" },
  { value: "A2", label: "Hạng II (A2)" },
  { value: "B", label: "Hạng III (B)" },
  { value: "C", label: "Hạng IV (C)" },
] as const

const TRANG_THAI = [
  { value: "dang_lam", label: "Đang làm", color: "bg-emerald-500" },
  { value: "nghi_viec", label: "Nghỉ việc", color: "bg-amber-500" },
  { value: "nghi_huu", label: "Nghỉ hưu", color: "bg-slate-500" },
] as const

const TAB_ITEMS = [
  { value: "personal", label: "Cá nhân", icon: UserCircleIcon, description: "Thông tin cá nhân" },
  { value: "identity", label: "CCCD", icon: CreditCardIcon, description: "Giấy tờ tùy thân" },
  { value: "work", label: "Công tác", icon: BriefcaseIcon, description: "Phòng ban, chức vụ" },
  { value: "contract", label: "Hợp đồng", icon: FileSignatureIcon, description: "Hợp đồng lao động" },
  { value: "party", label: "Đảng/Đoàn", icon: FlagIcon, description: "Đảng viên, Đoàn viên" },
  { value: "other", label: "Khác", icon: StickyNoteIcon, description: "Ghi chú bổ sung" },
] as const

const TAB_FIELDS: Record<string, (keyof NhanVienFullInput)[]> = {
  personal: ["ho_ten", "gioi_tinh", "ngay_sinh", "que_quan", "dia_chi_thuong_tru", "so_dien_thoai", "email", "dan_toc", "noi_sinh", "tinh_trang_hon_nhan"],
  identity: ["so_cccd", "ngay_cap_cccd", "noi_cap_cccd"],
  work: ["loai_nhan_vien", "trang_thai", "cap_hoc", "phong_ban_id", "chuc_vu_id"],
  contract: ["loai_hop_dong", "ngay_vao_lam"],
  party: ["la_dang_vien", "la_doan_vien"],
  other: [],
}

function getFieldsForTab(tab: string): (keyof NhanVienFullInput)[] {
  return TAB_FIELDS[tab] || []
}

const TAB_SCHEMAS: Record<string, z.ZodTypeAny> = {
  personal: nhanVienPersonalSchema,
  identity: nhanVienIdentitySchema,
  work: nhanVienWorkSchema,
  contract: nhanVienContractSchema,
  party: nhanVienPartySchema,
  other: z.object({}),
}

async function validateTabFields(form: ReturnType<typeof useForm<NhanVienFullInput>>, tab: string): Promise<boolean> {
  const schema = TAB_SCHEMAS[tab]
  if (!schema || schema === z.object({})) return true
  const values = form.getValues()
  const result = schema.safeParse(values)
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) {
        form.setError(field as keyof NhanVienFullInput, { type: "manual", message: messages[0] })
      }
    }
    return false
  }
  return true
}

const DEFAULT_VALUES: NhanVienFullInput = {
  ho_ten: "",
  gioi_tinh: "Nam",
  ngay_sinh: "",
  que_quan: "",
  dia_chi_thuong_tru: "",
  dia_chi_tam_tru: "",
  so_dien_thoai: "",
  email: "",
  email_ca_nhan: "",
  dan_toc: "",
  ton_giao: "",
  noi_sinh: "",
  tinh_trang_hon_nhan: "doc_than" as typeof DEFAULT_VALUES.tinh_trang_hon_nhan,
  so_bao_hiem: "",
  ngay_tham_gia_bhxh: "",
  so_tai_khoan_ngan_hang: "",
  ten_ngan_hang: "",
  so_cccd: "",
  ngay_cap_cccd: "",
  noi_cap_cccd: "",
  loai_nhan_vien: "giao_vien",
  trang_thai: "dang_lam",
  mon_day: "",
  cap_hoc: "thpt",
  phong_ban_id: "",
  chuc_vu_id: "",
  loai_hop_dong: "vien_chuc",
  so_hop_dong: "",
  ngay_vao_lam: "",
  ngay_het_hop_dong: "",
  hinh_thuc_tuyen_dung: "",
  noi_ky_hop_dong: "",
  hang_chuc_danh: undefined,
  ngach_luong: "",
  bac_luong: undefined,
  he_so_luong: "",
  so_nam_tham_nien: undefined,
  la_dang_vien: false,
  ngay_vao_dang: "",
  la_doan_vien: false,
  ngay_vao_doan: "",
  ghi_chu: "",
  anh_dai_dien: "",
}

function DatePickerField({
  value,
  onChange,
  placeholder = "Chọn ngày",
}: {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarDaysIcon className="mr-2 h-4 w-4 shrink-0" />
          {value ? formatDateVN(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  )
}

export function NhanVienFormDialog({
  open,
  onOpenChange,
  editingNhanVien,
  isPending,
  onSubmit,
}: NhanVienFormDialogProps) {
   const form = useForm<NhanVienFullInput>({
     defaultValues: DEFAULT_VALUES,
     mode: "onChange",
     reValidateMode: "onChange",
   })

   const [activeTab, setActiveTab] = useState("personal")

   const [isCurrentTabValid, setIsCurrentTabValid] = useState(false)

   const { watch, setValue, reset, trigger } = form
   const loaiNhanVien = watch("loai_nhan_vien")
   const watchedValues = watch()

   useEffect(() => {
    const schema = TAB_SCHEMAS[activeTab]
    if (!schema || schema === z.object({})) {
      setIsCurrentTabValid(true)
      return
    }
    const result = schema.safeParse(watchedValues)
    if (!result.success) {
      console.log(`[Tab ${activeTab}] Validation errors:`, JSON.stringify(result.error.flatten().fieldErrors))
    }
    setIsCurrentTabValid(result.success)
  }, [watchedValues, activeTab])

   const { data: phongBanList } = usePhongBanAll({ enabled: !!open })
   const filteredLoai = loaiNhanVien ? LOAI_MAPPING[loaiNhanVien as keyof typeof LOAI_MAPPING] : undefined
   const { data: chucVuList } = useChucVuList(filteredLoai, { enabled: !!open })

  const isGiaoVien = loaiNhanVien === "giao_vien"
  const isCanBo = loaiNhanVien === "can_bo"
  const isNhanVien = loaiNhanVien === "nhan_vien"

  // Tabs visibility based on employee type
  const showContractTab = isGiaoVien || isCanBo || watch("loai_hop_dong")
  const showPartyTab = isGiaoVien || isCanBo

  // Get visible tabs
  const visibleTabs = TAB_ITEMS.filter((tab) => {
    if (tab.value === "identity") return true
    if (tab.value === "contract") return showContractTab
    if (tab.value === "party") return showPartyTab
    return true
  })

  useEffect(() => {
    if (editingNhanVien) {
      reset({
        ho_ten: editingNhanVien.ho_ten || "",
        gioi_tinh: editingNhanVien.gioi_tinh as "Nam" | "Nữ" | "Khác",
        ngay_sinh: editingNhanVien.ngay_sinh || "",
        que_quan: editingNhanVien.que_quan || "",
        dia_chi_thuong_tru: editingNhanVien.dia_chi_thuong_tru || "",
        dia_chi_tam_tru: editingNhanVien.dia_chi_tam_tru || "",
        so_dien_thoai: editingNhanVien.so_dien_thoai || "",
        email: editingNhanVien.email || "",
        email_ca_nhan: editingNhanVien.email_ca_nhan || "",
        dan_toc: editingNhanVien.dan_toc || "",
        ton_giao: editingNhanVien.ton_giao || "",
        noi_sinh: editingNhanVien.noi_sinh || "",
        tinh_trang_hon_nhan: editingNhanVien.tinh_trang_hon_nhan as typeof DEFAULT_VALUES.tinh_trang_hon_nhan,
        so_cccd: editingNhanVien.so_cccd || "",
        ngay_cap_cccd: editingNhanVien.ngay_cap_cccd || "",
        noi_cap_cccd: editingNhanVien.noi_cap_cccd || "",
        loai_nhan_vien: editingNhanVien.loai_nhan_vien as typeof DEFAULT_VALUES.loai_nhan_vien,
        trang_thai: editingNhanVien.trang_thai as typeof DEFAULT_VALUES.trang_thai,
        mon_day: editingNhanVien.mon_day || "",
        cap_hoc: (editingNhanVien.cap_hoc || "thpt") as typeof DEFAULT_VALUES.cap_hoc,
        phong_ban_id: editingNhanVien.phong_ban_id || "",
        chuc_vu_id: editingNhanVien.chuc_vu_id || "",
        loai_hop_dong: editingNhanVien.loai_hop_dong as typeof DEFAULT_VALUES.loai_hop_dong,
        so_hop_dong: editingNhanVien.so_hop_dong || "",
        ngay_vao_lam: editingNhanVien.ngay_vao_lam || "",
        ngay_het_hop_dong: editingNhanVien.ngay_het_hop_dong || "",
        hinh_thuc_tuyen_dung: editingNhanVien.hinh_thuc_tuyen_dung || "",
        noi_ky_hop_dong: editingNhanVien.noi_ky_hop_dong || "",
        hang_chuc_danh: editingNhanVien.hang_chuc_danh as typeof DEFAULT_VALUES.hang_chuc_danh,
        ngach_luong: editingNhanVien.ngach_luong || "",
        bac_luong: editingNhanVien.bac_luong as typeof DEFAULT_VALUES.bac_luong,
        he_so_luong: editingNhanVien.he_so_luong as typeof DEFAULT_VALUES.he_so_luong,
        so_nam_tham_nien: editingNhanVien.so_nam_tham_nien as typeof DEFAULT_VALUES.so_nam_tham_nien,
        la_dang_vien: editingNhanVien.la_dang_vien || false,
        ngay_vao_dang: editingNhanVien.ngay_vao_dang || "",
        la_doan_vien: editingNhanVien.la_doan_vien || false,
        ngay_vao_doan: editingNhanVien.ngay_vao_doan || "",
        ghi_chu: editingNhanVien.ghi_chu || "",
         anh_dai_dien: editingNhanVien.anh_dai_dien || "",
       })
    } else {
      reset(DEFAULT_VALUES)
    }
    setActiveTab("personal")
  }, [editingNhanVien, open, reset])

  const CLEAN_UNDEFINED_FIELDS = [
    "ngay_cap_cccd", "ngay_vao_lam", "ngay_het_hop_dong",
    "ngay_vao_dang", "ngay_vao_doan", "ngay_tham_gia_bhxh",
    "ngay_bo_nhiem_chuc_vu", "email", "email_ca_nhan",
    "phong_ban_id", "chuc_vu_id",
  ] as const

  const handleSubmit = (data: NhanVienFullInput) => {
    const cleaned = { ...data }
    for (const field of CLEAN_UNDEFINED_FIELDS) {
      if (cleaned[field] === "") {
        (cleaned as Record<string, unknown>)[field] = undefined
      }
    }
    onSubmit(cleaned as NhanVienFullInput, editingNhanVien?.id)
  }

  const goToNextTab = useCallback(() => {
    const currentIndex = visibleTabs.findIndex((t) => t.value === activeTab)
    if (currentIndex < visibleTabs.length - 1) {
      setActiveTab(visibleTabs[currentIndex + 1].value)
    }
  }, [activeTab, visibleTabs])

  const currentTabIndex = visibleTabs.findIndex((t) => t.value === activeTab)
  const isLastTab = currentTabIndex === visibleTabs.length - 1

   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent size="5xl" className="max-h-[95vh] overflow-hidden flex flex-col p-0">
         <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
           <div className="flex items-center gap-3">
             <div className={cn(
               "flex h-8 w-8 items-center justify-center rounded-md",
               editingNhanVien ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
             )}>
               <UserCircleIcon className="h-4 w-4" />
             </div>
             <div>
               <DialogTitle className="text-base">
                 {editingNhanVien ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
               </DialogTitle>
               <DialogDescription className="text-xs text-muted-foreground">
                 {editingNhanVien
                   ? `${editingNhanVien.ho_ten} • ${editingNhanVien.ma_nhan_vien}`
                   : "Điền đầy đủ thông tin bên dưới"}
               </DialogDescription>
             </div>
           </div>
         </DialogHeader>
    <Form {...(form as any)}>
      <form onSubmit={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter' && !isLastTab) e.preventDefault() }} className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 pt-3 shrink-0">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-slate-100/50 p-1 rounded-xl flex-wrap h-auto">
                <TooltipProvider>
                {visibleTabs.map((tab, index) => {
                   const Icon = tab.icon
                   const currentIndex = visibleTabs.findIndex((t) => t.value === activeTab)
                   let isDisabled = false
                      if (index < currentIndex) {
                        isDisabled = false
                      } else if (index === currentIndex) {
                        isDisabled = false
                      } else {
                        isDisabled = !(index === currentIndex + 1 && isCurrentTabValid)
                      }
                      const trigger = (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          disabled={isDisabled}
                          className={cn(
                            "cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Icon className="h-4 w-4 mr-1.5" />
                          {tab.label}
                        </TabsTrigger>
                      )
                      if (isDisabled) {
                        return (
                          <Tooltip key={tab.value}>
                            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              Hoàn thành tab hiện tại để tiếp tục
                            </TooltipContent>
                          </Tooltip>
                        )
                      }
                      return trigger
                    })}
                  </TooltipProvider>
                </TabsList>

                {/* Tab Description */}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <ChevronRightIcon className="h-3 w-3" />
                  <span>{visibleTabs.find((t) => t.value === activeTab)?.description}</span>
                </div>
              </Tabs>
            </div>

            {/* Form Content - Fixed Height & Scrollable */}
            <div className="h-[500px] overflow-y-auto px-6 py-4">
              <Form {...(form as any)}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="min-h-full"
                  >
                    {/* ============ TAB 1: Cá nhân ============ */}
                    {activeTab === "personal" && (
                      <div className="space-y-6">
                    {/* Employee Type Selection */}
                    <div className="space-y-3">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <BadgeCheckIcon className="h-3 w-3" />
                        Loại nhân viên <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        {LOAI_NHAN_VIEN.map((type) => {
                          const Icon = type.icon
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setValue("loai_nhan_vien", type.value as typeof DEFAULT_VALUES.loai_nhan_vien)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                loaiNhanVien === type.value
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                              )}
                            >
                              <Icon className={cn("h-5 w-5 shrink-0", type.color)} />
                              <span className="font-medium text-sm">{type.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        Thông tin cơ bản
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="ho_ten"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Nguyễn Văn A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gioi_tinh"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Giới tính <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {GIOI_TINH.map((gt) => (
                                    <SelectItem key={gt.value} value={gt.value}>
                                      {gt.icon} {gt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ngay_sinh"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Ngày sinh <span className="text-red-500">*</span></FormLabel>
                              <DatePickerField
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Chọn ngày sinh"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="noi_sinh"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nơi sinh <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="TP. Hồ Chí Minh" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dan_toc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dân tộc <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Kinh" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ton_giao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tôn giáo</FormLabel>
                              <FormControl>
                                <Input placeholder="Không" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                        Liên lạc
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="so_dien_thoai"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số điện thoại <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="0912 345 678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email trường <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="ten@thanglong.edu.vn" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email_ca_nhan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email cá nhân</FormLabel>
                              <FormControl>
                                <Input placeholder="ten@gmail.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tinh_trang_hon_nhan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tình trạng hôn nhân <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TINH_TRANG_HON_NHAN.map((tt) => (
                                    <SelectItem key={tt.value} value={tt.value}>
                                      {tt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        Địa chỉ
                      </h3>

                      <FormField
                        control={form.control}
                        name="que_quan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quê quán <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea placeholder="Quận 1, TP. Hồ Chí Minh" {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="dia_chi_thuong_tru"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Địa chỉ thường trú <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="123 Đường ABC, Quận 1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dia_chi_tam_tru"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Địa chỉ tạm trú</FormLabel>
                              <FormControl>
                                <Input placeholder="456 Đường XYZ, Quận 2" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ TAB 2: CCCD ============ */}
                {activeTab === "identity" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                      <CreditCardIcon className="h-8 w-8 text-primary shrink-0" />
                      <div>
                        <h3 className="font-semibold">Thông tin CCCD/CMND</h3>
                        <p className="text-xs text-muted-foreground">Số CCCD gồm 9 hoặc 12 số</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="so_cccd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số CCCD/CMND <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="012345678901" {...field} maxLength={12} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Nhập 9 số (CMND cũ) hoặc 12 số (CCCD mới)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ngay_cap_cccd"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Ngày cấp <span className="text-red-500">*</span></FormLabel>
                            <DatePickerField
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Ngày cấp CCCD"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="noi_cap_cccd"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Nơi cấp <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Công an TP. Hồ Chí Minh" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>


                  </div>
                )}

                {/* ============ TAB 3: Công tác ============ */}
                {activeTab === "work" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="trang_thai"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trạng thái <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRANG_THAI.map((tt) => (
                                  <SelectItem key={tt.value} value={tt.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={cn("h-2 w-2 rounded-full", tt.color)} />
                                      {tt.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Giáo viên fields */}
                    {isGiaoVien && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                            Thông tin giảng dạy
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="mon_day"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Môn dạy</FormLabel>
                                  <FormControl>
                                    <Combobox
                                      options={MON_DAY.map((m) => ({ value: m.value, label: m.label }))}
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      placeholder="Chọn môn dạy..."
                                      emptyMessage="Không tìm thấy môn"
                                      searchPlaceholder="Tìm môn dạy..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="cap_hoc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cấp học <span className="text-red-500">*</span></FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {CAP_HOC.map((ch) => (
                                        <SelectItem key={ch.value} value={ch.value}>
                                          {ch.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Cán bộ fields */}
                    {isCanBo && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                            Thông tin quản lý
                          </h3>
                          <FormField
                            control={form.control}
                            name="cap_hoc"
                            render={({ field }) => (
                              <FormItem className="md:w-1/2">
                                 <FormLabel>Cấp học quản lý <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {CAP_HOC.map((ch) => (
                                      <SelectItem key={ch.value} value={ch.value}>
                                        {ch.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Phòng ban / Chức vụ */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                        Phòng ban & Chức vụ
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="phong_ban_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phòng ban/Tổ bộ môn <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Combobox
                                  options={phongBanList?.map((pb) => ({
                                    value: pb.id,
                                    label: pb.ten_phong_ban,
                                  })) ?? []}
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Chọn phòng ban..."
                                  emptyMessage="Không có phòng ban"
                                  searchPlaceholder="Tìm phòng ban..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="chuc_vu_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chức vụ <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Combobox
                                  options={chucVuList?.map((cv) => ({
                                    value: cv.id,
                                    label: cv.ten_chuc_vu,
                                    description: `Cấp ${cv.cap_bac}`,
                                  })) ?? []}
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Chọn chức vụ..."
                                  emptyMessage="Không có chức vụ phù hợp"
                                  searchPlaceholder="Tìm chức vụ..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ TAB 4: Hợp đồng ============ */}
                {activeTab === "contract" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="loai_hop_dong"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loại hợp đồng <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {LOAI_HOP_DONG.map((lhd) => (
                                  <SelectItem key={lhd.value} value={lhd.value}>
                                    {lhd.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="so_hop_dong"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số hợp đồng</FormLabel>
                            <FormControl>
                              <Input placeholder="01/2024/HĐLĐ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ngay_vao_lam"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                             <FormLabel>Ngày vào làm <span className="text-red-500">*</span></FormLabel>
                            <DatePickerField
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Ngày vào làm"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ngay_het_hop_dong"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Ngày hết hạn</FormLabel>
                            <DatePickerField
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Ngày hết hạn"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hinh_thuc_tuyen_dung"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hình thức tuyển dụng</FormLabel>
                            <FormControl>
                              <Input placeholder="Thi tuyển / Xét tuyển" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="noi_ky_hop_dong"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nơi ký hợp đồng</FormLabel>
                            <FormControl>
                              <Input placeholder="TP. Hồ Chí Minh" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Lương */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
                        Thông tin lương
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="hang_chuc_danh"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hạng chức danh</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {HANG_CHUC_DANH.map((hcd) => (
                                    <SelectItem key={hcd.value} value={hcd.value}>
                                      {hcd.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ngach_luong"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ngạch lương</FormLabel>
                              <FormControl>
                                <Input placeholder="GVTHPT" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bac_luong"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bậc lương</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={String(field.value || "")}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn bậc..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bac) => (
                                    <SelectItem key={bac} value={String(bac)}>
                                      Bậc {bac}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="he_so_luong"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hệ số lương</FormLabel>
                              <FormControl>
                                <Input placeholder="2.34" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="so_nam_tham_nien"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số năm thâm niên</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="5" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ TAB 5: Đảng/Đoàn ============ */}
                {activeTab === "party" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <FlagIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <FormLabel className="text-base cursor-pointer">Đảng viên</FormLabel>
                            <FormDescription className="text-xs">
                              Tick nếu là đảng viên Đảng Cộng sản
                            </FormDescription>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="la_dang_vien"
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      {watch("la_dang_vien") && (
                        <FormField
                          control={form.control}
                          name="ngay_vao_dang"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Ngày vào Đảng</FormLabel>
                              <DatePickerField
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Ngày vào Đảng"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <HeartHandshakeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <FormLabel className="text-base cursor-pointer">Đoàn viên</FormLabel>
                            <FormDescription className="text-xs">
                              Tick nếu là đoàn viên Đoàn TNCS HCM
                            </FormDescription>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="la_doan_vien"
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      {watch("la_doan_vien") && (
                        <FormField
                          control={form.control}
                          name="ngay_vao_doan"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Ngày vào Đoàn</FormLabel>
                              <DatePickerField
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Ngày vào Đoàn"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* ============ TAB 6: Khác ============ */}
                {activeTab === "other" && (
                  <div className="space-y-6">
                    {/* BHXH Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                        Bảo hiểm xã hội
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="so_bao_hiem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số BHXH</FormLabel>
                              <FormControl>
                                <Input placeholder="0123456789" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ngay_tham_gia_bhxh"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Ngày tham gia BHXH</FormLabel>
                              <DatePickerField
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Chọn ngày"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Bank Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <LandmarkIcon className="h-4 w-4 text-muted-foreground" />
                        Thông tin ngân hàng
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="ten_ngan_hang"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên ngân hàng</FormLabel>
                              <FormControl>
                                <Input placeholder="Vietcombank" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="so_tai_khoan_ngan_hang"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số tài khoản</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="ghi_chu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <StickyNoteIcon className="h-4 w-4" />
                            Ghi chú
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Thông tin bổ sung khác về nhân viên..."
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Các thông tin khác cần lưu ý
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                  </motion.div>
                </AnimatePresence>
              </Form>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                  {form.formState.isDirty && (
                    <span className="flex items-center gap-1">
                      <AlertCircleIcon className="h-3 w-3" />
                      Có thay đổi chưa lưu
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Hủy
                  </Button>
                  {isLastTab ? (
                    <Button
                      type="button"
                      disabled={isPending}
                      className="gap-2"
                      onClick={form.handleSubmit(handleSubmit)}
                    >
                      {isPending ? (
                        <>Đang lưu...</>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          {editingNhanVien ? "Cập nhật" : "Tạo nhân viên"}
                        </>
                      )}
                    </Button>
                   ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              onClick={async () => {
                                const isValid = await validateTabFields(form, activeTab)
                                if (isValid) {
                                  const currentIndex = visibleTabs.findIndex((t) => t.value === activeTab)
                                  if (currentIndex < visibleTabs.length - 1) {
                                    setActiveTab(visibleTabs[currentIndex + 1].value)
                                  }
                                }
                              }}
                              disabled={!isCurrentTabValid}
                              className={cn(
                                "gap-2",
                                !isCurrentTabValid && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              Tiếp tục
                              <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          {!isCurrentTabValid && (
                            <TooltipContent side="top" className="text-xs">
                              Vui lòng điền đầy đủ thông tin bắt buộc
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                 </div>
               </div>
             </DialogFooter>
           </form>
         </Form>
       </DialogContent>
     </Dialog>
   )
}
