// src/components/ManagerOverrideModal.jsx
import { useState } from "react";

export default function ManagerOverrideModal({
  open,
  actionLabel = "autorizar esta ação",
  onClose,
  onConfirm,
  loading = false,
}) {
  const [login, setLogin] = useState("");
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onConfirm({
      login: login.trim(),
      pin: pin.trim(),
      reason: reason.trim(),
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Autorização gerencial</h3>
        <p style={{ color: "#666", marginBottom: 16 }}>
          Para {actionLabel}, informe login e PIN de gerente ou administrador.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Login ou e-mail"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN / senha"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            style={inputStyle}
          />
          <textarea
            placeholder="Motivo da autorização"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ ...inputStyle, minHeight: 84, resize: "vertical" }}
          />

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={secondaryButtonStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Validando..." : "Autorizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "grid",
  placeItems: "center",
  zIndex: 9999,
  padding: 16,
};

const cardStyle = {
  width: "100%",
  maxWidth: 460,
  background: "#fff",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
};

const inputStyle = {
  width: "100%",
  marginBottom: 12,
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 15,
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#6f3dc8",
  color: "#fff",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#fff",
  cursor: "pointer",
};