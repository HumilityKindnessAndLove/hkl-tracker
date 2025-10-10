"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Spinner size="lg" />
          <p className="text-sm">Generating your QR code...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <p className="text-destructive text-center text-sm">{error}</p>
          <Button onClick={regenerateQRCode} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col items-center space-y-4 p-6">
        <h3 className="text-lg font-bold text-center">Your QR Code</h3>

        {qrCodeDataUrl && (
          <div className="border border-border rounded-lg">
            <img src={qrCodeDataUrl} alt="QR Code" width={size} height={size} />
          </div>
        )}

        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Share this QR code for quick access
          </p>

          {qrUrl && (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-xs text-center font-mono bg-muted p-2 rounded">
                {qrUrl}
              </p>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                Copy URL
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
