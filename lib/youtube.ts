export function getYouTubeEmbedUrl(url: string) {
  if (!url) return '';

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/
  );

  const videoId = match?.[1];

  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : url;
}
