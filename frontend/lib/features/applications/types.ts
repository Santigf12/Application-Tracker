export interface Application {
  id?: string;
  title: string;
  company: string;
  location: string;
  posting: string;
  added: string;
  applied: string;
  coverletter?: boolean;
  status: string;
  length: string;
  url: string;
}

export interface SaveCoverLetterPayload {
  id: string;
  content: string;
}

export interface UpdateApplicationPayload {
  id: string;
  application: Application;
}
