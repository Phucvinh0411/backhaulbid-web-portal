"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PinDropIcon from "@mui/icons-material/PinDrop";
import { PageHeader, ViewModeToggle, DetailDrawer } from "@/components/common";
import CarrierTransportItem from "@/components/carrier/CarrierTransportItem";
import { getMyDrivers, getMyVehicles } from "@/services/fleetApi";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

const mapTripStatus = (trip) => {
  if (trip.status === "WAITING_PICKUP") {
    return trip.driverId ? "ASSIGNED" : "WAITING_DRIVER";
  }
  if (trip.status === "PICKED_UP" || trip.status === "IN_TRANSIT")
    return "IN_TRANSIT";
  if (trip.status === "DELIVERED" || trip.status === "COMPLETED")
    return "COMPLETED";
  return trip.status;
};

const mapTrip = (trip, vehicles, drivers) => {
  const vehicle = vehicles.find((item) => item.id === trip.vehicleId);
  const driver = drivers.find((item) => item.id === trip.driverId);
  return {
    backendId: trip.id,
    id: `TRP-${String(trip.id).slice(0, 8).toUpperCase()}`,
    auctionId: trip.contractCode || trip.id,
    route: `${trip.pickupLocation} - ${trip.deliveryLocation}`,
    vehicle: vehicle?.plate || trip.vehicleId,
    driver: driver?.name || (trip.driverId ? trip.driverId : null),
    driverId: trip.driverId || "",
    pin: trip.hasAssignmentPin ? "Đã cấp" : null,
    status: mapTripStatus(trip),
    agreedPrice: trip.agreedPrice,
    latestTracking: trip.latestTracking,
    pickupLocation: trip.pickupLocation,
    deliveryLocation: trip.deliveryLocation,
  };
};

const statusChip = (status) => {
  const designs = {
    WAITING_DRIVER: { label: "Chờ điều phối", color: "warning" },
    ASSIGNED: { label: "Đã điều phối", color: "success" },
    IN_TRANSIT: { label: "Đang vận chuyển", color: "info" },
    COMPLETED: { label: "Hoàn thành", color: "success" },
    CANCELLED: { label: "Đã hủy", color: "error" },
  };
  const design = designs[status] || { label: status, color: "default" };
  return <Chip label={design.label} color={design.color} size="small" />;
};

