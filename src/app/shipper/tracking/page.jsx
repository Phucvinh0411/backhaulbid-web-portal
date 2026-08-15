import TrackingScreen from "@/components/shipper/TrackingScreen";

export default async function ShipperTrackingPage({ searchParams }) {
  const params = await searchParams;
  return <TrackingScreen tripId={params?.id || null} />;
}
