export interface PostedStory {
  url: string;
  isVideo: boolean;
  caption?: string;
  file?: File;
}

export interface MyStory extends PostedStory {
  id: string;
  postedAt: number;
}
