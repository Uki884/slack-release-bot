import { RestApiTypes, GraphqlApiTypes } from "./types";
import { GithubBaseApi, PATH_LIST } from "./githubBaseApi";
import { gql } from "graphql-request";

type Env = {
  GITHUB_PRIVATE_KEY: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_NAME: string;
  GITHUB_USERNAME: string;
  GITHUB_REPO: string;
};

export class GithubApi extends GithubBaseApi {
  private constructor(
    GITHUB_PRIVATE_KEY: string,
    GITHUB_APP_ID: string,
    GITHUB_APP_NAME: string,
    GITHUB_USERNAME: string,
    GITHUB_REPO: string,
  ) {
    super(GITHUB_PRIVATE_KEY, GITHUB_APP_ID, GITHUB_APP_NAME, GITHUB_USERNAME, GITHUB_REPO);
  }

  static new(env: Env) {
    return new GithubApi(
      env.GITHUB_PRIVATE_KEY,
      env.GITHUB_APP_ID,
      env.GITHUB_APP_NAME,
      env.GITHUB_USERNAME,
      env.GITHUB_REPO,
    );
  }

  async getMergeablePr() {
    const params = {
      state: "open",
      labels: "Mergeable",
      pulls: "true",
    };

    return await this.repoApiRequest<RestApiTypes.PullRequest[]>(PATH_LIST.ISSUES(), {
      params,
      method: "GET",
    });
  }

  async getApprovedPrList() {
    const document = gql`
      query ($query: String!) {
        search(type: ISSUE, last: 100, query: $query) {
          nodes {
            ... on PullRequest {
              number
              url
              author {
                login
                avatarUrl
                url
              }
              baseRef {
                name
              }
              headRef {
                name
              }
              mergeable
              title
              url
              reviewDecision
            }
          }
        }
      }
    `;
    const variables = `repo:${this.GITHUB_USERNAME}/${this.GITHUB_REPO} is:pr is:open`;

    const result = await this.graphqlRequest<{ search: { nodes: GraphqlApiTypes.PullRequest[] } }>(
      document,
      {
        query: variables,
      },
    );

    return result.search.nodes.filter(
      (pr) => pr.reviewDecision === "APPROVED" && ["main", "master"].includes(pr.baseRef.name),
    );
  }

  async getPullRequest(number: number) {
    return await this.repoApiRequest<RestApiTypes.PullRequestDetail>(PATH_LIST.PULL(number), {
      method: "GET",
    });
  }

  // 最新のリリース取得
  async getLatestRelease() {
    return await this.repoApiRequest<RestApiTypes.Release>(PATH_LIST.RELEASE_LATEST(), {
      method: "GET",
    });
  }

  // リリースノート取得
  async getReleaseNotes({
    tagName,
    targetCommitish,
    previousTagName,
    configurationFilePath,
  }: {
    tagName: string;
    targetCommitish?: string;
    previousTagName?: string;
    configurationFilePath?: string;
  }) {
    const payload = {
      tag_name: tagName,
      ...(targetCommitish ? { target_commitish: targetCommitish } : {}),
      ...(previousTagName ? { previous_tag_name: previousTagName } : {}),
      ...(configurationFilePath ? { configuration_file_path: configurationFilePath } : {}),
    };

    return await this.repoApiRequest<RestApiTypes.ReleaseNote>(
      PATH_LIST.RELEASES_GENERATE_NOTES(),
      {
        body: JSON.stringify(payload),
        method: "POST",
      },
    );
  }
}
