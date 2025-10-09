"use client";

import { Button, Spinner, Text } from "@radix-ui/themes";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";

interface QRCodeDisplayProps {
  size?: number;
}

export default function QRCodeDisplay({ size = 256 }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the QR URL from our API
      const response = await fetch("/api/qr");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch QR URL");
      }

      const data = await response.json();
      const url = data.url;

      // Generate QR code image
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code",
      );
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  const regenerateQRCode = async () => {
    await fetchQRCode();
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 border border-gray-200"
        style={{ width: size, height: size }}
      >
        <Spinner size="3" />
        <Text size="1">Loading...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200"
        style={{ width: size, height: size }}
      >
        <Text color="red" className="text-center" size="1">
          {error}
        </Text>
        <Button onClick={regenerateQRCode} variant="outline" size="1">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200"
      style={{ width: size, height: size }}
    >
      {qrCodeDataUrl && (
        // biome-ignore lint/performance/noImgElement: QR code is a data URL, not a regular image
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="block"
        />
      )}
    </div>
  );
}
