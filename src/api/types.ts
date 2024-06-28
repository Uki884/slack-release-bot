export type PullRequest = {
  id: number;
  number: number;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  title: string;
  html_url: string;
};
