export type Workspace = {
  id: string;
  name: string;
  imageUrl: string;
  chatsCount: number;
  videosAvailable: number;
  inQueue: number;
  lastActive: string;
};

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws_1",
    name: "Engineering Docs",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    chatsCount: 142,
    videosAvailable: 24,
    inQueue: 0,
    lastActive: "2 hours ago",
  },
  {
    id: "ws_2",
    name: "Marketing Assets",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    chatsCount: 56,
    videosAvailable: 12,
    inQueue: 2,
    lastActive: "1 day ago",
  },
  {
    id: "ws_3",
    name: "Customer Support",
    imageUrl: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=800",
    chatsCount: 890,
    videosAvailable: 150,
    inQueue: 5,
    lastActive: "5 mins ago",
  },
  {
    id: "ws_4",
    name: "Product Strategy",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    chatsCount: 34,
    videosAvailable: 8,
    inQueue: 0,
    lastActive: "3 days ago",
  },
  {
    id: "ws_5",
    name: "Design Inspiration",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
    chatsCount: 12,
    videosAvailable: 45,
    inQueue: 0,
    lastActive: "1 week ago",
  },
];
