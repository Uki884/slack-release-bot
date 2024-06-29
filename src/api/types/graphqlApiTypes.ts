// repository {
//   name
//   owner {
//     login
//   }
// }
// number
// url
// author {
//   login
//   avatarUrl
// }
// baseRef {
//   name
// }
// headRef {
//   name
// }
// title
// url
// reviewDecision
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
  title: string;
  reviewDecision: string;
};
