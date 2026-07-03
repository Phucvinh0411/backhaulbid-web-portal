"use client";

import { useState, useMemo } from "react";
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
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import WalletIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceOutlined";

import PageHeader from "@/components/common/PageHeader";

// Mock Transaction History for Shipper
const SHIPPER_TRANSACTIONS = [
  {
    id: "TX-2026-001",
    type: "deposit",
    typeName: "Nạp tiền vào ví (Qua VietQR)",
    amount: 20000000,
    time: "2026-07-02 09:30",
    status: "success",
  },
  {
    id: "TX-2026-002",
    type: "hold",
    typeName: "Tạm giữ cọc đấu giá (Lô LH-9041)",
    amount: -2500000,
    time: "2026-07-02 10:15",
    status: "success",
  },
  {
    id: "TX-2026-003",
    type: "refund",
    typeName: "Hoàn trả cọc thầu (Lô LH-8072)",
    amount: 1500000,
    time: "2026-07-01 16:40",
    status: "success",
  },
  {
    id: "TX-2026-004",
    type: "payment",
    typeName: "Thanh toán cước vận chuyển (Đơn LH-9034)",
    amount: -8900000,
    time: "2026-06-30 18:10",
    status: "success",
  },
  {
    id: "TX-2026-005",
    type: "withdraw",
    typeName: "Rút tiền về tài khoản MB Bank",
    amount: -5000000,
    time: "2026-06-29 11:20",
    status: "success",
  }
];

// Mock Transaction History for Carrier
const CARRIER_TRANSACTIONS = [
  {
    id: "TXN-001",
    type: "deposit",
    typeName: "Thanh toán chuyến BID-2451",
    amount: 12000000,
    time: "2026-08-10 14:30",
    status: "success",
  },
  {
    id: "TXN-002",
    type: "payment",
    typeName: "Phí dịch vụ nền tảng (Tháng 7)",
    amount: -2000000,
    time: "2026-08-09 09:15",
    status: "success",
  },
  {
    id: "TXN-003",
    type: "withdraw",
    typeName: "Rút tiền về Vietcombank",
    amount: -5000000,
    time: "2026-08-08 16:45",
    status: "pending",
  },
  {
    id: "TXN-004",
    type: "deposit",
    typeName: "Nạp tiền ví qua Momo",
    amount: 2000000,
    time: "2026-08-07 10:20",
    status: "success",
  },
  {
    id: "TXN-005",
    type: "payment",
    typeName: "Thanh toán chuyến BID-2390",
    amount: -8650000,
    time: "2026-08-02 11:00",
    status: "failed",
  },
];

