// これが型
export type PullRequest = {
  author: {
    login: string;
    avatarUrl: string;
    url: string;
  };
  number: number;
  url: string;
  baseRef: {
    name: string;
  };
  headRef: {
    name: string;
  };
  mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN";
  title: string;
  reviewDecision: string;
};
