"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/** Content that rises into place once when it scrolls into view. Static when reduced motion is on. */
export function Reveal({ as = "div", delay = 0, className, children, ...rest }) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  if (reduced) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Hero illustration: a return trip that starts empty at A, picks up a load at the shipper's
 * warehouse and arrives at B full. Plays once on load; drawn complete when reduced motion is on.
 */
export function BackhaulRoute() {
  const reduced = useReducedMotion();
  const PATH = "M 40 220 C 140 220 150 90 260 110 S 400 230 520 70";
  const play = (from, to, delay, duration = 1.6) =>
    reduced ? { initial: to, animate: to } : { initial: from, animate: to, transition: { duration, delay, ease: EASE } };
  // One trip: drive to the shipper's warehouse (45.85% of the route), stop to load, drive on to B.
  const TRIP = { delay: 0.4, duration: 3, times: [0, 0.42, 0.58, 1], ease: ["easeInOut", "linear", "easeInOut"] };
  const PICKUP = 0.4585;
  const LOADED_AT = TRIP.delay + TRIP.duration * 0.46;
  const trip = (key, values, unit) => {
    // pathLength must stay numeric; offsetDistance needs a unit.
    const v = (value) => (unit ? `${value}${unit}` : value);
    return reduced
      ? { initial: { [key]: v(values.at(-1)) }, animate: { [key]: v(values.at(-1)) } }
      : { initial: { [key]: v(values[0]) }, animate: { [key]: values.map(v) }, transition: TRIP };
  };

  return (
    <figure className="m-0 rounded-xl bg-band p-5 text-white md:p-7" aria-labelledby="route-caption">
      <svg viewBox="0 0 560 280" className="h-auto w-full" role="img" aria-label="Xe đi từ nơi vừa giao xong, ghé kho chủ hàng lấy hàng rồi chở tới kho nhận">
        <path d={PATH} fill="none" stroke="var(--color-on-band-soft)" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        <motion.path d={PATH} fill="none" stroke="var(--color-surface)" strokeWidth="4" strokeLinecap="round" {...trip("pathLength", [0, PICKUP, PICKUP, 1])} />

        {/* A: where the truck finished its outbound delivery */}
        <circle cx="40" cy="220" r="11" fill="var(--color-band)" stroke="var(--color-surface)" strokeWidth="3" />
        <text x="28" y="252" className="max-sm:hidden fill-[var(--color-on-band-soft)] text-[14px]">Vừa giao xong</text>

        {/* Pickup at the shipper's warehouse */}
        <motion.g {...play({ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, 0.2, 0.4)} style={{ transformOrigin: "260px 110px" }}>
          <rect x="248" y="98" width="24" height="24" rx="6" fill="var(--color-surface)" />
          <text x="260" y="146" textAnchor="middle" className="max-sm:hidden fill-[var(--color-surface)] text-[14px] font-semibold">Kho chủ hàng · lấy hàng</text>
        </motion.g>

        {/* B: delivery warehouse */}
        <circle cx="520" cy="70" r="11" fill="var(--color-success)" stroke="var(--color-surface)" strokeWidth="3" />
        <text x="520" y="40" textAnchor="middle" className="max-sm:hidden fill-[var(--color-on-band-soft)] text-[14px]">Kho nhận</text>

        {/* The truck travels the route; its box fills while it stops at the pickup. */}
        <motion.g
          style={{ offsetPath: `path("${PATH}")`, offsetRotate: "0deg" }}
          {...trip("offsetDistance", [0, PICKUP * 100, PICKUP * 100, 91], "%")}
        >
          <g transform="translate(-25 -40) scale(1.5)">
            <rect x="0" y="4" width="22" height="16" rx="3" fill="var(--color-band)" stroke="var(--color-surface)" strokeWidth="2" />
            <motion.rect x="3" y="7" width="16" height="10" rx="1.5" fill="var(--color-surface)" {...play({ opacity: 0 }, { opacity: 1 }, LOADED_AT, 0.25)} />
            <path d="M22 9 h6 l5 5 v6 h-11 z" fill="var(--color-surface)" />
            <circle cx="7" cy="22" r="3" fill="var(--color-surface)" />
            <circle cx="27" cy="22" r="3" fill="var(--color-surface)" />
          </g>
        </motion.g>
      </svg>
      {/* On narrow screens the in-figure labels would be ~8px, so they move below the drawing. */}
      <ol className="mt-2 grid list-none gap-1 p-0 text-sm text-on-band-soft sm:hidden" aria-hidden>
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-surface" />Vừa giao xong</li>
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-surface" />Kho chủ hàng: lấy hàng</li>
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" />Kho nhận</li>
      </ol>
      <figcaption id="route-caption" className="mt-3 grid gap-1">
        <span className="text-lg font-semibold">Chiều về không phải chạy rỗng.</span>
        <span className="text-on-band-soft">Xe vừa giao xong nhận thêm một lô trên đường về, qua phiên đấu giá của chủ hàng.</span>
      </figcaption>
    </figure>
  );
}

/**
 * The four steps of a trip. A rail fills as the reader scrolls through the list and each
 * step's marker fills when the rail reaches it.
 */
export function JourneySteps({ steps }) {
  const reduced = useReducedMotion();
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const fill = useTransform(progress, [0, 1], [0, 1]);

  return (
    <ol ref={listRef} className="relative m-0 grid list-none gap-10 p-0 pl-12 md:gap-14 md:pl-16">
      <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-[2px] rounded-full bg-line md:left-[19px]" />
      <motion.span
        aria-hidden
        className="absolute bottom-3 left-[15px] top-3 w-[2px] origin-top rounded-full bg-brand md:left-[19px]"
        style={{ scaleY: reduced ? 1 : fill }}
      />
      {steps.map((step, index) => (
        <StepItem key={step.title} step={step} index={index} total={steps.length} reduced={reduced} />
      ))}
    </ol>
  );
}

function StepItem({ step, index, total, reduced }) {
  const last = index === total - 1;
  const marker = `absolute -left-12 top-0 grid h-8 w-8 place-items-center text-sm font-semibold tabular-nums md:-left-16 md:h-10 md:w-10 ${last ? "rounded-md" : "rounded-full"}`;
  return (
    <li className="relative">
      {reduced ? (
        <span aria-hidden className={`${marker} bg-brand text-white`}>{index + 1}</span>
      ) : (
        <motion.span
          aria-hidden
          className={`${marker} border-2 border-brand`}
          initial={{ backgroundColor: "var(--color-surface)", color: "var(--color-brand)" }}
          whileInView={{ backgroundColor: "var(--color-brand)", color: "var(--color-surface)" }}
          viewport={{ once: true, amount: 1, margin: "0px 0px -40% 0px" }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {index + 1}
        </motion.span>
      )}
      <Reveal>
        <h3 className="text-xl font-bold md:text-2xl">{step.title}</h3>
        <p className="mt-2 max-w-[56ch] text-ink-muted md:text-lg">{step.text}</p>
      </Reveal>
    </li>
  );
}
