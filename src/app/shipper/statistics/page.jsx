import { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import StatisticsScreen from "@/components/statistics/StatisticsScreen";

export default function ShipperStatisticsPage() {
  return <Suspense fallback={<Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}><CircularProgress /></Box>}><StatisticsScreen role="shipper" /></Suspense>;
}
