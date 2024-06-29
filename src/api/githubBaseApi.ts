import jwt from "@tsndr/cloudflare-worker-jwt";
import { GraphQLClient } from "graphql-request";

export const PATH_LIST = {
  ISSUES: () => "issues" as const,
  PULLS: () => "pulls" as const,
  PULL: (number: number) => `pulls/${number}` as const,
  INSTALLATIONS: () => "app/installations" as const,
  ACCESS_TOKENS: (installationId: number) =>
    `app/installations/${installationId}/access_tokens` as const,
  RELEASE_LATEST: () => "releases/latest" as const,
  RELEASES_GENERATE_NOTES: () => "releases/generate-notes" as const,
  DISPATCHES: () => "dispatches" as const,
  RELEASES: () => "releases" as const,
} as const;

type PathList = {
  ISSUES: ReturnType<typeof PATH_LIST.ISSUES>;
  PULLS: ReturnType<typeof PATH_LIST.PULLS>;
  PULL: ReturnType<typeof PATH_LIST.PULL>;
  INSTALLATIONS: ReturnType<typeof PATH_LIST.INSTALLATIONS>;
  ACCESS_TOKENS: ReturnType<typeof PATH_LIST.ACCESS_TOKENS>;
  RELEASE_LATEST: ReturnType<typeof PATH_LIST.RELEASE_LATEST>;
  RELEASES_GENERATE_NOTES: ReturnType<typeof PATH_LIST.RELEASES_GENERATE_NOTES>;
  DISPATCHES: ReturnType<typeof PATH_LIST.DISPATCHES>;
  RELEASES: ReturnType<typeof PATH_LIST.RELEASES>;
};

type PathListKeys = keyof PathList;

type Params = { [key: string]: string } | undefined;

type RequestOption = RequestInit & { params?: Params };

export class GithubBaseApi {
  private GITHUB_PRIVATE_KEY: string;
  private GITHUB_APP_ID: string;
  private GITHUB_APP_NAME: string;
  protected GITHUB_USERNAME: string;
  protected GITHUB_REPO: string;

  constructor(
    GITHUB_PRIVATE_KEY: string,
    GITHUB_APP_ID: string,
    GITHUB_APP_NAME: string,
    GITHUB_USERNAME: string,
    GITHUB_REPO: string,
  ) {
    this.GITHUB_PRIVATE_KEY = GITHUB_PRIVATE_KEY;
    this.GITHUB_APP_ID = GITHUB_APP_ID;
    this.GITHUB_APP_NAME = GITHUB_APP_NAME;
    this.GITHUB_USERNAME = GITHUB_USERNAME;
    this.GITHUB_REPO = GITHUB_REPO;
  }

  private async getToken() {
    const cert = this.GITHUB_PRIVATE_KEY as string;
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 60,
      iat: Math.floor(Date.now() / 1000) - 10,
      iss: this.GITHUB_APP_ID as string,
    };
    const secret = cert.replace(/\\n/g, "\n");
    const token = await jwt.sign(payload, secret, {
      algorithm: "RS256",
    });

    return token;
  }

  private async getAccessToken() {
    const installations = await this.apiRequest<{ app_slug: string; id: number }[]>(
      PATH_LIST.INSTALLATIONS(),
      {
        method: "GET",
      },
    );

    const installation = installations.find(
      (installation) => installation.app_slug === this.GITHUB_APP_NAME,
    );

    if (!installation) {
      return "";
    }

    const response = await this.apiRequest(PATH_LIST.ACCESS_TOKENS(installation.id), {
      method: "POST",
    });
    const result = (await response) as { token: string };
    return result.token;
  }

  protected async repoApiRequest<T>(
    path: PathList[PathListKeys],
    options: RequestOption,
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    return await this.handleRequest(
      `https://api.github.com/repos/${this.GITHUB_USERNAME}/${this.GITHUB_REPO}/${path}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }

  protected async graphqlRequest<T>(
    document: string | import("graphql").DocumentNode,
    variables: object,
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    const client = new GraphQLClient(`https://api.github.com/graphql`, {
      headers: {
        Authorization: "Bearer " + accessToken,
        "User-Agent": "request",
      },
    });

    try {
      const response = await client.request({
        document,
        variables,
      });

      return response as T;
    } catch (error: any) {
      error.response.errors.forEach((error: any) => {
        console.error("Error:", error.message);
      });
      throw error;
    }
  }

  protected async apiRequest<T>(path: PathList[PathListKeys], options: RequestOption): Promise<T> {
    const url = `https://api.github.com/${path}`;
    const accessToken = await this.getToken();
    return await this.handleRequest(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  private async handleRequest<T>(url: string, options: RequestOption): Promise<T> {
    const queryParams = options.params ? new URLSearchParams(options.params) : undefined;
    delete options.params;

    const response = await fetch(`${url}?${queryParams?.toString() || ""}`, {
      ...options,
      headers: {
        ...options.headers,
        "User-Agent": "request",
        "Content-Type": "application/json",
        Accept: "application/vnd.github",
      },
    });
    const result = await response.json();
    return (await result) as T;
  }
}
