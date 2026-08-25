/**
 * ClayBackgroundBlobs — Persistent ambient 3D floating blobs.
 *
 * Provides soft colored ambient occlusion and depth that shows through
 * glass-claymorphic cards and containers.
 */
const ClayBackgroundBlobs = () => {
  return (
    <div className="clay-blob-container" aria-hidden="true">
      {/* Blob 1: Vivid Violet (Top-Left) */}
      <div className="clay-blob clay-blob--violet" />

      {/* Blob 2: Hot Pink (Top-Right) */}
      <div className="clay-blob clay-blob--pink" />

      {/* Blob 3: Sky Blue (Bottom-Left) */}
      <div className="clay-blob clay-blob--sky" />

      {/* Blob 4: Emerald / Amber (Bottom-Right) */}
      <div className="clay-blob clay-blob--emerald" />
    </div>
  );
};

export default ClayBackgroundBlobs;
