import React from "react";
import { X } from "lucide-react";
import "../styles/video-player.scss";

interface VideoPlayerProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isOpen,
  onClose,
  title,
}) => {
  if (!isOpen) return null;

  // Fonction pour détecter le type de vidéo
  const getVideoType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    }
    if (url.includes("vimeo.com")) {
      return "vimeo";
    }
    // Vérifier si c'est un fichier vidéo direct
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    if (videoExtensions.some((ext) => url.toLowerCase().endsWith(ext))) {
      return "direct";
    }
    return "unknown";
  };

  // Extraire l'ID de la vidéo YouTube
  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extraire l'ID de la vidéo Vimeo
  const getVimeoVideoId = (url: string) => {
    const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const videoType = getVideoType(videoUrl);
  let embedUrl = "";

  switch (videoType) {
    case "youtube":
      const youtubeId = getYouTubeVideoId(videoUrl);
      embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
      break;
    case "vimeo":
      const vimeoId = getVimeoVideoId(videoUrl);
      embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
      break;
    case "direct":
      embedUrl = videoUrl;
      break;
  }

  return (
    <div className="video-modal-overlay">
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="video-container">
          {videoType !== "unknown" ? (
            videoType === "direct" ? (
              <video controls autoPlay className="video-player" src={embedUrl}>
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            ) : (
              <iframe
                className="video-player"
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <div className="video-error">
              Désolé, ce type de vidéo n'est pas pris en charge.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
