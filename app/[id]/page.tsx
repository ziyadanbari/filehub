"use client";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
const DownloadFiles = () => {
  const { id: fileUuid } = useParams();
  const [isPasswordNeeded, setIsPasswordNeeded] = useState<boolean>();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloaded, setIsDownloaded] = useState(false);
  const [downloading, setIsDownloading] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        if (downloaded) return;
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/securitycheck/${fileUuid}`
        );
        setIsPasswordNeeded(false);
        downloadFile(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/downloadfiles/${fileUuid}?password=${password}`
        );
      } catch (error) {
        console.log(error);
        if (error instanceof AxiosError && error?.response?.status === 403) {
          setIsPasswordNeeded(true);
        }
      }
    })();
  }, [fileUuid]);
  const downloadFile = (downloadLink: string) => {
    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = downloadLink;
    // link.setAttribute("download", `${new Date().getTime()}.zip`);
    document.body.appendChild(link);
    link.click();
    setIsDownloaded(true);
    if (link.parentNode) link.parentNode.removeChild(link);
    setIsDownloading(false);
  };
  const checkPassword = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/securitycheck/${fileUuid}`,
        { password }
      );
      downloadFile(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/downloadfiles/${fileUuid}?password=${password}`
      );
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.status === 403) {
        setError(error?.response?.data?.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full h-screen flex items-center justify-center">
      {isPasswordNeeded ? (
        <div>
          <AlertDialog open={isPasswordNeeded} onOpenChange={(open) => {}}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  You need password to get access to this file
                </AlertDialogTitle>
              </AlertDialogHeader>
              <Input
                placeholder="Password..."
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <AlertDialogFooter className="flex flex-col gap-3">
                <Alert
                  variant={"destructive"}
                  className={!error ? "hidden" : "block"}>
                  <AlertCircle />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
                <AlertDialogAction
                  disabled={!password || isSubmitting}
                  onClick={checkPassword}>
                  Download
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
      <div className="text-4xl font-bold">
        {downloaded ? "Downloading..." : "Checking..."}
      </div>
    </div>
  );
};

export default DownloadFiles;
