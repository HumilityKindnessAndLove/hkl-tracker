"use client";

import { Button, Card, Spinner, Text } from "@radix-ui/themes";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";

interface QRCodeDisplayProps {
  size?: number;
}

export default function QRCodeDisplay({ size = 256 }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
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
      setQrUrl(url);

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

  const copyToClipboard = async () => {
    if (qrUrl) {
      try {
        await navigator.clipboard.writeText(qrUrl);
        // You could add a toast notification here
        alert("QR URL copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    }
  };

  if (loading) {
    return (
      <Card size="3">
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Spinner size="3" />
          <Text>Generating your QR code...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="3">
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Text color="red" className="text-center">
            {error}
          </Text>
          <Button onClick={regenerateQRCode} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card size="3">
      <div className="flex flex-col items-center space-y-4 p-6">
        <Text size="4" weight="bold" className="text-center">
          Your QR Code
        </Text>

        {qrCodeDataUrl && (
          <div className="border border-gray-200 rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeDataUrl} alt="QR Code" width={size} height={size} />
          </div>
        )}

        <div className="flex flex-col items-center space-y-2">
          <Text size="2" color="gray" className="text-center">
            Share this QR code for quick access
          </Text>

          {qrUrl && (
            <div className="flex flex-col items-center space-y-2">
              <Text
                size="1"
                className="text-center font-mono bg-gray-100 p-2 rounded"
              >
                {qrUrl}
              </Text>
              <Button onClick={copyToClipboard} variant="outline" size="2">
                Copy URL
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