export default function WalletScreen({ role = "shipper", standalone = true }) {
  const isShipper = role === "shipper";
  
  const [balance, setBalance] = useState(isShipper ? 15500000 : 25450000);
  const [transactions, setTransactions] = useState(isShipper ? SHIPPER_TRANSACTIONS : CARRIER_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all"); // all, success, pending, failed
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // States for Wallet actions
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [walletActionType, setWalletActionType] = useState("deposit"); // 'deposit' or 'withdraw'
  const [walletAmount, setWalletAmount] = useState("");
  const [bankAccount, setBankAccount] = useState(isShipper ? "MB Bank - 1902888889999" : "Vietcombank - **** **** **** 1234");

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("time");

  const columns = [
    { id: "id", label: "Mã giao dịch", align: "left" },
    { id: "typeName", label: "Nội dung chi tiết", align: "left" },
    { id: "amount", label: "Giá trị giao dịch", align: "right" },
    { id: "time", label: "Thời gian", align: "right" },
    { id: "status", label: "Trạng thái", align: "center" },
  ];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
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
      id: isShipper 
        ? `TX-2026-00${transactions.length + 1}` 
        : `TXN-00${transactions.length + 1}`,
      type: walletActionType,
      typeName: walletActionType === "deposit" 
        ? (isShipper ? "Nạp tiền vào ví (Qua VietQR)" : "Nạp tiền vào ví") 
        : (isShipper ? "Rút tiền về tài khoản MB Bank" : "Rút tiền về tài khoản ngân hàng"),
      amount: walletActionType === "deposit" ? amountNum : -amountNum,
      time: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "success",
    };

    setTransactions([newTx, ...transactions]);
    setOpenWalletDialog(false);
  };

  // Filter Transactions
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      const matchesSearch = 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.typeName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = 
        statusTab === "all" || 
        tx.status === statusTab;

      return matchesSearch && matchesTab;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (orderBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (orderBy === "time") {
        comparison = new Date(a.time) - new Date(b.time);
      } else {
        comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      }
      return order === "desc" ? -comparison : comparison;
    });

    return result;
  }, [transactions, searchTerm, statusTab, order, orderBy]);

  // Paginated Transactions
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  return (
    <Box className="w-full min-h-screen">
      {/* Page Header (Optional inside tabs) */}
      {standalone && (
        <PageHeader
          title={isShipper ? "Ví thanh toán & Ký quỹ" : "Ví thanh toán"}
          subtitle="Quản lý dòng tiền, số dư tài khoản và đối soát giao dịch ký quỹ."
          breadcrumbs={[
            { label: "Trang chủ", path: isShipper ? "/shipper/dashboard" : "/carrier/dashboard" },
            { label: "Ví điện tử" },
          ]}
        />
      )}

      <div className="space-y-6 animate-fade-in mt-4">
        {/* Balance & Info Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card
              className="!rounded-3xl border border-white/20 h-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                boxShadow: "0 12px 36px rgba(27, 73, 101, 0.2)",
              }}
            >
              <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <CardContent className="!p-8 flex flex-col justify-between h-full space-y-6 text-white">
                <div className="space-y-1.5">
                  <Typography className="!text-white/85 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <WalletIcon className="!text-[1rem]" /> {isShipper ? "Số dư ví khả dụng (Ký quỹ)" : "Số dư ví khả dụng"}
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
                    className="!bg-white !text-[#1B4965] hover:!bg-blue-50 !font-extrabold !py-3 !rounded-2xl !capitalize shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
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
            {isShipper ? (
              <Card className="!rounded-3xl border border-slate-100 h-full bg-white/70 backdrop-blur-md shadow-[0_8px_32px_0_rgba(27,73,101,0.02)]">
                <CardContent className="!p-6 flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <Typography variant="h6" className="!font-bold text-slate-800">
                      Quy chế ký quỹ & Thanh toán B2B
                    </Typography>
                    
                    <div className="space-y-2.5 text-xs text-slate-500 font-medium">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B4965] mt-1.5 shrink-0" />
                        <span>Hệ thống áp dụng cơ chế <span className="text-[#1B4965] bg-blue-50 px-1.5 py-0.5 rounded font-bold">Ký quỹ (Escrow)</span> để đảm bảo quyền lợi giữa Chủ hàng và Nhà xe khi đấu giá chốt thầu thành công.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-1.5 shrink-0" />
                        <span>Khoản tiền cọc <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">20% giá trần</span> của phiên đấu giá sẽ tự động tạm giữ khi bạn đăng lô hàng và giải tỏa ngay khi kết thúc hoặc hủy.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-1.5 shrink-0" />
                        <span>Khi nghiệm thu hoàn thành hành trình, số tiền cước vận chuyển sẽ <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">tự động giải ngân</span> từ ví ký quỹ sang tài khoản của tài xế/nhà xe.</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50/50 p-3 rounded-2xl border border-sky-100/60 text-xs text-sky-800 font-semibold flex items-center gap-2 mt-4">
                    <InfoIcon className="!text-[1.1rem] shrink-0" />
                    <span>Nạp tiền siêu tốc bằng mã VietQR hỗ trợ liên ngân hàng 24/7 không mất phí.</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="!rounded-3xl border border-slate-100 h-full bg-white/70 backdrop-blur-md shadow-[0_8px_32px_0_rgba(27,73,101,0.02)]">
                <CardContent className="!p-6 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <Typography variant="h6" className="!font-bold text-slate-800">
                      Tài khoản ngân hàng liên kết
                    </Typography>
                    
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white/60">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <AccountBalanceIcon />
                      </div>
                      <div>
                        <Typography variant="body2" className="!font-bold text-slate-800">Vietcombank (Mặc định)</Typography>
                        <Typography variant="caption" className="text-slate-500 font-mono tracking-widest block mt-0.5">**** **** **** 1234</Typography>
                      </div>
                    </div>

                    <Grid container spacing={3} className="!mt-1">
                      <Grid item xs={6}>
                        <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-100 relative">
                          <div className="absolute top-0 right-0 bottom-0 w-1 bg-emerald-500 rounded-r"></div>
                          <Typography variant="caption" className="text-slate-400 font-bold block">Tổng tiền vào tháng</Typography>
                          <Typography variant="subtitle1" className="!font-black text-emerald-600 mt-0.5">{formatCurrency(45000000)}</Typography>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className="p-3 bg-rose-500/5 rounded-2xl border border-rose-100 relative">
                          <div className="absolute top-0 right-0 bottom-0 w-1 bg-rose-500 rounded-r"></div>
                          <Typography variant="caption" className="text-slate-400 font-bold block">Tổng tiền ra tháng</Typography>
                          <Typography variant="subtitle1" className="!font-black text-rose-600 mt-0.5">{formatCurrency(8500000)}</Typography>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Transaction History Card with Filters and Dynamic Drag Table */}
        <Card
          className="!rounded-3xl border border-slate-100 !shadow-[0_8px_32px_0_rgba(27,73,101,0.02)] overflow-hidden"
          sx={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header & Filter Toolbar */}
          <Box className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Typography variant="h6" className="!font-bold text-slate-700">
              Lịch sử giao dịch ví
            </Typography>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Tabs
                value={statusTab}
                onChange={(e, val) => { setStatusTab(val); setPage(0); }}
                sx={{
                  minHeight: "36px",
                  "& .MuiTab-root": {
                    minHeight: "36px",
                    py: 0,
                    px: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    color: "#64748b",
                  },
                  "& .Mui-selected": {
                    color: "#1B4965 !important",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#1B4965",
                  },
                }}
              >
                <Tab label="Tất cả" value="all" />
                <Tab label="Thành công" value="success" />
                <Tab label="Đang chờ" value="pending" />
                <Tab label="Thất bại" value="failed" />
              </Tabs>

              <TextField
                placeholder="Tìm giao dịch..."
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full sm:w-60"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-slate-400" fontSize="small" />
                    </InputAdornment>
                  ),
                  className: "!rounded-xl bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white transition-all",
                }}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(27,73,101,0.08)",
                  },
                }}
              />
            </div>
          </Box>

          {/* Dynamic Table */}
          <TableContainer component={Paper} className="!shadow-none !bg-transparent">
            <Table sx={{ minWidth: 650 }}>
              <TableHead className="bg-slate-50/50">
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100 select-none hover:bg-slate-100/80 transition-colors"
                    >
                      {col.sortable !== false ? (
                        <TableSortLabel
                          active={orderBy === col.id}
                          direction={orderBy === col.id ? order : "asc"}
                          onClick={() => handleRequestSort(col.id)}
                          className="!font-bold hover:!text-slate-700"
                          sx={{ '& .MuiTableSortLabel-icon': { color: '#64748B !important' } }}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        <span>{col.label}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" className="!py-12 !border-none">
                      <Typography variant="body2" className="text-slate-400 font-medium">
                        Không tìm thấy giao dịch nào phù hợp.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                      {columns.map((col) => {
                        if (col.id === "id") {
                          return (
                            <TableCell key={col.id} className="!font-mono !font-bold text-slate-400 !border-slate-100">
                              {tx.id}
                            </TableCell>
                          );
                        }
                        if (col.id === "typeName") {
                          return (
                            <TableCell key={col.id} className="!font-bold text-slate-700 !border-slate-100">
                              {tx.typeName}
                            </TableCell>
                          );
                        }
                        if (col.id === "amount") {
                          return (
                            <TableCell
                              key={col.id}
                              align="right"
                              className={`!font-mono !font-bold !border-slate-100 ${
                                tx.amount > 0 ? "!text-[#047857]" : "!text-rose-600"
                              }`}
                            >
                              {tx.amount > 0 ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                            </TableCell>
                          );
                        }
                        if (col.id === "time") {
                          return (
                            <TableCell key={col.id} align="right" className="!text-slate-500 !text-xs !border-slate-100">
                              {tx.time}
                            </TableCell>
                          );
                        }
                        if (col.id === "status") {
                          let color = "success";
                          let label = "Thành công";
                          if (tx.status === "pending") {
                            color = "warning";
                            label = "Đang xử lý";
                          } else if (tx.status === "failed") {
                            color = "error";
                            label = "Thất bại";
                          }

                          return (
                            <TableCell key={col.id} align="center" className="!border-slate-100">
                              <Chip
                                label={label}
                                size="small"
                                color={color}
                                className="!font-bold !text-[0.68rem] rounded px-1.5"
                              />
                            </TableCell>
                          );
                        }
                        return null;
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
            sx={{
              borderTop: "1px solid rgba(27,73,101,0.08)",
              "& .MuiTablePagination-toolbar": {
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.82rem",
              },
            }}
          />
        </Card>
      </div>

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
          {walletActionType === "deposit" ? "Nạp tiền vào ví" : "Yêu cầu rút tiền về ngân hàng"}
          <IconButton size="small" onClick={() => setOpenWalletDialog(false)} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          {walletActionType === "deposit" ? (
            <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-100/50 flex flex-col items-center text-center space-y-2">
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
              {isShipper ? (
                <>
                  <MenuItem value="MB Bank - 1902888889999">MB Bank - 1902888889999 (Chính chủ)</MenuItem>
                  <MenuItem value="Vietcombank - 0011002223334">Vietcombank - 0011002223334</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem value="Vietcombank - **** **** **** 1234">Vietcombank - **** **** **** 1234 (Mặc định)</MenuItem>
                  <MenuItem value="Agribank - 1500205000999">Agribank - 1500205000999</MenuItem>
                </>
              )}
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
    </Box>
  );
}
