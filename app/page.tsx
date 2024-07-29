"use client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  AlertCircle,
  Clipboard,
  File,
  FilePlus2,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";

const FileUploadComponent = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(50);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneratedLink("");
    setError("");
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    let error = false;
    newFiles.forEach((file) => {
      if (files.some((f) => f.name === file.name)) {
        setError(`File ${file.name} already exists.`);
        error = true;
      } else if (file.size > 1 * 1024 * 1024 * 1024) {
        // 1GB size check
        setError(`File ${file.name} exceeds the 1GB limit.`);
        error = true;
      }
    });

    if (error) return;
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    e.target.value = "";
  };

  const saveInClipBoard = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    alert("Link copied to clipboard");
  };

  const submit = async () => {
    try {
      setGeneratedLink("");
      setIsUploading(true);
      setProgress(0);
      const formData = new FormData();
      if (password) formData.append("password", password);
      files.forEach((file, i) => {
        formData.append(`file[${i}]`, file);
      });
      const response = await axios.post(
        "http://localhost:8000/api/uploadfiles",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentCompleted = Math.round(
              (loaded * 100) / (total as number)
            );
            setProgress(percentCompleted);
          },
        }
      );
      if (response.data.link) {
        setGeneratedLink(response.data.link as string);
        setFiles([]);
        setPassword("");
      }
    } catch (error) {
      console.error("Error uploading files", error);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full h-full px-5 flex items-center justify-center my-10">
      <div className="sm:w-[600px] w-full flex items-center justify-center flex-col gap-4 ">
        <div className="text-4xl font-semibold text-center">
          Share your files with your friends
        </div>
        <Alert className={!error ? "hidden" : ""} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />
        <div
          className="w-[200px]"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click();
          }}>
          <Button
            className="w-full flex items-center justify-center gap-2 font-semibold"
            disabled={isUploading}>
            <FilePlus2 />
            Add file
          </Button>
        </div>
        <div
          className={`overflow-x-hidden overflow-y-auto p-3 sm:w-[600px] w-full max-h-[300px] rounded-md bg-slate-900 flex-col gap-2 ${
            files.length ? "flex" : "hidden"
          }`}>
          {files.map((file, i) => (
            <div
              className="w-full h-[40px] bg-slate-800 flex justify-between items-center rounded-md px-5 py-2"
              key={i}>
              <div className="flex items-center gap-2 flex-1 w-[40%]">
                <File />
                <div className="w-[40%] overflow-hidden text-ellipsis whitespace-nowrap">
                  {file.name}
                </div>
              </div>
              <Button
                className="cursor-pointer"
                disabled={isUploading}
                size="icon"
                variant="ghost"
                onClick={() => {
                  setFiles(files.filter((f) => f.name !== file.name));
                }}>
                <X />
              </Button>
            </div>
          ))}
        </div>
        {files.length ? (
          <>
            <Input
              placeholder="Set a password (optional)"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <div className="w-[200px]">
              <Button
                disabled={isUploading || !files.length}
                className="w-full flex items-center justify-center gap-2 font-semibold"
                onClick={submit}
                style={{
                  background: isUploading
                    ? `linear-gradient(to right, rgb(22 163 74) ${progress}%, white ${progress}%)`
                    : "",
                }}>
                <UploadCloud />
                {isUploading ? `${progress}%` : "Upload"}
              </Button>
            </div>
          </>
        ) : null}
        {generatedLink ? (
          <div className="max-w-[90%] flex flex-col items-center gap-3">
            <div className="text-lg font-semibold">Generated link</div>
            <div className="bg-gray-800 p-2 rounded-md flex items-center gap-2 w-full">
              <div className="flex-1 overflow-hidden text-ellipsis">
                <div className="w-[80%] overflow-hidden text-ellipsis whitespace-nowrap">
                  {generatedLink}
                </div>
              </div>
              <div className="cursor-pointer" onClick={saveInClipBoard}>
                <Clipboard />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FileUploadComponent;
