import type { SceneKey } from "@/lib/data";
import { SceneArt } from "./SceneArt";

export const imageUrl = (id: number) => `/img/${id}`;

// A tour's uploaded photo, or its illustrated scene when none has been uploaded yet
export function TourVisual({ imageId, scene, id, priority = false }: { imageId: number | null; scene: SceneKey; id: string; priority?: boolean }) {
  if (!imageId) return <SceneArt scene={scene} id={id} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- served from our own /img route with immutable caching
    <img className="art photo" src={imageUrl(imageId)} alt="" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
  );
}
