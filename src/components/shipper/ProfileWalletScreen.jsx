"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

// Icons
import WalletIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlineOutlined";
import BookIcon from "@mui/icons-material/ImportContactsOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import PageHeader from "@/components/common/PageHeader";

// Mock Transaction History
const INITIAL_TRANSACTIONS = [
  {
    id: "TX-2026-001",
    type: "deposit", // Nạp tiền
    typeName: "Nạp tiền vào ví (Qua VietQR)",
    amount: 20000000,
    time: "2026-07-02 09:30",
    status: "success",
  },
  {
    id: "TX-2026-002",
    type: "hold", // Trừ cọc
    typeName: "Tạm giữ cọc đấu giá (Lô LH-9041)",
    amount: -2500000,
    time: "2026-07-02 10:15",
    status: "success",
  },
  {
    id: "TX-2026-003",
    type: "refund", // Hoàn cọc
    typeName: "Hoàn trả cọc thầu (Lô LH-8072)",
    amount: 1500000,
    time: "2026-07-01 16:40",
    status: "success",
  },
  {
    id: "TX-2026-004",
    type: "payment", // Thanh toán
    typeName: "Thanh toán cước vận chuyển (Đơn LH-9034)",
    amount: -8900000,
    time: "2026-06-30 18:10",
    status: "success",
  },
  {
    id: "TX-2026-005",
    type: "withdraw", // Rút tiền
    typeName: "Rút tiền về tài khoản MB Bank",
    amount: -5000000,
    time: "2026-06-29 11:20",
    status: "success",
  }
];

// Mock Address Book
const INITIAL_ADDRESSES = [
  {
    id: "addr-1",
    label: "Kho Tổng Quận 9 (TP.HCM)",
    contactName: "Trần Thế Hải",
    contactPhone: "0912.345.678",
    province: "TP. Hồ Chí Minh",
    detail: "Cổng số 3, Khu Công Nghệ Cao, Quận 9",
  },
  {
    id: "addr-2",
    label: "Kho Thành Phẩm Bắc Ninh",
    contactName: "Nguyễn Thị Hương",
    contactPhone: "0988.776.655",
    province: "Bắc Ninh",
    detail: "Lô B4, KCN Yên Phong, Xã Yên Trung",
  },
  {
    id: "addr-3",
    label: "Cảng Đình Vũ (Hải Phòng)",
    contactName: "Phạm Hồng Minh",
    contactPhone: "0904.445.555",
    province: "Hải Phòng",
    detail: "Cầu cảng số 2, Cảng Đình Vũ, Quận Hải An",
  }
];

