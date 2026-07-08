"use client";

import dynamic from "next/dynamic";

const HotspotMap = dynamic(() => import("@/components/HotspotMap"), { ssr: false });

export default HotspotMap;
