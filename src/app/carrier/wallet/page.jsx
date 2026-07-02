"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCardIcon from "@mui/icons-material/AddCard";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { PageHeader } from "@/components/common";

const balanceHistory = [
  { day: "1", balance: 18000000 },
  { day: "2", balance: 20000000 },
  { day: "3", balance: 24000000 },
  { day: "4", balance: 15000000 },
  { day: "5", balance: 22000000 },
  { day: "6", balance: 25450000 },
];

const transactions = [
  { id: "TXN-001", type: "in", desc: "Thanh toán chuyến BID-2451", amount: 12000000, date: "10/08/2026 14:30", status: "success", icon: LocalAtmIcon },
  { id: "TXN-002", type: "out", desc: "Phí dịch vụ nền tảng (Tháng 7)", amount: 2000000, date: "09/08/2026 09:15", status: "success", icon: AssessmentOutlinedIcon },
  { id: "TXN-003", type: "out", desc: "Rút tiền về Vietcombank", amount: 5000000, date: "08/08/2026 16:45", status: "pending", icon: AccountBalanceIcon },
  { id: "TXN-004", type: "in", desc: "Nạp tiền ví qua Momo", amount: 2000000, date: "07/08/2026 10:20", status: "success", icon: AddCardIcon },
  { id: "TXN-005", type: "in", desc: "Thanh toán chuyến BID-2390", amount: 8650000, date: "02/08/2026 11:00", status: "failed", icon: LocalAtmIcon },
];

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function WalletPage() {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredTxns = transactions.filter(txn => {
    if (tabValue === 1) return txn.type === 'in';
    if (tabValue === 2) return txn.type === 'out';
    return true;
  });

  return (
    <Box className="animate-fade-in-up pb-12 w-full mt-2 flex flex-col gap-6">
      <PageHeader 
        title="Ví thanh toán" 
        subtitle="Quản lý dòng tiền, số dư tài khoản và đối soát giao dịch"
      />

      <Box>
        <Grid container spacing={4}>
          {/* Main Balance & Mini Chart */}
          <Grid item xs={12} md={5}>
            <Box className="flex flex-col gap-6 h-full">
              {/* Main Balance Card */}
              <Card 
                className="text-white relative overflow-hidden rounded-3xl" 
                sx={{ 
                  background: "linear-gradient(135deg, #0a1929 0%, #1B4965 100%)",
                  boxShadow: "0 12px 32px rgba(10, 25, 41, 0.4)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
              >
                {/* Decorative circles */}
                <Box className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></Box>
                <Box className="absolute bottom-0 right-0 p-6 opacity-20">
                  <AccountBalanceWalletIcon sx={{ fontSize: 120 }} />
                </Box>
                
                <CardContent className="relative z-10 p-8 flex flex-col h-full justify-between gap-6">
                  <Box className="flex justify-between items-start">
                    <Box>
                      <Box className="flex items-center gap-2 mb-1">
                        <Typography variant="subtitle2" className="font-semibold text-slate-300 uppercase tracking-widest">
                          Số dư khả dụng
                        </Typography>
                        <Tooltip title="Tiền có thể sử dụng hoặc rút ngay">
                          <InfoOutlinedIcon sx={{ fontSize: 16, color: "#cbd5e1", cursor: "help" }} />
                        </Tooltip>
                      </Box>
                      <Typography variant="h3" className="font-bold tracking-tight text-white">
                        {formatCurrency(25450000)}
                      </Typography>
                    </Box>
                    <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }}}>
                      <QrCodeScannerIcon />
                    </IconButton>
                  </Box>
                  
                  <Box className="flex items-end justify-between">
                    <Box className="flex gap-3 w-full">
                      <Button 
                        variant="contained" 
                        fullWidth
                        startIcon={<AddCardIcon />}
                        sx={{ 
                          backgroundColor: "#62B6CB", 
                          color: "#0a1929",
                          "&:hover": { filter: "brightness(0.95)" },
                          fontWeight: 700,
                          borderRadius: '12px',
                          py: 1.5
                        }} 
                        disableElevation
                      >
                        Nạp tiền
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        startIcon={<AccountBalanceIcon />}
                        sx={{ 
                          color: "white", 
                          borderColor: "rgba(255,255,255,0.3)", 
                          "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.1)" },
                          fontWeight: 700,
                          borderRadius: '12px',
                          py: 1.5
                        }}
                      >
                        Rút tiền
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Linked Bank Card Mockup */}
              <Card className="rounded-3xl border border-slate-200 shadow-sm glass relative overflow-hidden group">
                <Box className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#62b6cb]/30 to-transparent rounded-bl-full"></Box>
                <CardContent className="p-6">
                  <Box className="flex justify-between items-center mb-4">
                    <Typography variant="subtitle2" className="font-bold text-[#1B4965] uppercase tracking-wider">Tài khoản liên kết</Typography>
                    <Chip label="Mặc định" size="small" sx={{ bgcolor: '#e0f2fe', color: '#1B4965', fontWeight: 700, fontSize: '0.7rem' }} />
                  </Box>
                  <Box className="flex items-center gap-4">
                    <Box className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md">
                      <AccountBalanceIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" className="font-bold text-slate-800">Vietcombank</Typography>
                      <Typography variant="body2" className="text-slate-500 font-mono tracking-widest">**** **** **** 1234</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          {/* Cashflow & History */}
          <Grid item xs={12} md={7}>
            <Box className="flex flex-col gap-6 h-full">
              
              {/* Cashflow Mini KPIs */}
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Card className="glass rounded-2xl shadow-sm border border-emerald-100 overflow-hidden relative">
                    <Box className="absolute top-0 right-0 bottom-0 w-1 bg-emerald-400"></Box>
                    <CardContent className="p-5">
                      <Box className="flex items-center gap-3 mb-2">
                        <Box className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                          <ArrowUpwardIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle2" className="font-bold text-slate-500">Tiền vào (Tháng)</Typography>
                      </Box>
                      <Typography variant="h5" className="font-extrabold text-slate-800">{formatCurrency(45000000)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card className="glass rounded-2xl shadow-sm border border-rose-100 overflow-hidden relative">
                    <Box className="absolute top-0 right-0 bottom-0 w-1 bg-rose-400"></Box>
                    <CardContent className="p-5">
                      <Box className="flex items-center gap-3 mb-2">
                        <Box className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                          <ArrowDownwardIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle2" className="font-bold text-slate-500">Tiền ra (Tháng)</Typography>
                      </Box>
                      <Typography variant="h5" className="font-extrabold text-slate-800">{formatCurrency(8500000)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Transaction History */}
              <Card className="glass border border-slate-200/60 rounded-3xl shadow-sm flex-1 flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
                    <Typography variant="h6" className="!font-bold text-[#1B4965]">
                      Lịch sử giao dịch
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon />} sx={{ color: '#1B4965', borderColor: 'rgba(27,73,101,0.2)', textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
                      Xuất báo cáo
                    </Button>
                  </Box>
                  
                  <Box className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
                    <Tabs 
                      value={tabValue} 
                      onChange={handleTabChange} 
                      sx={{
                        minHeight: '36px',
                        '& .MuiTab-root': { minHeight: '36px', py: 0, px: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' },
                        '& .Mui-selected': { color: '#1B4965 !important' },
                        '& .MuiTabs-indicator': { backgroundColor: '#1B4965' }
                      }}
                    >
                      <Tab label="Tất cả" />
                      <Tab label="Tiền vào" />
                      <Tab label="Tiền ra" />
                    </Tabs>
                    <TextField 
                      placeholder="Tìm giao dịch..." 
                      size="small" 
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.8)', '& fieldset': { borderColor: '#e2e8f0' } } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Box className="space-y-3 mt-4 flex-1">
                    {filteredTxns.map((txn) => {
                      const Icon = txn.icon;
                      return (
                        <Box key={txn.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 bg-white/60 hover:bg-white transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(27,73,101,0.04)]">
                          <Box className="flex items-center gap-4">
                            <Box className={`w-12 h-12 rounded-xl flex items-center justify-center ${txn.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              <Icon />
                            </Box>
                            <Box>
                              <Typography variant="body2" className="font-bold text-slate-800">{txn.desc}</Typography>
                              <Box className="flex items-center gap-2 mt-1">
                                <Typography variant="caption" className="text-slate-500 font-medium">{txn.date}</Typography>
                                <Box className={`w-1.5 h-1.5 rounded-full ${txn.status === 'success' ? 'bg-emerald-500' : txn.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></Box>
                                <Typography variant="caption" className={`font-semibold ${txn.status === 'success' ? 'text-emerald-600' : txn.status === 'pending' ? 'text-amber-600' : 'text-rose-600'}`}>
                                  {txn.status === 'success' ? 'Thành công' : txn.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Typography variant="subtitle1" className={`font-extrabold tracking-tight ${txn.type === 'in' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {txn.type === 'in' ? '+' : '-'} {formatCurrency(txn.amount)}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Box>
                  
                  <Button variant="text" fullWidth sx={{ mt: 2, color: '#64748b', fontWeight: 600 }}>
                    Xem thêm giao dịch
                  </Button>
                </CardContent>
              </Card>

            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