export default function ProfileWalletScreen({ initialTab = 0 }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [balance, setBalance] = useState(15500000);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);

  // States for Wallet actions
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [walletActionType, setWalletActionType] = useState("deposit"); // 'deposit' or 'withdraw'
  const [walletAmount, setWalletAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("MB Bank - 1902888889999");

  // States for Profile Info
  const [companyName, setCompanyName] = useState("Công ty TNHH Logistics & Thương mại Toàn Cầu");
  const [taxCode, setTaxCode] = useState("0102030405");
  const [representative, setRepresentative] = useState("Nguyễn Minh Triết");
  const [phone, setPhone] = useState("0903.111.222");
  const [kycStatus, setKycStatus] = useState("verified"); // 'verified' or 'pending' or 'unverified'
  const [uploadedDoc, setUploadedDoc] = useState("GPKD_ToanCau.pdf");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // States for Address Book Actions
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [addressEditMode, setAddressEditMode] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    contactName: "",
    contactPhone: "",
    province: "",
    detail: "",
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val)
      .replace("₫", "đ");
  };

  // --- Wallet Action Handlers ---
  const handleOpenWalletAction = (type) => {
    setWalletActionType(type);
    setWalletAmount("");
    setOpenWalletDialog(true);
  };

  const handleWalletActionSubmit = () => {
    const amountNum = Number(walletAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (walletActionType === "withdraw" && amountNum > balance) {
      alert("Số dư khả dụng không đủ để thực hiện giao dịch này.");
      return;
    }

    const newBalance = walletActionType === "deposit" ? balance + amountNum : balance - amountNum;
    setBalance(newBalance);

    const newTx = {
      id: `TX-2026-00${transactions.length + 1}`,
      type: walletActionType,
      typeName: walletActionType === "deposit" ? "Nạp tiền vào ví" : "Rút tiền về tài khoản ngân hàng",
      amount: walletActionType === "deposit" ? amountNum : -amountNum,
      time: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "success",
    };

    setTransactions([newTx, ...transactions]);
    setOpenWalletDialog(false);
  };

  // --- Profile eKYC Handlers ---
  const handleSaveProfile = () => {
    setProfileSuccessMsg("Thông tin hồ sơ và eKYC đã được cập nhật thành công.");
    setTimeout(() => {
      setProfileSuccessMsg("");
    }, 3000);
  };

  // --- Address Book Handlers ---
  const handleOpenAddressAdd = () => {
    setAddressEditMode(false);
    setAddressForm({
      label: "",
      contactName: "",
      contactPhone: "",
      province: "",
      detail: "",
    });
    setOpenAddressDialog(true);
  };

  const handleOpenAddressEdit = (addr) => {
    setAddressEditMode(true);
    setSelectedAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      contactName: addr.contactName,
      contactPhone: addr.contactPhone,
      province: addr.province,
      detail: addr.detail,
    });
    setOpenAddressDialog(true);
  };

  const handleAddressDelete = (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này khỏi Sổ địa chỉ?")) {
      setAddresses(addresses.filter((item) => item.id !== id));
    }
  };

  const handleAddressSubmit = () => {
    if (!addressForm.label || !addressForm.detail || !addressForm.contactName || !addressForm.contactPhone) {
      alert("Vui lòng nhập đầy đủ các trường thông tin bắt buộc.");
      return;
    }

    if (addressEditMode) {
      setAddresses(
        addresses.map((item) =>
          item.id === selectedAddressId ? { ...item, ...addressForm } : item
        )
      );
    } else {
      const newAddr = {
        id: `addr-${Date.now()}`,
        ...addressForm,
      };
      setAddresses([...addresses, newAddr]);
    }
    setOpenAddressDialog(false);
  };

  return (
    <Box className="w-full min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Tài Khoản & Thiết Lập"
        subtitle="Quản lý thông tin doanh nghiệp, số dư ví ký quỹ giao dịch và sổ địa chỉ giao nhận."
        breadcrumbs={[
          { label: "Trang chủ", path: "/dashboard" },
          { label: "Thiết lập tài khoản" },
        ]}
      />

      {/* Main Tabs Navigation */}
      <Box className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-3 shadow-[0_8px_32px_0_rgba(27,73,101,0.03)] mb-6">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#1B4965",
              height: 3,
              borderRadius: 2,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              color: "#64748B",
              minHeight: 48,
              "&.Mui-selected": {
                color: "#1B4965",
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab icon={<WalletIcon className="!text-[1.2rem] mr-2" />} iconPosition="start" label="Ví điện tử" />
          <Tab icon={<PersonIcon className="!text-[1.2rem] mr-2" />} iconPosition="start" label="Hồ sơ & eKYC" />
          <Tab icon={<BookIcon className="!text-[1.2rem] mr-2" />} iconPosition="start" label="Sổ địa chỉ" />
        </Tabs>
      </Box>

      {/* TAB CONTENT 1: WALLET */}
      {activeTab === 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Balance card with gradient */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card
                className="!rounded-3xl border border-white/20 h-full relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                  boxShadow: "0 12px 36px rgba(59, 130, 246, 0.25)",
                }}
              >
                <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <CardContent className="!p-8 flex flex-col justify-between h-full space-y-6 text-white">
                  <div className="space-y-1.5">
                    <Typography className="!text-white/85 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <WalletIcon className="!text-[1rem]" /> Số dư ví khả dụng (Ký quỹ)
                    </Typography>
                    <Typography variant="h3" className="!font-black tracking-tight font-mono text-white">
                      {formatCurrency(balance)}
                    </Typography>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleOpenWalletAction("deposit")}
                      className="!bg-white !text-blue-600 hover:!bg-blue-50 !font-extrabold !py-3 !rounded-2xl !capitalize shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Nạp tiền
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleOpenWalletAction("withdraw")}
                      className="!border-white/50 !text-white hover:!bg-white/10 !font-bold !py-3 !rounded-2xl !capitalize hover:-translate-y-0.5 transition-all"
                    >
                      Rút tiền
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick stats / note card */}
            <Grid item xs={12} md={7}>
              <Card className="!rounded-3xl border border-slate-100 h-full bg-white/70 backdrop-blur-md">
                <CardContent className="!p-6 flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <Typography variant="h6" className="!font-bold text-slate-800">
                      Quy chế ký quỹ & Thanh toán B2B
                    </Typography>
                    
                    <div className="space-y-2.5 text-xs text-slate-500 font-medium">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] mt-1.5 shrink-0" />
                        <span>Hệ thống áp dụng cơ chế <span style={{ color: "#1E3A8A", backgroundColor: "rgba(30, 58, 138, 0.06)", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>Ký quỹ (Escrow)</span> để đảm bảo quyền lợi giữa Chủ hàng và Nhà xe khi đấu giá chốt thầu thành công.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-1.5 shrink-0" />
                        <span>Khoản tiền cọc <span style={{ color: "#B45309", backgroundColor: "rgba(180, 83, 9, 0.06)", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>20% giá trần</span> của phiên đấu giá sẽ tự động tạm giữ khi bạn đăng lô hàng và giải tỏa ngay khi kết thúc hoặc hủy.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-1.5 shrink-0" />
                        <span>Khi nghiệm thu hoàn thành hành trình, số tiền cước vận chuyển sẽ <span style={{ color: "#047857", backgroundColor: "rgba(4, 120, 87, 0.06)", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>tự động giải ngân</span> từ ví ký quỹ sang tài khoản của tài xế/nhà xe.</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50/50 p-3 rounded-2xl border border-sky-100/60 text-xs text-sky-800 font-semibold flex items-center gap-2 mt-4">
                    <InfoIcon className="!text-[1.1rem] shrink-0" />
                    <span>Nạp tiền siêu tốc bằng mã VietQR hỗ trợ liên ngân hàng 24/7 không mất phí.</span>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Transaction history table */}
          <Card
            className="!rounded-3xl border border-slate-100 !shadow-[0_8px_32px_0_rgba(27,73,101,0.02)] overflow-hidden"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-6 py-4.5 border-b border-slate-100">
              <Typography variant="h6" className="!font-bold text-slate-700">
                Lịch sử giao dịch ví ký quỹ
              </Typography>
            </div>

            <TableContainer component={Paper} className="!shadow-none !bg-transparent">
              <Table sx={{ minWidth: 650 }}>
                <TableHead className="bg-slate-50/50">
                  <TableRow>
                    <TableCell className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Mã giao dịch</TableCell>
                    <TableCell className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Nội dung chi tiết</TableCell>
                    <TableCell align="right" className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Giá trị giao dịch</TableCell>
                    <TableCell align="right" className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Thời gian</TableCell>
                    <TableCell align="center" className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/40">
                      {/* Tx ID */}
                      <TableCell className="!font-mono !font-bold text-slate-400 !border-slate-100">
                        {tx.id}
                      </TableCell>

                      {/* Content */}
                      <TableCell className="!font-bold text-slate-700 !border-slate-100">
                        {tx.typeName}
                      </TableCell>

                      {/* Amount */}
                      <TableCell
                        align="right"
                        className={`!font-mono !font-bold !border-slate-100 ${
                          tx.amount > 0 ? "!text-emerald-600" : "!text-rose-500"
                        }`}
                      >
                        {tx.amount > 0 ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                      </TableCell>

                      {/* Time */}
                      <TableCell align="right" className="!text-slate-500 !text-xs !border-slate-100">
                        {tx.time}
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" className="!border-slate-100">
                        <Chip
                          label="Thành công"
                          size="small"
                          color="success"
                          className="!font-bold !text-[0.68rem] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 2: PROFILE & eKYC */}
      {activeTab === 1 && (
        <div className="space-y-6 animate-fade-in">
          <Card
            className="!rounded-3xl border border-slate-100"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
            <CardContent className="!p-6 sm:!p-8 space-y-6">
              {profileSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 animate-fade-in text-sm font-semibold">
                  <CheckIcon /> {profileSuccessMsg}
                </div>
              )}

              {/* Profile Corporate header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <Typography variant="h6" className="!font-bold text-slate-700">
                    Hồ sơ doanh nghiệp chủ hàng
                  </Typography>
                  <Typography variant="caption" className="text-slate-400">
                    Thông tin phục vụ phát hành hóa đơn đỏ và xác thực pháp lý điện tử
                  </Typography>
                </div>

                <div>
                  {kycStatus === "verified" ? (
                    <Chip
                      label="Đã xác minh eKYC"
                      color="success"
                      icon={<CheckIcon />}
                      className="!font-extrabold !text-[0.72rem] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-3 rounded-full"
                    />
                  ) : (
                    <Chip
                      label="Đang chờ phê duyệt"
                      color="warning"
                      className="!font-extrabold !text-[0.72rem] bg-amber-50 text-amber-600 border border-amber-100 px-1 py-3 rounded-full"
                    />
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Tên doanh nghiệp"
                    fullWidth
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    InputProps={{ className: "!rounded-2xl" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Mã số thuế"
                    fullWidth
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    InputProps={{ className: "!rounded-2xl" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Người đại diện pháp luật"
                    fullWidth
                    value={representative}
                    onChange={(e) => setRepresentative(e.target.value)}
                    InputProps={{ className: "!rounded-2xl" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Số điện thoại liên hệ"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    InputProps={{ className: "!rounded-2xl" }}
                  />
                </Grid>

                {/* eKYC Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="body2" className="text-slate-500 font-bold mb-2">
                    Tài liệu xác thực doanh nghiệp (Giấy phép ĐKKD hoặc CCCD đại diện)
                  </Typography>

                  <div className="border-2 border-dashed border-slate-200 hover:border-[#1B4965]/40 transition-all rounded-3xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer relative group">
                    <input
                      type="file"
                      disabled
                      className="absolute inset-0 w-full h-full opacity-0 cursor-not-allowed"
                    />
                    <CloudUploadIcon className="!text-4xl text-slate-400 group-hover:text-[#1B4965] group-hover:scale-105 transition-all mb-2" />
                    <Typography variant="body2" className="!font-bold text-slate-600">
                      Tải lên giấy phép kinh doanh / tài liệu mới
                    </Typography>
                    <Typography variant="caption" className="text-slate-400">
                      Hỗ trợ định dạng PDF, PNG, JPG tối đa 10MB.
                    </Typography>
                  </div>

                  {uploadedDoc && (
                    <div className="mt-3 flex items-center justify-between bg-emerald-50/30 border border-emerald-100/50 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 text-xl">📄</span>
                        <div className="min-w-0">
                          <Typography className="!font-bold text-slate-700 text-xs truncate">
                            {uploadedDoc}
                          </Typography>
                          <Typography className="text-slate-400 text-[0.65rem]">
                            Đã xác minh bởi Ban quản trị nền tảng
                          </Typography>
                        </div>
                      </div>
                      <Chip
                        label="Hồ sơ gốc"
                        size="small"
                        className="!font-extrabold !text-[0.65rem] bg-emerald-100 text-emerald-800"
                      />
                    </div>
                  )}
                </Grid>
              </Grid>

              {/* Form Action Submit */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  className="!rounded-2xl !py-3 !px-8 !font-bold !capitalize shadow-md hover:shadow-lg transition-all"
                  sx={{
                    background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                    },
                  }}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 3: ADDRESS BOOK */}
      {activeTab === 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Toolbar with Add Address Button */}
          <div className="flex justify-between items-center">
            <Typography variant="body2" className="text-slate-400 font-semibold">
              Danh sách địa điểm bến bãi thường dùng lấy / nhận hàng hóa
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddressAdd}
              className="!rounded-2xl !py-2.5 !px-5 !text-xs !font-bold !capitalize shadow-md"
              sx={{
                background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
              }}
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          {/* Grid list of addresses */}
          <Grid container spacing={3}>
            {addresses.map((addr) => (
              <Grid item xs={12} md={6} lg={4} key={addr.id}>
                <Card
                  className="group hover:border-[#1B4965]/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 border border-slate-100 !rounded-3xl relative overflow-hidden"
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Decorative indicator line */}
                  <Box className="absolute top-0 left-0 w-full h-1 bg-[#1B4965] opacity-20 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="!p-5 space-y-3.5">
                    {/* Address title */}
                    <div className="flex items-center justify-between">
                      <Typography className="!font-bold text-slate-700 text-sm truncate max-w-[200px]">
                        {addr.label}
                      </Typography>
                      <div className="flex gap-0.5">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenAddressEdit(addr)}
                          className="text-slate-400 hover:text-[#1B4965]"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAddressDelete(addr.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>

                    {/* Detailed info */}
                    <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                      <div>
                        <strong className="text-slate-400 font-semibold block text-[0.65rem] uppercase">Người liên hệ</strong>
                        <span className="text-slate-700 font-semibold">{addr.contactName} ({addr.contactPhone})</span>
                      </div>
                      <div>
                        <strong className="text-slate-400 font-semibold block text-[0.65rem] uppercase">Địa chỉ kho bãi</strong>
                        <span className="text-slate-600 block truncate mt-0.5">{addr.detail}</span>
                        <span className="text-slate-400 font-bold block">{addr.province}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}

      {/* Wallet Action Dialog (Deposit / Withdraw simulation) */}
      <Dialog
        open={openWalletDialog}
        onClose={() => setOpenWalletDialog(false)}
        maxWidth="xs"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          {walletActionType === "deposit" ? "Nạp tiền vào ví ký quỹ" : "Yêu cầu rút tiền về ngân hàng"}
          <IconButton size="small" onClick={() => setOpenWalletDialog(false)} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          {walletActionType === "deposit" ? (
            <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-100/50 flex flex-col items-center text-center space-y-2">
              {/* Simulated QR Code */}
              <div className="w-32 h-32 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-mono text-xs text-slate-400 font-bold">
                [ VietQR Image ]
              </div>
              <Typography variant="caption" className="text-slate-500 font-semibold">
                Quét mã QR để chuyển khoản trực tiếp qua hệ thống Napas247.
              </Typography>
            </div>
          ) : (
            <TextField
              select
              label="Chọn tài khoản ngân hàng nhận"
              fullWidth
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              InputProps={{ className: "!rounded-2xl" }}
            >
              <MenuItem value="MB Bank - 1902888889999">MB Bank - 1902888889999 (Chính chủ)</MenuItem>
              <MenuItem value="Vietcombank - 0011002223334">Vietcombank - 0011002223334</MenuItem>
            </TextField>
          )}

          <TextField
            label="Số tiền giao dịch (VNĐ)"
            type="number"
            placeholder="Nhập số tiền muốn nạp/rút"
            fullWidth
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
            InputProps={{ className: "!rounded-2xl" }}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 flex justify-end gap-3">
          <Button
            onClick={() => setOpenWalletDialog(false)}
            variant="text"
            className="!text-slate-500 !font-bold !capitalize !rounded-xl"
          >
            Hủy
          </Button>
          <Button
            onClick={handleWalletActionSubmit}
            disabled={!walletAmount}
            variant="contained"
            className="!font-bold !capitalize !rounded-xl !px-5"
            sx={{
              background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Address Edit/Add Dialog */}
      <Dialog
        open={openAddressDialog}
        onClose={() => setOpenAddressDialog(false)}
        maxWidth="xs"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          {addressEditMode ? "Cập nhật địa chỉ kho bãi" : "Thêm địa chỉ kho bãi mới"}
          <IconButton size="small" onClick={() => setOpenAddressDialog(false)} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          <TextField
            label="Tên gợi nhớ kho (Ví dụ: Kho Tổng Đông Anh)"
            fullWidth
            value={addressForm.label}
            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Họ tên người liên hệ"
            fullWidth
            value={addressForm.contactName}
            onChange={(e) => setAddressForm({ ...addressForm, contactName: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Số điện thoại liên hệ"
            fullWidth
            value={addressForm.contactPhone}
            onChange={(e) => setAddressForm({ ...addressForm, contactPhone: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Tỉnh / Thành phố"
            fullWidth
            value={addressForm.province}
            onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Địa chỉ chi tiết (Số nhà, ngõ, đường, cụm kho)"
            multiline
            rows={2}
            fullWidth
            value={addressForm.detail}
            onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 flex justify-end gap-3">
          <Button
            onClick={() => setOpenAddressDialog(false)}
            variant="text"
            className="!text-slate-500 !font-bold !capitalize !rounded-xl"
          >
            Đóng
          </Button>
          <Button
            onClick={handleAddressSubmit}
            variant="contained"
            className="!font-bold !capitalize !rounded-xl !px-5"
            sx={{
              background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
            }}
          >
            {addressEditMode ? "Lưu lại" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
