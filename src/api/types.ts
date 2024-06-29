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

export type PullRequestDetail = {
  id: number;
  number: number;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  title: string;
  html_url: string;
  head: {
    ref: string; // ブランチ
  };
  base: {
    ref: string; // マージ先ブランチ
  };
};

export type Release = {
  tag_name: string;
};

export type ReleaseNote = {
  body: string;
};
