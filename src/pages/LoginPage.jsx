import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle, signingIn } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0FFFE] gap-6 px-4">
      <div className="text-5xl">🗑️</div>
      <h1 className="text-2xl font-bold text-gray-800">PresaWatch</h1>
      <p className="text-gray-500 text-center max-w-xs">
        Reporta basura y problemas en tu comunidad. Inicia sesión para continuar.
      </p>
      <button
        onClick={signInWithGoogle}
        disabled={signingIn}
        className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 shadow px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
      >
        {signingIn ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
        )}
        Continuar con Google
      </button>
    </div>
  );
}
