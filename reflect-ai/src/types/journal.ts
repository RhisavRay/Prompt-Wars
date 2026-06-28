export interface Journal {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJournalInput {
  title: string;
  content: string;
  mood: string;
}

export interface UpdateJournalInput {
  title?: string;
  content?: string;
  mood?: string;
}
