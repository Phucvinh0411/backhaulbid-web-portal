import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGpsSegments,
  buildJourneyTimeline,
  computeHeading,
  computeSpeed,
  routeProgress,
} from "./trackingPresentation.js";

test("routeProgress splits route into passed and remaining and computes ETA", () => {
  const routePoints = [
    [10.7626, 106.6602],
    [10.7800, 106.6800],
    [10.8000, 106.7000],
    [10.8200, 106.7200],
  ];
  const current = { latitude: 10.7805, longitude: 106.6802 };
  const gpsSegments = [
    [
      [10.7626, 106.6602],
      [10.7805, 106.6802],
    ],
  ];

  const result = routeProgress(routePoints, current, gpsSegments, { durationSeconds: 1800 });
  assert.ok(result.traveledMeters > 2000);
  assert.ok(result.remainingMeters > 4000);
  assert.ok(result.progressRatio > 0.2 && result.progressRatio < 0.5);
  assert.ok(result.etaSeconds > 0 && result.etaSeconds < 1800);
  assert.ok(result.routePassed.length >= 2);
  assert.ok(result.routeRemaining.length >= 2);
});

test("computeHeading and computeSpeed derive direction and km/h from GPS samples", () => {
  const locations = [
    {
      id: "1",
      latitude: 10.7626,
      longitude: 106.6602,
      source: "GPS",
      capturedAt: "2026-11-05T10:00:00.000Z",
    },
    {
      id: "2",
      latitude: 10.7636,
      longitude: 106.6602,
      source: "GPS",
      capturedAt: "2026-11-05T10:00:10.000Z",
    },
  ];

  const heading = computeHeading(locations, locations[1]);
  const speed = computeSpeed(locations, locations[1]);

  assert.equal(heading, 0); // Moving due North
  assert.ok(speed > 35 && speed < 45);
});

test("buildJourneyTimeline orders delivery events newest first without milestones", () => {
  const events = [
    { id: "e1", eventType: "DRIVER_ACCEPTED", recordedAt: "2026-11-05T09:00:00.000Z" },
    { id: "e2", eventType: "PICKUP_CONFIRMED", recordedAt: "2026-11-05T09:30:00.000Z" },
  ];
  const timeline = buildJourneyTimeline(events);
  assert.equal(timeline.length, 2);
  assert.equal(timeline[0].id, "e2");
  assert.equal(timeline[1].id, "e1");
  assert.ok(timeline.every((e) => !String(e.key).startsWith("milestone-")));
});

test("buildGpsSegments connects valid consecutive GPS points and breaks on large time gaps", () => {
  const locations = [
    { id: "1", latitude: 10.76, longitude: 106.66, source: "GPS", accuracyMeters: 10, capturedAt: "2026-11-05T10:00:00Z" },
    { id: "2", latitude: 10.761, longitude: 106.661, source: "GPS", accuracyMeters: 12, capturedAt: "2026-11-05T10:00:15Z" },
    { id: "3", latitude: 10.77, longitude: 106.67, source: "GPS", accuracyMeters: 15, capturedAt: "2026-11-05T10:15:00Z" },
    { id: "4", latitude: 10.771, longitude: 106.671, source: "GPS", accuracyMeters: 15, capturedAt: "2026-11-05T10:15:15Z" },
  ];
  const segments = buildGpsSegments(locations);
  assert.equal(segments.length, 2);
  assert.equal(segments[0].length, 2);
  assert.equal(segments[1].length, 2);
});

