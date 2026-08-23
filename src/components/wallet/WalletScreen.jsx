"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceOutlined";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import WalletIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import AppCard from "@/components/common/AppCard";
import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";
import { walletApi } from "@/services/walletApi";
import WalletDetailDialog, { WalletDetailRow } from "./WalletDetailDialog";

const OUTFLOW_TYPES = new Set(["WITHDRAW", "FREEZE", "AUCTION_FEE", "PENALTY"]);
const TRANSACTION_LABELS = {
  DEPOSIT: "Nạp tiền vào ví",
  WITHDRAW: "Yêu cầu rút tiền",
  FREEZE: "Tạm giữ tiền đặt cọc",
  UNFREEZE: "Hoàn trả tiền đặt cọc",
  AUCTION_FEE: "Phí tham gia phiên đấu giá",
  REFUND: "Hoàn tiền",
  TRANSFER: "Điều chuyển số dư",
  PENALTY: "Khấu trừ tiền phạt",
};

function toTableTransaction(transaction) {
  const type = String(transaction.type || "").toUpperCase();
  const amount = Math.abs(Number(transaction.amount || 0));
  return {
    id: transaction.id,
    typeName: TRANSACTION_LABELS[type] || transaction.description || "Giao dịch ví",
    amount: OUTFLOW_TYPES.has(type) ? -amount : amount,
    time: transaction.createdAt,
    status: String(transaction.status || "").toLowerCase(),
  };
}

function submitCheckoutForm(checkout) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkout.checkoutUrl;
  form.target = "_blank";
  Object.entries(checkout.formFields || {}).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function formatWalletInput(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? new Intl.NumberFormat("vi-VN").format(Number(digits)) : "";
}

