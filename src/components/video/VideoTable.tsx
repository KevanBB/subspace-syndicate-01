import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
  status: 'processing' | 'ready' | 'failed';
  error_message?: string;
  category: string;
  visibility: string;
  created_at: string;
  likes: number;
  tags: string;
}

const columns: ColumnDef<Video>[] = [
  {
    accessorKey: "thumbnail_url",
    header: "Thumbnail",
    cell: ({ row }) => {
      const thumbnailUrl = row.getValue("thumbnail_url") as string;
      return (
        <div className="relative w-32 h-20">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-400">No thumbnail</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const videoUrl = row.original.video_url;
      return (
        <div className="space-y-1">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            {title}
          </a>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{row.original.category}</span>
            <span>•</span>
            <span>{row.original.visibility}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'ready' ? 'bg-green-500' :
            status === 'processing' ? 'bg-yellow-500' :
            status === 'failed' ? 'bg-red-500' :
            'bg-gray-500'
          }`} />
          <span className="capitalize">{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
  },
  {
    accessorKey: "width",
    header: "Resolution",
    cell: ({ row }) => {
      const width = row.getValue("width") as number;
      const height = row.original.height;
      return `${width}x${height}`;
    },
  },
  {
    accessorKey: "codec",
    header: "Codec",
    cell: ({ row }) => {
      const codec = row.getValue("codec") as string;
      return codec || 'N/A';
    },
  },
  {
    accessorKey: "bitrate",
    header: "Bitrate",
    cell: ({ row }) => {
      const bitrate = row.getValue("bitrate") as number;
      return bitrate ? `${Math.round(bitrate / 1000)} kbps` : 'N/A';
    },
  },
  {
    accessorKey: "created_at",
    header: "Uploaded",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const video = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(video.id);
                toast({
                  title: "Video ID copied",
                  description: "The video ID has been copied to your clipboard.",
                });
              }}
            >
              Copy video ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(video.video_url);
                toast({
                  title: "Video URL copied",
                  description: "The video URL has been copied to your clipboard.",
                });
              }}
            >
              Copy video URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (video.status === 'ready') {
                  window.open(video.video_url, '_blank');
                } else {
                  toast({
                    title: "Video not ready",
                    description: "Please wait for the video to finish processing.",
                    variant: "destructive",
                  });
                }
              }}
            >
              View video
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (video.status === 'failed') {
                  toast({
                    title: "Processing failed",
                    description: video.error_message || "An error occurred during processing.",
                    variant: "destructive",
                  });
                }
              }}
            >
              {video.status === 'failed' ? 'View error details' : 'Processing status'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 