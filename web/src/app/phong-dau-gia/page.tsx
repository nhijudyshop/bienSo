"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOrdersWaitAuction, getAuctionResults, formatPrice } from "@/lib/api";
import { VPA_URL, AUCTION_ROOM_URL } from "@/lib/constants";
import PlateNumber from "@/components/PlateNumber";
import type { AuctionResultSession } from "@/types";

interface WaitAuctionOrder {
  orderId: string;
  plateNumber: string;
  announcementNumber: string;
  auctionFromTime: number;
  auctionToTime: number;
  colorCode: number;
  siteId: number;
}

function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAuctionStatus(fromTime: number, toTime: number): { label: string; color: string } {
  const now = Date.now();
  if (now < fromTime) return { label: "Sắp diễn ra", color: "text-accent-blue" };
  if (now >= fromTime && now <= toTime) return { label: "Đang diễn ra", color: "text-accent-green" };
  return { label: "Đã kết thúc", color: "text-text-secondary" };
}

function openAuctionRoom() {
  window.open(AUCTION_ROOM_URL, "auction_room", "width=1000,height=700");
}

export default function PhongDauGiaPage() {
  const [orders, setOrders] = useState<WaitAuctionOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState("");

  const [sessions, setSessions] = useState<AuctionResultSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    getOrdersWaitAuction()
      .then((data) => {
        const d = data as { success: boolean; result: { content: WaitAuctionOrder[] } };
        setOrders(d.result?.content ?? []);
      })
      .catch((err) => setOrderError(err.message))
      .finally(() => setLoadingOrders(false));

    getAuctionResults({ page: 0, size: 5 })
      .then((data) => {
        setSessions(data.content ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{"PH\xd2NG \u0110\u1ea4U GI\xc1"}</h1>
        <p className="text-text-secondary text-sm">
          {"Tham gia \u0111\u1ea5u gi\xe1 bi\u1ec3n s\u1ed1 xe tr\u1ef1c tuy\u1ebfn t\u1ea1i "}
          <a
            href={AUCTION_ROOM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue underline"
          >
            phongdau.vpa.com.vn
          </a>
          {". Ph\xf2ng \u0111\u1ea5u gi\xe1 m\u1edf tr\u01b0\u1edbc 30 ph\xfat khi phi\xean \u0111\u1ea5u gi\xe1 b\u1eaft \u0111\u1ea7u."}
        </p>
      </div>

      {/* Auction process steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-green text-2xl font-bold mb-2">01</div>
          <h3 className="font-semibold mb-2">{"\u0110\u0103ng nh\u1eadp ph\xf2ng \u0111\u1ea5u"}</h3>
          <p className="text-text-secondary text-sm">
            {"V\xe0o ph\xf2ng \u0111\u1ea5u gi\xe1 b\u1eb1ng t\xe0i kho\u1ea3n \u0111\xe3 \u0111\u0103ng k\xfd tr\xean dgbs.vpa.com.vn. Nh\u1eadp m\xe3 x\xe1c th\u1ef1c nh\u1eadn qua SMS ho\u1eb7c email \u0111\u1ec3 x\xe1c nh\u1eadn danh t\xednh."}
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-blue text-2xl font-bold mb-2">02</div>
          <h3 className="font-semibold mb-2">{"\u0110\u1eb7t gi\xe1"}</h3>
          <p className="text-text-secondary text-sm">
            {"Xem b\u1ea3ng gi\xe1 hi\u1ec7n t\u1ea1i v\xe0 \u0111\u1eb7t gi\xe1 m\u1edbi. Gi\xe1 sau ph\u1ea3i cao h\u01a1n gi\xe1 tr\u01b0\u1edbc \xedt nh\u1ea5t 1 b\u01b0\u1edbc gi\xe1. Kh\xf4ng gi\u1edbi h\u1ea1n s\u1ed1 l\u1ea7n tr\u1ea3 gi\xe1 trong phi\xean."}
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-orange text-2xl font-bold mb-2">03</div>
          <h3 className="font-semibold mb-2">{`K\u1ebft qu\u1ea3`}</h3>
          <p className="text-text-secondary text-sm">
            {"Khi h\u1ebft th\u1eddi gian, ng\u01b0\u1eddi c\xf3 gi\xe1 cao nh\u1ea5t s\u1ebd tr\xfang \u0111\u1ea5u gi\xe1. K\u1ebft qu\u1ea3 \u0111\u01b0\u1ee3c c\xf4ng b\u1ed1 t\u1ea1i trang K\u1ebft qu\u1ea3 \u0111\u1ea5u gi\xe1."}
          </p>
        </div>
      </div>

      {/* Orders waiting for auction */}
      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">{`Bi\u1ec3n s\u1ed1 ch\u1edd \u0111\u1ea5u gi\xe1 c\u1ee7a b\u1ea1n`}</h2>
          {orders.length > 0 && (
            <span className="bg-accent-green/20 text-accent-green text-xs font-medium px-2 py-1 rounded-full">
              {orders.length} {`bi\u1ec3n s\u1ed1`}
            </span>
          )}
        </div>

        {loadingOrders ? (
          <div className="px-4 py-12 text-center text-text-secondary">{`\u0110ang t\u1ea3i d\u1eef li\u1ec7u...`}</div>
        ) : orderError ? (
          <div className="px-6 py-8 text-center">
            <p className="text-text-secondary text-sm mb-4">
              {orderError.includes("401")
                ? "\u0110\u0103ng nh\u1eadp \u0111\u1ec3 xem bi\u1ec3n s\u1ed1 ch\u1edd \u0111\u1ea5u gi\xe1"
                : "Kh\xf4ng th\u1ec3 t\u1ea3i d\u1eef li\u1ec7u"}
            </p>
            <a
              href={`${VPA_URL}/dang-nhap`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent-green text-white px-4 py-2 rounded-lg text-sm inline-block hover:opacity-90 transition-opacity"
            >
              {`\u0110\u0103ng nh\u1eadp t\u1ea1i dgbs.vpa.com.vn`}
            </a>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-4 py-12 text-center text-text-secondary">
            {`B\u1ea1n ch\u01b0a c\xf3 bi\u1ec3n s\u1ed1 n\xe0o ch\u1edd \u0111\u1ea5u gi\xe1. `}
            <Link href="/dau-gia" className="text-accent-blue hover:underline">
              {`\u0110\u0103ng k\xfd \u0111\u1ea5u gi\xe1 ngay`}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => {
              const status = getAuctionStatus(order.auctionFromTime, order.auctionToTime);
              return (
                <div key={order.orderId} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <PlateNumber plate={order.plateNumber} colorCode={order.colorCode} />
                    <div>
                      <div className="text-sm font-medium">{order.announcementNumber}</div>
                      <div className="text-xs text-text-secondary">
                        {formatDate(order.auctionFromTime)} - {formatDate(order.auctionToTime)}
                      </div>
                      <div className={`text-xs font-medium mt-0.5 ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openAuctionRoom()}
                    className="bg-accent-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {`V\xe0o ph\xf2ng \u0111\u1ea5u`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent auction sessions */}
      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">{`Phi\xean \u0111\u1ea5u gi\xe1 g\u1ea7n \u0111\xe2y`}</h2>
          <Link href="/ket-qua-dau-gia" className="text-accent-blue text-sm hover:underline">
            {`Xem t\u1ea5t c\u1ea3`}
          </Link>
        </div>

        {loadingSessions ? (
          <div className="px-4 py-12 text-center text-text-secondary">{`\u0110ang t\u1ea3i d\u1eef li\u1ec7u...`}</div>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-12 text-center text-text-secondary">
            {`Ch\u01b0a c\xf3 k\u1ebft qu\u1ea3 \u0111\u1ea5u gi\xe1 n\xe0o`}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/ket-qua-dau-gia/${session.id}`}
                className="block px-6 py-4 hover:bg-bg-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{`Ng\xe0y `}{session.auctionDate}</div>
                      <div className="text-xs text-text-secondary">
                        {session.totalPlate} {`bi\u1ec3n s\u1ed1 \u0111\u01b0\u1ee3c \u0111\u1ea5u gi\xe1`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm">
                      <span className="text-text-secondary">{`Cao nh\u1ea5t: `}</span>
                      <span className="text-accent-green font-medium">{formatPrice(session.maxPrice)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-text-secondary">{`Th\u1ea5p nh\u1ea5t: `}</span>
                      <span className="text-accent-orange font-medium">{formatPrice(session.minPrice)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
