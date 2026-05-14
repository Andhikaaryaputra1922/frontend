"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, LogOut, Trash2, Save } from "lucide-react";

type ModalType = "success" | "error" | "warning" | "confirm" | "info" | "logout" | "delete" | "save";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function PremiumModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Batal",
  loading = false,
}: PremiumModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
      case "error": return <XCircle className="h-12 w-12 text-rose-500" />;
      case "warning": return <AlertCircle className="h-12 w-12 text-amber-500" />;
      case "confirm": return <Info className="h-12 w-12 text-blue-500" />;
      case "logout": return <LogOut className="h-12 w-12 text-[#8B0000]" />;
      case "delete": return <Trash2 className="h-12 w-12 text-rose-500" />;
      case "save": return <Save className="h-12 w-12 text-blue-600" />;
      default: return <Info className="h-12 w-12 text-slate-400" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case "success": return "bg-emerald-500 hover:bg-emerald-600";
      case "error": return "bg-rose-500 hover:bg-rose-600";
      case "warning": return "bg-amber-500 hover:bg-amber-600";
      case "logout": return "bg-[#8B0000] hover:bg-[#6B0000]";
      case "delete": return "bg-rose-600 hover:bg-rose-700";
      case "save": return "bg-blue-600 hover:bg-blue-700";
      default: return "bg-slate-800 hover:bg-slate-900";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 shadow-inner">
            {getIcon()}
          </div>
          <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900">{title}</h3>
          <p className="mb-8 text-sm leading-relaxed text-slate-500">{message}</p>
          
          <div className="flex w-full gap-3">
            {onConfirm && (
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm || onClose}
              disabled={loading}
              className={`flex-1 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${getAccentColor()}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Proses...</span>
                </div>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const getBg = () => {
    switch (type) {
      case "success": return "bg-emerald-600";
      case "error": return "bg-rose-600";
      default: return "bg-slate-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-4 w-4" />;
      case "error": return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[110] flex items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-2xl animate-in slide-in-from-right-10 duration-300 ${getBg()}`}>
      {getIcon()}
      <p className="text-sm font-bold tracking-tight">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}