export default function TransportsPage() {
  const notify = useGlobalNotification();
  const [viewMode, setViewMode] = useState("CARD");
  const [transports, setTransports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [generatedPin, setGeneratedPin] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  useEffect(() => {
    let active = true;
    Promise.all([contractApi.listTrips(), getMyVehicles(), getMyDrivers()])
      .then(([trips, vehicles, carrierDrivers]) => {
        if (!active) return;
        const verifiedDrivers = (carrierDrivers || []).filter(
          (driver) => driver.status === "VERIFIED",
        );
        setDrivers(verifiedDrivers);
        setTransports(
          (trips || []).map((trip) =>
            mapTrip(trip, vehicles || [], carrierDrivers || []),
          ),
        );
      })
      .catch((error) => {
        if (active) {
          setLoadError(
            getApiErrorMessage(
              error,
              "Không thể tải danh sách chuyến vận chuyển. Vui lòng thử lại.",
            ),
          );
          notify.error(
            getApiErrorMessage(
              error,
              "Không thể tải danh sách chuyến vận chuyển. Vui lòng thử lại.",
            ),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [notify]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedTransports = useMemo(() => {
    return [...transports].sort((a, b) => {
      const comparison = String(a[orderBy] || "").localeCompare(
        String(b[orderBy] || ""),
      );
      return order === "desc" ? -comparison : comparison;
    });
  }, [order, orderBy, transports]);

  const handleOpenAssign = (transport) => {
    setSelectedTransport(transport);
    setSelectedDriver(transport.driverId || "");
    setGeneratedPin("");
    setActionError("");
    setOpenDialog(true);
  };

  const handleOpenDetails = (transport) => {
    setSelectedTransport(transport);
    setOpenDetailsModal(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedTransport || !selectedDriver) return;
    setAssignmentLoading(true);
    setActionError("");
    try {
      const result = await contractApi.assignDriver(
        selectedTransport.backendId,
        {
          driverId: selectedDriver,
        },
      );
      const driver = drivers.find((item) => item.id === selectedDriver);
      const updated = {
        ...selectedTransport,
        driverId: selectedDriver,
        driver: driver?.name || selectedDriver,
        pin: "Đã cấp",
        status: "ASSIGNED",
      };
      setGeneratedPin(result.assignmentPin);
      setSelectedTransport(updated);
      setTransports((current) =>
        current.map((item) =>
          item.backendId === updated.backendId ? updated : item,
        ),
      );
      notify.success(
        "Đã điều phối tài xế và cấp mã PIN cho chuyến vận chuyển.",
      );
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể lưu điều phối tài xế. Vui lòng thử lại.",
      );
      setActionError(message);
      notify.error(message);
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex min-h-[320px] items-center justify-center">
        <CircularProgress aria-label="Đang tải chuyến vận chuyển" />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box className="p-4">
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in-up">
      <PageHeader
        title="Quản lý Vận chuyển"
        subtitle="Điều phối tài xế, cấp mã PIN và theo dõi các chuyến hàng từ dữ liệu vận hành thật"
        action={<ViewModeToggle viewMode={viewMode} onChange={setViewMode} />}
      />

      {sortedTransports.length === 0 ? (
        <Box className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-10 text-center">
          <Typography variant="h6" className="text-slate-500">
            Chưa có chuyến vận chuyển được gán cho nhà xe.
          </Typography>
        </Box>
      ) : viewMode === "TABLE" ? (
        <Card className="glass mt-6">
          <TableContainer>
            <Table aria-label="Danh sách chuyến vận chuyển">
              <TableHead sx={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}>
                <TableRow>
                  {["id", "route", "vehicle", "driver", "pin", "status"].map(
                    (column) => (
                      <TableCell key={column} className="!font-bold">
                        <TableSortLabel
                          active={orderBy === column}
                          direction={orderBy === column ? order : "asc"}
                          onClick={() => handleRequestSort(column)}
                        >
                          {
                            {
                              id: "Mã chuyến",
                              route: "Tuyến đường",
                              vehicle: "Phương tiện",
                              driver: "Tài xế",
                              pin: "Mã PIN",
                              status: "Trạng thái",
                            }[column]
                          }
                        </TableSortLabel>
                      </TableCell>
                    ),
                  )}
                  <TableCell align="right" className="!font-bold">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTransports.map((row) => (
                  <TableRow key={row.backendId} hover>
                    <TableCell className="font-semibold text-[#1B4965]">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.route}</TableCell>
                    <TableCell>{row.vehicle}</TableCell>
                    <TableCell>
                      {row.driver || (
                        <Typography
                          variant="caption"
                          className="italic text-slate-400"
                        >
                          Chưa gán
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{row.pin || "-"}</TableCell>
                    <TableCell>{statusChip(row.status)}</TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-2">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<InfoOutlinedIcon />}
                          onClick={() => handleOpenDetails(row)}
                        >
                          Chi tiết
                        </Button>
                        {row.status === "WAITING_DRIVER" ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenAssign(row)}
                          >
                            Điều phối
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PinDropIcon />}
                            component={Link}
                            href={`/carrier/transports/${row.backendId}`}
                          >
                            Theo dõi
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Grid container spacing={3} className="mt-2">
          {sortedTransports.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row.backendId}>
              <CarrierTransportItem
                transport={row}
                onAssign={handleOpenAssign}
                onViewDetail={handleOpenDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-2xl" }}
      >
        <DialogTitle className="font-bold text-[#1B4965]">
          Điều phối chuyến {selectedTransport?.id}
        </DialogTitle>
        <DialogContent dividers>
          <Box className="space-y-4 pt-2">
            {actionError && <Alert severity="error">{actionError}</Alert>}
            <Typography variant="body2" className="text-slate-600">
              Chỉ tài xế đã được Admin xác minh mới xuất hiện. PIN được tạo tại
              backend và chỉ hiển thị sau khi lưu điều phối.
            </Typography>
            <TextField
              select
              fullWidth
              label="Chọn tài xế"
              value={selectedDriver}
              onChange={(event) => setSelectedDriver(event.target.value)}
            >
              {drivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.name} - {driver.phone}
                </MenuItem>
              ))}
            </TextField>
            {drivers.length === 0 && (
              <Alert severity="info">
                Chưa có tài xế đã xác minh để điều phối.
              </Alert>
            )}
            {generatedPin && (
              <Box className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <Typography
                  variant="caption"
                  className="mb-2 block font-semibold uppercase tracking-wider text-emerald-700"
                >
                  Mã PIN xác thực của tài xế
                </Typography>
                <Box className="flex items-center justify-center gap-2">
                  <Typography
                    variant="h4"
                    className="font-mono font-black tracking-widest text-emerald-800"
                  >
                    {generatedPin}
                  </Typography>
                  <IconButton
                    size="small"
                    color="success"
                    aria-label="Sao chép mã PIN"
                    onClick={() => navigator.clipboard?.writeText(generatedPin)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  className="mt-2 block text-emerald-600"
                >
                  Hãy gửi mã này cho tài xế trong phiên điều phối hiện tại.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!selectedDriver || assignmentLoading}
            onClick={handleAssignDriver}
          >
            {assignmentLoading
              ? "Đang lưu..."
              : generatedPin
                ? "Cấp lại PIN"
                : "Lưu điều phối"}
          </Button>
        </DialogActions>
      </Dialog>

      <DetailDrawer
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        title={
          <Box className="flex w-full items-center justify-between pr-4">
            <span>Chi tiết chuyến {selectedTransport?.id}</span>
            {selectedTransport && statusChip(selectedTransport.status)}
          </Box>
        }
      >
        {selectedTransport && (
          <Box className="space-y-4">
            <Typography
              variant="subtitle2"
              className="font-bold uppercase text-slate-500"
            >
              Thông tin chuyến
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" className="text-slate-500">
                  Tuyến đường
                </Typography>
                <Typography variant="body1" className="font-bold">
                  {selectedTransport.route}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">
                  Phương tiện
                </Typography>
                <Typography
                  variant="body1"
                  className="font-bold text-[#1B4965]"
                >
                  {selectedTransport.vehicle}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">
                  Giá thỏa thuận
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {selectedTransport.agreedPrice == null
                    ? "Chưa cập nhật"
                    : new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(selectedTransport.agreedPrice)}
                </Typography>
              </Grid>
            </Grid>
            <Divider />
            <Typography
              variant="subtitle2"
              className="font-bold uppercase text-slate-500"
            >
              Điều phối
            </Typography>
            <Typography variant="body1" className="font-medium">
              {selectedTransport.driver || (
                <span className="italic text-amber-600">Chưa điều phối</span>
              )}
            </Typography>
            <Typography variant="body2" className="text-slate-500">
              PIN: {selectedTransport.pin || "Chưa cấp"}
            </Typography>
            <Typography variant="body2" className="text-slate-500">
              Hành trình được tài xế cập nhật theo mốc thủ công. Mở chi tiết để
              xem timeline và bằng chứng.
            </Typography>
            <Button
              component={Link}
              href={`/carrier/transports/${selectedTransport.backendId}`}
              variant="contained"
              fullWidth
            >
              {" "}
              Mở theo dõi chi tiết{" "}
            </Button>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