export default function WalletScreen({ role = "shipper", standalone = true }) {
  const isShipper = role === "shipper";
  const { notify } = useGlobalNotification();
  const [balance, setBalance] = useState(0);
  const [frozenBalance, setFrozenBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [topUpOrders, setTopUpOrders] = useState([]);
  const [topUpActionLoading, setTopUpActionLoading] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [walletActionType, setWalletActionType] = useState("deposit");
  const [walletAmount, setWalletAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [walletActionLoading, setWalletActionLoading] = useState(false);
  const [pendingTopUp, setPendingTopUp] = useState(null);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("time");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetail, setTransactionDetail] = useState(null);
  const [transactionDetailLoading, setTransactionDetailLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadWallet = async () => {
      setWalletLoading(true);
      try {
        const [wallet, transactionPage, withdrawalPage, topUpPage] = await Promise.all([
          walletApi.getMyWallet(),
          walletApi.listTransactions({ page: 1, pageSize: 100 }),
          walletApi.listWithdrawals({ page: 1, pageSize: 20 }),
          walletApi.listTopUps({ page: 1, pageSize: 10 }),
        ]);
        if (!active) return;
        setBalance(Number(wallet.availableBalance || 0));
        setFrozenBalance(Number(wallet.frozenBalance || 0));
        setTransactions((transactionPage.data || []).map(toTableTransaction));
        setWithdrawals(withdrawalPage.data || []);
        setTopUpOrders(topUpPage.data || []);
      } catch (error) {
        if (active) notify.error(getApiErrorMessage(error, "Không thể tải dữ liệu ví."));
      } finally {
        if (active) setWalletLoading(false);
      }
    };
    loadWallet();
    return () => {
      active = false;
    };
  }, [notify, role]);

  const refreshWallet = async () => {
    const [wallet, transactionPage, withdrawalPage, topUpPage] = await Promise.all([
      walletApi.getMyWallet(),
      walletApi.listTransactions({ page: 1, pageSize: 100 }),
      walletApi.listWithdrawals({ page: 1, pageSize: 20 }),
      walletApi.listTopUps({ page: 1, pageSize: 10 }),
    ]);
    setBalance(Number(wallet.availableBalance || 0));
    setFrozenBalance(Number(wallet.frozenBalance || 0));
    setTransactions((transactionPage.data || []).map(toTableTransaction));
    setWithdrawals(withdrawalPage.data || []);
    setTopUpOrders(topUpPage.data || []);
  };

  const handleCancelTopUp = async (invoiceNumber) => {
    setTopUpActionLoading(invoiceNumber);
    try {
      await walletApi.cancelTopUp(invoiceNumber);
      await refreshWallet();
      notify.success("Đã hủy đơn nạp tiền chưa thanh toán.");
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Không thể hủy đơn nạp tiền."));
    } finally {
      setTopUpActionLoading(null);
    }
  };

  useEffect(() => {
    if (!pendingTopUp) return undefined;

    let active = true;
    let checking = false;
    const checkTopUp = async () => {
      if (checking) return;
      checking = true;
      try {
        const status = await walletApi.getSepayTopUpStatus(pendingTopUp);
        if (!active) return;
        if (status.status === "PAID") {
          setPendingTopUp(null);
          await refreshWallet();
          notify.success("Nạp tiền thành công. Số dư đã được cập nhật.");
        } else if (["EXPIRED", "FAILED", "CANCELLED"].includes(status.status)) {
          setPendingTopUp(null);
          notify.warning("Đơn nạp tiền không hoàn tất.");
        }
      } catch {
        // SePay may deliver the IPN a few seconds after the checkout finishes.
      } finally {
        checking = false;
      }
    };

    checkTopUp();
    const intervalId = window.setInterval(checkTopUp, 4000);
    const timeoutId = window.setTimeout(() => {
      if (active) {
        setPendingTopUp(null);
        notify.info("Đơn nạp đang chờ IPN. Vui lòng tải lại sau khi thanh toán.");
      }
    }, 15 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [notify, pendingTopUp]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const handleOpenWalletAction = (type) => {
    setWalletActionType(type);
    setWalletAmount("");
    setBankName("");
    setBankAccountNumber("");
    setAccountHolderName("");
    setOpenWalletDialog(true);
  };

  const handleWalletActionSubmit = async () => {
    const amount = Number(walletAmount);
    if (!Number.isInteger(amount) || amount < 10000) {
      notify.warning(`${walletActionType === "deposit" ? "Số tiền nạp" : "Số tiền rút"} phải là số nguyên và từ 10.000 ₫.`);
      return;
    }

    if (walletActionType === "withdraw" && (!bankName.trim() || !/^[0-9]{6,30}$/.test(bankAccountNumber.trim()) || !accountHolderName.trim())) {
      notify.warning("Vui lòng nhập đầy đủ ngân hàng, số tài khoản 6-30 chữ số và tên chủ tài khoản.");
      return;
    }

    setWalletActionLoading(true);
    try {
      if (walletActionType === "withdraw") {
        await walletApi.createWithdrawal({
          amount,
          bankName: bankName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          accountHolderName: accountHolderName.trim(),
        });
        const [wallet, transactionPage, withdrawalPage] = await Promise.all([
          walletApi.getMyWallet(),
          walletApi.listTransactions({ page: 1, pageSize: 100 }),
          walletApi.listWithdrawals({ page: 1, pageSize: 20 }),
        ]);
        setBalance(Number(wallet.availableBalance || 0));
        setFrozenBalance(Number(wallet.frozenBalance || 0));
        setTransactions((transactionPage.data || []).map(toTableTransaction));
        setWithdrawals(withdrawalPage.data || []);
        setOpenWalletDialog(false);
        notify.success(`Đã gửi yêu cầu rút ${formatCurrency(amount)}. Số tiền được tạm giữ đến khi admin xử lý.`);
      } else {
        const returnUrl = `${window.location.origin}${window.location.pathname}`;
        const checkout = await walletApi.createSepayTopUp(amount, returnUrl);
        submitCheckoutForm(checkout);
        setPendingTopUp(checkout.invoiceNumber);
        setOpenWalletDialog(false);
        notify.info(`Đã tạo đơn nạp ${formatCurrency(amount)}. Hoàn tất thanh toán ở tab mới để hệ thống nhận IPN.`);
      }
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Không thể tạo đơn thanh toán."));
    } finally {
      setWalletActionLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const result = transactions.filter((transaction) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = transaction.id.toLowerCase().includes(term)
        || transaction.typeName.toLowerCase().includes(term);
      return matchesSearch && (statusTab === "all" || transaction.status === statusTab);
    });
    result.sort((left, right) => {
      const comparison = orderBy === "amount"
        ? left.amount - right.amount
        : orderBy === "time"
          ? new Date(left.time) - new Date(right.time)
          : left[orderBy].localeCompare(right[orderBy]);
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [transactions, searchTerm, statusTab, order, orderBy]);

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const requestSort = (property) => {
    const ascending = orderBy === property && order === "asc";
    setOrder(ascending ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleOpenTransactionDetail = async (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetail(null);
    setTransactionDetailLoading(true);
    try {
      const detail = await walletApi.getTransaction(transaction.id);
      setTransactionDetail(detail);
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Không thể tải chi tiết giao dịch. Vui lòng thử lại."));
      setSelectedTransaction(null);
    } finally {
      setTransactionDetailLoading(false);
    }
  };

  const closeTransactionDetail = () => {
    if (transactionDetailLoading) return;
    setSelectedTransaction(null);
    setTransactionDetail(null);
  };

  return (
    <Box className="w-full min-h-screen">
      {standalone && (
        <PageHeader
          title={isShipper ? "Ví thanh toán & Ký quỹ" : "Ví thanh toán"}
          subtitle="Quản lý số dư, tiền tạm giữ và lịch sử giao dịch từ dữ liệu thật."
          breadcrumbs={[
            { label: "Trang chủ", path: isShipper ? "/shipper/dashboard" : "/carrier/dashboard" },
            { label: "Ví điện tử" },
          ]}
        />
      )}

      <div className="space-y-6 animate-fade-in mt-4">
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <AppCard
              showAccent={false}
              className="!rounded-3xl border border-white/20 h-full relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)", boxShadow: "0 12px 36px rgba(27, 73, 101, 0.2)" }}
            >
              <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <CardContent className="!p-8 flex flex-col justify-between h-full space-y-6 text-white">
                <div className="space-y-1.5">
                  <Typography className="!text-white/85 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <WalletIcon className="!text-[1rem]" /> Số dư khả dụng
                  </Typography>
                  <Typography variant="h3" className="!font-black tracking-tight font-mono text-white">
                    {walletLoading ? <CircularProgress size={30} className="!text-white" /> : formatCurrency(balance)}
                  </Typography>
                  <Typography variant="body2" className="!text-white/70">
                    Đang tạm giữ: {formatCurrency(frozenBalance)}
                  </Typography>
                </div>
                <div className="flex gap-3">
                  <Button fullWidth variant="contained" onClick={() => handleOpenWalletAction("deposit")} className="!bg-white !text-[#1B4965] hover:!bg-blue-50 !font-extrabold !py-3 !rounded-2xl !capitalize">
                    Nạp tiền
                  </Button>
                  <Button fullWidth variant="outlined" onClick={() => handleOpenWalletAction("withdraw")} className="!border-white/50 !text-white hover:!bg-white/10 !font-bold !py-3 !rounded-2xl !capitalize">
                    Rút tiền
                  </Button>
                </div>
              </CardContent>
            </AppCard>
          </Grid>

          <Grid item xs={12} md={7}>
            <AppCard showAccent={false} className="!rounded-3xl border border-slate-100 h-full bg-white/70 backdrop-blur-md">
              <CardContent className="!p-6 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <Typography variant="h6" className="!font-bold text-slate-800">Quản lý dòng tiền an toàn</Typography>
                  <Typography variant="body2" className="text-slate-500">
                    Tiền nạp chỉ được cộng vào ví sau khi SePay gửi IPN hợp lệ. Phí tham gia và tiền đặt cọc được xử lý nội bộ bởi Wallet Service.
                  </Typography>
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-sky-100 bg-sky-50/60 text-sky-800">
                    <InfoIcon className="shrink-0" />
                    <Typography variant="body2">Không có giao dịch giả lập trên giao diện.</Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5 text-slate-500">
                  <AccountBalanceIcon className="text-emerald-600" />
                  <Typography variant="body2">Số dư và lịch sử được lấy trực tiếp từ Wallet Service.</Typography>
                </div>
              </CardContent>
            </AppCard>
          </Grid>
        </Grid>

        <AppCard showAccent={false} className="!rounded-3xl border border-slate-100 !shadow-[0_8px_32px_0_rgba(27,73,101,0.02)] overflow-hidden">
          <Box className="p-6 border-b border-slate-100">
            <Typography variant="h6" className="!font-bold text-slate-700 mb-3">Yêu cầu rút tiền</Typography>
            {withdrawals.length === 0 ? <Typography variant="body2" className="text-slate-400">Chưa có yêu cầu rút tiền.</Typography> : <Box className="grid gap-2 md:grid-cols-2">{withdrawals.slice(0, 6).map((item) => <Box key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><Box><Typography variant="body2" className="font-bold">{formatCurrency(item.amount)}</Typography><Typography variant="caption" className="text-slate-500">{item.bankName} · {item.maskedBankAccountNumber}</Typography></Box><Chip size="small" label={item.status === "PENDING" ? "Đang chờ admin" : item.status === "APPROVED" ? "Đã duyệt" : "Từ chối"} color={item.status === "APPROVED" ? "success" : item.status === "REJECTED" ? "error" : "warning"} /></Box>)}</Box>}
           </Box>
           <Box className="p-6 border-b border-slate-100">
             <Typography variant="h6" className="!font-bold text-slate-700">Đơn nạp SePay gần đây</Typography>
             {topUpOrders.length === 0 ? (
               <Typography variant="body2" className="text-slate-400 mt-2">Chưa có đơn nạp tiền.</Typography>
             ) : (
               <Box className="mt-3 grid gap-2 md:grid-cols-2">
                 {topUpOrders.map((item) => (
                   <Box key={item.invoiceNumber} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 gap-3">
                     <Box>
                       <Typography variant="body2" className="font-bold">{formatCurrency(item.amount)}</Typography>
                       <Typography variant="caption" className="text-slate-500">{item.invoiceNumber} · {item.status}</Typography>
                     </Box>
                     {item.status === "CREATED" && (
                       <Button
                         size="small"
                         color="error"
                         onClick={() => handleCancelTopUp(item.invoiceNumber)}
                         disabled={topUpActionLoading === item.invoiceNumber}
                       >
                         {topUpActionLoading === item.invoiceNumber ? "Đang hủy..." : "Hủy"}
                       </Button>
                     )}
                   </Box>
                 ))}
               </Box>
             )}
           </Box>
           <Box className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Typography variant="h6" className="!font-bold text-slate-700">Lịch sử giao dịch ví</Typography>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Tabs value={statusTab} onChange={(event, value) => { setStatusTab(value); setPage(0); }} sx={{ minHeight: "36px", "& .MuiTab-root": { minHeight: "36px", textTransform: "none", fontWeight: 600 } }}>
                <Tab label="Tất cả" value="all" />
                <Tab label="Thành công" value="success" />
                <Tab label="Đang chờ" value="pending" />
                <Tab label="Thất bại" value="failed" />
              </Tabs>
              <TextField
                placeholder="Tìm giao dịch..."
                size="small"
                value={searchTerm}
                onChange={(event) => { setSearchTerm(event.target.value); setPage(0); }}
                className="w-full sm:w-60"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon className="text-slate-400" fontSize="small" /></InputAdornment> }}
              />
            </div>
          </Box>
          <TableContainer component={Paper} className="!shadow-none !bg-transparent">
            <Table sx={{ minWidth: 650 }}>
              <TableHead className="bg-slate-50/50">
                <TableRow>
                  {[
                    ["id", "Mã giao dịch", "left"],
                    ["typeName", "Nội dung", "left"],
                    ["amount", "Giá trị", "right"],
                    ["time", "Thời gian", "right"],
                    ["status", "Trạng thái", "center"],
                    ["detail", "Chi tiết", "center"],
                  ].map(([id, label, align]) => (
                    <TableCell key={id} align={align} className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">
                      {id === "status" || id === "detail" ? label : <TableSortLabel active={orderBy === id} direction={orderBy === id ? order : "asc"} onClick={() => requestSort(id)}>{label}</TableSortLabel>}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {walletLoading ? (
                  <TableRow><TableCell colSpan={5} align="center" className="!py-12"><CircularProgress size={26} /></TableCell></TableRow>
                ) : paginatedTransactions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" className="!py-12 text-slate-400">Chưa có giao dịch phù hợp.</TableCell></TableRow>
                ) : paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-slate-50/40 transition-colors">
                    <TableCell className="!font-mono !font-bold text-slate-400 !border-slate-100">{transaction.id}</TableCell>
                    <TableCell className="!font-bold text-slate-700 !border-slate-100">{transaction.typeName}</TableCell>
                    <TableCell align="right" className={`!font-mono !font-bold !border-slate-100 ${transaction.amount > 0 ? "!text-[#047857]" : "!text-rose-600"}`}>
                      {transaction.amount > 0 ? `+${formatCurrency(transaction.amount)}` : formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell align="right" className="!text-slate-500 !text-xs !border-slate-100">{new Date(transaction.time).toLocaleString("vi-VN")}</TableCell>
                    <TableCell align="center" className="!border-slate-100">
                      <Chip label={transaction.status === "success" ? "Thành công" : transaction.status === "pending" ? "Đang xử lý" : "Thất bại"} size="small" color={transaction.status === "success" ? "success" : transaction.status === "pending" ? "warning" : "error"} className="!font-bold !text-[0.68rem]" />
                    </TableCell>
                    <TableCell align="center" className="!border-slate-100">
                      <Button size="small" onClick={() => handleOpenTransactionDetail(transaction)} className="!font-bold !capitalize">Xem</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
          />
        </AppCard>
      </div>

      <Dialog open={openWalletDialog} onClose={() => setOpenWalletDialog(false)} maxWidth="xs" fullWidth PaperProps={{ className: "!rounded-3xl !p-2" }}>
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          {walletActionType === "deposit" ? "Nạp tiền qua SePay Sandbox" : "Yêu cầu rút tiền"}
          <IconButton size="small" onClick={() => setOpenWalletDialog(false)} className="text-slate-400"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          {walletActionType === "deposit" ? (
            <Alert severity="info">Sau khi tạo đơn, form thanh toán SePay sẽ mở ở tab mới. Ví chỉ cập nhật sau IPN hợp lệ.</Alert>
          ) : (
            <Alert severity="warning">Yêu cầu sẽ khóa số tiền ngay lập tức và chờ admin duyệt. Nếu bị từ chối, số tiền sẽ được hoàn lại.</Alert>
          )}
          <TextField
            label={walletActionType === "deposit" ? "Số tiền nạp (VND)" : "Số tiền rút (VND)"}
            type="text"
            inputMode="numeric"
            placeholder="Tối thiểu 10.000"
            fullWidth
            value={formatWalletInput(walletAmount)}
            onChange={(event) => setWalletAmount(event.target.value.replace(/\D/g, ""))}
            disabled={walletActionLoading}
            helperText="Tự động phân tách hàng nghìn để dễ kiểm tra"
            inputProps={{ "aria-label": walletActionType === "deposit" ? "Số tiền nạp bằng VND" : "Số tiền rút bằng VND" }}
            InputProps={{ className: "!rounded-2xl", startAdornment: <InputAdornment position="start">₫</InputAdornment> }}
          />
          {walletActionType === "withdraw" && (
            <>
              <TextField label="Ngân hàng nhận" fullWidth value={bankName} onChange={(event) => setBankName(event.target.value)} disabled={walletActionLoading} />
              <TextField label="Số tài khoản" inputMode="numeric" fullWidth value={bankAccountNumber} onChange={(event) => setBankAccountNumber(event.target.value.replace(/\D/g, ""))} disabled={walletActionLoading} />
              <TextField label="Tên chủ tài khoản" fullWidth value={accountHolderName} onChange={(event) => setAccountHolderName(event.target.value)} disabled={walletActionLoading} />
            </>
          )}
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 flex justify-end gap-3">
          <Button onClick={() => setOpenWalletDialog(false)} variant="text" className="!text-slate-500 !font-bold !capitalize !rounded-xl">Hủy</Button>
          <Button onClick={handleWalletActionSubmit} disabled={!walletAmount || walletActionLoading} variant="contained" className="!font-bold !capitalize !rounded-xl !px-5 !text-white" sx={{ background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)", "&:hover": { background: "linear-gradient(135deg, #15415A 0%, #081E2B 100%)" }, "&.Mui-disabled": { background: "#94A3B8", color: "#F8FAFC" } }}>
            {walletActionLoading ? <CircularProgress size={20} className="!text-white" /> : walletActionType === "deposit" ? "Tạo đơn thanh toán" : "Gửi yêu cầu rút"}
          </Button>
        </DialogActions>
      </Dialog>

      <WalletDetailDialog
        open={Boolean(selectedTransaction)}
        onClose={closeTransactionDetail}
        title="Chi tiết giao dịch"
        loading={transactionDetailLoading}
      >
        {transactionDetail && (
          <Box>
            <WalletDetailRow label="Mã giao dịch" value={transactionDetail.id} />
            <WalletDetailRow label="Loại giao dịch" value={transactionDetail.type} />
            <WalletDetailRow label="Số tiền" value={formatCurrency(transactionDetail.amount)} />
            <WalletDetailRow label="Trạng thái" value={transactionDetail.status} />
            <WalletDetailRow label="Phương thức" value={transactionDetail.paymentMethod} />
            <WalletDetailRow label="Mã tham chiếu" value={transactionDetail.referenceCode} />
            <WalletDetailRow label="Nội dung" value={transactionDetail.description} />
            <WalletDetailRow label="Thời gian" value={transactionDetail.createdAt ? new Date(transactionDetail.createdAt).toLocaleString("vi-VN") : undefined} />
          </Box>
        )}
      </WalletDetailDialog>
    </Box>
  );
}
