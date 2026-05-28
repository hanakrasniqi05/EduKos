import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField, authButtonClass, authInputClass } from "../components/AuthLayout";
import { getDashboardPath } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.roles.includes("Shkolla") && response.institutionIsApproved === false) {
        navigate("/waiting-approval", { replace: true });
        return;
      }
      const from = (location.state as { from?: string } | null)?.from;

      if (from && !from.startsWith("/dashboard")) {
        navigate(from, { replace: true });
      } else {
        navigate(getDashboardPath(response.roles), { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kyqja deshtoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Kyqu ne llogari"
      subtitle="Vazhdo te paneli yt ne EduKos."
      footer={
        <>
          Nuk ke llogari?{" "}
          <Link to="/signup" className="font-semibold text-[#3d7a52] hover:underline">
            Regjistrohu ketu
          </Link>
        </>
      }
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={authInputClass}
            placeholder="email@shembull.com"
          />
        </AuthField>

        <AuthField label="Fjalekalimi">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={authInputClass}
            placeholder="Fjalekalimi"
          />
        </AuthField>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Duke u kyqur..." : "Kyqu"}
        </button>
      </form>
    </AuthLayout>
  );
}
