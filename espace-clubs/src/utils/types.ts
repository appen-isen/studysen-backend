export type Club = {
  clubId: number;
  name: string;
  contactEmail: string;
  campusId: number;
  imageUrl: string;
  enabled?: boolean;
};

export type PostType = {
  id: number;
  type: 'event' | 'post';
  date: string;
  title: string;
  club: {
    name: string;
    image: string;
  };
  description: string;
  link?: string;
  address?: string;
  info?: {
    startTime?: string;
    price?: string;
    ageLimit?: string;
  };
  imageUri?: string;
};
