export type PullRequest = {
  id: number;
  number: number;
  user: {
    login: string;
  };
  title: string;
  html_url: string;
};