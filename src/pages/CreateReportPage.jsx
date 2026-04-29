import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { API_BASE } from "../lib/config";
import api from "../lib/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: -34.9011,
  lng: -56.1645,
};

export default function CreateReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [lat, setLat] = useState(defaultCenter.lat);
  const [lng, setLng] = useState(defaultCenter.lng);
  const [isGeolocating, setIsGeolocating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          setIsGeolocating(false);
        },
        () => {
          setIsGeolocating(false);
        }
      );
    } else {
      setIsGeolocating(false);
    }
  }, []);

  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      setLat(e.latLng.lat());
      setLng(e.latLng.lng());
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }
    if (!description.trim()) {
      setError("La descripción es requerida");
      return;
    }
    if (!photo) {
      setError("La foto es requerida");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert photo to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Photo = event.target.result.split(",")[1];

        const payload = {
          title: title.trim(),
          description: description.trim(),
          latitude: lat,
          longitude: lng,
          photo: base64Photo,
          email: user?.email,
        };

        const response = await api.post(
          `${API_BASE}/reports`,
          payload
        );

        if (response.status === 201 || response.status === 200) {
          navigate("/");
        } else {
          setError("Error al crear el reporte");
        }
      };
      reader.readAsDataURL(photo);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear el reporte";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl animate-spin">⏳</span>
          </div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Reporte</h1>
        <p className="text-gray-600 text-sm mt-1">
          Ayudanos a mejorar el barrio reportando un problema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Basura acumulada en esquina"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Descripción *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el problema con más detalle..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Foto *
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-input"
              disabled={isSubmitting}
            />
            <label
              htmlFor="photo-input"
              className={`block w-full px-4 py-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${
                photo
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
              }`}
            >
              {photoPreview ? (
                <div className="space-y-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm text-gray-600">
                    📷 {photo.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Click para cambiar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl">📷</p>
                  <p className="text-sm font-medium text-gray-700">
                    Captura o selecciona una foto
                  </p>
                  <p className="text-xs text-gray-500">
                    En móvil abre la cámara automáticamente
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Map */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ubicación *
            {isGeolocating && (
              <span className="text-xs font-normal text-gray-500 ml-2">
                (obteniendo ubicación actual...)
              </span>
            )}
          </label>
          <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={{ lat, lng }}
              zoom={17}
              onLoad={(map) => (mapRef.current = map)}
              onClick={handleMapClick}
              options={{
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false,
              }}
            >
              <Marker
                position={{ lat, lng }}
                ref={markerRef}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    setLat(e.latLng.lat());
                    setLng(e.latLng.lng());
                  }
                }}
              />
            </GoogleMap>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            📍 Click en el mapa o arrastra el marcador para cambiar la ubicación
          </p>
        </div>

        {/* Coordinates display */}
        <div className="text-xs text-gray-500 text-center">
          <code>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </code>
        </div>

        {/* Submit button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span> Enviando...
              </>
            ) : (
              <>
                ✅ Crear Reporte (+50 pts)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
